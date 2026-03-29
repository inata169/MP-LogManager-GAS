# Change: Automated Mobile Sync & Encoding Fix

## Why
iPhone (Web App) と PC (Desktop App) の間でデータを同期する際、手動で `sync_json.py` を実行する必要があり手間がかかっていた。また、Windows環境における日本語文字化け（Mojibake）が iPhone 側で発生しており、信頼性に欠けていた。

## What Changes
- `Run_LogManager.bat` の改良による同期の自動化（起動時・終了時）。
- `sync_json.py` の機能拡張（CLIフラグ、内部ロギング、UTF-8強制）。
- `.gitattributes` による JSON ファイルのバイナリ扱い設定（Git変換防止）。
- Web App (`app.js`) の UTF-8 デコード処理の堅牢化。

## Impact
- Affected code: `Run_LogManager.bat`, `sync_json.py`, `web/js/app.js`, `.gitattributes`
- User experience: PCを通常通り使っているだけで自動的にiPhoneと同期されるようになる。
