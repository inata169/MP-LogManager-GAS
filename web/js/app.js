/**
 * メインアプリケーションロジック
 */

// アプリ初期化
document.addEventListener('DOMContentLoaded', async () => {
    console.log('MP-LogManager Web App v20260321 loading...');
    initTheme();
    initNavigation();
    initModals();
    initRefresh();
    initSettings();

    // GitHub Token確認
    if (!githubAPI.hasToken()) {
        showModal('settings-modal');
        return;
    }

    // データ読み込み
    await Promise.all([
        loadTasks(),
        loadJournals()
    ]);
});

/**
 * テーマ初期化
 */
function initTheme() {
    const savedTheme = localStorage.getItem('theme') || 'light';
    document.documentElement.setAttribute('data-theme', savedTheme);
    updateThemeIcon(savedTheme);
    updateHighlightTheme(savedTheme);

    document.getElementById('theme-toggle').addEventListener('click', () => {
        const currentTheme = document.documentElement.getAttribute('data-theme');
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
        document.documentElement.setAttribute('data-theme', newTheme);
        localStorage.setItem('theme', newTheme);
        updateThemeIcon(newTheme);
        updateHighlightTheme(newTheme);
    });
}

function updateHighlightTheme(theme) {
    const hljsLight = document.getElementById('hljs-theme-light');
    const hljsDark = document.getElementById('hljs-theme-dark');
    if (hljsLight && hljsDark) {
        if (theme === 'dark') {
            hljsLight.disabled = true;
            hljsDark.disabled = false;
        } else {
            hljsLight.disabled = false;
            hljsDark.disabled = true;
        }
    }
}

function updateThemeIcon(theme) {
    const icon = document.querySelector('#theme-toggle .icon');
    icon.textContent = theme === 'dark' ? '☀️' : '🌙';
}

/**
 * ナビゲーション初期化
 */
function initNavigation() {
    const navButtons = document.querySelectorAll('.nav-btn');
    const views = document.querySelectorAll('.view');

    navButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            const viewName = btn.dataset.view;

            // ナビゲーションボタンのアクティブ状態更新
            navButtons.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');

            // ビューの切り替え
            views.forEach(v => v.classList.remove('active'));
            document.getElementById(`${viewName}-view`).classList.add('active');
        });
    });
}

/**
 * モーダル初期化
 */
function initModals() {
    // モーダルを閉じる
    document.querySelectorAll('.modal-close').forEach(btn => {
        btn.addEventListener('click', () => {
            hideModal(btn.closest('.modal').id);
        });
    });

    // モーダル外クリックで閉じる
    document.querySelectorAll('.modal').forEach(modal => {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                hideModal(modal.id);
            }
        });
    });

    // 設定保存
    document.getElementById('save-settings').addEventListener('click', () => {
        const token = document.getElementById('github-token').value.trim();
        const owner = document.getElementById('github-owner').value.trim();
        const repo = document.getElementById('github-repo').value.trim();

        if (!token) {
            alert('GitHub Tokenを入力してください');
            return;
        }

        githubAPI.setToken(token);

        // Owner/Repoを保存（空の場合は削除して自動取得に任せる）
        if (owner) {
            localStorage.setItem('github_owner', owner);
        } else {
            localStorage.removeItem('github_owner');
        }

        if (repo) {
            localStorage.setItem('github_repo', repo);
        } else {
            localStorage.removeItem('github_repo');
        }

        hideModal('settings-modal');
        location.reload();  // リロードしてデータ読み込み
    });
}

/**
 * モーダル表示
 */
function showModal(modalId) {
    document.getElementById(modalId).classList.add('active');
}

/**
 * モーダル非表示
 */
function hideModal(modalId) {
    document.getElementById(modalId).classList.remove('active');
}

/**
 * ローディング表示
 */
function showLoading(show) {
    document.getElementById('loading').classList.toggle('active', show);
}

/**
 * Service Worker登録（PWA）
 */
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('sw.js')
            .then(reg => console.log('Service Worker registered:', reg))
            .catch(err => console.log('Service Worker registration failed:', err));
    });
}

/**
 * リフレッシュ機能初期化
 */
function initRefresh() {
    const refreshBtn = document.getElementById('refresh-btn');
    if (!refreshBtn) return;

    refreshBtn.addEventListener('click', async () => {
        const icon = refreshBtn.querySelector('.icon');

        // 回転アニメーション開始
        icon.style.display = 'inline-block';
        const animation = icon.animate([
            { transform: 'rotate(0deg)' },
            { transform: 'rotate(360deg)' }
        ], {
            duration: 1000,
            iterations: Infinity
        });

        try {
            showLoading(true);
            await Promise.all([
                loadTasks(),
                loadJournals()
            ]);
            console.log('Data refreshed');
        } catch (error) {
            console.error('Refresh failed:', error);
            alert('同期に失敗しました。');
        } finally {
            showLoading(false);
            // アニメーション停止
            animation.cancel();
        }
    });
}

/**
 * 設定初期化
 */
function initSettings() {
    const settingsBtn = document.getElementById('settings-btn');
    if (!settingsBtn) return;

    settingsBtn.addEventListener('click', () => {
        // 現在のトークンをフィールドに反映
        const token = localStorage.getItem('github_token') || '';
        document.getElementById('github-token').value = token;

        // Owner/Repoも反映
        document.getElementById('github-owner').value = localStorage.getItem('github_owner') || '';
        document.getElementById('github-repo').value = localStorage.getItem('github_repo') || '';

        showModal('settings-modal');
    });
}


