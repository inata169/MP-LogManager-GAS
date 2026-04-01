# Google 同期機能セットアップガイド

Google カレンダーおよび Google Tasks (Todo) と同期するために、以下の手順で GAS スクリプトを更新してください。

## 1. Google Tasks API の有効化 (必須)

1. [script.google.com](https://script.google.com/) で `MP-LogManager API` を開きます。
2. 左メニューの **[サービス +]** をクリックします。
3. 一覧から **[Google Tasks API]** を選択し、**[追加]** をクリックします。
   - ※ これを行わないと、Tasks 同期時にエラーが発生します。

> [!TIP]
> **より簡単な方法**: リポジトリ内の `web/gas-api-template.json` を [Google Apps Script 拡張機能](https://chrome.google.com/webstore/detail/google-apps-script-github/pnbnnebhneidfacpbedhkocakebneboc) や Clasp 等でインポートすることも可能ですが、基本は以下の手動設定を推奨します。

## 2. Code.gs の更新

現在の `Code.gs` の内容をすべて消去し、以下を貼り付けてください。
(以前のファイルID `journals` と `tasks` の値は、現在のあなたの環境に合わせて自動構成してあります)

```javascript
/* --- 設定: あなたのファイルID --- */
const FILES = {
  "journals": "YOUR_JOURNALS_FILE_ID",
  "tasks": "YOUR_TASKS_FILE_ID"
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

## 3. デプロイ（反映作業）

ここが最も重要なステップです。**正しく「新しいバージョン」を作成しないと、プログラムの変更が反映されません。**

1.  GAS エディタ右上の **[デプロイ]** -> **[デプロイを管理]** をクリックします。
2.  現在のアクティブなデプロイ（例: `MP-LogManager API` または `無題`）を選択します。
3.  右上の **鉛筆アイコン（編集）** をクリックします。
4.  「バージョン」のプルダウンメニューをクリックし、**必ず [新しいバージョン] を選択してください。**
    - ※ ここで「バージョン 1」などの既存の数字のままだと、中身が更新されません。
5.  右下の **[デプロイ]** ボタンをクリックします。
6.  「デプロイを更新しました」と表示され、バージョン番号が上がっていれば（例: バージョン 3）成功です。
    - ※ Web App URL は原則変わりませんので、Web アプリ側の設定を直す必要はありません。

---

## 4. 実行権限の承認（同期が動かない場合）

もし上記設定をしても同期されない場合は、GAS にカレンダーや Todo を操作する権限が与えられていない可能性があります。

1.  GAS エディタのツールバーにある「実行する関数を選択」から **`syncCalendar`** および **`syncGTasks`** をそれぞれ選び、**[▶ 実行]** を押します。
2.  **「承認が必要です」** というポップアップが出たら、画面の指示に従って自分のアカウントで「許可」を行ってください。
    - ※ 両方の関数を 1 度ずつ実行（許可）することで、カレンダーと Todo 両方の権限が確定します。
3.  一度許可すれば、それ以降は自動で同期されるようになります。

---

## 5. Web アプリ側での動作確認

1.  Web アプリ（GitHub Pages）をリロードします。
2.  設定（⚙️）を開き、**「Google 同期設定」** の各スイッチを **ON** にして **[保存]** を押します。
3.  タスクを新規作成し、**「期限（日）」** を入力して保存してください。
4.  自分の Google カレンダーと Google Todo（MP-LogManager リスト）に反映されれば完了です！
