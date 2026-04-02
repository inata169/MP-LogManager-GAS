# Todo List (v2.2.1 - Optimization Edition)

- [x] **GAS 連携エラー対策 & 同期最適化 (v2.2.1)** (2026-04-02)
    - [x] **診断機能の追加**: CORSチェックを含む詳細な接続テスト機能の実装
    - [x] **クォータ制限対策**: 自動同期の廃止と手動同期ボタン（☁️）の導入
    - [x] **データ送信の効率化**: 同期対象を未完了タスクのみに制限
    - [x] **GASコードの最適化**: 差分更新ロジックの導入によるAPI呼び出し削減
    - [x] **ドキュメント更新**: `GOOGLE_SYNC_SETUP.md` の刷新
    - [x] **リリース**: v2.2.1 タグ打ちとリリース作成

---

## 🚀 High Priority (Next)
- [ ] **UI 改填**: モバイルでの入力しやすさや、検索機能のさらなる強化。
- [ ] **PWA 強化**: オフライン通知やアイコンのブラッシュアップ。

## 📜 Completed Archive
- [x] **Google 同期機能の実装 (v2.2.0)**: Google Calendar および Google Tasks (Todo) との同期機能（一方向）を実装。 (2026-04-01)
- [x] **導入の簡略化**: GAS の設定を一括反映できる JSON テンプレート (`web/gas-api-template.json`) を作成。(2026-04-01)
- [x] **Web App 専用構成への移行**: デスクトップ版関連ファイルおよびドキュメント内の言及をすべて削除。 (2026-03-31)
- [x] **GAS + Google Drive 連携への移行 (v2.0.0)**: データを GitHub から Google Drive (GAS) へ安全に移行。 (2026-03-30)

## 📜 Completed Archive
- [x] **GAS + Google Drive 連携への移行**: データを GitHub から Google Drive (GAS) へ安全に移行し、履歴を消去した新規リポジトリ `MP-LogManager-GAS` を構築。 (2026-03-30)
- [x] **Web Appの汎用化**: 現状 `inata169/MP-LogManager` がハードコードされている箇所を、URLからの自動取得または設定画面での入力式に変更し、誰でもフォークして利用できるように改善。 (2026-03-25)
... (以下略)
