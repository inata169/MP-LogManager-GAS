## Context
MP-LogManager は GAS をバックエンドとした PWA。
GAS は CalendarApp / Tasks サービスをネイティブに呼び出せるため、フロントエンドから OAuth2 フローは不要。

## Goals / Non-Goals
- Goals:
  - Tasks の due_date → Google Calendar (終日イベント, `[MP-Log]` プレフィックス)
  - Tasks の全件 → Google Tasks リスト `MP-LogManager` へ upsert
  - 両同期を設定画面で個別に ON/OFF 可能
- Non-Goals:
  - 双方向同期（Google 側の変更を MP-Log に反映）
  - カレンダー名の設定（デフォルトカレンダー固定）

## Decisions
- **同期方向**: 一方向 (MP-LogManager → Google)。GAS Time Trigger なし、タスク保存時にのみ発火。
- **識別**: Calendar イベントはタイトルプレフィックス `[MP-Log]` で識別。GTasks はタイトル一致で upsert。
- **no-cors**: POST は `no-cors` のため同期結果はレスポンス不可。「同期リクエスト送信」として扱う。
- **デフォルト OFF**: 設定 ON にするまで同期は発生しない。

## Risks / Trade-offs
- GTasks タイトル重複問題: 同名タスクが複数ある場合、最初のマッチのみ更新される → 許容。
- no-cors でエラーが検知できない → GAS Logger でのみ確認可能。
- Google Tasks API は GAS Services から手動で有効化が必要 → セットアップ手順に記載。

## Open Questions
- なし（全確認済み）
