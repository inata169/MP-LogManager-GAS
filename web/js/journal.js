/**
 * Journal管理モジュール
 */

let journalsData = [];
let journalsSha = '';
let currentDate = new Date().toISOString().split('T')[0];
let currentEditingEntryId = null;
let easyMDE = null;
let saveDraftTimeout = null;
let isJournalListOpen = false;

/**
 * iOSのネイティブな「すべてを選択」がJournal全文を対象にできるようにする。
 * EasyMDEはモバイルでcontenteditableを使い、CodeMirrorは通常、表示範囲の
 * 前後だけをDOMへ描画するため、iOSのDOM選択が途中で切れてしまう。
 */
function configureIOSNativeSelection(codeMirror, navigatorObject = navigator) {
    if (!codeMirror || !navigatorObject) return false;

    const userAgent = navigatorObject.userAgent || '';
    const platform = navigatorObject.platform || '';
    const isIOS = /iPad|iPhone|iPod/.test(userAgent)
        || (platform === 'MacIntel' && navigatorObject.maxTouchPoints > 1);

    if (!isIOS || codeMirror.getOption('inputStyle') !== 'contenteditable') {
        return false;
    }

    codeMirror.setOption('viewportMargin', Infinity);
    codeMirror.refresh();
    return true;
}

function updateJournalLayoutState() {
    const view = document.getElementById('journal-view');
    const toggle = document.getElementById('journal-list-toggle');
    if (!view) return;

    view.classList.toggle('entry-active', Boolean(currentEditingEntryId));
    view.classList.toggle('list-open', isJournalListOpen);

    if (toggle) {
        toggle.textContent = isJournalListOpen ? 'Edit' : 'List';
        toggle.setAttribute('aria-pressed', String(isJournalListOpen));
    }

    if (easyMDE) {
        setTimeout(() => easyMDE.codemirror.refresh(), 0);
    }
}

/**
 * Journals読み込み
 */
async function loadJournals() {
    try {
        showLoading(true);
        const { journals, sha, isCache, error } = await DataAPI.getJournals();
        journalsData = journals || [];
        journalsSha = sha;
        renderJournals();

        if (isCache) {
            // Tasks側と重複を避けるため、ここではクラス付与のみ行う
            document.getElementById('app-main').classList.add('cache-mode');
        }
    } catch (error) {
        console.error('Failed to load journals:', error);
        showToast(`Journalの読み込みに失敗しました: ${error.message}`, 'error');
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
            String(j.title ?? '').toLowerCase().includes(searchQuery) ||
            String(j.content ?? '').toLowerCase().includes(searchQuery)
        ).sort((a, b) => new Date(b.date) - new Date(a.date)); // 日付順
    } else {
        // 通常時は日付フィルタ
        entries = journalsData.filter(j => j.date === currentDate);
    }

    if (entries.length === 0) {
        const emptyMessage = document.createElement('p');
        emptyMessage.className = 'journal-empty-message';
        emptyMessage.textContent = searchQuery ? '検索結果が見つかりません' : 'この日のエントリはありません';
        container.replaceChildren(emptyMessage);
        if (!searchQuery) clearEditor();
        updateJournalLayoutState();
        return;
    }

    const fragment = document.createDocumentFragment();
    entries.forEach(entry => fragment.appendChild(createJournalEntryElement(entry, Boolean(searchQuery))));
    container.replaceChildren(fragment);

    // 最初のエントリを自動選択 (検索時以外または以前の選択がない場合)
    if (!currentEditingEntryId && entries.length > 0) {
        loadJournalEntry(entries[0].id);
    } else {
        updateJournalLayoutState();
    }
}

function createJournalEntryElement(entry, showDate) {
    const item = document.createElement('div');
    item.className = `journal-entry${currentEditingEntryId === entry.id ? ' active' : ''}`;
    item.dataset.id = String(entry.id ?? '');

    const info = document.createElement('div');
    info.className = 'journal-item-info';

    const title = document.createElement('div');
    title.className = 'journal-entry-title';
    if (showDate) {
        const dateLabel = document.createElement('span');
        dateLabel.className = 'search-date-label';
        dateLabel.textContent = String(entry.date ?? '');
        title.append(dateLabel, document.createTextNode(' '));
    }
    title.appendChild(document.createTextNode(String(entry.title ?? '')));

    const preview = document.createElement('div');
    preview.className = 'journal-entry-preview';
    preview.textContent = `${String(entry.content ?? '').substring(0, 50)}...`;

    const deleteButton = document.createElement('button');
    deleteButton.type = 'button';
    deleteButton.className = 'journal-delete-btn';
    deleteButton.title = '削除';
    deleteButton.setAttribute('aria-label', `削除: ${String(entry.title ?? '')}`);
    deleteButton.textContent = '🗑️';
    deleteButton.addEventListener('click', event => {
        event.stopPropagation();
        deleteJournalEntry(entry.id);
    });

    info.append(title, preview);
    item.append(info, deleteButton);
    item.addEventListener('click', () => loadJournalEntry(entry.id));
    return item;
}

