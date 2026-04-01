## ADDED Requirements

### Requirement: Google Calendar 同期設定
ユーザーは設定画面で Google Calendar 同期を ON/OFF できる。
ON のとき、タスク保存のたびに `due_date` を持つタスクが Google Calendar のデフォルトカレンダーに終日イベントとして同期される。

#### Scenario: 同期 ON でタスク保存
- **WHEN** ユーザーが同期設定を ON にしてタスクを保存する
- **THEN** GAS に `type=sync_calendar` の POST リクエストが発火される

#### Scenario: 同期 OFF でタスク保存
- **WHEN** ユーザーが同期設定を OFF にしてタスクを保存する
- **THEN** Google Calendar への同期リクエストは発火されない

### Requirement: Google Tasks 同期設定
ユーザーは設定画面で Google Tasks 同期を ON/OFF できる。
ON のとき、タスク保存のたびに全タスクが Google Tasks の `MP-LogManager` リストに upsert される。

#### Scenario: 同期 ON でタスク保存
- **WHEN** ユーザーが同期設定を ON にしてタスクを保存する
- **THEN** GAS に `type=sync_gtasks` の POST リクエストが発火される

#### Scenario: 新規タスクの反映
- **WHEN** MP-LogManager に新規タスクが追加され Google Tasks 同期が ON のとき
- **THEN** Google Tasks の `MP-LogManager` リストに同名タスクが追加される

#### Scenario: 完了タスクの反映
- **WHEN** タスクを DONE に変更し Google Tasks 同期が ON のとき
- **THEN** Google Tasks 上の対応タスクのステータスが `completed` に更新される
