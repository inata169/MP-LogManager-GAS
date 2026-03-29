# MP-LogManager 開発者ガイド
**Version:** 1.4.1  
**最終更新:** 2026-03-25

---

## 1. アーキテクチャ概要
MP-LogManagerは、**Web App (PWA)** をメインとし、**Desktop App (Python)** がサブとして機能するハイブリッド構成に移行しました。データは GitHub を中央リポジトリとして同期します。

### 構成要素
```
┌──────────────────┐          ┌───────────────────┐
│  Web App (PWA)   │ ◄──────► │  GitHub Repository │
│  (HTML/JS/CSS)   │   REST   │  (JSON Files)     │
└──────────────────┘   API    └─────────▲─────────┘
                                        │
                                        │ git push/pull
                                        │
                              ┌─────────▼─────────┐
                              │  Desktop App      │
                              │  (Python/Tkinter) │
                              └───────────────────┘
```

---

## 2. Web App の詳細構造
`web/` ディレクトリ内に配置された完全に独立したモジュールです。

### 主要 JS モジュール
- **`js/api.js`**: `GitHubAPI` クラスを定義。データの取得・更新（Base64エンコード等）を担当。
- **`js/app.js`**: 全体初期化、テーマ切り替え、設定モーダル管理。
- **`js/tasks.js`**: タスク表示、フィルタ、並べ替え、保存ロジック。
- **`js/journal.js`**: EasyMDE初期化、オートセーブ、日付遷移、印刷ロジック。

### PWA とオフライン対応
- **`sw.js` (Service Worker)**: 各リソース（JS/CSS/HTML）をオフラインでキャッシュ。
- **`manifest.json`**: アプリケーションアイコン、テーマカラー、開始URLの設定。
- **リポジトリの相対パス設定**: 様々なリポジトリ名でフォークされても動作するように、各パスは相対パスで定義。

---

## 3. GitHub API 連携
Web Appは `Personal Access Token (PAT)` を使用し、直接 GitHub と通信します。

### データ構造
- `data/tasks.json`: 全タスクデータ。
- `data/journals.json`: 全ジャーナルデータ。
- SHA管理: 書き込み時にはファイル内容の更新を検証するため、最新の SHA を常に取得して使用します。

---

## 4. デスクトップ版アプリ (Python)
デスクトップ版は、ローカルの SQLite3 データベースと GitHub 上の JSON データを同期するブリッジ機能を提供します。

### 同期フロー (`Run_LogManager.bat`)
1. GitHub から Pull し、最新の JSON を抽出。
2. JSON から SQLite へデータをインポート。
3. GUI アプリ（Dashboard 等）が動作。
4. 終了時に SQLite から JSON をエクスポートし、Git Push。

---

## 5. 今後の拡張プラン
- **汎用性の向上**: さらにリポジトリ設定を柔軟にし、GitHub Pages 以外（自前サーバー等）へのデプロイも検討。
- **セキュリティ**: PAT 以外の認証方式（GitHub Apps等）への移行。

---
**Happy Coding! 🚀**
