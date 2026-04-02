/**
 * API連携モジュール
 * データの実体（tasks, journals）は Google Apps Script (GAS) 経由で Google Drive に保存します。
 * GitHub API は、リポジトリ設定などの非機密情報の管理に使用します。
 */

const API_CONFIG = {
    // GAS設定
    gasUrl: localStorage.getItem('gas_url') || '', // デプロイしたウェブアプリのURL
    
    // GitHub設定（従来通り。設定や他の公開ファイルの管理に使用可能）
    owner: 'inata169',
    repo: 'MP-LogManager',
    branch: 'main',
    tasksPath: 'data/tasks.json',
    journalsPath: 'data/journals.json'
};

/**
 * リポジトリ設定を取得（localStorage or URLからの自動抽出）
 */
function getRepoConfig() {
    const storageOwner = localStorage.getItem('github_owner');
    const storageRepo = localStorage.getItem('github_repo');

    if (storageOwner && storageRepo) {
        return { owner: storageOwner, repo: storageRepo };
    }

    const host = window.location.host;
    const pathParts = window.location.pathname.split('/').filter(p => p);

    if (host.endsWith('.github.io')) {
        const owner = host.split('.')[0];
        const repo = pathParts[0] || API_CONFIG.repo;
        return { owner, repo };
    }

    return { owner: API_CONFIG.owner, repo: API_CONFIG.repo };
}

// 初期化時に設定を反映
const activeConfig = getRepoConfig();
API_CONFIG.owner = activeConfig.owner;
API_CONFIG.repo = activeConfig.repo;

/**
 * Google Apps Script API クラス
 */
class GasAPI {
    constructor() {
        this.url = API_CONFIG.gasUrl;
    }

    setUrl(url) {
        this.url = url;
        localStorage.setItem('gas_url', url);
        API_CONFIG.gasUrl = url;
    }

    hasUrl() {
        return !!this.url;
    }

    async fetchData(type) {
        if (!this.hasUrl()) throw new Error('GAS URLが設定されていません');
        
        try {
            // 指数バックオフを伴うリトライを適用
            const response = await this.fetchWithRetry(`${this.url}?type=${type}&t=${Date.now()}`);
            if (!response.ok) throw new Error(`HTTP Error: ${response.status}`);
            
            const data = await response.json();
            if (data && data.error) {
                throw new Error(`GAS Error: ${data.error}`);
            }
            return data;
        } catch (error) {
            console.error(`FetchData failed (${type}):`, error);
            if (error.message === 'Failed to fetch') {
                throw new Error('ネットワークエラーまたはGASのクォータ制限により、データ取得に失敗しました。');
            }
            throw error;
        }
    }

    async updateData(type, data) {
        if (!this.hasUrl()) throw new Error('GAS URLが設定されていません');

        try {
            // POST は失敗時の副作用を考慮し、通常のリトライではなく timeout のみ適用
            const response = await this.fetchWithTimeout(this.url, {
                method: 'POST',
                mode: 'no-cors',
                headers: {
                    'Content-Type': 'text/plain'
                },
                body: JSON.stringify({
                    type: type,
                    data: data
                })
            }, 15000); // 更新は少し長めに待機 (15s)

            return { status: 'requested' };
        } catch (error) {
            console.error(`UpdateData failed (${type}):`, error);
            throw error;
        }
    }

    async ping() {
        if (!this.hasUrl()) return { ok: false, error: 'URL未設定' };
        try {
            const response = await this.fetchWithTimeout(`${this.url}?type=ping&t=${Date.now()}`, {}, 5000);
            if (!response.ok) return { ok: false, error: `HTTP ${response.status}` };
            
            const data = await response.json();
            if (data && data.error) return { ok: false, error: data.error };
            return { ok: true };
        } catch (e) {
            let msg = e.message;
            if (e.name === 'AbortError') msg = 'タイムアウト (5秒)';
            
            // クォータ超過や一般的なGASエラーの推測
            if (msg.includes('Failed to fetch') || msg.includes('NetworkError')) {
                msg = 'ネットワークエラーまたはクォータ制限の可能性があります';
            }
            
            console.error('Ping failed:', e);
            return { ok: false, error: msg, details: e.stack };
        }
    }

    /**
     * 詳細な診断を実行 (mode: 'cors' を試走)
     */
    async diagnose() {
        if (!this.hasUrl()) return { ok: false, error: 'URL未設定' };
        
        const results = {
            url: this.url,
            steps: []
        };

        // Step 1: Normal Ping (no-cors)
        results.steps.push({ name: 'Basic Connectivity (no-cors)', status: 'testing...' });
        const pingResult = await this.ping();
        results.steps[0].status = pingResult.ok ? 'OK' : 'Failed';
        results.steps[0].error = pingResult.error;

        // Step 2: CORS Check (may fail by design, but gives info)
        results.steps.push({ name: 'CORS Diagnostic (cors)', status: 'testing...' });
        try {
            const response = await this.fetchWithTimeout(`${this.url}?type=ping&t=${Date.now()}`, {
                mode: 'cors'
            }, 5000);
            results.steps[1].status = response.ok ? 'OK' : `HTTP ${response.status}`;
        } catch (e) {
            results.steps[1].status = 'Blocked/Error';
            results.steps[1].error = e.message;
            if (e.name === 'TypeError' && e.message === 'Failed to fetch') {
                results.steps[1].hint = 'CORS制約またはURLが無効です（GASのWebアプリ設定を確認してください）';
            }
        }

        // Step 3: Quota/Response Check (via Proxy if possible, but here we just check if it was ever successful)
        results.ok = pingResult.ok;
        return results;
    }

