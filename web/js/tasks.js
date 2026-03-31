/**
 * Tasks管理モジュール
 */

let tasksData = [];
let tasksSha = '';
let currentEditingTaskId = null;

/**
 * Tasks読み込み
 */
async function loadTasks() {
    try {
        showLoading(true);
        const { tasks, sha } = await DataAPI.getTasks();
        tasksData = tasks || [];
        tasksSha = sha;
        renderTasks();
    } catch (error) {
        console.error('Failed to load tasks:', error);
        showToast('タスクの読み込みに失敗しました。URLの設定を確認してください。', 'error');
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
    let filtered = tasksData;
    if (hideCompleted) {
        filtered = filtered.filter(t => t.status !== 'DONE');
    }
    if (categoryFilter !== 'all') {
        filtered = filtered.filter(t => t.category === categoryFilter);
    }

    const searchText = document.getElementById('task-search').value.toLowerCase().trim();
    if (searchText) {
        filtered = filtered.filter(t => 
            t.title.toLowerCase().includes(searchText) || 
            (t.details && t.details.toLowerCase().includes(searchText))
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

    container.innerHTML = filtered.map(task => `
        <div class="task-item ${task.status === 'DONE' ? 'task-done' : ''}" data-id="${task.id}">
            <div class="task-header">
                <input type="checkbox" class="task-checkbox" ${task.status === 'DONE' ? 'checked' : ''} 
                       onchange="toggleTaskStatus(${task.id})">
                <div class="task-content">
                    <div class="task-title">${escapeHtml(task.title)}</div>
                    <div class="task-meta">
                        <span class="task-badge badge-category">${task.category}</span>
                        <span class="task-badge badge-priority-${task.priority.toLowerCase()}">${task.priority}</span>
                        ${task.due_date ? `<span>📅 ${task.due_date}</span>` : ''}
                    </div>
                    ${task.details ? `<div class="task-details markdown-body">${renderMarkdown(task.details)}</div>` : ''}
                </div>
                <button class="task-delete-btn" onclick="event.stopPropagation(); deleteTask(${task.id})" aria-label="Delete task">🗑️</button>
            </div>
        </div>
    `).join('');

    // クリックイベント（編集）
    container.querySelectorAll('.task-item').forEach(item => {
        item.addEventListener('click', (e) => {
            if (e.target.classList.contains('task-checkbox')) return;
            const taskId = parseInt(item.dataset.id);
            openEditTaskModal(taskId);
        });
    });
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
    document.getElementById('task-details').value = '';
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
    document.getElementById('task-details').value = task.details || '';
    showModal('task-modal');
}

/**
 * タスク保存
 */
async function saveTask() {
    const title = document.getElementById('task-title').value.trim();
    if (!title) {
        showToast('タイトルを入力してください', 'warning');
        return;
    }

    const taskData = {
        title,
        category: document.getElementById('task-category').value,
        priority: document.getElementById('task-priority').value,
        due_date: document.getElementById('task-due-date').value || null,
        details: document.getElementById('task-details').value.trim() || null
    };

    if (currentEditingTaskId) {
        // 更新
        const task = tasksData.find(t => t.id === currentEditingTaskId);
        Object.assign(task, taskData);
    } else {
        // 新規追加
        const newId = Math.max(...tasksData.map(t => t.id), 0) + 1;
        tasksData.push({
            id: newId,
            ...taskData,
            status: 'TODO',
            created_at: new Date().toISOString(),
            completed_at: null
        });
    }

    await saveTasks();
    hideModal('task-modal');
}

/**
 * タスク削除
 */
async function deleteTask(taskId) {
    if (!confirm('このタスクを削除しますか？')) return;

    tasksData = tasksData.filter(t => t.id !== taskId);
    await saveTasks();
}

/**
 * Tasks保存（GitHub API）
 */
async function saveTasks() {
    try {
        showLoading(true);
        const result = await DataAPI.updateTasks(tasksData);
        if (result.content && result.content.sha) {
            tasksSha = result.content.sha;
        }
        renderTasks();
    } catch (error) {
        console.error('Failed to save tasks:', error);
        showToast('タスクの保存に失敗しました', 'error');
    } finally {
        showLoading(false);
    }
}

/**
 * HTMLエスケープ
 */
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
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

/**
 * Markdownレンダリング
 */
function renderMarkdown(text) {
    if (!text) return '';
    try {
        // テーブル内の不自然な改行を結合する前処理
        let prepText = preprocessMarkdownTables(text);

        // markedオブジェクトを確実に取得
        const markedObj = (typeof window !== 'undefined' && window.marked) ? window.marked : (typeof marked !== 'undefined' ? marked : null);

        if (markedObj && typeof markedObj.parse === 'function') {
            return markedObj.parse(prepText, { breaks: true });
        } else {
            console.warn('marked is not loaded properly. Falling back to plain text.');
        }
    } catch (e) {
        console.error("Markdown parse error:", e);
    }
    return escapeHtml(text);
}

// イベントリスナー
document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('add-task-btn').addEventListener('click', openAddTaskModal);
    document.getElementById('save-task').addEventListener('click', saveTask);
    document.getElementById('hide-completed').addEventListener('change', renderTasks);
    document.getElementById('filter-category').addEventListener('change', renderTasks);
    document.getElementById('task-search').addEventListener('input', renderTasks);

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
