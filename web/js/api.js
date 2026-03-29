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
        
        // ブラウザのキャッシュを回避するためにタイムスタンプを付与
        const response = await fetch(`${this.url}?type=${type}&t=${Date.now()}`);
        if (!response.ok) throw new Error(`GAS API Error: ${response.status}`);
        return response.json();
    }

    async updateData(type, data) {
        if (!this.hasUrl()) throw new Error('GAS URLが設定されていません');

        // GASのdoPostでパース可能な形式で送信
        const response = await fetch(this.url, {
            method: 'POST',
            mode: 'no-cors', // 重要: GASの仕様上、レスポンスが見えない場合がある
            headers: {
                'Content-Type': 'text/plain' // CORS回避のため text/plain を推奨
            },
            body: JSON.stringify({
                type: type,
                data: data
            })
        });

        // no-cors の場合、response.ok は常に false になるが、送信自体は成功している
        return { status: 'requested' }; 
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
    }
};

