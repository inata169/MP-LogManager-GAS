## 1. OpenSpec & ドキュメント
- [x] 1.1 proposal.md の作成
- [x] 1.2 spec delta の作成
- [x] 1.3 design.md の作成

## 2. GAS バックエンド (Code.gs)
- [ ] 2.1 `doGet` に `ping` ハンドラを追加
- [ ] 2.2 `doPost` に `sync_calendar` / `sync_gtasks` ハンドラを追加
- [ ] 2.3 `syncCalendar(tasks)` 関数を実装
- [ ] 2.4 `syncGTasks(tasks)` 関数を実装

## 3. フロントエンド
- [x] 3.1 `web/index.html` — 設定モーダルに同期トグルUI追加
- [x] 3.2 `web/js/api.js` — `DataAPI.syncCalendar` / `DataAPI.syncGTasks` 追加
- [x] 3.3 `web/js/tasks.js` — `saveTasks()` 後に同期呼び出し追加
- [x] 3.4 `web/js/app.js` — 同期設定の読み込み・保存ロジック追加
- [x] 3.5 `web/css/style.css` — トグルスイッチのスタイル追加

## 4. セットアップガイド
- [x] 4.1 GAS への追記手順を Walkthrough として作成
- [x] 4.2 トラブルシューティング（デプロイ更新ミスへの対策）を追記
