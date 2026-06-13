# journal Specification

## Purpose
Describe Journal entry editing behavior in the Web App.
## Requirements
### Requirement: Multiple Journal Entries Per Date
The Web App SHALL support multiple journal entries for the same date, each with its own entry identity and title.

#### Scenario: Creating another entry on a date
- **WHEN** the user creates a new Journal entry while a date already has entries
- **THEN** the app creates a separate entry for the selected date instead of replacing the existing entries.

#### Scenario: Editing a selected entry
- **WHEN** the user selects an existing Journal entry
- **THEN** the app loads that entry by its ID and allows updating its title and content without changing other entries for the same date.

#### Scenario: Persisting entry metadata
- **WHEN** a new Journal entry is saved
- **THEN** the saved entry includes an ID, date, title, content, and created_at timestamp.

### Requirement: Journal Rich Editor
The Web App SHALL provide a WYSIWYG rich text editor for writing journal entries with integrated Markdown support.

#### Scenario: Mobile Usage (iPhone)
- **WHEN** opening a journal entry on a mobile device
- **THEN** the editor toolbar is responsive and fully functioning without horizontal overflow

#### Scenario: Split View on Desktop
- **WHEN** using a larger screen (PC)
- **THEN** the editor supports a side-by-side split view mode for real-time previewing
