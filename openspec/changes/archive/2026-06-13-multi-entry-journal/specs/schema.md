# Schema Change: Journals

## Old Schema
```sql
CREATE TABLE journals (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    date TEXT UNIQUE, -- One per day
    content TEXT,
    remarks TEXT
)
```

## New Schema (v2.0)
```sql
CREATE TABLE journals (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    date TEXT, -- Not unique
    title TEXT DEFAULT 'Daily Log', -- New
    content TEXT,
    created_at TEXT -- New
)
```

## Migration Strategy
1. Rename `journals` to `journals_old`.
2. Create new `journals` table.
3. Insert data from `journals_old`:
   ```sql
   INSERT INTO journals (date, content) SELECT date, content FROM journals_old
   ```
4. Drop `journals_old`.
