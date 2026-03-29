#!/usr/bin/env python
# -*- coding: utf-8 -*-
"""
SQLite ↔ JSON 双方向同期スクリプト (Auto-Git対応版 v1.1)
Gitコマンドのエラー詳細表示と、変更がない場合のハンドリングを強化しました。
"""

import json
import os
import subprocess
import sys
import argparse
from datetime import datetime
from database import get_db_connection

class Logger:
    def __init__(self, filename="_sync_internal_log.txt"):
        self.terminal = sys.stdout
        self.log = open(filename, "w", encoding="utf-8")
        self.encoding = "utf-8"  # Add this attribute

    def write(self, message):
        self.terminal.write(message)
        self.log.write(message)
        self.log.flush()

    def flush(self):
        self.terminal.flush()
        self.log.flush()

DATA_DIR = "data"
TASKS_JSON = os.path.join(DATA_DIR, "tasks.json")
JOURNALS_JSON = os.path.join(DATA_DIR, "journals.json")

# WindowsのGit環境対策
ENV = os.environ.copy()
ENV["LC_ALL"] = "C"
ENV["PYTHONUTF8"] = "1"

def run_git(args, error_msg="Git command failed"):
    """Gitコマンドを実行（エラー詳細はstderrに出力）"""
    try:
        result = subprocess.run(
            ["git"] + args,
            check=False,  # エラーでも例外にせず、returncodeで判定
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE,
            text=True,
            env=ENV,
            encoding='utf-8',
            errors='replace'
        )
        if result.returncode != 0:
            # 変更がない場合(commit時のexit code 1など)はエラーとみなさない場合もある
            if "nothing to commit" in result.stdout or "nothing to commit" in result.stderr:
                return "NOTHING_TO_COMMIT"
            print(f"❌ {error_msg}")
            print(f"   Command: git {' '.join(args)}")
            print(f"   Stderr: {result.stderr.strip()}")
            return None
        return result.stdout.strip()
    except Exception as e:
        print(f"❌ Execution Error: {e}")
        return None

def ensure_data_dir():
    if not os.path.exists(DATA_DIR):
        os.makedirs(DATA_DIR)

def sqlite_to_json():
    conn = get_db_connection()
    c = conn.cursor()
    
    # Tasks
    c.execute("SELECT * FROM tasks ORDER BY id")
    tasks = []
    for row in c.fetchall():
        tasks.append({
            "id": row["id"],
            "title": row["title"],
            "category": row["category"],
            "priority": row["priority"],
            "status": row["status"],
            "due_date": row["due_date"],
            "details": row["details"],
            "created_at": row["created_at"],
            "completed_at": row["completed_at"]
        })
    
    # Journals
    c.execute("SELECT * FROM journals ORDER BY date, id")
    journals = []
    for row in c.fetchall():
        journals.append({
            "id": row["id"],
            "date": row["date"],
            "title": row["title"],
            "content": row["content"],
            "created_at": row["created_at"]
        })
    
    conn.close()
    
    ensure_data_dir()
    
    try:
        with open(TASKS_JSON, 'w', encoding='utf-8') as f:
            json.dump(tasks, f, ensure_ascii=False, indent=2)
        print(f"📦 Exported {len(tasks)} tasks to JSON")
        
        with open(JOURNALS_JSON, 'w', encoding='utf-8') as f:
            json.dump(journals, f, ensure_ascii=False, indent=2)
        print(f"📦 Exported {len(journals)} journals to JSON")
    except Exception as e:
        print(f"❌ JSON Export Error: {e}")

