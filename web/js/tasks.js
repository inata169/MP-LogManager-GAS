/**
 * Tasks管理モジュール
 */

let tasksData = [];
let tasksSha = '';
let currentEditingTaskId = null;
let taskDetailsMode = 'edit';
let taskPreviewTimer = null;
let taskEditorSnapshot = '';

const TASK_PREVIEW_DEBOUNCE_MS = 150;
const TASK_PRIORITY_CLASSES = new Set(['high', 'medium', 'low']);

/**
 * Tasks読み込み
 */
async function loadTasks() {
    try {
        showLoading(true);
        const { tasks, sha, isCache, error } = await DataAPI.getTasks();
        tasksData = tasks || [];
        tasksSha = sha;
        renderTasks();

        if (isCache) {
            showToast(`オフラインまたは接続エラーのため、キャッシュデータを表示しています (${error})`, 'warning', 6000);
            document.getElementById('app-main').classList.add('cache-mode');
        } else {
            document.getElementById('app-main').classList.remove('cache-mode');
        }
    } catch (error) {
        console.error('Failed to load tasks:', error);
        showToast(`タスクの読み込みに失敗しました: ${error.message}`, 'error');
    } finally {
        showLoading(false);
    }
}

/**
 * Tasks表示
 */
function renderTasks() {
    const container = document.getElementById('tasks-list');
    const hideCompleted = document.getElementById('hide-completed').checked;
    const categoryFilter = document.getElementById('filter-category').value;

    // フィルタリング
    let filtered = [...tasksData];
    if (hideCompleted) {
        filtered = filtered.filter(t => t.status !== 'DONE');
    }
    if (categoryFilter !== 'all') {
        filtered = filtered.filter(t => t.category === categoryFilter);
    }

    const searchText = document.getElementById('task-search').value.toLowerCase().trim();
    if (searchText) {
        filtered = filtered.filter(t =>
            String(t.title ?? '').toLowerCase().includes(searchText) ||
            String(t.details ?? '').toLowerCase().includes(searchText)
        );
    }

    // ソート処理
    const sortType = document.getElementById('sort-tasks') ? document.getElementById('sort-tasks').value : 'default';
    filtered.sort((a, b) => {
        if (sortType === 'due_asc') {
            return new Date(a.due_date || '9999-12-31') - new Date(b.due_date || '9999-12-31');
        } else if (sortType === 'due_desc') {
            return new Date(b.due_date || '1970-01-01') - new Date(a.due_date || '1970-01-01');
        } else if (sortType === 'created_desc') {
            return new Date(b.created_at || parseInt(a.id || 0)) - new Date(a.created_at || parseInt(b.id || 0)); // fallback to id
        } else {
            // default
            if (a.status === 'DONE' && b.status !== 'DONE') return 1;
            if (a.status !== 'DONE' && b.status === 'DONE') return -1;
            if (a.status === 'DONE') {
                return new Date(b.completed_at || 0) - new Date(a.completed_at || 0);
            } else {
                return new Date(a.due_date || '9999-12-31') - new Date(b.due_date || '9999-12-31');
            }
        }
    });

    const fragment = document.createDocumentFragment();
    filtered.forEach(task => fragment.appendChild(createTaskElement(task)));
    container.replaceChildren(fragment);
}

function createTaskElement(task) {
    const isDone = task.status === 'DONE';
    const item = document.createElement('div');
    item.className = `task-item${isDone ? ' task-done' : ''}`;
    item.dataset.id = String(task.id ?? '');

    const header = document.createElement('div');
    header.className = 'task-header';

    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.className = 'task-checkbox';
    checkbox.checked = isDone;
    checkbox.setAttribute('aria-label', `完了状態を切り替える: ${String(task.title ?? '')}`);
    checkbox.addEventListener('click', event => event.stopPropagation());
    checkbox.addEventListener('change', () => toggleTaskStatus(task.id));

    const content = document.createElement('div');
    content.className = 'task-content';

    const title = document.createElement('div');
    title.className = 'task-title';
    title.textContent = String(task.title ?? '');
    content.appendChild(title);

    const meta = document.createElement('div');
    meta.className = 'task-meta';

    const category = document.createElement('span');
    category.className = 'task-badge badge-category';
    category.textContent = String(task.category ?? '');
    meta.appendChild(category);

    const priorityText = String(task.priority ?? 'Medium');
    const priorityKey = priorityText.toLowerCase();
    const priority = document.createElement('span');
    priority.className = `task-badge badge-priority-${TASK_PRIORITY_CLASSES.has(priorityKey) ? priorityKey : 'medium'}`;
    priority.textContent = priorityText;
    meta.appendChild(priority);

    if (task.due_date) {
        const dueDate = document.createElement('span');
        dueDate.textContent = `📅 ${String(task.due_date)}`;
        meta.appendChild(dueDate);
    }
    content.appendChild(meta);

    if (task.details) {
        const details = document.createElement('div');
        details.className = 'task-details markdown-body';
        SafeRender.renderMarkdownInto(details, task.details, { preprocess: preprocessMarkdownTables });
        content.appendChild(details);
    }

    const deleteButton = document.createElement('button');
    deleteButton.type = 'button';
    deleteButton.className = 'task-delete-btn';
    deleteButton.setAttribute('aria-label', `削除: ${String(task.title ?? '')}`);
    deleteButton.textContent = '🗑️';
    deleteButton.addEventListener('click', event => {
        event.stopPropagation();
        deleteTask(task.id);
    });

    header.append(checkbox, content, deleteButton);
    item.appendChild(header);
    item.addEventListener('click', () => openEditTaskModal(task.id));
    return item;
}

