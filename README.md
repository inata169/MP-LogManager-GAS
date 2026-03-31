# MP-LogManager (GAS Edition) 🚀

[![Version](https://img.shields.io/badge/version-2.1.0-orange.svg)](https://github.com/inata169/MP-LogManager-GAS)
[![Security](https://img.shields.io/badge/Data%20Privacy-High-green.svg)](https://docs.google.com/presentation/d/...)
[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)

**MP-LogManager (GAS Edition)** は、医学物理士の日常業務をスマートに管理するための、**「究極のプライバシー保護」** を備えたタスク管理・日報アプリケーションです。

---

## 🛡️ 本バージョンの最大の特徴
従来のバージョンとは異なり、**個人のタスクや日報データが GitHub 上に一切保存されません。**

- **データ保存先**: あなたの個人の **Google Drive**
- **Backend (Storage)**: Google Apps Script (GAS)
- **Personal Data**: あなたの個人の **Google Drive** にのみ保存されます。

これらにより、GitHub リポジトリを 公開 (Public) 設定にして GitHub Pages を利用しながらも、**中身のデータは自分だけがアクセスできる安全な場所にある**という、利便性とセキュリティを両立した環境を実現しています。

---

## ✨ 主な機能

### 📓 Journal (日報・メモ)
![Journal View](docs/pics/%E3%82%B9%E3%82%AF%E3%83%AA%E3%83%BC%E3%83%B3%E3%82%B7%E3%83%A7%E3%83%83%E3%83%88%202026-03-31%20100916.png)
- **Rich Editor**: Markdown、シンタックスハイライト、オートセーブ完結。
- **Secure Storage**: 日々の記録はすべて Google Drive 上の JSON ファイルに保存。
- **PDF出力**: iPhone の AirPrint や PC での PDF 保存に最適化した整形機能。

### ✅ Tasks (タスク管理)
![Tasks View](docs/pics/%E3%82%B9%E3%82%AF%E3%83%AA%E3%83%BC%E3%83%B3%E3%82%B7%E3%83%A7%E3%83%83%E3%83%88%202026-03-31%20100838.png)
- **Flexible Management**: カテゴリ、優先度によるタスク管理。
- **Advanced Sorting**: 期限、作成日によるソートの保存。
- **Real-time Search**: 全タスクをインクリメンタル検索。

---

## 🔧 セットアップ手順（自分専用の構築）

1. **Google Drive 側の準備**
   - **[詳細なセットアップガイドはこちら](docs/SETUP_GUIDE.md)** をご覧ください（初心者の方でも迷わず設定できます）。
   - Drive 上に `journals.json` と `tasks.json` を作成。
   - Google Apps Script (GAS) を作成し、専用のコードをデプロイして「ウェブアプリ URL」を取得。

2. **Web App への設定**
   - 発行された **GitHub Pages URL** にアクセス。
   - 右上の設定(⚙️)ボタンから、自分専用の **GAS Web App URL** を入力して保存。

3. **データの復元（移行）**
   - 既存のデータがある場合は、Google Drive 上の JSON ファイルに中身をコピーすることでそのまま引き継げます。

---

## 🛠️ 技術スタック
- **Frontend**: Vanilla JS, CSS3 (Modern dark mode), HTML5 (PWA対応)
- **Libraries**: EasyMDE, marked.js, highlight.js
- **Backend**: Google Apps Script (GAS)
- **Storage**: Google Drive (JSON format)

---

## 📚 ライセンス
MIT License

---
**Developed with Antigravity (Advanced Agentic AI)**
