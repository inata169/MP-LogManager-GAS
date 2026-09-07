## 1. Safe Rendering Boundary
- [x] 1.1 DOMPurify必須・fail-closedの共通Markdown描画モジュールを追加する。
- [x] 1.2 Task詳細の一覧・プレビューを共通Markdown描画へ移行する。
- [x] 1.3 Journal印刷を共通Markdown描画へ移行する。
- [x] 1.4 Task/Journal一覧をDOM APIと`addEventListener`で構築し、データ由来値をHTML・インラインイベントへ連結しない。
- [x] 1.5 接続診断とtoastの動的値を`textContent`で表示する。
- [x] 1.6 Markdown、メタデータ、ID、診断メッセージの攻撃文字列とfail-closed回帰ケースを確認する。

## 2. Task Unsaved-Change Protection
- [x] 2.1 Taskフォームの初期snapshotとdirty判定を実装する。
- [x] 2.2 ×、キャンセル、背景タップ、Escapeを同じclose requestへ統合する。
- [x] 2.3 未保存確認で「戻る」を選んだ場合に入力・スクロール・編集/プレビュー状態を保持する。
- [x] 2.4 保存失敗時はモーダルを閉じずdirty状態を保持し、成功または既存方針上の受付済み応答だけを完了扱いにする。

## 3. Accessible Modal Lifecycle
- [x] 3.1 Taskと設定モーダルへ完全なdialog名付けとボタン種別・ラベルを追加する。
- [x] 3.2 開いたモーダルへの初期フォーカス、Tab/Shift+Tab循環、Escape、body scroll lock、呼び出し元へのフォーカス復帰を実装する。
- [ ] 3.3 viewportの拡大禁止を除き、200%相当の表示でも主要操作へ到達できることを確認する。

## 4. Journal Performance And Regression QA
- [ ] 4.1 1,000行・5,000行fixtureでiPhone Safari/PWAの初期化、入力、全文選択、コピー、クラッシュ有無を測定・記録する。
- [x] 4.2 非iOSでCodeMirror virtualizationが維持されることを確認する。
- [ ] 4.3 320×568、390×844、デスクトップ、ダークモード、キーボード操作、PWAオフライン更新を確認する。
- [x] 4.4 JavaScript構文、OpenSpec strict、危険HTML/URL、保存失敗、dirty closeの回帰確認を実行する。

## 5. Release And Documentation
- [x] 5.1 ローカル資産queryとService Workerキャッシュをv2.3.4へ更新する。
- [x] 5.2 README、ユーザーマニュアル、release notes、daily summary、handover、Todoを更新する。
- [ ] 5.3 デプロイと実機確認後にOpenSpec変更を別コミットでアーカイブする。
