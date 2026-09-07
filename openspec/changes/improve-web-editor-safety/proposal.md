# Change: Web編集画面の安全性とアクセシビリティを強化する

## Why
Task・Journal・接続診断には、Google Drive/GASやユーザー入力に由来する値を文字列テンプレート経由で`innerHTML`へ渡す経路が残っている。Task Markdownはv2.3.3で安全化したが、Journal印刷、一覧メタデータ、診断・通知では同じ安全境界が一貫していない。また、Task編集は未保存のまま閉じられ、モーダルのフォーカス管理とページ拡大設定にも改善余地がある。

## What Changes
- MarkdownからHTMLへ変換する処理を、DOMPurifyを必須とする共通の安全な描画境界へ集約する。
- Journal印刷、Task/Journal一覧、診断結果、通知で、ユーザー・GAS・ネットワーク由来の文字列をHTMLとして解釈しない。
- データ由来IDをインラインイベントハンドラーへ埋め込まず、DOM APIと`addEventListener`で操作を結び付ける。
- Task編集にdirty状態を導入し、×、キャンセル、背景タップ、Escapeのすべてで未保存変更を確認する。保存失敗時はモーダルと入力を保持する。
- Taskと設定モーダルへ、初期フォーカス、Tab循環、Escape、呼び出し元へのフォーカス復帰を追加する。
- viewport設定から画面拡大禁止を除き、iPhone/iPadのピンチズームを許可する。
- iPhoneのJournal全文選択を維持したまま、1,000行・5,000行の長文で初期化、入力、選択、コピーを測定する。

## Impact
- Affected specs: `web-security`（新規）、`web-accessibility`（新規）、`mobile-task-ux`
- Affected code: `web/index.html`, `web/js/app.js`, `web/js/tasks.js`, `web/js/journal.js`, `web/css/style.css`, `web/sw.js`, 新規の共通安全描画モジュール
- Existing dependency reused: vendored DOMPurify 3.4.14
- New external dependencies: なし
- Data migration: なし
- GAS/Google sync contract changes: なし
