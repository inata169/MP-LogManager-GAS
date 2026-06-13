# google-sync Specification

## Purpose
Describe Google sync settings, manual sync behavior, GAS setup requirements, and diagnostics for the Web App.
## Requirements
### Requirement: Calendar Sync Diagnostics
The Web App SHALL distinguish basic GAS connectivity from actual Google Calendar synchronization success.

#### Scenario: Connection test succeeds but Calendar sync is not verified
- **WHEN** the GAS connection test succeeds
- **THEN** the app does not claim Calendar synchronization is working unless an actual sync request has succeeded.

#### Scenario: Manual Calendar sync completes
- **WHEN** the user runs manual Google Calendar sync
- **THEN** the app shows how many tasks were sent and how many were skipped before the existing sync request.

#### Scenario: Task skipped due to missing due date
- **WHEN** a task has Calendar sync enabled but no due date
- **THEN** the app reports that the task was skipped because Calendar events require a due date.

### Requirement: Google Calendar 同期設定
The Web App SHALL allow users to turn Google Calendar sync ON or OFF in settings.
When Calendar sync is ON, manual sync SHALL send eligible non-DONE tasks with per-task Calendar sync enabled to GAS as default-calendar all-day event sync requests.

#### Scenario: 同期 ON で手動同期
- **WHEN** ユーザーが Google Calendar 同期設定を ON にして手動同期ボタンを押す
- **THEN** GAS に `type=sync_calendar` の POST リクエストが発火される

#### Scenario: 同期 OFF で手動同期
- **WHEN** ユーザーが Google Calendar 同期設定を OFF にして手動同期ボタンを押す
- **THEN** Google Calendar への同期リクエストは発火されない

#### Scenario: タスク保存では自動同期しない
- **WHEN** ユーザーがタスクを保存する
- **THEN** Google Calendar への同期リクエストは自動発火されない

#### Scenario: 期限なしタスクの診断
- **WHEN** Google Calendar 同期が ON で期限のない未完了タスクがある
- **THEN** the Web App informs the user that those tasks are skipped because Calendar events require due dates.

#### Scenario: タスク単位の Calendar 同期 OFF
- **WHEN** Google Calendar 同期が ON で、ある未完了タスクの Calendar 同期がタスク単位で OFF になっている
- **THEN** that task is excluded from the `sync_calendar` request.

### Requirement: Google Tasks 同期設定
The Web App SHALL allow users to turn Google Tasks sync ON or OFF in settings.
When Google Tasks sync is ON, manual sync SHALL send active tasks to GAS for synchronization to the Google Tasks list named `MP-LogManager`.

#### Scenario: 同期 ON で手動同期
- **WHEN** ユーザーが Google Tasks 同期設定を ON にして手動同期ボタンを押す
- **THEN** GAS に `type=sync_gtasks` の POST リクエストが発火される

#### Scenario: 同期 OFF で手動同期
- **WHEN** ユーザーが Google Tasks 同期設定を OFF にして手動同期ボタンを押す
- **THEN** Google Tasks への同期リクエストは発火されない

#### Scenario: タスク保存では自動同期しない
- **WHEN** ユーザーがタスクを保存する
- **THEN** Google Tasks への同期リクエストは自動発火されない

#### Scenario: 新規タスクの反映
- **WHEN** MP-LogManager に新規タスクが追加され Google Tasks 同期が ON の状態で手動同期される
- **THEN** Google Tasks の `MP-LogManager` リストに同名タスクが追加される

#### Scenario: 完了タスクの反映
- **WHEN** タスクを DONE に変更し Google Tasks 同期が ON の状態で手動同期される
- **THEN** Google Tasks 上の対応タスクのステータスが `completed` に更新される

### Requirement: Google Sync GAS Template
The project SHALL provide setup documentation and GAS template content for the sync endpoints used by the Web App.

#### Scenario: GAS ping endpoint is available in setup content
- **WHEN** users follow the Google sync setup documentation or template
- **THEN** the GAS code includes a `doGet` `ping` handler for connectivity checks.

#### Scenario: GAS sync endpoints are available in setup content
- **WHEN** users follow the Google sync setup documentation or template
- **THEN** the GAS code includes `doPost` handlers for `sync_calendar` and `sync_gtasks`.

#### Scenario: GAS sync functions are available in setup content
- **WHEN** users follow the Google sync setup documentation or template
- **THEN** the GAS code includes `syncCalendar(tasks)` and `syncGTasks(tasks)` functions.
