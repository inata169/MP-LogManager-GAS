/**
 * Journal管理モジュール
 */

let journalsData = [];
let journalsSha = '';
let currentDate = new Date().toISOString().split('T')[0];
let currentEditingEntryId = null;
let easyMDE = null;
let saveDraftTimeout = null;

/**
 * Journals読み込み
 */
async function loadJournals() {
    try {
        showLoading(true);
        const { journals, sha } = await githubAPI.getJournals();
        journalsData = journals;
        journalsSha = sha;
        renderJournals();
    } catch (error) {
        console.error('Failed to load journals:', error);
        alert('Journalの読み込みに失敗しました');
    } finally {
        showLoading(false);
    }
}

/**
 * Journals表示
 */
function renderJournals() {
    const container = document.getElementById('journal-entries');
    const searchQuery = document.getElementById('journal-search')?.value.toLowerCase() || '';
    
    let entries = [];
    if (searchQuery) {
        // 検索時は全期間から抽出
        entries = journalsData.filter(j => 
            j.title.toLowerCase().includes(searchQuery) || 
            j.content.toLowerCase().includes(searchQuery)
        ).sort((a, b) => new Date(b.date) - new Date(a.date)); // 日付順
    } else {
        // 通常時は日付フィルタ
        entries = journalsData.filter(j => j.date === currentDate);
    }

    if (entries.length === 0) {
        container.innerHTML = `<p style="color: var(--text-secondary); text-align: center;">${searchQuery ? '検索結果が見つかりません' : 'この日のエントリはありません'}</p>`;
        if (!searchQuery) clearEditor();
        return;
    }

    container.innerHTML = entries.map(entry => `
        <div class="journal-entry ${currentEditingEntryId === entry.id ? 'active' : ''}" 
             data-id="${entry.id}" onclick="loadJournalEntry(${entry.id})">
            <div class="journal-item-info">
                <div class="journal-entry-title">
                    ${searchQuery ? `<span class="search-date-label">${entry.date}</span> ` : ''}
                    ${escapeHtml(entry.title)}
                </div>
                <div class="journal-entry-preview">${escapeHtml(entry.content.substring(0, 50))}...</div>
            </div>
            <button class="journal-delete-btn" onclick="deleteJournalEntry(event, ${entry.id})" title="削除">🗑️</button>
        </div>
    `).join('');

    // 最初のエントリを自動選択 (検索時以外または以前の選択がない場合)
    if (!currentEditingEntryId && entries.length > 0) {
        loadJournalEntry(entries[0].id);
    }
}

/**
 * Journalエントリをエディタに読み込み
 */
function loadJournalEntry(entryId) {
    const entry = journalsData.find(j => j.id === entryId);
    if (!entry) return;

    currentEditingEntryId = entryId;
    document.getElementById('journal-title').value = entry.title;
    if (easyMDE) {
        easyMDE.value(entry.content);
    } else {
        document.getElementById('journal-content').value = entry.content;
    }

    // アクティブ表示更新
    document.querySelectorAll('.journal-entry').forEach(el => {
        el.classList.toggle('active', parseInt(el.dataset.id) === entryId);
    });
}

/**
 * エディタをクリア
 */
function clearEditor() {
    currentEditingEntryId = null;
    document.getElementById('journal-title').value = '';
    if (easyMDE) {
        easyMDE.value('');
    } else {
        document.getElementById('journal-content').value = '';
    }
}

/**
 * 新規エントリ作成
 */
function createNewEntry() {
    clearEditor();
    document.getElementById('journal-title').value = 'Daily Log';
    if (easyMDE) {
        easyMDE.codemirror.focus();
    } else {
        document.getElementById('journal-content').focus();
    }
}

/**
 * Journal保存
 */
async function saveJournal() {
    const title = document.getElementById('journal-title').value.trim();
    let content = easyMDE ? easyMDE.value().trim() : document.getElementById('journal-content').value.trim();

    // Gemini特有の引用タグを除去
    content = sanitizeGeminiContent(content);
    if (easyMDE) easyMDE.value(content); // エディタ側も更新しておくと親切

    if (!title || !content) {
        alert('タイトルと内容を入力してください');
        return;
    }

    if (currentEditingEntryId) {
        // 更新
        const entry = journalsData.find(j => j.id === currentEditingEntryId);
        entry.title = title;
        entry.content = content;
    } else {
        // 新規追加
        const newId = Math.max(...journalsData.map(j => j.id), 0) + 1;
        journalsData.push({
            id: newId,
            date: currentDate,
            title,
            content,
            created_at: new Date().toISOString()
        });
        currentEditingEntryId = newId;
    }

    // 保存成功したら下書きを消去
    localStorage.removeItem('journal_draft');
    await saveJournals();
}

/**
 * Journals保存（GitHub API）
 */
async function saveJournals() {
    try {
        showLoading(true);
        const result = await githubAPI.updateJournals(journalsData, journalsSha);
        journalsSha = result.content.sha;
        renderJournals();
    } catch (error) {
        console.error('Failed to save journals:', error);
        alert('Journalの保存に失敗しました');
    } finally {
        showLoading(false);
    }
}

/**
 * 日付変更
 */
function changeDate(days) {
    const date = new Date(currentDate);
    date.setDate(date.getDate() + days);
    currentDate = date.toISOString().split('T')[0];
    document.getElementById('journal-date').value = currentDate;
    currentEditingEntryId = null;
    renderJournals();
}

/**
 * 日付入力変更
 */
function onDateChange() {
    currentDate = document.getElementById('journal-date').value;
    currentEditingEntryId = null;
    renderJournals();
}

