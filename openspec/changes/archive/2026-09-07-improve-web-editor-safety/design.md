## Context
v2.3.3ではTask詳細のMarkdown描画をDOMPurifyで安全化した。一方、`journal.js`の印刷処理は`marked.parse()`の出力を直接`innerHTML`へ渡し、Task/Journal一覧はデータ由来のIDやメタデータをHTMLテンプレートとインラインイベントへ埋め込んでいる。`app.js`の接続診断とtoastも動的なメッセージをHTML文字列へ連結する。

UI面では、モーダルの開閉は`active`クラスの切り替えだけで、フォーカスの移動・閉じ込め・復帰・Escape処理を持たない。Task編集は変更前の状態を記録しておらず、保存失敗を含む閉じる経路で入力を失う可能性がある。iOS Journalの全文選択修正はCodeMirrorの全行をDOMへ描画するため、非常に長い文書でのコストを実機測定する必要がある。

詳細な根拠と選択肢は[`hardening/hardening.md`](hardening/hardening.md)にまとめる。

## Goals / Non-Goals
- Goals:
  - ユーザー・GAS・ネットワーク由来の文字列を、明示的にサニタイズされたMarkdown以外はHTMLとして解釈しない。
  - Markdownの安全性を一つの共通実装で所有し、TaskとJournalの挙動差をなくす。
  - Taskの未保存内容を、すべての閉じる操作と保存失敗から保護する。
  - Task・設定モーダルをキーボードとスクリーンリーダーで一貫して操作可能にする。
  - iPhone/iPadでページ拡大を許可し、長いJournalの全文選択と編集性能を確認する。
- Non-Goals:
  - JSON形式、GAS API、Calendar/Google Tasks同期動作の変更。
  - WYSIWYGエディタやCodeMirrorの置き換え。
  - CSP/Trusted Typesの全面導入。
  - Calendar重複排除、データ分割、差分保存など別ロードマップの実装。

## Evidence
- Observed: `web/js/journal.js:331`はJournal Markdownをサニタイズせず印刷DOMへ挿入する。
- Observed: `web/js/tasks.js:91-105`と`web/js/journal.js:102-113`はデータ由来値をHTMLとインラインイベントへ連結する。
- Observed: `web/js/app.js:163-206,257`は診断・エラーメッセージ・toastを動的HTMLへ連結する。
- Observed: `web/js/app.js:93-105,218-232`はモーダルのフォーカス、Escape、復帰、dirty状態を管理しない。
- Observed: `web/index.html:6`は`maximum-scale=1.0, user-scalable=no`で拡大を禁止する。
- Source-derived: `web/js/journal.js:30`の`viewportMargin: Infinity`はiOSの全文選択を直す一方、文書サイズに比例してDOM量を増やす。

## Options
### Option 1: 各描画箇所へ個別ガードを追加する
Journal印刷へDOMPurifyを追加し、既存テンプレートの各値をエスケープする。差分は小さいが、安全制御が複数ファイルへ分散したままになり、新しい描画経路で同じ漏れが再発しやすい。

### Option 2: 共通の安全描画境界とDOM構築へ移行する（推奨）
Markdown変換とfail-closed処理を新しい共通モジュールへ移し、Task・Journalの両方から利用する。一般文字列は`textContent`、要素生成は`createElement`、操作は`addEventListener`で結び付け、動的`innerHTML`は共通サニタイズ済みMarkdownまたは完全な定数テンプレートに限定する。

このアプリは小規模なVanilla JS構成であり、共通境界の追加コストは限定的である。再発防止とレビュー容易性を優先し、Option 2を提案する。実装はこの選択の明示承認後に開始する。

## Proposed Decisions
- 共通モジュールを`web/js/safe-render.js`として追加し、DOMPurifyの対応確認、Markdown変換、サニタイズ、エスケープ済みテキストへのfail-closedを所有させる。
- Task固有のMarkdownテーブル前処理はTask側に残し、その出力だけを共通モジュールへ渡す。
- Task/Journal一覧はDOM APIで構築し、データ由来IDはクロージャ内の値としてイベントリスナーへ渡す。
- 診断結果とtoastは、構造をDOM APIで作り、動的値を`textContent`へ入れる。
- Task編集開始時に正規化したフォームsnapshotを保持する。保存完了時だけsnapshotを更新し、保存失敗時はdirty状態を維持する。
- `hideModal()`の前にキャンセル可能なclose requestを通し、×、キャンセル、背景、Escapeで同じTask dirty確認を使う。
- 汎用モーダル管理は開いた要素、直前フォーカス、フォーカス可能要素、body scroll lockを管理する。Task固有のdirty判断はモーダルのcancelable eventで分離する。
- viewportは`width=device-width, initial-scale=1.0`とし、フォーム側の16px入力サイズで意図しない自動ズームを抑える。
- iOS性能は1,000行・5,000行の固定fixtureで初期化時間、入力応答、選択・コピー一致、クラッシュ有無を記録する。v2.3.3より明確な劣化があれば同じリリースで推測的なエディタ変更をせず、測定結果と代替案を別判断にする。

## Risks / Trade-offs
- DOM APIへの移行で一覧描画コードが長くなる。
  - 小さな要素生成helperと回帰テストで重複を抑え、HTML文字列helperは導入しない。
- 共通Markdownモジュールの障害がTaskとJournalの両方へ影響する。
  - DOMPurify不在・非対応・例外時は必ずテキスト表示へfail closedし、Task/Journal双方で同じ回帰ケースを実行する。
- 未保存確認が頻繁だと操作感を損なう。
  - 初期snapshotと現在値が異なる場合だけ確認し、プレビュー切り替えだけではdirtyにしない。
- フォーカストラップがEasyMDEや日付入力と干渉する可能性がある。
  - 対象を現在開いているモーダル内に限定し、画面幅、キーボード、VoiceOver相当の確認を行う。
- ピンチズーム許可で一部レイアウトが拡大表示される。
  - 200%相当でも主要操作へ到達できることを確認する。
- iOSの全行DOM描画は長文でコストが増える。
  - まず測定し、全文選択の修正を維持した状態で許容性を判断する。

## Migration Plan
1. 共通安全描画モジュールと単体回帰ケースを追加する。
2. Task Markdownを共通モジュールへ移し、既存表示が一致することを確認する。
3. Journal印刷、Task/Journal一覧、診断・toastを安全なDOM構築へ移す。
4. Task dirty状態と保存結果を閉じるポリシーへ接続する。
5. 汎用モーダルのフォーカス管理とzoom許可を追加する。
6. iPhone長文性能、モバイル/デスクトップ、ダークモード、PWA更新を検証する。
7. v2.3.4の資産・Service Workerキャッシュを更新し、段階的に公開する。

## Rollback
- v2.3.4のフロントエンドコミットとキャッシュ版を戻せば、データ移行なしでv2.3.3へ復帰できる。
- セキュリティ移行中は既存のTask詳細DOMPurify処理を削除せず、共通モジュールのTask回帰確認後に置き換える。

## Open Questions
- 解決済み: Option 2（共通の安全描画境界とDOM API移行）を実装する。
- 解決済み: 実機性能確認の基準端末はiPhone SE（第3世代、2022年）、iOS 26.6.1として記録する。ただし実装は端末名で分岐せず、320px幅からデスクトップまで共通のレスポンシブ動作とする。
