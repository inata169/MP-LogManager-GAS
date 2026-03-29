# MP-LogManager (GAS Edition) 🚀

[![Version](https://img.shields.io/badge/version-1.5.0-orange.svg)](https://github.com/inata169/MP-LogManager-GAS)
[![Security](https://img.shields.io/badge/Data%20Privacy-High-green.svg)](https://docs.google.com/presentation/d/...)
[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)

**MP-LogManager (GAS Edition)** は、医学物理士の日常業務をスマートに管理するための、**「究極のプライバシー保護」** を備えたタスク管理・日報アプリケーションです。

---

## 🛡️ 本バージョンの最大の特徴
従来のバージョンとは異なり、**個人のタスクや日報データが GitHub 上に一切保存されません。**

- **データ保存先**: あなたの個人の **Google Drive**
- **通信ゲートウェイ**: **Google Apps Script (GAS)** を独自のAPIとして使用
- **GitHub の役割**: プログラム（Web UI/ロジック）の配信のみ

これにより、GitHub リポジトリを Public（公開）設定にして GitHub Pages（iPhone対応）を利用しながらも、**中身のデータは自分だけがアクセスできる安全な場所にある**という、利便性とセキュリティを両立した環境を実現しています。

---

## ✨ 主な機能

### 📓 Journal (日報・メモ)
- **Rich Editor**: Markdown、シンタックスハイライト、オートセーブ完結。
- **Secure Storage**: 日々の記録はすべて Google Drive 上の JSON ファイルに保存。
- **PDF出力**: iPhone の AirPrint や PC での PDF 保存に最適化した整形機能。

### ✅ Tasks (タスク管理)
- **Flexible Management**: カテゴリ、優先度によるタスク管理。
- **Advanced Sorting**: 期限、作成日によるソートの保存。
- **Real-time Search**: 全タスクをインクリメンタル検索。

---

## 🔧 セットアップ手順（自分専用の構築）

1. **Google Drive 側の準備**
   - Drive 上に `journals.json` と `tasks.json` を作成。
   - Google Apps Script (GAS) を作成し、専用のコードをデプロイして「ウェブアプリ URL」を取得。

2. **Web App への設定**
   - 発行された **GitHub Pages URL**（例: `https://inata169.github.io/MP-LogManager-GAS/web/`）にアクセス。
   - 右上の設定(⚙️)ボタンから、自分専用の **GAS Web App URL** を入力して保存。

3. **データの復元（移行）**
   - 既存のデータがある場合は、Google Drive 上の JSON ファイルに中身をコピーすることでそのまま引き継げます。

---

## 🛠️ 技術スタック
- **Frontend**: Vanilla JS, CSS3 (Modern dark mode), HTML5
- **Libraries**: EasyMDE, marked.js, highlight.js
- **Backend**: Google Apps Script (GAS)
- **Storage**: Google Drive (JSON format)

---

## 📚 ライセンス
MIT License

---
**Developed with Antigravity (Advanced Agentic AI)**