/**
 * タスクステータス切り替え
 */
async function toggleTaskStatus(taskId) {
    const task = tasksData.find(t => t.id === taskId);
    if (!task) return;

    task.status = task.status === 'DONE' ? 'TODO' : 'DONE';
    task.completed_at = task.status === 'DONE' ? new Date().toISOString() : null;

    await saveTasks();
}

function clearTaskPreviewTimer() {
    if (taskPreviewTimer) {
        clearTimeout(taskPreviewTimer);
        taskPreviewTimer = null;
    }
}

function showTaskPreviewMessage(message) {
    const preview = document.getElementById('task-details-preview-panel');
    preview.replaceChildren();

    const emptyMessage = document.createElement('p');
    emptyMessage.className = 'task-details-preview-empty';
    emptyMessage.textContent = message;
    preview.appendChild(emptyMessage);
}

function renderTaskDetailsPreview() {
    const source = document.getElementById('task-details').value;
    const preview = document.getElementById('task-details-preview-panel');

    if (!source.trim()) {
        showTaskPreviewMessage('プレビューする内容がありません');
        return;
    }

    const result = SafeRender.renderMarkdownInto(preview, source, { preprocess: preprocessMarkdownTables });
    if (!result.hasContent || (!preview.textContent.trim() && !preview.querySelector('*'))) {
        showTaskPreviewMessage('安全に表示できる内容がありません');
    }
}

function scheduleTaskDetailsPreview() {
    clearTaskPreviewTimer();
    if (taskDetailsMode !== 'preview') return;

    taskPreviewTimer = setTimeout(() => {
        taskPreviewTimer = null;
        if (taskDetailsMode === 'preview') {
            renderTaskDetailsPreview();
        }
    }, TASK_PREVIEW_DEBOUNCE_MS);
}

function setTaskDetailsMode(mode, { focusTab = false } = {}) {
    const nextMode = mode === 'preview' ? 'preview' : 'edit';
    const editPanel = document.getElementById('task-details-edit-panel');
    const previewPanel = document.getElementById('task-details-preview-panel');
    const tabs = document.querySelectorAll('.task-details-tab');

    clearTaskPreviewTimer();
    taskDetailsMode = nextMode;

    tabs.forEach(tab => {
        const isSelected = tab.dataset.taskDetailsMode === nextMode;
        tab.setAttribute('aria-selected', String(isSelected));
        tab.tabIndex = isSelected ? 0 : -1;

        if (isSelected && focusTab) {
            tab.focus();
        }
    });

    editPanel.hidden = nextMode !== 'edit';
    previewPanel.hidden = nextMode !== 'preview';

    if (nextMode === 'preview') {
        renderTaskDetailsPreview();
    }
}

function resetTaskDetailsEditor(source = '') {
    clearTaskPreviewTimer();
    document.getElementById('task-details').value = source == null ? '' : String(source);
    document.getElementById('task-details-preview-panel').replaceChildren();
    setTaskDetailsMode('edit');
}

function getTaskEditorSnapshot() {
    return JSON.stringify({
        title: document.getElementById('task-title').value,
        category: document.getElementById('task-category').value,
        priority: document.getElementById('task-priority').value,
        dueDate: document.getElementById('task-due-date').value,
        details: document.getElementById('task-details').value,
        syncCalendar: document.getElementById('task-sync-calendar').checked
    });
}

function captureTaskEditorSnapshot() {
    taskEditorSnapshot = getTaskEditorSnapshot();
}

function isTaskEditorDirty() {
    return Boolean(taskEditorSnapshot) && getTaskEditorSnapshot() !== taskEditorSnapshot;
}

