# Google 同期機能セットアップガイド (v2.2.5 安定版)

Google カレンダーおよび Google Tasks (Todo) と同期するために、以下の手順で GAS スクリプトを更新してください。本バージョンでは **クォータ制限対策** に加え、**エラー情報の可視化** が強化されています。

## 1. Google Tasks API の有効化 (必須)

以前のバージョンより設定が簡単になりました。マニフェストファイル (`appsscript.json`) を直接編集することで、確実かつ迅速に API を有効化できます。

1.  GAS エディタの画面左端にある **歯車アイコン（プロジェクトの設定）** をクリックします。
2.  「**『appsscript.json』マニフェストファイルをエディタに表示する**」という項目にチェックを入れます。
3.  画面左端の **「<>」（エディタ）アイコン** に戻ります。
4.  ファイル名のリストに `appsscript.json` が現れるので、それを開き、中身を以下のように書き換えて保存（Ctrl+S）してください。

```json
{
  "timeZone": "Asia/Tokyo",
  "dependencies": {
    "enabledAdvancedServices": [
      {
        "userSymbol": "Tasks",
        "version": "v1",
        "serviceId": "tasks"
      }
    ]
  },
  "exceptionLogging": "STACKDRIVER",
  "runtimeVersion": "V8",
  "webapp": {
    "executeAs": "USER_DEPLOYING",
    "access": "ANYONE_ANONYMOUS"
  }
}
```

---

## 2. Code.gs の更新

現在の `Code.gs` の内容をすべて消去し、以下を貼り付けてください。
**※重要**: `YOUR_JOURNALS_FILE_ID` などの値は、ご自身の環境のものに書き換えてください。

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
  if (!FILES[type]) return createResponse({ error: 'Invalid type' });

  try {
    const file = DriveApp.getFileById(FILES[type]);
    const content = file.getBlob().getDataAsString();
    return createResponse(JSON.parse(content || '[]'));
  } catch (err) {
    return createResponse({ error: 'File access error: ' + err.toString() });
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

    if (FILES[type]) {
      const file = DriveApp.getFileById(FILES[type]);
      file.setContent(JSON.stringify(data, null, 2));
      return createResponse({ status: 'success' });
    }

    if (type === 'sync_calendar') return createResponse(syncCalendar(data));
    if (type === 'sync_gtasks') return createResponse(syncGTasks(data));

    return createResponse({ error: 'Invalid type' });
  } catch (err) {
    return createResponse({ error: 'Post error: ' + err.toString() });
  }
}

/**
 * Google Calendar 同期ロジック (最適化版)
 */
function syncCalendar(tasks) {
  const calendar = CalendarApp.getDefaultCalendar();
  const prefix = '[MP-Log]';
  const now = new Date();
  const start = new Date(now.getTime() - (30 * 24 * 60 * 60 * 1000));
  const end = new Date(now.getTime() + (365 * 24 * 60 * 60 * 1000));
  const existingEvents = calendar.getEvents(start, end, { search: prefix });

  const processedIds = new Set();

  tasks.forEach(task => {
    if (!task.due_date || task.status === 'DONE') return;

    const title = `${prefix} ${task.title}`;
    const startDate = new Date(task.due_date);
    
    const existing = existingEvents.find(e => e.getTitle() === title);

    if (existing) {
      processedIds.add(existing.getId());
      if (existing.getAllDayStartDate().getTime() !== startDate.getTime()) {
        existing.setAllDayDate(startDate);
      }
    } else {
      const newEvent = calendar.createAllDayEvent(title, startDate, { description: task.details || '' });
      processedIds.add(newEvent.getId());
    }
  });

  // クリーンアップ: リストにないイベントを削除
  existingEvents.forEach(e => {
    if (!processedIds.has(e.getId())) {
      e.deleteEvent();
    }
  });

  return { status: 'calendar_synced', updated: tasks.length };
}

/**
 * Google Tasks 同期ロジック (最適化版)
 */
function syncGTasks(tasks) {
  const listName = 'MP-LogManager';
  let taskListId = null;
  const lists = Tasks.Tasklists.list().items;
  const existingList = lists ? lists.find(l => l.title === listName) : null;

  if (existingList) {
    taskListId = existingList.id;
  } else {
    const newList = Tasks.Tasklists.insert({ title: listName });
    taskListId = newList.id;
  }

  const gTasksItems = Tasks.Tasks.list(taskListId).items || [];
  const processedGIds = new Set();

  tasks.forEach(task => {
    if (task.status === 'DONE') return;

    const existing = gTasksItems.find(t => t.title === task.title);
    const status = 'needsAction';
    const notes = task.details || '';
    const due = task.due_date ? new Date(task.due_date).toISOString() : null;

    if (existing) {
      processedGIds.add(existing.id);
      const hasChange = (existing.notes || '') !== notes || 
                        (existing.due || '').split('T')[0] !== (due || '').split('T')[0];
      
      if (hasChange) {
        Tasks.Tasks.patch({ notes: notes, due: due, status: status }, taskListId, existing.id);
      }
    } else {
      const newTask = Tasks.Tasks.insert({ title: task.title, notes: notes, due: due, status: status }, taskListId);
      processedGIds.add(newTask.id);
    }
  });

  // クリーンアップ: リストにないタスクを完了にする
  gTasksItems.forEach(gt => {
    if (gt.status !== 'completed' && !processedGIds.has(gt.id)) {
      Tasks.Tasks.patch({ status: 'completed' }, taskListId, gt.id);
    }
  });

  return { status: 'gtasks_synced', updated: tasks.length };
}

/**
 * 認可テスト用: これを実行して一括で権限承認を行います
 */
function testAuth() {
  syncCalendar([]);
  syncGTasks([]);
  Logger.log("Authorization Success!");
}

function createResponse(data) {
  return ContentService.createTextOutput(JSON.stringify(data)).setMimeType(ContentService.MimeType.JSON);
}
```

---

## 5. 初回利用時の「認可（承認）」作業 (超重要 ⚠️)

Web Appとしてデプロイした後、**スクリプトエディタ上で手動実行を行わないと、API（Calendar/Tasks）の操作権限が有効になりません。** 同期が動かない場合は必ず以下の操作を行ってください。

1.  GAS エディタ画面上部の関数選択メニューから **`testAuth`** を選択します。
2.  **[実行]** ボタンをクリックします。
3.  「承認が必要です」というポップアップが出るので、**[権限を確認]** をクリックします。
4.  ご自身のアカウントを選択し、「このアプリは Google で確認されていません」と出た場合は **[詳細] -> [MP-LogManager（安全ではないページ）に移動]** をクリックして許可してください。
5.  実行ログに「Authorization Success!」と表示されれば、すべての権限（Calendar, Tasks, Drive）の承認が完了です。
    *   ※これで ☁️ ボタンからの同期が動くようになります。

> [!TIP]
> **「同期完了」と出るのに反映されない場合**:
> 1. 上記の認可作業を忘れていないか確認してください。
> 2. ブラウザの開発者ツール（F12）のコンソールに「GAS Error: ...」と表示されていないか確認してください。
> 3. カレンダー同期には「期限（日付）」の設定が必須です。日付がないタスクはカレンダーには現れません。
