# Change: Journal Rich Editor

## Why
ブログサービス（Note等）のような直感的でリッチな編集体験を実現するため、現在のプレーンなテキストエリアをリッチエディタに置き換えます。特にiPhoneでのモバイル入力とPCでのスプリットビュー（横並びプレビュー）をサポートし、Markdownを意識せずに日報を書けるようにします。軽量なWYSIWYGライブラリである EasyMDE 等を利用するアプローチ（方式A）を採用します。

## What Changes
- Web App側の `index.html` に EasyMDE のCDN（CSS/JS）を追加。
- 既存のテキストエリア(`#journal-content`)を EasyMDE エディタでラップしてツールバーを提供。
- 現在の Write/Preview タブUIを廃止し、EasyMDE組み込みのリアルタイムビューア/スプリットビューに置き換え。
- iPhone（モバイル）向けのレスポンシブなツールバーや入力レイアウトの調整。
- 保存・読み込み時に EasyMDE API の独自値取得・設定メソッド (`easyMDE.value()`) と既存ロジックを連携。

## Impact
- Affected specs: Journal
- Affected code: `web/index.html`, `web/js/journal.js`, `web/css/style.css`
