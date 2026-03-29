# 日次サマリー - 2026-03-30
## 🚀 Google Drive + GAS 連携への移行と履歴のクリーンアップ
個人データの流出リスクを完全に排除するため、GitHub API に依存しない Google Drive + Google Apps Script (GAS) 連携構成への抜本的な移行を実施しました。
### 実装・対応内容
- **独立したクリーンリポジトリの作成**:
  - MP-LogManager-GAS を新規作成。Git履歴を完全にリセットし、過去の機密データを完全に抹消。
- **Google Apps Script (GAS) API の構築**:
  - Google Drive 上の JSON ファイルを操作する doGet / doPost エンドポイントを実装。
- **Web App フロントエンドの改修**:
  - データの取得・保存先を GAS API へ切り替え。設定画面に「GAS Web App URL」入力を追加。
  - **[最終修正]** ブラウザの強力なキャッシュを回避するため、fetch URLにタイムスタンプ (\	=\\) を付与。
  - **[最終修正]** sw.js の CACHE_NAME を更新し、古い PWA キャッシュを強制破棄。
- **公開と整備**:
  - GitHub Pages でデプロイし、README を GAS 連携仕様に刷新。
---
