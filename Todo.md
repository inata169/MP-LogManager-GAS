# Todo List (v2.0.0 - Web App Dedicated)

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
- [x] **UI/UX のブラッシュアップ**: GAS 連携の安定性向上（リトライ・タイムアウト・ping）と、モバイル・iOSでの使い勝手向上（トースト・SafeArea・ズーム防止）。

## 📜 Completed Archive
- [x] **GAS + Google Drive 連携への移行**: データを GitHub から Google Drive (GAS) へ安全に移行し、履歴を消去した新規リポジトリ `MP-LogManager-GAS` を構築。 (2026-03-30)
- [x] **Web Appの汎用化**: 現状 `inata169/MP-LogManager` がハードコードされている箇所を、URLからの自動取得または設定画面での入力式に変更し、誰でもフォークして利用できるように改善。 (2026-03-25)
... (以下略)