function handleTaskDetailsTabKeydown(event) {
    const tabs = Array.from(document.querySelectorAll('.task-details-tab'));
    const currentIndex = tabs.indexOf(document.activeElement);
    if (currentIndex < 0) return;

    let nextIndex = null;
    if (event.key === 'ArrowRight') {
        nextIndex = (currentIndex + 1) % tabs.length;
    } else if (event.key === 'ArrowLeft') {
        nextIndex = (currentIndex - 1 + tabs.length) % tabs.length;
    } else if (event.key === 'Home') {
        nextIndex = 0;
    } else if (event.key === 'End') {
        nextIndex = tabs.length - 1;
    }

    if (nextIndex == null) return;
    event.preventDefault();
    setTaskDetailsMode(tabs[nextIndex].dataset.taskDetailsMode, { focusTab: true });
}

/**
 * 新規タスクモーダルを開く
 */
function openAddTaskModal() {
    currentEditingTaskId = null;
    document.getElementById('modal-title').textContent = '新規タスク';
    document.getElementById('task-title').value = '';
    document.getElementById('task-category').value = 'Planning';
    document.getElementById('task-priority').value = 'Medium';
    document.getElementById('task-due-date').value = '';
    resetTaskDetailsEditor();
    document.getElementById('task-sync-calendar').checked = true; // デフォルトはON
    captureTaskEditorSnapshot();
    showModal('task-modal');
}

/**
 * 編集モーダルを開く
 */
function openEditTaskModal(taskId) {
    const task = tasksData.find(t => t.id === taskId);
    if (!task) return;

    currentEditingTaskId = taskId;
    document.getElementById('modal-title').textContent = 'タスク編集';
    document.getElementById('task-title').value = task.title;
    document.getElementById('task-category').value = task.category;
    document.getElementById('task-priority').value = task.priority;
    document.getElementById('task-due-date').value = task.due_date || '';
    resetTaskDetailsEditor(task.details);
    document.getElementById('task-sync-calendar').checked = task.sync_calendar !== false; // 明示的に false でなければ ON
    captureTaskEditorSnapshot();
    showModal('task-modal');
}

/**
 * タスク保存
 */
async function saveTask() {
    const title = document.getElementById('task-title').value.trim();
    const detailsSource = document.getElementById('task-details').value;
    if (!title) {
        showToast('タイトルを入力してください', 'warning');
        return;
    }

    const taskData = {
        title,
        category: document.getElementById('task-category').value,
        priority: document.getElementById('task-priority').value,
        due_date: document.getElementById('task-due-date').value || null,
        details: detailsSource.trim() ? detailsSource : null,
        sync_calendar: document.getElementById('task-sync-calendar').checked
    };

    const previousTasks = tasksData;
    if (currentEditingTaskId != null) {
        const taskIndex = tasksData.findIndex(t => t.id === currentEditingTaskId);
        if (taskIndex < 0) {
            showToast('編集対象のタスクが見つかりません', 'error');
            return;
        }
        tasksData = tasksData.map((task, index) => index === taskIndex ? { ...task, ...taskData } : task);
    } else {
        const numericIds = tasksData.map(task => Number(task.id)).filter(Number.isFinite);
        const newId = Math.max(...numericIds, 0) + 1;
        tasksData = [...tasksData, {
            id: newId,
            ...taskData,
            status: 'TODO',
            created_at: new Date().toISOString(),
            completed_at: null
        }];
    }

    const saveButton = document.getElementById('save-task');
    saveButton.disabled = true;
    const didSave = await saveTasks();
    saveButton.disabled = false;
    if (!didSave) {
        tasksData = previousTasks;
        return;
    }

    captureTaskEditorSnapshot();
    clearTaskPreviewTimer();
    hideModal('task-modal');
}

/**
 * タスク削除
 */
async function deleteTask(taskId) {
    if (!confirm('このタスクを削除しますか？')) return;

    tasksData = tasksData.filter(t => t.id !== taskId);
    
    // カレンダー同期設定がONで日付がないものが含まれる場合、警告を表示するためのチェック用
    const noDateSyncTasks = tasksData.filter(t => t.sync_calendar !== false && !t.due_date && t.status !== 'DONE');
    if (noDateSyncTasks.length > 0 && localStorage.getItem('sync_calendar') === 'true') {
        console.warn('Tasks without due date will not sync to Google Calendar:', noDateSyncTasks);
    }

    await saveTasks();
}

/**
 * Tasks保存（GitHub API）
 */
