import sqlite3
import os
from datetime import datetime

import json

DEFAULT_DB_NAME = "mp_log.db"
CONFIG_FILE = "config.json"

def get_db_path():
    """Determines the database path from config file or default."""
    if os.path.exists(CONFIG_FILE):
        try:
            with open(CONFIG_FILE, 'r', encoding='utf-8') as f:
                config = json.load(f)
                return config.get("db_path", DEFAULT_DB_NAME)
        except Exception as e:
            print(f"Error loading config: {e}")
    return DEFAULT_DB_NAME

def get_db_connection():
    """Creates and returns a connection to the SQLite database."""
    db_path = get_db_path()
    conn = sqlite3.connect(db_path)
    conn.row_factory = sqlite3.Row  # Access columns by name
    return conn

def init_db():
    """Initializes the database functionality, creating tables if they don't exist."""
    conn = get_db_connection()
    c = conn.cursor()
    
    # Tasks Table
    c.execute('''
        CREATE TABLE IF NOT EXISTS tasks (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            title TEXT NOT NULL,
            category TEXT,
            priority TEXT,
            status TEXT DEFAULT 'TODO',
            due_date TEXT,
            details TEXT,
            created_at TEXT,
            completed_at TEXT
        )
    ''')
    
    # Journals Table (New Schema)
    # Check if table needs migration (i.e., missing title column)
    c.execute("PRAGMA table_info(journals)")
    columns = [info[1] for info in c.fetchall()]
    
    if 'journals' in [t[0] for t in conn.execute("SELECT name FROM sqlite_master WHERE type='table'").fetchall()]:
        if 'title' not in columns:
            print("Migrating journals table...")
            c.execute("ALTER TABLE journals RENAME TO journals_old")
            c.execute('''
                CREATE TABLE journals (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    date TEXT,
                    title TEXT DEFAULT 'Daily Log',
                    content TEXT,
                    created_at TEXT
                )
            ''')
            # Migrate old data
            c.execute("INSERT INTO journals (date, content) SELECT date, content FROM journals_old")
            c.execute("DROP TABLE journals_old")
            print("Migration complete.")
    
    # Create plain if not exists (New Schema)
    c.execute('''
        CREATE TABLE IF NOT EXISTS journals (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            date TEXT,
            title TEXT DEFAULT 'Daily Log',
            content TEXT,
            created_at TEXT
        )
    ''')
    
    conn.commit()
    conn.close()

def backup_db():
    """Creates a backup of the database file."""
    db_path = get_db_path()
    
    if not os.path.exists(db_path):
        return
    
    backup_dir = "backups"
    if not os.path.exists(backup_dir):
        os.makedirs(backup_dir)
        
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    # Backup filename includes original name to avoid confusion
    original_name = os.path.basename(db_path)
    backup_path = os.path.join(backup_dir, f"{os.path.splitext(original_name)[0]}_{timestamp}.db")
    
    import shutil
    try:
        shutil.copy2(db_path, backup_path)
        print(f"Backup created at: {backup_path}")
    except Exception as e:
        print(f"Backup failed: {e}")
