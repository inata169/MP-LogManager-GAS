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
            if (!response.ok) throw new Error(`GAS API Error: ${response.status}`);
            return response.json();
        } catch (error) {
            console.error(`FetchData failed (${type}):`, error);
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

    /**
     * GASへの疎通確認
     */
    async ping() {
        if (!this.hasUrl()) return false;
        try {
            // 短いタイムアウトで接続確認
            const response = await this.fetchWithTimeout(`${this.url}?type=ping&t=${Date.now()}`, {}, 5000);
            return response.ok;
        } catch (e) {
            return false;
        }
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
    // Tasks
    async getTasks() {
        const data = await gasAPI.fetchData('tasks');
        return { tasks: data, sha: null }; // GASではSHA不要
    },
    async updateTasks(tasks) {
        return await gasAPI.updateData('tasks', tasks);
    },

    // Journals
    async getJournals() {
        const data = await gasAPI.fetchData('journals');
        return { journals: data, sha: null };
    },
    async updateJournals(journals) {
        return await gasAPI.updateData('journals', journals);
    },

    // Sync
    async syncCalendar(tasks) {
        return await gasAPI.updateData('sync_calendar', tasks);
    },
    async syncGTasks(tasks) {
        return await gasAPI.updateData('sync_gtasks', tasks);
    }
};

