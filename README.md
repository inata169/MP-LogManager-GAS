# MP-LogManager v1.4.1

[![Version](https://img.shields.io/badge/version-1.4.1-blue.svg)](https://github.com/inata169/MP-LogManager/releases)
[![License](https://img.shields.io/badge/license-MIT-green.svg)](LICENSE)

Medical Physicist Log Manager - 医学物理士業務のタスク管理・日記アプリケーション

医学物理士の日常業務（QA、治療計画、品質管理など）をサポートする、オールインワンのタスク管理・日報作成プラットフォームです。
**ブラウザからどこでもアクセス可能なWebアプリ版（PWA対応）**をメインに、PCでの詳細な集計・管理を可能にする**デスクトップアプリ版（Python）**が連携して動作します。

---

## 📱 メインアプリケーション: Web App (iPhone / PCブラウザ対応)

いつでもどこからでも日報やタスクの確認・入力ができるPWA対応のWebアプリケーションです。

### 🌐 アクセスURL
👉 **https://inata169.github.io/MP-LogManager/web/**
*(※ iPhoneやAndroidでは、ブラウザの共有メニューから「ホーム画面に追加」を行うことでネイティブアプリのように利用可能になります)*

### ✨ Web App の主な機能

#### 📓 Journal (日報・メモ)
- **Rich Editor (EasyMDE)**: プレビュー機能、シンタックスハイライト、マークダウン記法をサポートしたリッチなエディタ。PCではスプリットビューに対応。
- **Auto-save (オートセーブ)**: 入力中の内容は5秒ごとにローカルへ下書き保存され、ブラウザが落ちても復元可能。
- **Web Printing / PDF保存**: 内容を綺麗に整形し、iPhoneのAirPrintやPCでのPDF保存へワンクリックで出力（背景のUIを除外）。
- **全期間横断検索**: いつ書いた日報でもキーワードですぐに検索・アクセス可能。

#### ✅ Tasks (業務タスク管理)
- **Tasks 管理**: カテゴリ、優先度によるタスク作成・完了・編集。
- **並べ替え (Sorting)**: 期限順、新着順などのソート機能と設定の保存。
- **リアルタイム検索**: タスクをタイトル・詳細・カテゴリで即座に絞り込み。

### 🔧 初回セットアップ
Web AppはGitHub APIを直接介して皆様のデータを同期します。
1. 上記Web AppのURLにアクセス (自身のフォークしたリポジトリの Pages でも利用可能です)
2. 画面右上の設定(⚙️)ボタンをクリック
3. [GitHub Settings](https://github.com/settings/tokens) から発行した Personal Access Token (PAT) を入力して保存
   - ※ `repo` スコープにチェックを入れて発行してください
   - ※ トークン(`ghp_...`)はブラウザ内に安全に保存されます
4. **(フォークされた場合)** 設定画面にある「GitHub Owner」と「Repository」をお使いのリポジトリ名に更新してください。
   - ※ URLが `https://<user>.github.io/<repo>/` の形式であれば、自動取得されるため入力不要です。


---

## 💻 サブアプリケーション: PC Desktop App (Python)

PC環境でより高度な集計や全体バックアップを行いたい場合に使用する、Python製のデスクトップアプリケーションです。
Web Appで入力したデータ（GitHub上）とローカル環境を自動で同期（PULL / PUSH）します。

### 🪟 デスクトップ版専用の機能
- **📊 Dashboard**: 週間生産性グラフやカテゴリ別の作業割合の可視化
- **📈 Monthly Report**: 月間作業の集計グラフ(matplotlib)と内訳表示
- **💾 Data Management**: データのCSVエクスポート・インポート機能、自動バックアップ機能
- **🔔 Reminders**: 期限が近いタスクのデスクトップ通知

### 🚀 起動方法 (Windows 推奨)

#### 1. ダウンロード & インストール
```powershell
git clone https://github.com/inata169/MP-LogManager.git
cd MP-LogManager
pip install -r requirements.txt
```

#### 2. ワンクリック起動
```powershell
# 以下のバッチファイルをダブルクリック（または実行）すると、
# 自動的にGitHubからWeb版の最新データをPULLし、アプリを立ち上げます。
# アプリ終了時には自動でPUSHが行われます。
Run_LogManager.bat
```

*(直接実行する場合は `python main.py` を実行しますが、自動同期を行うためにバッチファイルでの起動を推奨します)*

---

## 📚 ドキュメント

開発者向け情報や、より詳細な使用方法は以下のドキュメントを参照してください。
- **[ユーザーマニュアル](docs/USER_MANUAL.md)**: 基本操作、高度な機能、トラブルシューティング
- **[開発者ガイド](docs/DEVELOPER_GUIDE.md)**: アーキテクチャ、DBスキーマ、主要モジュール、新機能追加方法
- **[API仕様書](docs/API_REFERENCE.md)**: 全モジュールの関数・クラス・メソッド詳細

---

## License
MIT License
