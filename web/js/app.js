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

    // GAS URL確認
    if (!gasAPI.hasUrl()) {
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
        const gasUrl = document.getElementById('gas-url').value.trim();
        const token = document.getElementById('github-token').value.trim();
        const owner = document.getElementById('github-owner').value.trim();
        const repo = document.getElementById('github-repo').value.trim();
        const syncCalendar = document.getElementById('sync-calendar-toggle').checked;
        const syncGTasks = document.getElementById('sync-gtasks-toggle').checked;

        if (!gasUrl) {
            showToast('GAS Web App URL を入力してください', 'error');
            return;
        }

        gasAPI.setUrl(gasUrl);
        if (token) githubAPI.setToken(token);
        
        localStorage.setItem('sync_calendar', syncCalendar);
        localStorage.setItem('sync_gtasks', syncGTasks);

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
        showToast('設定を保存しました。リロードします...', 'success');
        setTimeout(() => location.reload(), 1500);  // リロードしてデータ読み込み
    });

    // 接続テスト
    document.getElementById('test-gas-connection').addEventListener('click', async () => {
        const gasUrl = document.getElementById('gas-url').value.trim();
        if (!gasUrl) {
            showToast('URLを入力してください', 'warning');
            return;
        }

        const btn = document.getElementById('test-gas-connection');
        const originalText = btn.textContent;
        btn.textContent = 'テスト中...';
        btn.disabled = true;

        const tempApi = new GasAPI();
        tempApi.setUrl(gasUrl);

        try {
            const success = await tempApi.ping();
            if (success) {
                showToast('接続成功！', 'success');
            } else {
                showToast('接続に失敗しました。URLまたはGASの公開設定を確認してください。', 'error');
            }
        } catch (e) {
            showToast('エラーが発生しました', 'error');
        } finally {
            btn.textContent = originalText;
            btn.disabled = false;
        }
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
 * トースト通知を表示
 */
function showToast(message, type = 'info', duration = 3000) {
    const container = document.getElementById('toast-container');
    if (!container) return;

    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    
    let icon = 'ℹ️';
    if (type === 'success') icon = '✅';
    if (type === 'error') icon = '❌';
    if (type === 'warning') icon = '⚠️';

    toast.innerHTML = `<span>${icon}</span><span>${message}</span>`;
    container.appendChild(toast);

    // 自動消去
    setTimeout(() => {
        toast.classList.add('fade-out');
        setTimeout(() => toast.remove(), 300);
    }, duration);
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
            showToast('同期に失敗しました。接続を確認してください。', 'error');
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
        // 現在の設定を反映
        document.getElementById('gas-url').value = localStorage.getItem('gas_url') || '';
        document.getElementById('github-token').value = localStorage.getItem('github_token') || '';
        document.getElementById('github-owner').value = localStorage.getItem('github_owner') || '';
        document.getElementById('github-repo').value = localStorage.getItem('github_repo') || '';
        document.getElementById('sync-calendar-toggle').checked = localStorage.getItem('sync_calendar') === 'true';
        document.getElementById('sync-gtasks-toggle').checked = localStorage.getItem('sync_gtasks') === 'true';

        showModal('settings-modal');
    });
}


