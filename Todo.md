# Todo List

## Current Version: v1.4.1 (2026-03-25)

## High Priority (Next Session)
- [x] **Web Appの汎用化**: 現状 `inata169/MP-LogManager` がハードコードされている箇所を、URLからの自動取得または設定画面での入力式に変更し、誰でもフォークして利用できるように改善。 (2026-03-25)

- [x] **Journal 印刷バグ修正**: 編集・クリアを繰り返した際に古い内容がPDFに残る問題を解消 (2026-03-26)
- [ ] **ユーザーフィードバック収集**: 新しく実装した機能の使い勝手やバグ出し。

## Completed
- [x] **Journal Printing**: Web App（Journal）のPDF印刷機能（iPhoneの自動印刷警告回避・バックグラウンドレンダリングによる出力） (2026-03-25)
- [x] **Journal Auto-save**: EasyMDEでの入力内容を5秒ごとにlocalStorageへ下書き保存・復元する機能 (2026-03-25)
- [x] **Journal Rich Editor**: Web App（Journal）のNote風リッチエディタ化（方式A: EasyMDE導入）。iPhone対応およびPCでのスプリットビューを実装。 (2026-03-24)
- [x] **Task Sorting Feature**: Web App (Tasks View) にタスクの並べ替え（期限順、ステータス、新着順）機能を追加し、設定を保存。 (2026-03-24)
- [x] **Web App / Journal Search**: タスクや全Journalに対する横断的な検索機能 (2026-03-22)
- [x] **JournalのMarkdownプレビューのリッチ化 (Phase 1)**: `highlight.js` の導入によるシンタックスハイライト対応、およびNotion風のクリーンなUIへの刷新。 (2026-03-21)
- [x] **GitHubトークン更新不可の改善**: ヘッダーに設定ボタン(⚙️)を追加し、トークン再入力へ誘導。 (2026-03-13)
- [x] **Web AppのMarkdownテーブル表示問題**: `marked.js` を導入して改行を含むテーブル崩れを根本解決 (2026-02-27)

## Completed
- [x] **Web App UI/UX**: モバイル（iPhone）での表示崩れを防ぐため、CSS調整とMarkdownテーブル表示を修正（marked.js追加）。 (2026-02-27)
- [x] **Markdown Table Fix**: PC版アプリ（tkinterweb導入）でのMarkdownテーブル表示崩れ修正と、スクロール時のエラークラッシュの回避処理、タスク保存時のバリデーションを修正。(2026-02-27)
- [x] **Actions Fix**: iPhone等から連続操作した際、複数回のコミットでPagesビルドが競合し「Cancelled」エラーメールの通知が大量に届く問題を修正（JSON更新時は `[skip ci]` を付与）(2026-02-27)
- [x] **Web App Refresh**: ヘッダーに手動同期（リフレッシュ）ボタンを実装 (2026-02-13)
- [x] **Sync Fix**: 双方向の削除同期（PC版で消したタスクがWeb版から復元される問題）を修正 (2026-02-13)
- [x] **Task Deletion**: 1件ずつの削除ボタン（🗑️）を各タスク行に実装 (v1.2.1) (2026-02-12)
- [x] **Filter Default**: 起動時に「Hide Completed」をデフォルトでONに設定 (2026-02-12)
- [x] **Web UI Refactor**: ステータスフィルタをチェックボックス形式に簡素化 (2026-02-12)
- [x] **Auto Sync**: Automatic data synchronization at startup/shutdown via batch file (v1.2) (2026-02-12)
- [x] **My iPhone**: Web App (PWA) for iPhone/Mobile access via GitHub Pages (2026-02-10)
      - Added auto-git functionality to `sync_json.py` (v1.1) for one-click sync.
      - Fixed Japanese mojibake (character encoding) issues in JS, Python, and Git settings.
- [x] **Documentation**: User Manual, Developer Guide, API Reference (2026-01-29)
- [x] **Dark Mode**: Light/Dark theme toggle with persistent settings (2026-01-29)
- [x] **Monthly Report**: Monthly task statistics with charts and category breakdown (2026-01-29)
- [x] **Print Feature**: PDF export for all views (Tasks, Journal, Dashboard, Monthly Report) (2026-01-29)
- [x] **Reminders**: Desktop notifications for due tasks.
- [x] **Data Visualization**: Dashboard with weekly productivity charts (matplotlib).
- [x] **Search**: Task list search bar with real-time filtering.
- [x] **Cloud Sync Support**: Configurable DB path via `config.json` for Google Drive etc.
- [x] **Bug Fix**: Fixed issue where task status updates were not saving (Sync error).
- [x] **Task Deletion**: Multi-selection (Ctrl/Shift) and Right-click context menu (delete).
- [x] **Environment**: Python path & launch success.
- [x] **GUI-DB Integration**: DB connection for tasks.
- [x] **Journal Feature**: Saving/Loading journal entries.
- [x] **Journal (v2.0)**: Multiple entries per day support & UI redesign.
- [x] **Sync Feature**: Task to Journal sync (with feedback).
- [x] **Templates**: Task creation from templates (Routine tasks).
- [x] **Dashboard**: Summary cards and category progress bars.
- [x] **Export/Import**: CSV support for data migration.
- [x] **Snippet**: Quick insert phrases for journal.
- [x] **PHI**: Patient ID (6-8 digits) and birthday detection/warnings.
- [x] **Backup**: Automatic DB backup on startup.
- [x] **Task List Enhancement**: Sorting, filtering, and rich list items.
