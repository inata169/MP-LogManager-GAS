/**
 * メインアプリケーションロジック
 */

let isManualSyncRunning = false;
let activeModal = null;
let modalOpener = null;
let inertedBackgroundElements = [];

const MODAL_FOCUSABLE_SELECTOR = [
    'a[href]',
    'button:not([disabled])',
    'input:not([disabled]):not([type="hidden"])',
    'select:not([disabled])',
    'textarea:not([disabled])',
    '[tabindex]:not([tabindex="-1"])'
].join(',');

// アプリ初期化
document.addEventListener('DOMContentLoaded', async () => {
    console.log('MP-LogManager Web App v2.3.4 loading...');
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
    document.querySelectorAll('.modal-close').forEach(btn => {
        btn.addEventListener('click', () => {
            requestCloseModal(btn.closest('.modal').id, 'control');
        });
    });

    document.querySelectorAll('.modal').forEach(modal => {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                requestCloseModal(modal.id, 'overlay');
            }
        });
    });

    document.addEventListener('keydown', handleModalKeydown);

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
        const loadingMessage = document.createElement('div');
        loadingMessage.className = 'diag-loading';
        loadingMessage.textContent = '診断中...';
        diagResult.replaceChildren(loadingMessage);

        const tempApi = new GasAPI();
        tempApi.setUrl(gasUrl);

        try {
            const result = await tempApi.diagnose();
            
            renderConnectionDiagnostics(diagResult, result, DataAPI.lastError);
            if (result.ok) {
                appendDiagnosticSummary(diagResult, 'info', 'GAS ping OK. This only confirms basic connectivity; Calendar sync is not verified.');
                showToast('GAS ping OK only. Calendar sync is not verified.', 'info', 5500);
            } else {
                appendDiagnosticSummary(diagResult, 'error', '❌ 接続に失敗しました。GASのデプロイ設定（アクセス権: 全員）やクォータ制限を確認してください。');
                showToast('接続失敗', 'error');
            }
        } catch (e) {
            diagResult.replaceChildren();
            appendDiagnosticSummary(diagResult, 'error', `重大なエラー: ${String(e.message ?? e)}`);
            showToast(`エラー: ${e.message}`, 'error');
        } finally {
            btn.textContent = originalText;
            btn.disabled = false;
        }
    });
}

function appendTextElement(parent, tagName, className, value) {
    const element = document.createElement(tagName);
    if (className) element.className = className;
    element.textContent = String(value ?? '');
    parent.appendChild(element);
    return element;
}

function renderConnectionDiagnostics(container, result, lastError) {
    container.replaceChildren();
    appendTextElement(container, 'h4', '', '診断結果');
    const list = document.createElement('ul');
    list.className = 'diag-list';

    const steps = Array.isArray(result?.steps) ? result.steps : [];
    steps.forEach(step => {
        const item = document.createElement('li');
        appendTextElement(item, 'span', 'diag-step-name', step?.name);
        const isOk = step?.status === 'OK';
        appendTextElement(item, 'span', `diag-step-status ${isOk ? 'diag-ok' : 'diag-fail'}`, step?.status);
        if (step?.error) appendTextElement(item, 'div', 'diag-error', step.error);
        if (step?.hint) appendTextElement(item, 'div', 'diag-hint', step.hint);
        list.appendChild(item);
    });

    if (lastError) {
        const item = document.createElement('li');
        item.className = 'diag-last-error';
        appendTextElement(item, 'span', 'diag-step-name', 'Last Operations Error');
        appendTextElement(item, 'div', 'diag-error', `[${String(lastError.timestamp ?? '')}] ${String(lastError.message ?? '')}`);
        list.appendChild(item);
    }
    container.appendChild(list);
}

function appendDiagnosticSummary(container, type, message) {
    const safeType = type === 'info' ? 'info' : 'error';
    appendTextElement(container, 'div', `diag-summary ${safeType}`, message);
}

/**
 * モーダル表示
 */
function showModal(modalId) {
    const modal = document.getElementById(modalId);
    if (!modal) return;

    if (activeModal && activeModal !== modal) {
        hideModal(activeModal.id);
    }

    const focusedElement = document.activeElement;
    modalOpener = focusedElement instanceof HTMLElement && !modal.contains(focusedElement)
        ? focusedElement
        : null;
    activeModal = modal;
    modal.classList.add('active');
    modal.setAttribute('aria-hidden', 'false');
    document.body.classList.add('modal-open');
    setModalBackgroundInert(modal);

    // 前回閉じた位置ではなく、常にフォーム先頭から表示する
    modal.querySelectorAll('.modal-content, .modal-body').forEach(element => {
        element.scrollTop = 0;
    });

    requestAnimationFrame(() => {
        const initialFocus = modal.querySelector('[data-modal-initial-focus]')
            || getModalFocusableElements(modal)[0]
            || modal.querySelector('.modal-content');
        if (initialFocus) {
            if (!initialFocus.hasAttribute('tabindex') && initialFocus.classList.contains('modal-content')) {
                initialFocus.tabIndex = -1;
            }
            initialFocus.focus({ preventScroll: true });
        }
    });
}

/**
 * モーダル非表示
 */
function hideModal(modalId) {
    const modal = document.getElementById(modalId);
    if (!modal) return;

    modal.classList.remove('active');
    modal.setAttribute('aria-hidden', 'true');
    if (activeModal !== modal) return;

    activeModal = null;
    restoreModalBackground();
    document.body.classList.remove('modal-open');

    const opener = modalOpener;
    modalOpener = null;
    requestAnimationFrame(() => {
        if (opener?.isConnected && typeof opener.focus === 'function') {
            opener.focus({ preventScroll: true });
        }
    });
}

