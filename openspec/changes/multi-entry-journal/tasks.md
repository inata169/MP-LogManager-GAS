# Tasks: Multi-Entry Journal

- [x] **Database Migration**: 
  - [x] Check schema version.
  - [x] Alter table to add `title` and remove unique constraint on `date` (via table recreation).
  - [x] Migrate existing data.
- [x] **Backend Logic**:
  - [x] Update `JournalManager.get_entries` to return list.
  - [x] Update `JournalManager.add_entry` to accept title.
  - [x] Update `JournalManager.update_entry` and `delete_entry`.
- [x] **UI Implementation**:
  - [x] Split `JournalFrame` into Sidebar (List) and Editor (Right).
  - [x] Add "New Entry" button.
  - [x] Connect Sync button to active entry.
  - [x] Fix Grid/Pack layout bug in Header.
