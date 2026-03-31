# MP-LogManager 開発者ガイド
**Version:** 2.1.0  
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

## 4. 今後の拡張プラン
- **セキュリティ**: GAS 上での簡易的な認証トークンの導入。
- **UI/UX**: 多言語対応や、より高度なデータ可視化機能。

---
**Happy Coding! 🚀**
