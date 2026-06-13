# Release Notes v2.3.2

## 概要
v2.3.2 は、保存/読み込みの診断、JSON肥大化時の軽量な警告、iPhone Tasks詳細入力欄の改善、Google Calendar同期診断の明確化を行う最小リスクリリースです。

データ形式、GAS API contract、Calendar同期の基本セマンティクスは変更していません。

## 主な変更
- **Save/Load診断**
  - `DataAPI.lastMetrics` を追加し、保存/読み込みの種別、件数、JSONサイズ、処理時間、ステータス、時刻を診断用に記録します。
  - 診断値は戻り値、制御フロー、永続化形式、エラー仕様には影響しません。

- **保存UX**
  - Tasks / Journal保存時に開始、確認済み成功、失敗を分かりやすく表示します。
  - GASが保存完了を確認できない `cors_blocked` / `requested (fallback)` の場合は、成功ではなく未確認の警告として表示します。
  - JSONサイズが大きい場合に非ブロッキング警告を表示します。

- **iPhone Tasks入力欄**
  - iPhone幅の画面で `#task-details` を広げ、キーボード表示時にも入力しやすくしました。

- **Google Calendar同期診断**
  - GAS接続テストは「GAS pingのみOK」と明示し、Calendar同期成功とは分けて表示します。
  - 手動同期時に、送信対象、期限なし、個別同期OFF、完了済み除外の件数を表示します。
  - GASが返した同期結果と、Calendar上での表示確認を分けて表示します。
  - 手動同期中は同期ボタンを無効化し、連打による重複同期リクエストを防止します。

- **キャッシュ更新**
  - WebアセットのクエリとService Workerキャッシュ名を `v2.3.2-r4` に更新しました。
  - オフラインキャッシュ戦略は変更していません。

- **OpenSpec**
  - `openspec/changes/improve-save-load-mobile-task-sync/` をv2.3.2正式proposalとして整理しました。
  - `openspec validate improve-save-load-mobile-task-sync --strict --no-interactive` に合格済みです。

## 検証
- `node --check web/js/api.js`
- `node --check web/js/app.js`
- `node --check web/js/tasks.js`
- `node --check web/js/journal.js`
- `openspec validate improve-save-load-mobile-task-sync --strict --no-interactive`
- ブラウザ手動確認
  - Tasks保存 OK
  - Journal保存 OK
  - iPhone Tasks詳細入力欄拡大 OK
  - GAS ping表示とCalendar同期診断の分離 OK
  - 手動Calendar同期 OK
  - 同期ボタン連打時もCalendar予定は1件のみ

## 注意
- 保存時のCalendar自動同期は再有効化していません。Calendarへ反映するには手動同期ボタンを使用してください。
- Stable Calendar event matching、event ID保存、upsert改善、deduplication、JSON分割、差分保存、archive migration はv2.3.2には含めていません。
