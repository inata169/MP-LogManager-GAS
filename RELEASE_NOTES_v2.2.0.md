# MP-LogManager v2.2.0 (GAS Edition) Release Notes

## 🎉 新機能: Google 同期機能の実装

このアップデートでは、長距離同期の第一弾として、Google カレンダーと Google Tasks (Todo) との自動同期機能を実装しました！

### ✨ 主な変更点
- **Google Calendar 同期**: タスクに期限（due_date）を設定すると、自分の Google カレンダーのデフォルトカレンダーに終日予定として自動的に登録されます。
- **Google Tasks 同期**: 全タスクが Google Todo の専用リスト (MP-LogManager) に自動的に作成・更新されます。
- **個別設定**: 同期の ON/OFF は、アプリ内の設定(⚙️)からカレンダー/Tasks ごとに個別に設定可能です。
- **ドキュメントの拡充**: 初心者でも迷わず同期設定ができるよう、[Google 同期セットアップガイド](docs/GOOGLE_SYNC_SETUP.md) を新規作成しました。

### 🔧 改善と安定性
- 設定画面にトグリスイッチを採用し、直感的な UI に改善。
- GAS との連携エラー時のメッセージを強化。
- リリース用ドキュメント（README、マニュアル）のリンクとバージョン表記を更新。

---
**Developed with Antigravity (Advanced Agentic AI)**
