# Change: Add Task Templates

## Why
医学物理士の日常業務には「毎朝のQAセット」などの繰り返しのタスクが多く含まれます。これらをテンプレート化することで、入力の手間を省き、入力ミスを防止します。

## What Changes
- `TaskDialog` にテンプレート選択用の UI（ComboBox）を追加
- `TemplateManager` を新設し、テンプレートデータの管理（読込・取得）を担当
- デフォルトのルーチンタスク（テンプレート）を用意
- テンプレート選択時に、ダイアログの各フィールド（タイトル、カテゴリ、詳細など）を自動補完

## Impact
- Affected specs: `task-management`
- Affected code: `models.py`, `gui/dialogs.py`
