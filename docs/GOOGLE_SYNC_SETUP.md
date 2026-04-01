# Google 同期機能セットアップガイド

Google カレンダーおよび Google Tasks (Todo) と同期するために、以下の手順で GAS スクリプトを更新してください。

## 1. Google Tasks API の有効化 (必須)

1. [script.google.com](https://script.google.com/) で `MP-LogManager API` を開きます。
2. 左メニューの **[サービス +]** をクリックします。
3. 一覧から **[Google Tasks API]** を選択し、**[追加]** をクリックします。
   - ※ これを行わないと、Tasks 同期時にエラーが発生します。

## 2. Code.gs の更新

現在の `Code.gs` の内容をすべて消去し、以下を貼り付けてください。
(以前のファイルID `journals` と `tasks` の値は、現在のあなたの環境に合わせて自動構成してあります)

```javascript
/* --- 設定: あなたのファイルID (自動反映済み) --- */
const FILES = {
  "journals": "1DZKyQdQGXJ6l5hiP5aPJUnOljzAWpNq5",
  "tasks": "1akLrAm73vCBg1sP-58wlsF-juTTOR-kQ"
};

/**
 * データの取得 (GET)
 */
function doGet(e) {
  const type = e.parameter.type;
  
  if (type === 'ping') return createResponse({ status: 'ok' });

  if (!FILES[type]) {
    return createResponse({ error: "Invalid type" });
  }

  try {
    const file = DriveApp.getFileById(FILES[type]);
    const content = file.getBlob().getDataAsString();
    return createResponse(JSON.parse(content || "[]"));
  } catch (err) {
    return createResponse({ error: "File access error: " + err.toString() });
  }
}

/**
 * データの保存・同期 (POST)
 */
function doPost(e) {
  try {
    const postData = JSON.parse(e.postData.contents);
    const type = postData.type;
    const data = postData.data;

    // 通常のデータ保存
    if (FILES[type]) {
      const file = DriveApp.getFileById(FILES[type]);
      file.setContent(JSON.stringify(data, null, 2));
      return createResponse({ status: "success" });
    }

    // Google Calendar 同期
    if (type === 'sync_calendar') {
      return createResponse(syncCalendar(data));
    }

    // Google Tasks 同期
    if (type === 'sync_gtasks') {
      return createResponse(syncGTasks(data));
    }

    return createResponse({ error: "Invalid type" });
  } catch (err) {
    return createResponse({ error: "Post error: " + err.toString() });
  }
}

/**
 * Google Calendar 同期ロジック
 */
function syncCalendar(tasks) {
  const calendar = CalendarApp.getDefaultCalendar();
  const prefix = "[MP-Log]";
  
  // 30日前から365日後までの既存イベントを取得して重複防止
  const now = new Date();
  const start = new Date(now.getTime() - (30 * 24 * 60 * 60 * 1000));
  const end = new Date(now.getTime() + (365 * 24 * 60 * 60 * 1000));
  const existingEvents = calendar.getEvents(start, end, { search: prefix });

  tasks.forEach(task => {
    if (!task.due_date || task.status === 'DONE') return;

    const title = `${prefix} ${task.title}`;
    const dueDate = new Date(task.due_date);
    
    // 既存チェック
    const existing = existingEvents.find(e => e.getTitle().includes(task.title));
    
    if (existing) {
      // 日付が違えば更新
      if (existing.getAllDayStartDate().getTime() !== dueDate.getTime()) {
        existing.setAllDayDate(dueDate);
      }
    } else {
      // 新規作成
      calendar.createAllDayEvent(title, dueDate, { description: task.details || "" });
    }
  });

  return { status: "calendar_synced" };
}

/**
 * Google Tasks 同期ロジック
 */
function syncGTasks(tasks) {
  const listName = "MP-LogManager";
  let taskListId = null;

  // リストの取得または作成
  const lists = Tasks.Tasklists.list().items;
  const existingList = lists ? lists.find(l => l.title === listName) : null;

  if (existingList) {
    taskListId = existingList.id;
  } else {
    const newList = Tasks.Tasklists.insert({ title: listName });
    taskListId = newList.id;
  }

  // 既存タスクの取得
  const existingTasks = Tasks.Tasks.list(taskListId).items || [];

  tasks.forEach(task => {
    const status = task.status === 'DONE' ? 'completed' : 'needsAction';
    const existing = existingTasks.find(t => t.title === task.title);

    const taskResource = {
      title: task.title,
      notes: task.details || "",
      status: status
    };
    
    if (task.due_date) {
      // ISO 8601 形式の文字列が必要
      taskResource.due = new Date(task.due_date).toISOString();
    }

    if (existing) {
      Tasks.Tasks.patch(taskResource, taskListId, existing.id);
    } else if (task.status !== 'DONE') {
      Tasks.Tasks.insert(taskResource, taskListId);
    }
  });

  return { status: "gtasks_synced" };
}

function createResponse(data) {
  return ContentService.createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}
```

## 3. 再デプロイ

1. GAS エディタ右上の **[デプロイ]** -> **[デプロイを管理]** をクリックします。
2. 鉛筆アイコンボタンをクリックして、バージョンを **[新しいバージョン]** に変更します。
3. **[デプロイ]** をクリックして完了です。
   - ※ Web App URL が変わらないように、既存のデプロイを修正して更新してください。

---

## 4. 動作確認

1. Web App の設定画面を開き、新しく追加されたトグルを ON にして保存します。
2. タスクを新しく作成（期限付き）して保存します。
3. あなたの Google カレンダーと Google Todo (MP-LogManagerリスト) に反映されていれば成功です！
