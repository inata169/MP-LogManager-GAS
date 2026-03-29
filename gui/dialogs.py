import customtkinter as ctk
from datetime import date
from utils import CATEGORIES, PRIORITIES
from models import TemplateManager

class TaskDialog(ctk.CTkToplevel):
    def __init__(self, parent, callback, task=None):
        super().__init__(parent)
        self.callback = callback
        self.task = task
        self.template_manager = TemplateManager()
        
        self.title("Edit Task" if task else "Add New Task")
        self.geometry("400x550")
        
        # Make modal
        self.transient(parent)
        self.grab_set()
        
        self.grid_columnconfigure(0, weight=1)
        
        self.label = ctk.CTkLabel(self, text="Edit Task" if task else "New Task", font=ctk.CTkFont(size=20, weight="bold"))
        self.label.grid(row=0, column=0, pady=10)
        
        self.is_preview_mode = False
        
        # Template Selection (Only for new tasks)
        if not task:
            templates = self.template_manager.get_all_templates()
            template_names = [t["name"] for t in templates]
            self.template_var = ctk.StringVar(value="Select Template...")
            self.template_opt = ctk.CTkComboBox(self, values=template_names, variable=self.template_var, command=self.apply_template)
            self.template_opt.grid(row=1, column=0, padx=20, pady=(0, 10), sticky="ew")
        
        row_offset = 2 if not task else 1

        # Title
        self.title_entry = ctk.CTkEntry(self, placeholder_text="Task Title")
        if task: self.title_entry.insert(0, task['title'])
        self.title_entry.grid(row=row_offset, column=0, padx=20, pady=10, sticky="ew")
        
        # Category
        self.category_var = ctk.StringVar(value=task['category'] if task else CATEGORIES[0])
        self.category_opt = ctk.CTkComboBox(self, values=CATEGORIES, variable=self.category_var)
        self.category_opt.grid(row=row_offset + 1, column=0, padx=20, pady=10, sticky="ew")
        
        # Priority
        self.priority_var = ctk.StringVar(value=task['priority'] if task else PRIORITIES[1]) # Medium default
        self.priority_opt = ctk.CTkComboBox(self, values=PRIORITIES, variable=self.priority_var)
        self.priority_opt.grid(row=row_offset + 2, column=0, padx=20, pady=10, sticky="ew")
        
        # Due Date
        self.date_entry = ctk.CTkEntry(self, placeholder_text="YYYY-MM-DD")
        self.date_entry.insert(0, task['due_date'] if task and task['due_date'] else str(date.today()))
        self.date_entry.grid(row=row_offset + 3, column=0, padx=20, pady=10, sticky="ew")
        
        # Details Area Header (Label + Toggle)
        self.details_header_frame = ctk.CTkFrame(self, fg_color="transparent")
        self.details_header_frame.grid(row=row_offset + 4, column=0, padx=20, pady=(10, 0), sticky="ew")
        
        ctk.CTkLabel(self.details_header_frame, text="Details (Markdown supported):").pack(side="left")
        
        self.preview_btn = ctk.CTkButton(self.details_header_frame, text="👁 Preview", width=80, 
                                         fg_color="#3B8ED0", hover_color="#2C6C9E",
                                         command=self.toggle_preview)
        self.preview_btn.pack(side="right")

        # Details Content Frame
        self.details_content_frame = ctk.CTkFrame(self, fg_color="transparent")
        self.details_content_frame.grid(row=row_offset + 5, column=0, padx=20, pady=(5, 10), sticky="nsew")
        self.details_content_frame.grid_rowconfigure(0, weight=1)
        self.details_content_frame.grid_columnconfigure(0, weight=1)

        # Details Textbox
        self.details_box = ctk.CTkTextbox(self.details_content_frame, height=100)
        if task and task['details']: self.details_box.insert("1.0", task['details'])
        self.details_box.grid(row=0, column=0, sticky="nsew")
        
        # HTML Preview Label
        try:
            from tkinterweb import HtmlFrame
            self.preview_label = HtmlFrame(self.details_content_frame, messages_enabled=False)
        except ImportError:
            import tkinter as tk
            self.preview_label = tk.Label(self.details_content_frame, text="tkinterweb missing.")

        # Save Button
        self.save_btn = ctk.CTkButton(self, text="Save Task", command=self.save_task)
        self.save_btn.grid(row=row_offset + 6, column=0, padx=20, pady=20)
        
    def apply_template(self, choice):
        template = self.template_manager.get_template_by_name(choice)
        if template:
            # Update fields
            self.title_entry.delete(0, "end")
            self.title_entry.insert(0, template["title"])
            self.category_var.set(template["category"])
            self.priority_var.set(template["priority"])
            self.details_box.delete("1.0", "end")
            self.details_box.insert("1.0", template["details"])
            if self.is_preview_mode:
                self.update_preview_content()

    def toggle_preview(self):
        self.is_preview_mode = not self.is_preview_mode
        if self.is_preview_mode:
            self.preview_btn.configure(text="✏️ Edit", fg_color="#E38D13", hover_color="#C87A0C")
            self.details_box.grid_remove()
            self.preview_label.grid(row=0, column=0, sticky="nsew")
            self.update_preview_content()
        else:
            self.preview_btn.configure(text="👁 Preview", fg_color="#3B8ED0", hover_color="#2C6C9E")
            self.preview_label.grid_remove()
            self.details_box.grid(row=0, column=0, sticky="nsew")

    def update_preview_content(self):
        content = self.details_box.get("1.0", "end-1c")
        try:
            import markdown
            import re
            content = re.sub(r'\n+(?=(<br>.*?) \|)', '', content)
            html = markdown.markdown(content, extensions=['tables', 'nl2br', 'fenced_code'])
            is_dark = ctk.get_appearance_mode() == "Dark"
            text_col = "#EAEAEA" if is_dark else "#333333"
            link_col = "#3B8ED0"
            bg_col = "#2B2B2B" if is_dark else "white"
            
            styled_html = f"""
            <html>
            <head>
            <style>
                body {{ font-family: sans-serif; color: {text_col}; background-color: {bg_col}; line-height: 1.5; font-size: 12px; margin: 10px; }}
                a {{ color: {link_col}; text-decoration: none; }}
                table {{ border-collapse: collapse; width: 100%; margin-top: 10px; margin-bottom: 10px; }}
                th, td {{ border: 1px solid #777; padding: 5px; }}
                th {{ background-color: #444; color: white; }}
                pre {{ background-color: #1A1A1A; color: white; padding: 10px; border-radius: 5px; }}
                code {{ background-color: #1A1A1A; color: white; padding: 2px 4px; border-radius: 3px; font-family: monospace; }}
            </style>
            </head>
            <body>
            {html}
            </body>
            </html>
            """
            self.preview_label.load_html(styled_html)
        except ImportError:
            pass

    def save_task(self):
        from utils import check_phi
        from tkinter import messagebox
        
        task_data = {
            "title": self.title_entry.get(),
            "category": self.category_var.get(),
            "priority": self.priority_var.get(),
            "due_date": self.date_entry.get(),
            "details": self.details_box.get("1.0", "end-1c")
        }
        
        # PHI Check
        try:
            phi_warnings = check_phi(task_data["title"] + " " + task_data["details"])
            if phi_warnings:
                confirm = messagebox.askyesno("PHI Warning", f"⚠ {phi_warnings[0]}\n\nこのまま保存しますか？")
                if not confirm:
                    return
        except Exception as e:
            print(f"PHI Check Error: {e}")

        if not task_data["title"].strip():
            messagebox.showwarning("Validation Error", "タスクのタイトルを入力してください。")
            return

        try:
            self.callback(task_data)
            self.destroy()
        except Exception as e:
            messagebox.showerror("Save Error", f"タスクの保存中にエラーが発生しました:\n{str(e)}")
            print(f"Save Task Error: {e}")
