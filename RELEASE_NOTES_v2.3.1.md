# Release Notes v2.3.1

## 概要
v2.3.1 では、Journal / Tasks の高密度レスポンシブレイアウトを整え、PC ブラウザと iPhone ブラウザ/PWA の両方で画面内に表示できる情報量を増やしました。

## 主な変更
- **PC 横幅の活用**
  - `#app-main` の 800px 幅制限を 1024px 以上で解除し、最大 1480px まで広がるようにしました。
  - Journal エディタと Tasks 一覧がワイド画面を活用できます。
- **Tasks 画面の高密度化**
  - PC ではタスクカードを2〜3カラム表示にしました。
  - iPhone では検索/フィルタ、カード余白、バッジ、詳細プレビューを圧縮しました。
- **Journal 画面の高密度化**
  - iPhone ではヘッダー、検索、一覧、EasyMDE 周辺の余白を削減しました。
  - モバイル編集中は `List` / `Edit` で一覧と編集領域を切り替えられます。
- **README 更新**
  - v2.3.1 の iPhone 版 Journal / Tasks スクリーンショットを追加しました。
  - README 上でスクリーンショットを横並び表示にしました。
- **キャッシュ更新**
  - CSS/JS クエリと Service Worker キャッシュ名を `v2.3.1` に更新しました。

## 検証
- `node --check web/js/journal.js`
- `node --check web/js/tasks.js`
- `openspec.cmd validate add-compact-responsive-layout --strict --no-interactive`
- GitHub Pages 公開 HTML/CSS の `v=2.3.1` 反映確認
- PC 最大幅、iPhone 幅でのユーザー確認

## 注意
古い PWA キャッシュが残る場合は、ブラウザの Cache Storage / Service Worker を削除するか、`?v=2.3.1` を付けて再読み込みしてください。
