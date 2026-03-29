import re

# PHI detection patterns
PATIENT_ID_PATTERN = r"\b\d{6,8}\b"  # 6-8 digit numbers
DATE_BIRTH_PATTERN = r"\b\d{4}/\d{1,2}/\d{1,2}\b" # YYYY/MM/DD
NAME_PATTERN = r"(?P<name>[A-Z][a-z]+ [A-Z][a-z]+)" # English Name style

def check_phi(text):
    """
    Checks the input text for potential PHI (Protected Health Information).
    Returns a list of warnings if found.
    """
    warnings = []
    
    # Check for digit patterns (Patient ID)
    if re.search(PATIENT_ID_PATTERN, text):
        warnings.append("患者IDと思われる数字が見つかりました。")
        
    # Check for dates (potentially Birthday)
    if re.search(DATE_BIRTH_PATTERN, text):
        warnings.append("日付（生年月日など）が含まれている可能性があります。")
        
    return warnings

# Constants for Journal Snippets
SNIPPETS = [
    "始業前点検完了。異常なし。",
    "Isocenter Check OK.",
    "線量校正不確かさ範囲内を確認。",
    "治療計画承認完了。",
    "患者QA実施、Pass率100% (3%/3mm)。",
    "カンファレンスにて症例検討実施。"
]

# Constants for Dropdowns
CATEGORIES = ["QA", "Treatment Planning", "Commissioning", "Research", "Meeting", "Other"]
PRIORITIES = ["High", "Medium", "Low"]
STATUSES = ["TODO", "DOING", "DONE"]

def auto_backup():
    """Wrapper for database backup."""
    try:
        from database import backup_db
        backup_db()
        return True
    except Exception as e:
        print(f"Backup failed: {e}")
        return False

# Theme definitions for Dark Mode
THEMES = {
    "light": {
        "bg": "#FFFFFF",
        "fg": "#000000",
        "button_bg": "#E0E0E0",
        "button_fg": "#000000",
        "entry_bg": "#FFFFFF",
        "entry_fg": "#000000",
        "listbox_bg": "#FFFFFF",
        "listbox_fg": "#000000",
        "text_bg": "#FFFFFF",
        "text_fg": "#000000",
        "frame_bg": "#F0F0F0"
    },
    "dark": {
        "bg": "#2B2B2B",
        "fg": "#FFFFFF",
        "button_bg": "#3C3F41",
        "button_fg": "#FFFFFF",
        "entry_bg": "#3C3F41",
        "entry_fg": "#FFFFFF",
        "listbox_bg": "#3C3F41",
        "listbox_fg": "#FFFFFF",
        "text_bg": "#2B2B2B",
        "text_fg": "#FFFFFF",
        "frame_bg": "#2B2B2B"
    }
}

def get_current_theme():
    """現在のテーマを取得（config.jsonから読み込み）"""
    import json
    import os
    
    config_file = "config.json"
    if os.path.exists(config_file):
        try:
            with open(config_file, 'r', encoding='utf-8') as f:
                config = json.load(f)
                return config.get("theme", "light")
        except Exception:
            pass
    return "light"

def save_theme(theme_name):
    """テーマ設定をconfig.jsonに保存"""
    import json
    import os
    
    config_file = "config.json"
    config = {}
    
    if os.path.exists(config_file):
        try:
            with open(config_file, 'r', encoding='utf-8') as f:
                config = json.load(f)
        except Exception:
            pass
    
    config["theme"] = theme_name
    
    try:
        with open(config_file, 'w', encoding='utf-8') as f:
            json.dump(config, f, indent=4, ensure_ascii=False)
        return True
    except Exception as e:
        print(f"Failed to save theme: {e}")
        return False
