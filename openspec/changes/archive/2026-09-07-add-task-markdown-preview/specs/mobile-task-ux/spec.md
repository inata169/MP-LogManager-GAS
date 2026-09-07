## ADDED Requirements

### Requirement: Task Markdown Preview
The Web App SHALL let users preview a task's Markdown-formatted details before saving while preserving the original Markdown source.

#### Scenario: Preview an edited task
- **WHEN** a user enters Markdown in the task details field and selects the preview tab
- **THEN** the system displays the current details as rendered Markdown without saving the task

#### Scenario: Return to editing
- **WHEN** a user returns from the preview tab to the edit tab
- **THEN** the details field contains the exact Markdown source that was present before previewing

#### Scenario: Preserve Markdown on save
- **WHEN** a user saves a task after previewing its details
- **THEN** the system stores the original Markdown source rather than the rendered HTML

### Requirement: Safe Task Markdown Rendering
The Web App MUST sanitize generated Markdown HTML before inserting it into the task list or task editor preview.

#### Scenario: Render common Markdown
- **WHEN** task details contain headings, lists, checklists, tables, code blocks, or links
- **THEN** the system renders those supported Markdown structures in both the task list and preview

#### Scenario: Reject executable markup
- **WHEN** task details contain scriptable HTML, event-handler attributes, or unsafe URL schemes
- **THEN** the system removes or neutralizes the unsafe content before it reaches the live DOM

## MODIFIED Requirements

### Requirement: iPhone Task Detail Editing Space
The Web App SHALL provide enough detail-entry space for comfortable task editing and Markdown preview on iPhone-sized viewports.

#### Scenario: Editing task details on iPhone
- **WHEN** the user opens the task add/edit modal on an iPhone-sized viewport
- **THEN** the detail textarea is tall enough for multi-line entry and remains usable with the on-screen keyboard.

#### Scenario: Long task detail entry
- **WHEN** the user enters a long task detail text on an iPhone-sized viewport
- **THEN** the user can review and edit the content without the field feeling constrained to only a few visible lines.

#### Scenario: Preview on iPhone
- **WHEN** a user opens the task editor on an iPhone-sized viewport
- **THEN** the edit and preview panes are available one at a time at the full modal content width and the save controls remain reachable
