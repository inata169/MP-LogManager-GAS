# Project Context

## Purpose
MP-LogManager は、医学物理士のタスク管理、日報生成、およびデータの同期を目的とした統合プラットフォームです。
**Web App (PWA)** をメインインターフェースとし、外出先（iPhone/iPad等）からの入力を可能にしつつ、デスクトップ版（Python）での高度な集計・管理をサポートします。

## Tech Stack
### Web App (Main)
- **Framework**: Vanilla JS / HTML5 / CSS3 (Notion-like UI)
- **Libraries**: EasyMDE (Editor), marked.js (Markdown), highlight.js (Code)
- **Deployment**: GitHub Pages (PWA対応)
- **Backend (Storage)**: 
    - **Google Apps Script (GAS) API**: Google Drive へのデータ保存 (MP-LogManager-GAS Edition)
    - **GitHub API**: リポジトリ設定などの非機密情報の管理用
- **Deployment**: GitHub Pages (PWA対応) - プログラム自体の配信のみを担当
- **Security**: 個人データ（Journal/Tasks）の GitHub 上への非保存（GAS連携利用時）

### Desktop App (Sub)
- **Language**: Python 3.11+
- **GUI Framework**: CustomTkinter
- **Database**: SQLite3
- **Libraries**: pandas (export), matplotlib (charts), reportlab (PDF)

## Project Conventions

### Code Style
- PEP 8 準拠
- UTF-8 エンコーディング必須 (特に Windows 環境)
- 日本語コメント・ドキュメントを許容

### Architecture Patterns
- GUI-First: ユーザーインターフェースを起点とした機能設計
- Manager パターン: `TaskManager` などのクラスによるデータ操作の抽象化
- Module-based: `gui/`, `models.py`, `database.py` などに責務を分離

### Testing Strategy
- 手動検証および検証用スクリプト (`verify_*.py`) による動作確認

### Git Workflow
- `$env:LC_ALL='C';` を付与したコマンド実行 (文字化け防止)
- 日本語コミットメッセージ

## Domain Context
- 医療ログ（マルチパス型）: 患者ID、タスク内容、完了ステータス、日報（Journal）などの概念を持つ。
- PHI (Protected Health Information): 患者の個人情報の取り扱いに注意が必要。

## Important Constraints
- Windows パスとエンコーディング (UTF-8)
- 外部コマンド実行時のリダイレクト必須

## External Dependencies
- `customtkinter`
- `pandas`
