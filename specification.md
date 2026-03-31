# MP-LogManager (GAS Edition) 仕様書 v2.1

## 1. 概要 (Overview)
*   **プロジェクト名:** MP-LogManager (GAS Edition)
*   **目的:** 医学物理士の日常業務（タスク・日報）を、高い機密性を保ちつつモバイル・PCの双方からシームレスに管理する。
*   **背景:** 従来の GitHub API 依存の構成では、パブリックリポジトリを利用する場合に個人データが Git 履歴に残るリスクがあった。v2.0 では **Google Apps Script (GAS)** を介して **Google Drive** 上にデータを隔離保存する構成へ移行し、「完全なデータプライバシー」と「GitHub Pages による利便性」を両立させた。

## 2. アーキテクチャ (Architecture)
*   **Frontend:** Vanilla JS / HTML5 (PWA対応) - GitHub Pages でホスト。
*   **Backend (Storage):** Google Apps Script (GAS) API + Google Drive (JSON)。
*   **Deployment:** プログラム自体は GitHub で管理し、データはユーザー個人の Google Drive で完結する。

## 3. 主要機能 (Main Features)

### 3.1 Web App (GAS 連携 PWA)
*   **データ保護:** タスクおよび日報データは GitHub に送信されず、ユーザーが設定した GAS Web App URL を通じてのみ保存・取得される。
*   **キャッシュ制御:** PWA のサービスワーカー (`sw.js`) によるオフライン動作と、API リクエストへのタイムスタンプ付与による最新データの確実な取得。
*   **Journal エディタ:** EasyMDE による Markdown リッチ編集、PDF 印刷、オートセーブ機能。

### 3.2 デスクトップ版 (Python / 終役)
*   **現状:** 従来のデスクトップ版 (`main.py`, `sync_json.py` 等) は v2.0.0 をもって廃止・削除された。
*   **理由:** Google Drive + GAS 連携による Web App の機能充足により、ローカル SQLite を介した管理の必要性が低下し、シングルソース（Google Drive）によるシンプルな構成とするため。

## 4. データ構造 (Data Structure)
Google Drive 上に以下の JSON ファイルを配置し、GAS を介して CRUD 操作を行う。
*   `tasks.json`: タスク一覧 (ID, タイトル, カテゴリ, 優先度, 期限, ステータス等)。
*   `journals.json`: 日報一覧 (日付, 内容, タイトル等)。

## 5. セキュリティ (Security)
*   **データの局所化:** 個人データはユーザー自身の Google アカウント内にのみ存在する。
*   **認証:** GAS ウェブアプリの公開設定（「自分のみ」または特定の認証）によりアクセスを制御する。
*   **PHI 保護:** Web App 上での入力時、患者 ID などのパターンを検知した際の警告表示（実装済み）。
