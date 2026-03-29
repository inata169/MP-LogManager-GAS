## 1. Implementation
- [x] 1.1 `index.html` に EasyMDE (または SimpleMDE フォーク) の CDN リンク (CSS/JS) を追加
- [x] 1.2 `index.html` の Write/Preview タブUI要素を削除（EasyMDE 組み込み機能に置換）
- [x] 1.3 `js/journal.js` の `DOMContentLoaded` 時等で EasyMDE を初期化し、既存の `#journal-content` に適用
- [x] 1.4 `style.css` にて、EasyMDE のデザインをアプリのテーマ変数 (`--bg-primary` 等) やダークモードに合わせて上書き
- [x] 1.5 保存・読込、エディタクリア、新規エントリ作成時の JavaScript ロジックを EasyMDE の API (`easyMDE.value()` など) で適切に上書きするフックを実装
- [x] 1.6 iPhoneでツールバーがはみ出さないか等のレスポンシブ対応（モバイル優先調整）