def json_to_sqlite():
    if not os.path.exists(TASKS_JSON) or not os.path.exists(JOURNALS_JSON):
        return
    
    try:
        conn = get_db_connection()
        c = conn.cursor()
        
        # Tasks Sync
        with open(TASKS_JSON, 'r', encoding='utf-8') as f:
            tasks = json.load(f)
        
        json_task_ids = {task["id"] for task in tasks}
        c.execute("SELECT id FROM tasks")
        sqlite_task_ids = {row["id"] for row in c.fetchall()}
        
        # Add or Update
        updated = 0
        added = 0
        for task in tasks:
            if task["id"] in sqlite_task_ids:
                c.execute("""
                    UPDATE tasks SET
                        title = ?, category = ?, priority = ?, status = ?,
                        due_date = ?, details = ?, completed_at = ?
                    WHERE id = ?
                """, (
                    task["title"], task["category"], task["priority"], task["status"],
                    task["due_date"], task["details"], task["completed_at"], task["id"]
                ))
                updated += 1
            else:
                c.execute("""
                    INSERT INTO tasks (id, title, category, priority, status, due_date, details, created_at, completed_at)
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
                """, (
                    task["id"], task["title"], task["category"], task["priority"], task["status"],
                    task["due_date"], task["details"], task["created_at"], task["completed_at"]
                ))
                added += 1
        
        # Delete items from SQLite that are not in JSON
        deleted = 0
        ids_to_delete = sqlite_task_ids - json_task_ids
        if ids_to_delete:
            placeholders = ','.join('?' * len(ids_to_delete))
            c.execute(f"DELETE FROM tasks WHERE id IN ({placeholders})", list(ids_to_delete))
            deleted = len(ids_to_delete)

        # Journals Sync
        with open(JOURNALS_JSON, 'r', encoding='utf-8') as f:
            journals = json.load(f)
        
        json_journal_ids = {j["id"] for j in journals}
        c.execute("SELECT id FROM journals")
        sqlite_journal_ids = {row["id"] for row in c.fetchall()}
        
        j_updated = 0
        j_added = 0
        for journal in journals:
            if journal["id"] in sqlite_journal_ids:
                c.execute("""
                    UPDATE journals SET
                        date = ?, title = ?, content = ?
                    WHERE id = ?
                """, (journal["date"], journal["title"], journal["content"], journal["id"]))
                j_updated += 1
            else:
                c.execute("""
                    INSERT INTO journals (id, date, title, content, created_at)
                    VALUES (?, ?, ?, ?, ?)
                """, (journal["id"], journal["date"], journal["title"], journal["content"], journal["created_at"]))
                j_added += 1
        
        # Delete items from SQLite that are not in JSON
        j_deleted = 0
        j_ids_to_delete = sqlite_journal_ids - json_journal_ids
        if j_ids_to_delete:
            j_placeholders = ','.join('?' * len(j_ids_to_delete))
            c.execute(f"DELETE FROM journals WHERE id IN ({j_placeholders})", list(j_ids_to_delete))
            j_deleted = len(j_ids_to_delete)

        conn.commit()
        conn.close()
        
        print(f"📥 Imported JSON (Tasks: +{added}/~{updated}/-{deleted}, Journals: +{j_added}/~{j_updated}/-{j_deleted})")
    
    except Exception as e:
        print(f"❌ SQLite Import Error: {e}")

def main():
    # 内部ログファイルの設定
    sys.stdout = Logger("_sync_internal_log.txt")
    sys.stderr = sys.stdout

    # 明示的に標準出力をUTF-8に設定
    try:
        # sys.stdoutがLoggerの場合は、実際のterminalの方をreconfigureする
        target = sys.stdout.terminal if hasattr(sys.stdout, 'terminal') else sys.stdout
        if hasattr(target, 'reconfigure') and getattr(target, 'encoding', '') != 'utf-8':
            target.reconfigure(encoding='utf-8')
            sys.stderr.reconfigure(encoding='utf-8')
    except Exception:
        pass

    parser = argparse.ArgumentParser(description="SQLite ↔ JSON Sync with Auto-Git")
    parser.add_argument("--export", action="store_true", help="Export SQLite to JSON (Local only if no push)")
    parser.add_argument("--import", dest="import_json", action="store_true", help="Import JSON to SQLite (Local only if no pull)")
    args = parser.parse_args()

    print("=== 🔄 MP-LogManager Sync Start ===\n")
    
    # 1. Handle Manual Flags
    if args.export:
        print("🚀 Mode: Manual Export & Push")
        sqlite_to_json()
        
        print("\n⬆️  Pushing changes to GitHub...")
        run_git(["add", "data/"])
        timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        commit_res = run_git(["commit", "-m", f"Sync data (Local -> Web) [skip ci]: {timestamp}"])
        if commit_res != "NOTHING_TO_COMMIT" and commit_res is not None:
            run_git(["push", "origin", "main"])
            print("✅ Successfully pushed to GitHub!")
        else:
            print("✨ No changes to push.")
            
        print("\n=== ✅ Export Completed ===")
        return

    if args.import_json:
        print("🚀 Mode: Manual Pull & Import")
        print("⬇️  Pulling changes from GitHub...")
        pull_res = run_git(["pull", "origin", "main"])
        if pull_res is None:
            print("❌ Error: git pull failed. Aborting sync for safety.")
            return
        
        json_to_sqlite()
        print("\n=== ✅ Import Completed ===")
        return

    # 2. Standard Auto-Sync Logic (Fallback for manual execution without flags)
    print("⬇️  Pulling changes from GitHub...")
    pull_res = run_git(["pull", "origin", "main"]) 
    if pull_res is None:
        print("❌ Error: git pull failed. Aborting sync for safety.")
        return
    
    print("\n🔄 Syncing JSON to SQLite...")
    json_to_sqlite()
    
    print("\n🔄 Syncing SQLite to JSON...")
    sqlite_to_json()
    
    print("\n⬆️  Pushing changes to GitHub...")
    run_git(["add", "data/"])
    timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    commit_res = run_git(["commit", "-m", f"Sync data (Auto) [skip ci]: {timestamp}"])
    if commit_res != "NOTHING_TO_COMMIT" and commit_res is not None:
        run_git(["push", "origin", "main"])

    print("\n=== ✅ Sync Completed ===")

if __name__ == "__main__":
    main()
