# MP-LogManager API リファレンス
**Version:** 2.1.0  
**最終更新:** 2026-03-31

---

## 1. Web App API (JavaScript)
`web/js/api.js` にて実装されている GAS 通信およびデータ統合管理クラス。

### class `GasAPI`
Google Apps Script ウェブアプリ経由で Google Drive 上の JSON を操作します。
- **`fetchData(type: string)`**: `type` ('tasks' | 'journals') を指定してデータを取得。`fetch` 時にキャッシュ回避用のタイムスタンプを付与します。
- **`updateData(type: string, data: any)`**: データを POST 送信し、Google Drive 上のファイルを更新します。
- **`setUrl(url: string)`**: GAS ウェブアプリの URL を `localStorage` に保存。

### object `DataAPI`
フロントエンド各画面（Tasks, Journal）から呼ばれる統合インターフェース。
- **`getTasks()`**: `GasAPI` を使用してタスクリストを取得。
- **`updateTasks(tasks)`**: タスクリストを保存。
- **`getJournals()`**: `GasAPI` を使用してジャーナルリストを取得。
- **`updateJournals(journals)`**: ジャーナルリストを保存。

### class `GitHubAPI` (Legacy/Config)
リポジトリ設定などの非機密情報の管理に使用可能な、従来の GitHub 通信クラス。
- **`request(endpoint, options)`**: GitHub REST API へのリクエスト。

---

## 2. ユーティリティ
### module `web/js/api.js` (JavaScript)
- **`getRepoConfig()`**: URL または `localStorage` からリポジトリ情報を抽出。

---
**Happy Coding! 🚀**
