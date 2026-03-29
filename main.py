import customtkinter as ctk
from database import init_db, backup_db
from gui.app import App

# ==========================================
# Global patch to suppress tkinterweb string widget scroll event errors
import tkinter as tk

_orig_report = tk.Tk.report_callback_exception
def _patched_report(self, exc, val, tb):
    err_str = str(val)
    if issubclass(exc, AttributeError) and "'str' object has no attribute" in err_str and ("'winfo_containing'" in err_str or "'master'" in err_str):
        # Swallow crash caused by tkinterweb injecting a string as the event.widget 
        return
    _orig_report(self, exc, val, tb)
tk.Tk.report_callback_exception = _patched_report
# ==========================================

def main():
    # 1. Initialize Database
    print("Initializing Database...")
    init_db()
    
    # 2. Create Backup
    print("Creating Backup...")
    backup_db()
    
    # 3. Check Upcoming Tasks & Send Notifications
    print("Checking upcoming tasks...")
    from models import TaskManager
    from notifications import NotificationManager
    
    task_manager = TaskManager()
    notifier = NotificationManager()
    
    # ウェルカム通知
    notifier.notify_startup()
    
    # 期限切れ間近タスク通知
    upcoming_tasks = task_manager.get_upcoming_tasks(days_ahead=1)
    if upcoming_tasks:
        notifier.notify_upcoming_tasks(upcoming_tasks)
    
    print("System verified. Launching GUI...")
    
    # 4. Launch GUI
    app = App()
    app.mainloop()

if __name__ == "__main__":
    main()