    /**
     * タイムアウト付きフェッチ
     */
    async fetchWithTimeout(resource, options = {}, timeout = 10000) {
        const controller = new AbortController();
        const id = setTimeout(() => controller.abort(), timeout);
        
        try {
            const response = await fetch(resource, {
                ...options,
                signal: controller.signal
            });
            clearTimeout(id);
            return response;
        } catch (error) {
            clearTimeout(id);
            throw error;
        }
    }

    /**
     * 指数バックオフを伴うオートリトライ付きフェッチ
     */
    async fetchWithRetry(resource, options = {}, retries = 3, backoff = 1000) {
        try {
            const response = await this.fetchWithTimeout(resource, options);
            if (response.ok) return response;
            
            if (retries > 0 && (response.status >= 500 || response.status === 408)) {
                await new Promise(resolve => setTimeout(resolve, backoff));
                return this.fetchWithRetry(resource, options, retries - 1, backoff * 2);
            }
            return response;
        } catch (error) {
            if (retries > 0 && error.name !== 'AbortError') {
                await new Promise(resolve => setTimeout(resolve, backoff));
                return this.fetchWithRetry(resource, options, retries - 1, backoff * 2);
            }
            throw error;
        }
    }
}

/**
 * 従来の GitHub API クラス (設定管理用)
 */
class GitHubAPI {
    constructor() {
        this.token = localStorage.getItem('github_token') || '';
        this.baseUrl = 'https://api.github.com';
    }

    setToken(token) {
        this.token = token;
        localStorage.setItem('github_token', token);
    }

    hasToken() {
        return !!this.token;
    }

    async request(endpoint, options = {}) {
        const url = `${this.baseUrl}${endpoint}`;
        const headers = {
            'Accept': 'application/vnd.github.v3+json',
            ...options.headers
        };

        if (this.token) {
            headers['Authorization'] = `token ${this.token}`;
        }

        const response = await fetch(url, {
            ...options,
            headers
        });

        if (!response.ok) {
            throw new Error(`GitHub API Error: ${response.status} ${response.statusText}`);
        }

        return response.json();
    }
}

// グローバルインスタンス
const githubAPI = new GitHubAPI();
const gasAPI = new GasAPI();

/**
 * データの統合取得・更新関数（フロントエンドからはこれを呼ぶ）
 */
const DataAPI = {
    // キャッシュユーティリティ
    _setCache(key, data) {
        localStorage.setItem(`cache_${key}`, JSON.stringify({
            data,
            timestamp: Date.now()
        }));
    },
    _getCache(key) {
        const cached = localStorage.getItem(`cache_${key}`);
        return cached ? JSON.parse(cached) : null;
    },
    
    lastError: null,
    
    _setLastError(error) {
        this.lastError = {
            message: error.message,
            timestamp: new Date().toISOString(),
            stack: error.stack
        };
        console.error('DataAPI Error logged:', error);
    },

    // Tasks
    async getTasks() {
        try {
            const data = await gasAPI.fetchData('tasks');
            this._setCache('tasks', data);
            return { tasks: data, sha: null, isCache: false };
        } catch (error) {
            this._setLastError(error);
            const cached = this._getCache('tasks');
            if (cached) {
                console.warn('Using cached tasks due to error:', error);
                return { tasks: cached.data, sha: null, isCache: true, error: error.message };
            }
            throw error;
        }
    },
    async updateTasks(tasks) {
        const result = await gasAPI.updateData('tasks', tasks);
        this._setCache('tasks', tasks); // 更新成功(リクエスト送信)時もキャッシュを更新
        return result;
    },

    // Journals
    async getJournals() {
        try {
            const data = await gasAPI.fetchData('journals');
            this._setCache('journals', data);
            return { journals: data, sha: null, isCache: false };
        } catch (error) {
            this._setLastError(error);
            const cached = this._getCache('journals');
            if (cached) {
                console.warn('Using cached journals due to error:', error);
                return { journals: cached.data, sha: null, isCache: true, error: error.message };
            }
            throw error;
        }
    },
    async updateJournals(journals) {
        const result = await gasAPI.updateData('journals', journals);
        this._setCache('journals', journals);
        return result;
    },

    // Sync
    async syncCalendar(tasks) {
        // [Optimization] 個別に同期OFF設定されているタスク、および完了済みタスクを除外
        const syncTasks = tasks.filter(t => t.sync_calendar !== false && t.status !== 'DONE');
        return await gasAPI.updateData('sync_calendar', syncTasks);
    },
    async syncGTasks(tasks) {
        // [Optimization] 同様にフィルタリング
        const activeTasks = tasks.filter(t => t.status !== 'DONE');
        return await gasAPI.updateData('sync_gtasks', activeTasks);
    }
};

