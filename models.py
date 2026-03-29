from database import get_db_connection

class TaskManager:
    def get_tasks(self):
        conn = get_db_connection()
        tasks = conn.execute('SELECT * FROM tasks').fetchall()
        conn.close()
        return [dict(task) for task in tasks]

    def get_completed_today(self, date_str):
        conn = get_db_connection()
        # Find tasks completed on the given date (simple text match for YYYY-MM-DD in ISO timestamp)
        # completed_at format is expected to be YYYY-MM-DD ...
        # Or I can just check if completed_at starts with date_str
        query = f"SELECT * FROM tasks WHERE status = 'DONE' AND completed_at LIKE '{date_str}%'"
        tasks = conn.execute(query).fetchall()
        conn.close()
        return [dict(task) for task in tasks]

    def add_task(self, title, category, priority, due_date, details):
        conn = get_db_connection()
        conn.execute('INSERT INTO tasks (title, category, priority, due_date, details) VALUES (?, ?, ?, ?, ?)',
                     (title, category, priority, due_date, details))
        conn.commit()
        conn.close()

    def update_status(self, task_id, status):
        conn = get_db_connection()
        if status == 'DONE':
            from datetime import datetime
            completed_at = str(datetime.now())
            conn.execute('UPDATE tasks SET status = ?, completed_at = ? WHERE id = ?', (status, completed_at, task_id))
        else:
            conn.execute('UPDATE tasks SET status = ?, completed_at = NULL WHERE id = ?', (status, task_id))
        conn.commit()
        conn.close()

    def update_task_details(self, task_id, title, category, priority, due_date, details):
        conn = get_db_connection()
        conn.execute('''
            UPDATE tasks 
            SET title = ?, category = ?, priority = ?, due_date = ?, details = ?
            WHERE id = ?
        ''', (title, category, priority, due_date, details, task_id))
        conn.commit()
        conn.close()

    def delete_task(self, task_id):
        conn = get_db_connection()
        conn.execute('DELETE FROM tasks WHERE id = ?', (task_id,))
        conn.commit()
        conn.close()

    def delete_tasks(self, task_ids):
        if not task_ids: return
        conn = get_db_connection()
        placeholders = ','.join('?' * len(task_ids))
        conn.execute(f'DELETE FROM tasks WHERE id IN ({placeholders})', task_ids)
        conn.commit()
        conn.close()

    def get_stats(self):
        conn = get_db_connection()
        total = conn.execute('SELECT COUNT(*) FROM tasks').fetchone()[0]
        completed = conn.execute('SELECT COUNT(*) FROM tasks WHERE status = "DONE"').fetchone()[0]
        category_counts = conn.execute('SELECT category, COUNT(*) FROM tasks GROUP BY category').fetchall()
        conn.close()
        return {
            "total": total,
            "completed": completed,
            "categories": {row[0]: row[1] for row in category_counts}
        }

    def get_weekly_stats(self):
        conn = get_db_connection()
        from datetime import date, timedelta
        today = date.today()
        stats = {}
        # Last 7 days including today
        for i in range(6, -1, -1):
            day = today - timedelta(days=i)
            day_str = str(day)
            count = conn.execute("SELECT COUNT(*) FROM tasks WHERE status = 'DONE' AND completed_at LIKE ?", (f"{day_str}%",)).fetchone()[0]
            stats[day_str] = count
        conn.close()
        return stats

    def get_upcoming_tasks(self, days_ahead=1):
        """期限が近いタスクを取得（デフォルト: 今日と明日）"""
        conn = get_db_connection()
        from datetime import date, timedelta
        today = date.today()
        upcoming = []
        
        for i in range(days_ahead + 1):
            target_date = today + timedelta(days=i)
            date_str = str(target_date)
            tasks = conn.execute(
                "SELECT * FROM tasks WHERE status != 'DONE' AND due_date = ?", 
                (date_str,)
            ).fetchall()
            upcoming.extend([dict(task) for task in tasks])
        
        conn.close()
        return upcoming

    def get_monthly_stats(self, year, month):
        """指定月の統計を取得"""
        conn = get_db_connection()
        from calendar import monthrange
        
        # 月の最初と最後の日を計算
        _, last_day = monthrange(year, month)
        start_date = f"{year}-{month:02d}-01"
        end_date = f"{year}-{month:02d}-{last_day}"
        
        # 日別の完了タスク数
        daily_stats = {}
        for day in range(1, last_day + 1):
            day_str = f"{year}-{month:02d}-{day:02d}"
            count = conn.execute(
                "SELECT COUNT(*) FROM tasks WHERE status = 'DONE' AND completed_at LIKE ?",
                (f"{day_str}%",)
            ).fetchone()[0]
            daily_stats[day_str] = count
        
        # カテゴリ別集計
        category_stats = conn.execute(
            """SELECT category, COUNT(*) FROM tasks 
               WHERE status = 'DONE' AND completed_at BETWEEN ? AND ?
               GROUP BY category""",
            (start_date, f"{end_date} 23:59:59")
        ).fetchall()
        
        conn.close()
        
        return {
            "daily": daily_stats,
            "categories": {row[0]: row[1] for row in category_stats},
            "total": sum(daily_stats.values())
        }

class JournalManager:
    def get_entries(self, date_str):
        conn = get_db_connection()
        entries = conn.execute('SELECT * FROM journals WHERE date = ? ORDER BY id', (date_str,)).fetchall()
        conn.close()
        return [dict(e) for e in entries]

    def add_entry(self, date_str, title, content):
        conn = get_db_connection()
        from datetime import datetime
        created_at = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        conn.execute('INSERT INTO journals (date, title, content, created_at) VALUES (?, ?, ?, ?)', 
                     (date_str, title, content, created_at))
        conn.commit()
        conn.close()

    def update_entry(self, entry_id, title, content):
        conn = get_db_connection()
        conn.execute('UPDATE journals SET title = ?, content = ? WHERE id = ?', (title, content, entry_id))
        conn.commit()
        conn.close()

    def delete_entry(self, entry_id):
        conn = get_db_connection()
        conn.execute('DELETE FROM journals WHERE id = ?', (entry_id,))
        conn.commit()
        conn.close()

class TemplateManager:
    def __init__(self):
        # Default templates for Medical Physicists
        self.templates = [
            {
                "name": "Custom",
                "title": "",
                "category": "Other",
                "priority": "Medium",
                "details": ""
            },
            {
                "name": "毎朝QA (Morning QA)",
                "title": "Morning QA",
                "category": "QA/Maint",
                "priority": "High",
                "details": "Daily output check and safety interlock test."
            },
            {
                "name": "週次QA (Weekly QA)",
                "title": "Weekly QA",
                "category": "QA/Maint",
                "priority": "Medium",
                "details": "Wedge factor and mechanical checks."
            },
            {
                "name": "月次QA (Monthly QA)",
                "title": "Monthly QA",
                "category": "QA/Maint",
                "priority": "Medium",
                "details": "Full dosimetry and imaging quality check."
            },
            {
                "name": "治療計画 (Treatment Planning)",
                "title": "Plan Review: [Patient ID]",
                "category": "Planning",
                "priority": "Medium",
                "details": "Review DVH and dose distribution."
            }
        ]

    def get_all_templates(self):
        return self.templates

    def get_template_by_name(self, name):
        for t in self.templates:
            if t["name"] == name:
                return t
        return None