/**
 * 下書きを保存 (Debounced)
 */
function saveDraft() {
    if (!easyMDE) return;
    
    const title = document.getElementById('journal-title').value;
    const content = easyMDE.value();
    
    // 中身が空なら保存しない
    if (!title && !content) return;

    const draft = {
        title,
        content,
        timestamp: new Date().getTime(),
        entryId: currentEditingEntryId
    };
    
    localStorage.setItem('journal_draft', JSON.stringify(draft));
    
    const status = document.getElementById('draft-status');
    if (status) {
        status.textContent = '下書き保存済み';
        status.style.display = 'inline';
        status.style.opacity = '1';
        
        if (saveDraftTimeout) clearTimeout(saveDraftTimeout);
        saveDraftTimeout = setTimeout(() => {
            status.style.opacity = '0';
            setTimeout(() => { status.style.display = 'none'; }, 500);
        }, 3000);
    }
}

/**
 * 印刷処理
 */
function printJournal() {
    if (!easyMDE) return;
    
    // 印刷用エリアを取得
    const printArea = document.getElementById('print-area');
    if (!printArea) return;

    // 印刷用エリアを一旦リセット（古い内容の残分を完全に排除）
    printArea.innerHTML = `
        <h1 id="print-title"></h1>
        <div id="print-content" class="markdown-body"></div>
    `;

    const titleEl = document.getElementById('print-title');
    const contentEl = document.getElementById('print-content');
    
    // タイトルと内容を取得してサニタイズ
    const title = document.getElementById('journal-title').value.trim();
    let content = easyMDE.value().trim();
    content = sanitizeGeminiContent(content); 
    
    titleEl.textContent = title || 'Untitled Journal';
    
    // marked.js を使用して HTML を流し込む
    if (typeof marked !== 'undefined') {
        contentEl.innerHTML = marked.parse(content);
    } else {
        contentEl.textContent = content;
    }
    
    // iOS Safari のレンダリング遅延対策として、少し待機してから印刷
    requestAnimationFrame(() => {
        setTimeout(() => {
            window.print();
        }, 150); 
    });
}

/**
 * 下書きの確認と復元
 */
function checkDraft() {
    const draftJson = localStorage.getItem('journal_draft');
    if (!draftJson) return;
    
    const draft = JSON.parse(draftJson);
    const now = new Date().getTime();
    
    // 24時間以内の下書きがあれば確認
    if (now - draft.timestamp < 24 * 60 * 60 * 1000) {
        const timeStr = new Date(draft.timestamp).toLocaleTimeString();
        if (confirm(`未保存の下書き（${timeStr}）があります。復元しますか？`)) {
            document.getElementById('journal-title').value = draft.title;
            easyMDE.value(draft.content);
            currentEditingEntryId = draft.entryId;
        } else {
            localStorage.removeItem('journal_draft');
        }
    }
}

/**
 * Gemini特有の引用タグを除去する
 */
function sanitizeGeminiContent(text) {
    if (!text) return text;
    // [cite_start] と [cite: ...] を除去
    return text.replace(/\[cite_start\]/g, '').replace(/\[cite:.*?\]/g, '');
}

    // Preprocessing and parsing logic removed, handled by EasyMDE now.

// イベントリスナー
document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('journal-date').value = currentDate;
    document.getElementById('journal-date').addEventListener('change', onDateChange);
    document.getElementById('prev-day').addEventListener('click', () => changeDate(-1));
    document.getElementById('next-day').addEventListener('click', () => changeDate(1));
    document.getElementById('save-journal').addEventListener('click', saveJournal);
    document.getElementById('print-journal').addEventListener('click', printJournal);
    document.getElementById('new-entry').addEventListener('click', createNewEntry);
    
    if (typeof EasyMDE !== 'undefined') {
        easyMDE = new EasyMDE({
            element: document.getElementById('journal-content'),
            spellChecker: false,
            hideIcons: ['guide'],
            showIcons: ['code', 'table', 'horizontal-rule', 'strikethrough'],
            status: false,
            minHeight: '250px',
            renderingConfig: {
                singleLineBreaks: true,
                codeSyntaxHighlighting: true // highlight.js を有効化
            }
        });

        // 変更を監視してオートセーブ (5秒ごと)
        let autoSaveTimer = null;
        easyMDE.codemirror.on('change', () => {
            if (autoSaveTimer) clearTimeout(autoSaveTimer);
            autoSaveTimer = setTimeout(saveDraft, 5000);
        });

        const titleInput = document.getElementById('journal-title');
        titleInput.addEventListener('input', () => {
            if (autoSaveTimer) clearTimeout(autoSaveTimer);
            autoSaveTimer = setTimeout(saveDraft, 5000);
        });

        // 下書きチェック
        setTimeout(checkDraft, 1000);
    }

    // 検索イベント
    const journalSearch = document.getElementById('journal-search');
    if (journalSearch) {
        journalSearch.addEventListener('input', () => {
            renderJournals();
        });
    }
});

/**
 * Journal削除
 */
async function deleteJournalEntry(event, entryId) {
    if (event) event.stopPropagation();
    
    if (!confirm('このエントリを削除してもよろしいですか？')) {
        return;
    }

    try {
        journalsData = journalsData.filter(j => j.id !== entryId);
        
        if (currentEditingEntryId === entryId) {
            clearEditor();
        }
        
        await saveJournals();
        console.log('Journal entry deleted:', entryId);
    } catch (error) {
        console.error('Failed to delete journal entry:', error);
        alert('削除に失敗しました');
    }
}
