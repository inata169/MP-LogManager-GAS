# Todo List (v2.2.0 - Google Sync Edition)

- [x] **Task: Web App 専用構成への移行**
    - [x] **デスクトップ版関連ファイルの削除**
        - [x] `git rm` によるファイル/ディレクトリの削除 (gui/, main.py, sync_json.py 等)
        - [x] 不要な設定ファイル・一時ファイルの削除
    - [x] **ドキュメントの更新**
        - [x] `README.md`: デスクトップ版の記述を削除
        - [x] `specification.md`: デスクトップ版の「廃止」を明記
        - [x] `docs/` 配下: デスクトップ版への言及を削除
    - [x] **設定・管理ファイルの整理**
        - [x] `Todo.md` / `99-handover_context.md` の更新
        - [x] `.gitignore` の整理
    - [x] **コミットとプッシュ**
        - [x] 変更のコミット
        - [x] リモートへのプッシュ

---

## 🚀 High Priority (Next)
- [x] **Google 同期機能の実装**: Google Calendar (予定) および Google Tasks (Todo) との同期機能（一方向）を実装。設定画面で個別に ON/OFF 可能。 (2026-04-01)
- [x] **導入の簡略化**: GAS の設定を一括反映できる JSON テンプレート (`web/gas-api-template.json`) を作成。(2026-04-01)
- [x] **同期機能のドキュメント拡充**: デプロイ時の注意点やトラブルシューティングを `GOOGLE_SYNC_SETUP.md` に追記。
- [x] **UI/UX のブラッシュアップ**: GAS 連携の安定性向上（リトライ・タイムアウト・ping）と、モバイル・iOSでの使い勝手向上（トースト・SafeArea・ズーム防止）。

## 📜 Completed Archive
- [x] **GAS + Google Drive 連携への移行**: データを GitHub から Google Drive (GAS) へ安全に移行し、履歴を消去した新規リポジトリ `MP-LogManager-GAS` を構築。 (2026-03-30)
- [x] **Web Appの汎用化**: 現状 `inata169/MP-LogManager` がハードコードされている箇所を、URLからの自動取得または設定画面での入力式に変更し、誰でもフォークして利用できるように改善。 (2026-03-25)
... (以下略)
