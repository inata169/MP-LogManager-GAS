## Context
Tasks一覧は既に`marked`で詳細をMarkdown表示しているが、編集モーダルはプレーンな`textarea`だけである。また、現在の`renderMarkdown()`は`marked.parse()`の結果を直接`innerHTML`へ渡しており、新しいプレビュー面を追加すると既存の未サニタイズ経路も増える。

## Goals / Non-Goals
- Goals:
  - iPhoneでも詳細を広く編集し、保存前にMarkdown表示を確認できる。
  - 一覧とプレビューで同じ、安全なMarkdown描画関数を使う。
  - 既存のTasks JSON形式を維持する。
- Non-Goals:
  - WYSIWYG編集への置き換え。
  - Tasksデータ形式やGAS APIの変更。
  - Journal用EasyMDEの再利用。

## Decisions
- Decision: モバイルは「編集」「プレビュー」のタブ切り替えとする。
  - 狭い画面で左右分割すると双方が読みにくくなるため、常に一方を横幅いっぱいに表示する。
- Decision: `textarea`を入力元とし、プレビューは入力値から都度生成する。
  - 保存対象は常に生のMarkdown文字列とし、HTMLは保存しない。
- Decision: `marked`の出力を固定バージョンのDOMPurifyでサニタイズしてからDOMへ挿入する。
  - `marked`自身はHTMLをサニタイズしないため、一覧を含む共通描画関数で一度だけ安全性を担保する。
- Decision: TasksにはEasyMDEを導入しない。
  - Journal向けCodeMirrorの高さ・モバイル選択処理と干渉させず、依存と初期化処理を小さく保つ。

## Risks / Trade-offs
- DOMPurifyを追加すると配布物が増える。
  - 固定バージョンを使い、Service Workerのキャッシュ更新と合わせて検証する。
- 入力のたびにMarkdownを再描画すると長文で負荷が出る可能性がある。
  - プレビュー表示中のみ、短いdebounceを付けて更新する。
- サニタイズにより危険な生HTML表現は削除される。
  - Markdown標準の見出し・リスト・表・コード・リンクを受け入れ基準にする。

## Migration Plan
1. DOMPurifyを固定バージョンで読み込む。
2. 共通Markdown描画関数をサニタイズ対応にする。
3. Tasks編集モーダルへタブとプレビュー面を追加する。
4. Service Workerのキャッシュ名とローカル資産バージョンを更新する。
5. 既存Tasksデータを使って表示・保存の無変換を確認する。

## Open Questions
- なし。
