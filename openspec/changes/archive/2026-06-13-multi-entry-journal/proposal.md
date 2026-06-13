# Proposal: Multi-Entry Journal Support

## Background
Users expressed a need to create multiple journal entries per day (e.g., separate notes for specific meetings, ideas, or daily reports) rather than being limited to a single daily file. Additionally, the task sync feedback was insufficient.

## Objective
Update the data model and UI to support multiple journal entries per date, each with a title.

## Scope
- **Database**: Migrate `journals` table to remove UNIQUE constraint on date and add `title` and `created_at`.
- **UI**: redesign `JournalFrame` to include a sidebar list of entries and a main editor area.
- **Logic**: Update `JournalManager` to handle CRUD operations for multiple entries.
