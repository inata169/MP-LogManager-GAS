# MP-LogManager 開発者ガイド
**Version:** 2.0.0  
**最終更新:** 2026-03-31

---

## 1. アーキテクチャ概要
MP-LogManagerは、**Web App (PWA)** をメインとし、**Google Apps Script (GAS)** をバックエンドとする構成に移行しました。データは GitHub に保存されず、ユーザーの Google Drive 内に JSON 形式で隔離保存されます。

### 構成要素
```
┌──────────────────┐          ┌───────────────────┐
│  Web App (PWA)   │ ◄──────► │  Google Apps Script│
│  (HTML/JS/CSS)   │   fetch  │  (GAS API)        │
└──────────────────┘   (API)  └─────────▲─────────┘
                                        │
                                        │ read/write
                                        │
                              ┌─────────▼─────────┐
                              │  Google Drive     │
                              │  (JSON Files)     │
                              └───────────────────┘
```

---

## 2. Web App の詳細構造
`web/` ディレクトリ内に配置された完全に独立したモジュールです。

### 主要 JS モジュール
- **`js/api.js`**: `GasAPI` クラスおよび `DataAPI` を定義。GAS 経由でのデータ取得・更新を担当。
- **`js/app.js`**: 全体初期化、テーマ切り替え、設定モーダル（GAS URL入力）管理。
- **`js/tasks.js`**: タスク表示、フィルタ、並べ替え、保存ロジック。
- **`js/journal.js`**: EasyMDE初期化、オートセーブ、日付遷移、印刷ロジック。

### PWA とキャッシュ制御
- **`sw.js` (Service Worker)**: リソースのキャッシュ管理。
- **キャッシュ破棄**: `fetch` リクエストにタイムスタンプ (`?t=...`) を付与することで、ブラウザのキャッシュを回避し常に最新の JSON を取得します。

---

## 3. GAS API 連携
Web App はユーザー設定の GAS URL に対して GET/POST リクエストを送信します。

### データ構造
- `tasks.json`: 全タスクデータ。
- `journals.json`: 全ジャーナルデータ。

### 通信プロトコル
- **GET**: `?type=tasks` または `?type=journals` でデータを取得。
- **POST**: JSON ボディに `type` と `data` を含めてデータを保存。

---

## 4. デスクトップ版アプリ (Python)
現状、デスクトップ版はローカルの SQLite3 データベースと **GitHub** 上の JSON を同期する `sync_json.py` を使用しています。

### 今後の課題
- `sync_json.py` を GAS API 対応に改修し、Google Drive 上の JSON と直接同期できるようにする。
- `config.json` に GAS URL を保存し、`requests` ライブラリ等で通信を行う。

---

## 5. 今後の拡張プラン
- **デスクトップ版 GAS 対応**: 同期フローの完全な GAS 化。
- **セキュリティ**: GAS 上での簡易的な認証トークンの導入。

---
**Happy Coding! 🚀**
