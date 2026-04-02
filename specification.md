# MP-LogManager (GAS Edition) 仕様書 v2.2.1

## 1. 概要 (Overview)
*   **プロジェクト名:** MP-LogManager (GAS Edition)
*   **目的:** 医学物理士の日常業務（タスク・日報）を、高い機密性を保つつモバイル・PCの双方からシームレスに管理する。
*   **背景:** 従来の構成での API 制限（クォータ）問題を解決するため、v2.2.1 では **手動同期モード** と **差分更新ロジック** を導入し、大規模なタスクリストでも安定して運用できる構成とした。

## 2. アーキテクチャ (Architecture)
*   **Frontend:** Vanilla JS / HTML5 (PWA対応) - GitHub Pages でホスト。
*   **Backend (Storage):** Google Apps Script (GAS) API + Google Drive (JSON)。
*   **Diagnostics:** 開発者・ユーザー双方が設定画面から通信状態（CORS/Quota）を監視できる診断エンジンを内蔵。

## 3. 主要機能 (Main Features)

### 3.1 Web App (GAS 連携 PWA)
*   **データ保護:** タスクおよび日報データは GitHub に送信されず、ユーザーが設定した GAS Web App URL を通じてのみ保存・取得される。
*   **同期制御 (v2.2.1):** ユーザーによる明示的なアクション（☁️ボタン）による一括同期。通信回数を最小化し、Google API の利用制限を回避する。
*   **Journal エディタ:** EasyMDE による Markdown リッチ編集、PDF 印刷、オートセーブ機能。

### 3.2 外部同期 (Google Sync)
*   **Calendar / Tasks:** GAS を通じて Google カレンダーおよび Google Tasks と連携。完了済みタスクのクリーンアップ機能を備え、Google 側の状態を最新に保つ。

## 4. データ構造 (Data Structure)
Google Drive 上に以下の JSON ファイルを配置し、GAS を介して CRUD 操作を行う。
*   `tasks.json`: タスク一覧 (ID, タイトル, カテゴリ, 優先度, 期限, ステータス等)。
*   `journals.json`: 日報一覧 (日付, 内容, タイトル等)。

## 5. セキュリティ (Security)
*   **データの局所化:** 個人データはユーザー自身の Google アカウント内にのみ存在する。
*   **認証:** GAS ウェブアプリの公開設定（「自分のみ」または特定の認証）によりアクセスを制御する。
*   **PHI 保護:** 患者個人情報の検知・警告ロジック（`phi-detector.js`）を搭載。
