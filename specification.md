# 医学物理士業務管理システム (MP-LogManager) 仕様書 ver 2.0 (GUI-First Edition)

## 1. 概要 (Overview)
*   **プロジェクト名:** MP-LogManager (Medical Physicist Log & Task Manager)
*   **目的:** 医学物理士の日々の業務（QA、治療計画、カンファレンス等）における「タスク管理」と「業務日報」を一元管理する。GUIによる直感的な操作（マウス・プルダウン中心）を重視し、入力負荷を軽減する。
*   **開発方針:** Python + CustomTkinter を使用したデスクトップアプリケーション。

## 2. ターゲットユーザー
*   **ユーザー:** 医学物理士 (Medical Physicist)
*   **利用環境:** Windows PC (院内ネットワーク/オフライン想定)

## 3. 機能要件 (Functional Requirements)

### 3.1 モジュール1: 日報管理 (Daily Journal)
*   **記録機能:**
    *   必須項目: 日付、内容、特記事項（ヒヤリハットなど）。
*   **スニペット機能 (Quick Insert):**
    *   よく使うフレーズ（例：「始業前点検完了」「Isocenter Check OK」など）を、画面上のボタンクリック一つで本文に挿入する機能を搭載。
*   **連携:** その日に完了したタスクをボタン一つで日報に転記する「Sync」機能。

### 3.2 モジュール2: Todoリスト (Task Management)
*   **操作性:**
    *   **マウスファースト:** タスク作成時のカテゴリ選択、優先度設定は全てプルダウン（コンボボックス）で行う。
    *   **完了操作:** チェックボックスのクリックのみで完了状態にする。
*   **タスク項目:**
    *   タイトル、カテゴリ（QA, Planning, Meeting, Research, Etc）、優先度、期限、詳細メモ、**タグ（装置名・部屋名など）**。
*   **ルーチンタスク（テンプレート）:**
    *   「毎朝のQAセット」など、決まったタスク群を一括登録するボタンを用意。

### 3.3 モジュール3: ダッシュボード (Dashboard)
*   **可視化:**
    *   アプリ起動時に、「本日の残タスク」や「今週の業務カテゴリ割合」をグラフやプログレスバーで表示し、直感的に業務量を把握可能にする。

### 3.4 モジュール4: データ管理 (Data Persistence)
*   **保存形式:** SQLite3 (`mp_log.db`)
    *   リレーショナルデータベースとしてタスクと日報を管理。
*   **バックアップ:** 起動/終了時に自動でバックアップフォルダへコピーを作成。
*   **エクスポート:** CSV形式での出力に加え、**整形されたレポート（Excel/PDF）**の出力をサポート（将来実装）。

## 4. 非機能要件 (Non-Functional Requirements)

### 4.1 セキュリティ (PHI Protection)
*   **ローカル完結:** 外部通信を行わない。
*   **PHI警告:** 入力テキストを監視し、患者ID（8桁数字など）や個人名と思われるパターンが含まれる場合、警告ポップアップまたはハイライト表示を行う。

### 4.2 UI/UX
*   **フレームワーク:** `CustomTkinter`
*   **デザイン:** モダンで視認性の高いダークモード/ライトモード対応UI。
*   **入力補助:** キーボード入力を極力減らし、マウス操作で完結する動線設計。

## 5. データ構造定義 (Schema Design)

### Table: tasks
| Column | Type | Description |
| :--- | :--- | :--- |
| id | INTEGER | PK |
| title | TEXT | タスク名 |
| category | TEXT | QA, Plan, etc. |
| priority | TEXT | High, Mid, Low |
| status | TEXT | TODO, DONE |
| due_date | TEXT | YYYY-MM-DD |
| created_at | TEXT | 作成日時 |
| completed_at | TEXT | 完了日時 |

### Table: journals
| Column | Type | Description |
| :--- | :--- | :--- |
| id | INTEGER | PK |
| date | TEXT | YYYY-MM-DD (Unique) |
| content | TEXT | 本文 |
| remarks | TEXT | 申し送り事項 |

## 6. ディレクトリ構成案
```
MP-LogManager/
├── main.py          # アプリ起動エントリポイント
├── database.py      # DB接続・初期化
├── models.py        # データアクセスロジック
├── utils.py         # バックアップ、PHIチェック等
└── gui/             # GUI用パッケージ
    ├── app.py       # Main Window
    ├── frames.py    # 各画面パーツ
    └── dialogs.py   # ポップアップダイアログ
```