function requestCloseModal(modalId, reason = 'programmatic') {
    const modal = document.getElementById(modalId);
    if (!modal || !modal.classList.contains('active')) return false;

    const closeEvent = new CustomEvent('modalbeforeclose', {
        cancelable: true,
        detail: { reason }
    });
    if (!modal.dispatchEvent(closeEvent)) return false;

    hideModal(modalId);
    return true;
}

function getModalFocusableElements(modal) {
    return Array.from(modal.querySelectorAll(MODAL_FOCUSABLE_SELECTOR)).filter(element => {
        return !element.hidden
            && element.getAttribute('aria-hidden') !== 'true'
            && element.getClientRects().length > 0;
    });
}

function handleModalKeydown(event) {
    if (!activeModal) return;

    if (event.key === 'Escape') {
        event.preventDefault();
        requestCloseModal(activeModal.id, 'escape');
        return;
    }

    if (event.key !== 'Tab') return;
    const focusable = getModalFocusableElements(activeModal);
    if (focusable.length === 0) {
        event.preventDefault();
        activeModal.querySelector('.modal-content')?.focus({ preventScroll: true });
        return;
    }

    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    if (event.shiftKey && (document.activeElement === first || !activeModal.contains(document.activeElement))) {
        event.preventDefault();
        last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
    }
}

function setModalBackgroundInert(modal) {
    restoreModalBackground();
    const backgroundElements = document.querySelectorAll('body > .app-header, body > #app-main, body > .bottom-nav, body > .modal');
    inertedBackgroundElements = Array.from(backgroundElements)
        .filter(element => element !== modal)
        .map(element => ({
            element,
            wasInert: element.hasAttribute('inert'),
            previousAriaHidden: element.getAttribute('aria-hidden')
        }));
    inertedBackgroundElements.forEach(({ element }) => {
        element.setAttribute('inert', '');
        element.setAttribute('aria-hidden', 'true');
    });
}

function restoreModalBackground() {
    inertedBackgroundElements.forEach(({ element, wasInert, previousAriaHidden }) => {
        if (!element.isConnected) return;
        if (!wasInert) element.removeAttribute('inert');
        if (previousAriaHidden == null) {
            element.removeAttribute('aria-hidden');
        } else {
            element.setAttribute('aria-hidden', previousAriaHidden);
        }
    });
    inertedBackgroundElements = [];
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

    const allowedTypes = new Set(['info', 'success', 'error', 'warning']);
    const safeType = allowedTypes.has(type) ? type : 'info';
    const toast = document.createElement('div');
    toast.className = `toast ${safeType}`;
    toast.setAttribute('role', safeType === 'error' ? 'alert' : 'status');
    
    let icon = 'ℹ️';
    if (safeType === 'success') icon = '✅';
    if (safeType === 'error') icon = '❌';
    if (safeType === 'warning') icon = '⚠️';

    const iconElement = document.createElement('span');
    iconElement.setAttribute('aria-hidden', 'true');
    iconElement.textContent = icon;
    const messageElement = document.createElement('span');
    messageElement.className = 'toast-message';
    messageElement.textContent = String(message ?? '');
    toast.append(iconElement, messageElement);
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
        if (isManualSyncRunning) {
            showToast('Google sync is already running.', 'info', 2500);
            return;
        }

        isManualSyncRunning = true;
        syncBtn.disabled = true;
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
            const calendarStats = {
                eligible: tasksData.filter(t => t.sync_calendar !== false && t.status !== 'DONE' && t.due_date).length,
                skippedNoDate: tasksData.filter(t => t.sync_calendar !== false && t.status !== 'DONE' && !t.due_date).length,
                skippedPerTaskOff: tasksData.filter(t => t.sync_calendar === false && t.status !== 'DONE').length,
                completedExcluded: tasksData.filter(t => t.status === 'DONE').length
            };
            
            if (localStorage.getItem('sync_calendar') === 'true') {
                console.log('Manual sync: Calendar...');
                showToast(`Calendar sync check: ${calendarStats.eligible} sent, ${calendarStats.skippedNoDate} no due date, ${calendarStats.skippedPerTaskOff} per-task off, ${calendarStats.completedExcluded} completed excluded.`, 'info', 6000);
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
                let hasUnconfirmedResult = false;
                let hasReadableDiagnostic = false;
                let message = 'Google sync diagnostic result';
                results.forEach(res => {
                    if (res.status === 'requested (fallback)' || res.status === 'cors_blocked') {
                        hasUnconfirmedResult = true;
                        message += `\n- ${res.type}: request sent, but GAS did not confirm completion`;
                    } else if (res.updated !== undefined) {
                        hasReadableDiagnostic = true;
                        message += `\n- ${res.type}: GAS returned ${res.status || 'ok'} for ${res.updated} item(s); Calendar visibility is not verified`;
                    }
                });
                if (calendarStats.eligible === 0 && localStorage.getItem('sync_calendar') === 'true') {
                    message += '\n- Calendar: no eligible tasks with due dates';
                }
                showToast(message, hasUnconfirmedResult || !hasReadableDiagnostic ? 'warning' : 'info', 6500);
            }
        } catch (error) {
            console.error('Manual sync failed:', error);
            showToast(`同期失敗: ${error.message}\n(GASの承認が必要な場合があります)`, 'error', 6000);
        } finally {
            animation.cancel();
            syncBtn.disabled = false;
            isManualSyncRunning = false;
        }
    });
}