/**
 * Journalエントリをエディタに読み込み
 */
function loadJournalEntry(entryId) {
    const entry = journalsData.find(j => j.id === entryId);
    if (!entry) return;

    currentEditingEntryId = entryId;
    isJournalListOpen = false;
    document.getElementById('journal-title').value = String(entry.title ?? '');
    if (easyMDE) {
        easyMDE.value(String(entry.content ?? ''));
    } else {
        document.getElementById('journal-content').value = String(entry.content ?? '');
    }

    // アクティブ表示更新
    document.querySelectorAll('.journal-entry').forEach(el => {
        el.classList.toggle('active', el.dataset.id === String(entryId));
    });
    updateJournalLayoutState();
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
    updateJournalLayoutState();
}

/**
 * 新規エントリ作成
 */
function createNewEntry() {
    clearEditor();
    isJournalListOpen = false;
    document.getElementById('journal-title').value = 'Daily Log';
    updateJournalLayoutState();
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
        showToast('タイトルと内容を入力してください', 'warning');
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
        showToast('Saving journal to GAS...', 'info', 1200);
        const result = await DataAPI.updateJournals(journalsData);
        if (result.content && result.content.sha) {
            journalsSha = result.content.sha;
        }
        if (DataAPI.isUnconfirmedSaveResult(result)) {
            showToast('Journal save request sent, but GAS did not confirm persistence. Reload to verify.', 'warning', 6500);
        } else {
            showToast('Journal saved.', 'success', 1800);
        }

        const sizeWarning = DataAPI.getLargeDataWarning('journals');
        if (sizeWarning) {
            showToast(sizeWarning, 'warning', 6000);
        }
        renderJournals();
    } catch (error) {
        console.error('Failed to save journals:', error);
        showToast('Journalの保存に失敗しました', 'error');
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
    isJournalListOpen = false;
    renderJournals();
}

/**
 * 日付入力変更
 */
function onDateChange() {
    currentDate = document.getElementById('journal-date').value;
    currentEditingEntryId = null;
    isJournalListOpen = false;
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
    const titleEl = document.createElement('h1');
    titleEl.id = 'print-title';
    const contentEl = document.createElement('div');
    contentEl.id = 'print-content';
    contentEl.className = 'markdown-body';
    printArea.replaceChildren(titleEl, contentEl);
    
    // タイトルと内容を取得してサニタイズ
    const title = document.getElementById('journal-title').value.trim();
    let content = easyMDE.value().trim();
    content = sanitizeGeminiContent(content); 
    
    titleEl.textContent = title || 'Untitled Journal';
    
    SafeRender.renderMarkdownInto(contentEl, content);
    
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
            isJournalListOpen = false;
            updateJournalLayoutState();
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
    const listToggle = document.getElementById('journal-list-toggle');
    if (listToggle) {
        listToggle.addEventListener('click', () => {
            isJournalListOpen = !isJournalListOpen;
            updateJournalLayoutState();
        });
    }
    
    if (typeof EasyMDE !== 'undefined') {
        easyMDE = new EasyMDE({
            element: document.getElementById('journal-content'),
            spellChecker: false,
            hideIcons: ['guide'],
            showIcons: ['code', 'table', 'horizontal-rule', 'strikethrough'],
            status: false,
            minHeight: '250px',
            previewRender: text => SafeRender.markdownToSafeHtml(text).html,
            renderingConfig: {
                singleLineBreaks: true,
                codeSyntaxHighlighting: true // highlight.js を有効化
            }
        });

        configureIOSNativeSelection(easyMDE.codemirror);

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
async function deleteJournalEntry(entryId) {
    if (!confirm('このエントリを削除してもよろしいですか？')) {
        return;
    }

    try {
        journalsData = journalsData.filter(j => j.id !== entryId);
        
        if (currentEditingEntryId === entryId) {
            isJournalListOpen = true;
            clearEditor();
        }
        
        await saveJournals();
        console.log('Journal entry deleted:', entryId);
    } catch (error) {
        console.error('Failed to delete journal entry:', error);
        showToast('削除に失敗しました', 'error');
    }
}
