# Change: Tasks編集画面にMarkdownプレビューを追加

## Why
Tasksの詳細欄は長文のMarkdownを入力できる一方、編集画面では常にプレーンテキストとして表示されるため、見出し・箇条書き・コード・表の構造を確認しにくい。特にiPhoneでは編集幅が限られるため、入力と読みやすい表示を簡単に切り替えられる必要がある。

## What Changes
- Tasks編集モーダルの詳細欄に「編集」「プレビュー」の切り替えを追加する。
- プレビューは既存のMarkdown描画を再利用し、入力中の内容を保存前に確認できるようにする。
- Markdownから生成したHTMLをサニタイズし、一覧表示と編集プレビューの双方で安全な共通描画経路を使う。
- iPhoneでは編集とプレビューを1画面ずつ表示し、狭い横幅を有効に使う。
- 保存するデータ形式は変更せず、元のMarkdown文字列をそのまま保持する。

## Impact
- Affected specs: `mobile-task-ux`
- Affected code: `web/index.html`, `web/js/tasks.js`, `web/css/style.css`, `web/sw.js`, `web/vendor/dompurify/*`
- New dependency: 固定バージョンのDOMPurify（PWAで利用できる形で配布）
- Data migration: なし
