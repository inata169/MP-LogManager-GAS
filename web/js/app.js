/**
 * メインアプリケーションロジック
 */

// アプリ初期化
document.addEventListener('DOMContentLoaded', async () => {
    console.log('MP-LogManager Web App v2.2.5 (Optimization & Fix) loading...');
    initTheme();
    initNavigation();
    initModals();
    initRefresh();
    initSettings();
    initSync();

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
        const diagResult = document.getElementById('connection-diag-result');
        const originalText = btn.textContent;
        
        btn.textContent = 'テスト中...';
        btn.disabled = true;
        diagResult.style.display = 'block';
        diagResult.innerHTML = '<div class="diag-loading">診断中...</div>';

        const tempApi = new GasAPI();
        tempApi.setUrl(gasUrl);

        try {
            const result = await tempApi.diagnose();
            
            let html = `<h4>診断結果</h4><ul class="diag-list">`;
            result.steps.forEach(step => {
                const statusClass = step.status === 'OK' ? 'diag-ok' : 'diag-fail';
                html += `
                    <li>
                        <span class="diag-step-name">${step.name}</span>
                        <span class="diag-step-status ${statusClass}">${step.status}</span>
                        ${step.error ? `<div class="diag-error">${step.error}</div>` : ''}
                        ${step.hint ? `<div class="diag-hint">${step.hint}</div>` : ''}
                    </li>`;
            });
            
            // DataAPIの直近エラーも表示
            if (DataAPI.lastError) {
                html += `
                    <li class="diag-last-error">
                        <span class="diag-step-name">Last Operations Error</span>
                        <div class="diag-error">
                            [${DataAPI.lastError.timestamp}] ${DataAPI.lastError.message}
                        </div>
                    </li>`;
            }
            
            html += `</ul>`;
            
            if (result.ok) {
                html += `<div class="diag-summary success">✅ 接続に成功しました。設定を保存してリロードしてください。</div>`;
                showToast('接続成功！', 'success');
            } else {
                html += `<div class="diag-summary error">❌ 接続に失敗しました。GASのデプロイ設定（アクセス権: 全員）やクォータ制限を確認してください。</div>`;
                showToast('接続失敗', 'error');
            }
            
            diagResult.innerHTML = html;
        } catch (e) {
            diagResult.innerHTML = `<div class="diag-summary error">重大なエラー: ${e.message}</div>`;
            showToast(`エラー: ${e.message}`, 'error');
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



/**
 * 同期機能初期化
 */
function initSync() {
    const syncBtn = document.getElementById('sync-btn');
    if (!syncBtn) return;

    // 設定で両方OFFならボタンを無効化（または非表示）
    const isSyncEnabled = localStorage.getItem('sync_calendar') === 'true' || localStorage.getItem('sync_gtasks') === 'true';
    if (!isSyncEnabled) {
        syncBtn.style.opacity = '0.5';
        syncBtn.title = '設定でGoogle同期がオフになっています';
    }

    syncBtn.addEventListener('click', async () => {
        if (!gasAPI.hasUrl()) {
            showToast('GAS URLを設定してください', 'warning');
            return;
        }

        const icon = syncBtn.querySelector('.icon');
        // 回転アニメーション開始
        const animation = icon.animate([
            { transform: 'rotate(0deg)' },
            { transform: 'rotate(360deg)' }
        ], {
            duration: 1000,
            iterations: Infinity
        });

        try {
            showToast('Google と同期中...', 'info');
            const syncResults = [];
            
            if (localStorage.getItem('sync_calendar') === 'true') {
                console.log('Manual sync: Calendar...');
                syncResults.push(DataAPI.syncCalendar(tasksData).then(r => ({ type: 'Calendar', ...r })));
            }
            if (localStorage.getItem('sync_gtasks') === 'true') {
                console.log('Manual sync: GTasks...');
                syncResults.push(DataAPI.syncGTasks(tasksData).then(r => ({ type: 'Tasks', ...r })));
            }

            if (syncResults.length === 0) {
                showToast('同期設定がオフになっています', 'warning');
            } else {
                const results = await Promise.all(syncResults);
                let message = 'Google 同期が完了しました';
                results.forEach(res => {
                    if (res.updated !== undefined) {
                        message += `\n- ${res.type}: ${res.updated}件`;
                    } else if (res.status === 'requested (fallback)' || res.status === 'cors_blocked') {
                        message += `\n- ${res.type}: 通信不安定（要カレンダー確認）`;
                    }
                });
                showToast(message, 'success', 5000);
            }
        } catch (error) {
            console.error('Manual sync failed:', error);
            showToast(`同期失敗: ${error.message}\n(GASの承認が必要な場合があります)`, 'error', 6000);
        } finally {
            animation.cancel();
        }
    });
}
