# Change: Google Calendar / Google Tasks 同期機能の追加

## Why
MP-LogManager の Tasks データを Google Calendar・Google Tasks と連携させることで、
期限管理を Google エコシステムと統合し、リマインダーなどの活用を可能にする。

## What Changes
- 設定モーダルに「Google Calendar 同期」「Google Tasks 同期」のトグルスイッチを追加
- `api.js` に `DataAPI.syncCalendar()` / `DataAPI.syncGTasks()` 関数を追加
- `tasks.js` の `saveTasks()` 完了後に、同期設定が ON なら GAS へ同期リクエストを発火
- `app.js` に同期設定の読み込み・保存ロジックを追加
- GAS (`Code.gs`) に `syncCalendar()` / `syncGTasks()` 関数と `doPost` ハンドラを追加

## Impact
- Affected specs: `google-sync` (新規)
- Affected code: `web/index.html`, `web/js/api.js`, `web/js/tasks.js`, `web/js/app.js`, `Code.gs` (GAS)
- Breaking: なし（同期 OFF がデフォルト、既存機能に影響なし）
- 同期方向: 一方向のみ (MP-LogManager → Google)
- GAS サービス: Google Tasks API を Services から手動で有効化が必要
