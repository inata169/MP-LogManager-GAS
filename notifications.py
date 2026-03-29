"""
MP-LogManager Notification Module
都会的なデザインのデスクトップ通知システム
"""

from plyer import notification
from datetime import date


class NotificationManager:
    """デスクトップ通知マネージャー"""
    
    def __init__(self):
        self.app_name = "MP-LogManager"
        
    def notify_upcoming_tasks(self, tasks):
        """期限切れ間近タスクの通知"""
        if not tasks:
            return
        
        today = date.today()
        today_str = str(today)
        
        # 今日が期限のタスク
        today_tasks = [t for t in tasks if t.get('due_date') == today_str]
        # 明日が期限のタスク
        tomorrow_tasks = [t for t in tasks if t.get('due_date') != today_str]
        
        # 通知メッセージ構築
        if today_tasks:
            self._send_notification(
                title="⚠️ 今日が期限のタスクがあります",
                message=self._format_task_list(today_tasks),
                timeout=10
            )
        
        if tomorrow_tasks:
            self._send_notification(
                title="📅 明日が期限のタスクがあります",
                message=self._format_task_list(tomorrow_tasks),
                timeout=8
            )
    
    def _format_task_list(self, tasks):
        """タスクリストを都会的なフォーマットで整形"""
        if len(tasks) == 1:
            task = tasks[0]
            priority_icon = self._get_priority_icon(task.get('priority', 'Medium'))
            return f"{priority_icon} {task.get('title', 'Untitled')}"
        else:
            # 複数タスクの場合は件数のみ表示
            high_count = sum(1 for t in tasks if t.get('priority') == 'High')
            if high_count > 0:
                return f"{len(tasks)}件のタスク（うち優先度高: {high_count}件）"
            else:
                return f"{len(tasks)}件のタスク"
    
    def _get_priority_icon(self, priority):
        """優先度に応じたアイコン"""
        icons = {
            'High': '🔴',
            'Medium': '🟡',
            'Low': '🟢'
        }
        return icons.get(priority, '⚪')
    
    def _send_notification(self, title, message, timeout=5):
        """通知送信（都会的なスタイル）"""
        try:
            notification.notify(
                title=title,
                message=message,
                app_name=self.app_name,
                timeout=timeout
            )
        except Exception as e:
            print(f"通知エラー: {e}")
    
    def notify_startup(self):
        """起動時のウェルカム通知"""
        self._send_notification(
            title="✨ MP-LogManager",
            message="システムが起動しました",
            timeout=3
        )
