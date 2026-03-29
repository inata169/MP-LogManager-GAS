# MP-LogManager API リファレンス
**Version:** 1.4.1  
**最終更新:** 2026-03-25

---

## 1. Web App API (JavaScript)
`web/js/api.js` にて不整合のないように実装されている GitHub 通信クラス。

### class `GitHubAPI`
- **`constructor()`**: `localStorage` から `github_token` を読み込みます。
- **`setToken(token: string)`**: 新しいトークンを保存し、以降の通信で使用。
- **`request(endpoint: string, options: any)`**: GitHub REST API へのリクエストをラップ。
- **`getFile(path: string)`**: ファイル内容と現在の SHA を取得。
- **`updateFile(path: string, content: any, sha: string, message: string)`**: ファイルを Base64 エンコードして GitHub にプッシュ。

#### 主要メソッド
- **`getTasks()`**: `data/tasks.json` を取得。
- **`updateTasks(tasks, sha)`**: タスクリストを更新。
- **`getJournals()`**: `data/journals.json` を取得。
- **`updateJournals(journals, sha)`**: ジャーナルリストを更新。

---

## 2. Desktop App API (Python)
デスクトップ版でのみ使用されるビジネスロジック。

### module `models.py`
- **class `TaskManager`**:
  - `get_tasks()`: 全タスクをリストで取得。
  - `add_task(...)`: 新規タスクの追加。
  - `update_status(task_id, status)`: ステータス更新。
- **class `JournalManager`**:
  - `get_entries(date_str)`: 指定日のジャーナルを取得。
  - `add_entry(date_str, title, content)`: 新規エントリの作成。

---

## 3. 同期モジュール (Python)
### module `sync_json.py`
- **`export_to_json()`**: SQLite データベースの内容を `data/*.json` へ書き出し。
- **`import_from_json()`**: `data/*.json` の内容を SQLite データベースへ読み込み。
- **`Logger`**: 環境依存の文字化けを回避するためのカスタムロガークラス。

---

## 4. ユーティリティ (JavaScript & Python)
### module `utils.py` (Python)
- **`contains_phi(text)`**: 患者情報の簡易検出正規表現。

### module `web/js/api.js` (JavaScript)
- **`getRepoConfig()`**: URL または `localStorage` からリポジトリ情報を自動抽出するユーティリティ。

---
**Happy Coding! 🚀**
