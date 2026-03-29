/**
 * GitHub API連携モジュール
 * Personal Access Token (PAT) を使用してGitHubリポジトリのJSONファイルを読み書き
 */

const API_CONFIG = {
    owner: 'inata169',  // Default owner
    repo: 'MP-LogManager',  // Default repo
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

    // URLから抽出試行 (GitHub Pages: <owner>.github.io/<repo>/)
    const host = window.location.host;
    const pathParts = window.location.pathname.split('/').filter(p => p);

    if (host.endsWith('.github.io')) {
        const owner = host.split('.')[0];
        // パスが空でなければ最初の部分をリポジトリ名とみなす
        const repo = pathParts[0] || API_CONFIG.repo;
        return { owner, repo };
    }

    return { owner: API_CONFIG.owner, repo: API_CONFIG.repo };
}

// 初期化時に設定を反映
const activeConfig = getRepoConfig();
API_CONFIG.owner = activeConfig.owner;
API_CONFIG.repo = activeConfig.repo;


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

    /**
     * ファイルの内容を取得
     */
    async getFile(path) {
        const endpoint = `/repos/${API_CONFIG.owner}/${API_CONFIG.repo}/contents/${path}`;
        const data = await this.request(endpoint);

        // Base64デコード（日本語対応）
        const binaryString = atob(data.content.replace(/\s/g, ''));
        const bytes = Uint8Array.from(binaryString, c => c.charCodeAt(0));
        const content = new TextDecoder('utf-8').decode(bytes);

        return {
            content: JSON.parse(content),
            sha: data.sha  // 更新時に必要
        };
    }

    /**
     * ファイルを更新
     */
    async updateFile(path, content, sha, message) {
        const endpoint = `/repos/${API_CONFIG.owner}/${API_CONFIG.repo}/contents/${path}`;

        // JSON → UTF-8 bytes → Base64エンコード
        const jsonStr = JSON.stringify(content, null, 2);
        const bytes = new TextEncoder().encode(jsonStr);
        let binary = '';
        const len = bytes.byteLength;
        for (let i = 0; i < len; i++) {
            binary += String.fromCharCode(bytes[i]);
        }
        const contentBase64 = btoa(binary);

        const data = await this.request(endpoint, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                message,
                content: contentBase64,
                sha,
                branch: API_CONFIG.branch
            })
        });

        return data;
    }

    /**
     * Tasks取得
     */
    async getTasks() {
        const { content, sha } = await this.getFile(API_CONFIG.tasksPath);
        return { tasks: content, sha };
    }

    /**
     * Tasks更新
     */
    async updateTasks(tasks, sha) {
        return this.updateFile(
            API_CONFIG.tasksPath,
            tasks,
            sha,
            'Update tasks from web app [skip ci]'
        );
    }

    /**
     * Journals取得
     */
    async getJournals() {
        const { content, sha } = await this.getFile(API_CONFIG.journalsPath);
        return { journals: content, sha };
    }

    /**
     * Journals更新
     */
    async updateJournals(journals, sha) {
        return this.updateFile(
            API_CONFIG.journalsPath,
            journals,
            sha,
            'Update journals from web app [skip ci]'
        );
    }
}

// グローバルインスタンス
const githubAPI = new GitHubAPI();