async function saveTasks() {
    try {
        showLoading(true);
        showToast('Saving tasks to GAS...', 'info', 1200);
        const result = await DataAPI.updateTasks(tasksData);
        if (result.content && result.content.sha) {
            tasksSha = result.content.sha;
        }
        if (DataAPI.isUnconfirmedSaveResult(result)) {
            showToast('Tasks save request sent, but GAS did not confirm persistence. Reload to verify.', 'warning', 6500);
        } else {
            showToast('Tasks saved.', 'success', 1800);
        }

        const sizeWarning = DataAPI.getLargeDataWarning('tasks');
        if (sizeWarning) {
            showToast(sizeWarning, 'warning', 6000);
        }

        // [v2.2.5] 日付なしタスクへの警告
        const noDateSyncTasks = tasksData.filter(t => t.sync_calendar !== false && !t.due_date && t.status !== 'DONE');
        if (noDateSyncTasks.length > 0 && localStorage.getItem('sync_calendar') === 'true') {
            showToast(`${noDateSyncTasks.length}件のタスクに日付がないため、Calendarには同期されません。`, 'warning', 5000);
        }

        /* [Optimization] クォータ節約のため自動同期を一時停止。手動同期ボタンを使用してください。
        try {
            if (localStorage.getItem('sync_calendar') === 'true') {
                console.log('Syncing to Google Calendar...');
                DataAPI.syncCalendar(tasksData); // 非同期で投げておく (no-cors)
            }
            if (localStorage.getItem('sync_gtasks') === 'true') {
                console.log('Syncing to Google Tasks...');
                DataAPI.syncGTasks(tasksData); // 非同期で投げておく (no-cors)
            }
        } catch (syncErr) {
            console.warn('Sync failed (will not block save):', syncErr);
        }
        */

        renderTasks();
        return true;
    } catch (error) {
        console.error('Failed to save tasks:', error);
        showToast('タスクの保存に失敗しました', 'error');
        return false;
    } finally {
        showLoading(false);
    }
}

/**
 * Markdownテーブル内の不自然な改行を結合し、marked.jsが正しくパースできるように前処理を行います。
 */
function preprocessMarkdownTables(text) {
    if (!text) return '';

    let lines = text.split('\n');
    let inTable = false;
    let inCodeBlock = false;
    let outLines = [];
    let currentRow = '';

    for (let i = 0; i < lines.length; i++) {
        let line = lines[i].replace(/\r$/, '');

        // コードブロック内はスキップ
        if (line.trim().startsWith('```')) {
            inCodeBlock = !inCodeBlock;
            if (inTable) {
                inTable = false;
                if (currentRow) outLines.push(currentRow);
                currentRow = '';
            }
            outLines.push(line);
            continue;
        }

        if (inCodeBlock) {
            outLines.push(line);
            continue;
        }

        if (!inTable) {
            // テーブルヘッダーとセパレーターの検出
            if (line.match(/^\|.*\|$/) && i + 1 < lines.length) {
                let nextLine = lines[i + 1].replace(/\r$/, '');
                if (nextLine.match(/^\|[\s\-\|:]+\|$/)) {
                    inTable = true;
                    outLines.push(line);
                    outLines.push(nextLine);
                    i++; // セパレーター行をスキップ
                    continue;
                }
            }
            outLines.push(line);
        } else {
            // テーブル構造内の処理
            if (line.trim() === '' && currentRow === '') {
                // 空行でテーブル終了と判定
                inTable = false;
                outLines.push(line);
                continue;
            }

            if (currentRow === '') {
                currentRow = line;
            } else {
                // セル内の改行が連続する場合、文字列を結合
                // 必要に応じてスペースを挟む
                currentRow += (line ? ' ' : '') + line;
            }

            // 現在の行が '|' で終わっていれば1行のテーブル行として完了
            if (currentRow.trim().endsWith('|')) {
                outLines.push(currentRow);
                currentRow = '';
            }
        }
    }

    if (currentRow) {
        outLines.push(currentRow);
    }

    return outLines.join('\n');
}


// イベントリスナー
document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('add-task-btn').addEventListener('click', openAddTaskModal);
    document.getElementById('save-task').addEventListener('click', saveTask);
    document.getElementById('hide-completed').addEventListener('change', renderTasks);
    document.getElementById('filter-category').addEventListener('change', renderTasks);
    document.getElementById('task-search').addEventListener('input', renderTasks);
    document.getElementById('task-details').addEventListener('input', scheduleTaskDetailsPreview);

    document.querySelectorAll('.task-details-tab').forEach(tab => {
        tab.addEventListener('click', () => {
            setTaskDetailsMode(tab.dataset.taskDetailsMode);
        });
    });
    document.querySelector('.task-details-tabs').addEventListener('keydown', handleTaskDetailsTabKeydown);

    document.getElementById('task-modal').addEventListener('modalbeforeclose', event => {
        if (!isTaskEditorDirty()) {
            clearTaskPreviewTimer();
            return;
        }

        if (!window.confirm('未保存の変更があります。破棄して閉じますか？')) {
            event.preventDefault();
            return;
        }
        clearTaskPreviewTimer();
    });

    // ソートUIの初期化
    const sortSelect = document.getElementById('sort-tasks');
    if (sortSelect) {
        const savedSort = localStorage.getItem('task_sort') || 'default';
        sortSelect.value = savedSort;
        sortSelect.addEventListener('change', (e) => {
            localStorage.setItem('task_sort', e.target.value);
            renderTasks();
        });
    }
});
