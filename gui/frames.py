import customtkinter as ctk
from models import TaskManager, JournalManager
from datetime import date
import tkinter as tk
from tkinter import messagebox
from matplotlib.figure import Figure
from matplotlib.backends.backend_tkagg import FigureCanvasTkAgg
import matplotlib.pyplot as plt

class TaskFrame(ctk.CTkFrame):
    def __init__(self, master, **kwargs):
        super().__init__(master, **kwargs)
        self.grid_columnconfigure(0, weight=1)
        self.grid_rowconfigure(1, weight=1)

        # Header Frame
        self.header_frame = ctk.CTkFrame(self, fg_color="transparent")
        self.header_frame.grid(row=0, column=0, padx=20, pady=20, sticky="ew")
        
        self.label = ctk.CTkLabel(self.header_frame, text="Task List", font=ctk.CTkFont(size=20, weight="bold"))
        self.label.pack(side="left")
        
        # Search Bar
        self.search_var = ctk.StringVar()
        self.search_var.trace("w", lambda *args: self.refresh_tasks())
        self.search_entry = ctk.CTkEntry(self.header_frame, textvariable=self.search_var, placeholder_text="Search tasks...", width=150)
        self.search_entry.pack(side="right", padx=10)

        # Sort Options
        self.sort_var = ctk.StringVar(value="Priority")
        self.sort_opt = ctk.CTkComboBox(self.header_frame, values=["Priority", "Due Date", "Title"], 
                                        variable=self.sort_var, command=lambda _: self.refresh_tasks(),
                                        width=120)
        self.sort_opt.pack(side="right", padx=10)
        self.sort_label = ctk.CTkLabel(self.header_frame, text="Sort by:")
        self.sort_label.pack(side="right")
        
        # Filter Options
        self.hide_completed_var = ctk.StringVar(value="on")
        self.hide_completed_check = ctk.CTkCheckBox(self.header_frame, text="Hide Completed", 
                                                   variable=self.hide_completed_var, onvalue="on", offvalue="off",
                                                   command=self.refresh_tasks)
        self.hide_completed_check.pack(side="right", padx=20)
        
        # Export Button
        self.export_btn = ctk.CTkButton(self.header_frame, text="Export CSV", width=100, 
                                        fg_color="#4BC0C0", hover_color="#3BA0A0",
                                        command=self.export_csv)
        self.export_btn.pack(side="right", padx=10)

        # Import Button
        self.import_btn = ctk.CTkButton(self.header_frame, text="Import CSV", width=100, 
                                        fg_color="#FFB84D", hover_color="#E3A83D",
                                        command=self.import_csv)
        self.import_btn.pack(side="right", padx=10)
        
        # Print Button
        self.print_btn = ctk.CTkButton(self.header_frame, text="🖨 Print", width=100,
                                       fg_color="#9B59B6", hover_color="#8E44AD",
                                       command=self.print_tasks)
        self.print_btn.pack(side="right", padx=10)
        
        # Task List
        self.list_frame = ctk.CTkScrollableFrame(self)
        self.list_frame.grid(row=1, column=0, padx=20, pady=(0, 20), sticky="nsew")
        
        # Add Task Button
        self.add_btn = ctk.CTkButton(self, text="+ Add Task", command=self.open_add_dialog)
        self.add_btn.grid(row=2, column=0, padx=20, pady=20, sticky="e")
        
        self.task_manager = TaskManager()
        
        # Selection State
        self.selected_ids = set()
        self.last_selected_id = None
        self.row_widgets = {} # task_id -> row_frame

        self.refresh_tasks()

    def export_csv(self):
        import csv
        from tkinter import filedialog
        tasks = self.task_manager.get_tasks()
        if not tasks: return

        file_path = filedialog.asksaveasfilename(defaultextension=".csv", filetypes=[("CSV Files", "*.csv")])
        if file_path:
            with open(file_path, 'w', newline='', encoding='utf-8-sig') as f:
                writer = csv.DictWriter(f, fieldnames=tasks[0].keys())
                writer.writeheader()
                writer.writerows(tasks)
            print(f"Exported to {file_path}")

    def import_csv(self):
        import csv
        from tkinter import filedialog, messagebox
        file_path = filedialog.askopenfilename(filetypes=[("CSV Files", "*.csv")])
        if not file_path: return

        try:
            with open(file_path, 'r', newline='', encoding='utf-8-sig') as f:
                reader = csv.DictReader(f)
                count = 0
                for row in reader:
                    # Map CSV columns to add_task parameters
                    # Expecting at least 'title', 'category', 'priority', 'due_date', 'details'
                    self.task_manager.add_task(
                        title=row.get('title', 'Imported Task'),
                        category=row.get('category', 'Other'),
                        priority=row.get('priority', 'Medium'),
                        due_date=row.get('due_date', ''),
                        details=row.get('details', '')
                    )
                    count += 1
                
                messagebox.showinfo("Import Success", f"{count} 件のタスクをインポートしました。")
                self.refresh_tasks()
        except Exception as e:
            messagebox.showerror("Import Error", f"インポートに失敗しました:\n{str(e)}")
    
    def print_tasks(self):
        """タスクリストをPDF出力"""
        
        from tkinter import filedialog, messagebox
        
        try:
            from print_utils import print_tasks_to_pdf
        except ImportError as e:
            messagebox.showerror("Import Error", f"print_utilsのインポートに失敗:\n{str(e)}")
            return
        
        tasks = self.task_manager.get_tasks()
        
        if not tasks:
            messagebox.showinfo("Print", "印刷するタスクがありません。")
            return
        
        # 保存先選択
        file_path = filedialog.asksaveasfilename(
            defaultextension=".pdf",
            filetypes=[("PDF Files", "*.pdf")],
            initialfile="tasks_report.pdf"
        )
        
        if file_path:
            try:
                print_tasks_to_pdf(tasks, file_path)
                messagebox.showinfo("Print Success", f"PDFを保存しました:\n{file_path}")
            except Exception as e:
                import traceback
                traceback.print_exc()
                messagebox.showerror("Print Error", f"PDF生成に失敗しました:\n{str(e)}")
        
        
    def refresh_tasks(self):
        # Clear existing
        for widget in self.list_frame.winfo_children():
            widget.destroy()
        
        self.row_widgets.clear()
        self.selected_ids.clear()
        self.last_selected_id = None

        # Fetch from DB
        tasks = self.task_manager.get_tasks()
        
        # Search Filter
        search_query = self.search_var.get().lower()
        if search_query:
            tasks = [t for t in tasks if search_query in t["title"].lower() or search_query in t["details"].lower() or search_query in t["category"].lower()]
        
        # Filter
        if self.hide_completed_var.get() == "on":
            tasks = [t for t in tasks if t["status"] != "DONE"]
            
        # Sort
        sort_by = self.sort_var.get()
        if sort_by == "Priority":
            priority_map = {"High": 0, "Medium": 1, "Low": 2}
            tasks.sort(key=lambda x: priority_map.get(x["priority"], 99))
        elif sort_by == "Due Date":
            tasks.sort(key=lambda x: x["due_date"] if x["due_date"] else "9999-99-99")
        elif sort_by == "Title":
            tasks.sort(key=lambda x: x["title"].lower())
            
        for task in tasks:
            self.create_task_row(task)
            
    def create_task_row(self, task):
        row = ctk.CTkFrame(self.list_frame)
        row.pack(fill="x", pady=5, padx=5)
        
        # 1. Status Checkbox
        check_var = ctk.StringVar(value="on" if task["status"] == "DONE" else "off")
        check = ctk.CTkCheckBox(row, text="", width=20, variable=check_var, 
                                onvalue="on", offvalue="off",
                                command=lambda: self.toggle_status(task["id"], check_var))
        check.pack(side="left", padx=(10, 5))
        
        # 2. Priority Badge
        priority_colors = {"High": "#FF4B4B", "Medium": "#FFB84D", "Low": "#4BC0C0"}
        p_color = priority_colors.get(task["priority"], "gray")
        p_badge = ctk.CTkLabel(row, text=task["priority"][:1], width=20, height=20, 
                               fg_color=p_color, text_color="white", corner_radius=10,
                               font=ctk.CTkFont(size=10, weight="bold"))
        p_badge.pack(side="left", padx=5)
        
        # 3. Main Info Container (Title + Date)
        info_frame = ctk.CTkFrame(row, fg_color="transparent")
        info_frame.pack(side="left", padx=10, fill="both", expand=True)
        
        title = ctk.CTkLabel(info_frame, text=task["title"], font=ctk.CTkFont(weight="bold"))
        title.pack(side="top", anchor="w")
        
        meta_text = f"📅 {task['due_date'] or 'No date'}"
        if task['details']:
            snippet = task['details'][:50].replace('\n', ' ')
            meta_text += f"  |  📝 {snippet}{'...' if len(task['details']) > 50 else ''}"
            
        meta_label = ctk.CTkLabel(info_frame, text=meta_text, font=ctk.CTkFont(size=11), text_color="#707070")
        meta_label.pack(side="top", anchor="w")
        
        # 4. Category (Right side)
        badge = ctk.CTkLabel(row, text=task["category"], 
                             fg_color="#1F538D", # Soft Blue
                             text_color="white", # Explicitly white
                             corner_radius=5, 
                             font=ctk.CTkFont(size=11, weight="bold"),
                             padx=10) # Add inner padding
        badge.pack(side="right", padx=10)
        
        # 5. Delete Button (1件ずつ削除)
        del_btn = ctk.CTkButton(row, text="🗑", width=30, height=30, 
                                fg_color="transparent", text_color="#FF4B4B", hover_color=("#FADBD8", "#2C3E50"),
                                command=lambda t_id=task["id"]: self.delete_single_task(t_id))
        del_btn.pack(side="right", padx=5)
        
        # Bind double-click to edit (to frame and all labels)
        # Bind click for selection
        for widget in [row, title, meta_label, info_frame]:
            widget.bind("<Double-Button-1>", lambda e: self.open_edit_dialog(task))
            widget.bind("<Button-1>", lambda e: self.on_task_click(e, task['id']))
            widget.bind("<Button-3>", lambda e: self.on_task_right_click(e, task['id']))
            
        self.row_widgets[task["id"]] = row
        
    def open_add_dialog(self):
        from .dialogs import TaskDialog
        TaskDialog(self, callback=self.add_task_callback)

    def open_edit_dialog(self, task):
        from .dialogs import TaskDialog
        TaskDialog(self, callback=lambda data: self.edit_task_callback(task['id'], data), task=task)
        
    def toggle_status(self, task_id, var):
        status = "DONE" if var.get() == "on" else "TODO"
        print(f"Updating task {task_id} to {status}")
        self.task_manager.update_status(task_id, status)
        
        # Refresh if we are in "Hide Completed" mode
        if self.hide_completed_var.get() == "on":
            self.refresh_tasks()

    def add_task_callback(self, task_data):
        print(f"Saving task: {task_data}")
        self.task_manager.add_task(
            title=task_data["title"],
            category=task_data["category"],
            priority=task_data["priority"],
            due_date=task_data["due_date"],
            details=task_data["details"]
        )
        self.refresh_tasks()

    def edit_task_callback(self, task_id, task_data):
        print(f"Updating task {task_id}: {task_data}")
        self.task_manager.update_task_details(
            task_id,
            title=task_data["title"],
            category=task_data["category"],
            priority=task_data["priority"],
            due_date=task_data["due_date"],
            details=task_data["details"]
        )
        self.refresh_tasks()


    def on_task_click(self, event, task_id):
        # Handle Selection Logic
        ctrl_pressed = (event.state & 0x4) != 0
        shift_pressed = (event.state & 0x1) != 0
        
        if shift_pressed and self.last_selected_id is not None:
             self.select_range(self.last_selected_id, task_id)
        elif ctrl_pressed:
            if task_id in self.selected_ids:
                self.selected_ids.remove(task_id)
                self.last_selected_id = task_id # Update last focused even on deselect?
            else:
                self.selected_ids.add(task_id)
                self.last_selected_id = task_id
        else:
            # Single selection (clear others)
            self.selected_ids.clear()
            self.selected_ids.add(task_id)
            self.last_selected_id = task_id
            
        self.update_selection_visuals()

    def select_range(self, start_id, end_id):
        # We need the order of tasks. 
        # Since logic is complex with sorting, we'll iterate through current row_widgets keys (insertion order handled by refresh)
        # But row_widgets is dict. Python 3.7+ preserves insertion order.
        # Assuming refresh_tasks inserts in order.
        
        all_ids = list(self.row_widgets.keys())
        try:
            idx1 = all_ids.index(start_id)
            idx2 = all_ids.index(end_id)
            start, end = min(idx1, idx2), max(idx1, idx2)
            
            for i in range(start, end + 1):
                self.selected_ids.add(all_ids[i])
        except ValueError:
            pass # ID not found?

    def update_selection_visuals(self):
        for t_id, widget in self.row_widgets.items():
            if t_id in self.selected_ids:
                widget.configure(fg_color=("#D0E0E3", "#3B8ED0")) # Highlight color
            else:
                widget.configure(fg_color=("gray86", "gray17")) # Default color (ctk default for frame inside frame usually transparent or specific)
                # Correction: The frame in create_task_row didn't specify fg_color, so it was system default.
                # Let's verify what default "invisible" or "card" color was. 
                # create_task_row: row = ctk.CTkFrame(self.list_frame) -> Default theme color.
                # To be safe, we should reset to None (Default) or appropriate theme color.
                # ctk.CTkFrame default fg_color is None (transparent) if not set? No, it has a default.
                # Let's set it to valid theme colors for "unselected"
                widget.configure(fg_color=["gray86", "gray17"]) 

    def on_task_right_click(self, event, task_id):
        # If clicked task is NOT in selection, select it exclusively (like Windows Explorer)
        if task_id not in self.selected_ids:
            self.selected_ids.clear()
            self.selected_ids.add(task_id)
            self.last_selected_id = task_id
            self.update_selection_visuals()
            
        # Show Context Menu
        menu = tk.Menu(self, tearoff=0)
        menu.add_command(label=f"Delete {len(self.selected_ids)} Task(s)", command=self.delete_selected_tasks)
        try:
            menu.tk_popup(event.x_root, event.y_root)
        finally:
            menu.grab_release()
            
    def delete_selected_tasks(self):
        if not self.selected_ids: return
        
        count = len(self.selected_ids)
        if not messagebox.askyesno("Confirm Delete", f"Are you sure you want to delete {count} tasks?"):
            return
            
        ids_to_delete = list(self.selected_ids)
        self.task_manager.delete_tasks(ids_to_delete)
        
        self.selected_ids.clear()
        self.last_selected_id = None
        self.refresh_tasks()

    def delete_single_task(self, task_id):
        if not messagebox.askyesno("Confirm Delete", "このタスクを削除しますか？"):
            return
        self.task_manager.delete_tasks([task_id])
        self.refresh_tasks()

class JournalFrame(ctk.CTkFrame):
    def __init__(self, master, **kwargs):
        super().__init__(master, **kwargs)
        self.grid_columnconfigure(1, weight=1)
        self.grid_rowconfigure(1, weight=1)
        
        # Managers
        self.journal_manager = JournalManager()
        self.task_manager = TaskManager()
        self.current_entry_id = None
        
        # State
        self.is_preview_mode = False

        # -- Header --
        self.header = ctk.CTkFrame(self, fg_color="transparent")
        self.header.grid(row=0, column=0, columnspan=2, sticky="ew", padx=10, pady=10)
        
        self.label = ctk.CTkLabel(self.header, text="Journal", font=ctk.CTkFont(size=20, weight="bold"))
        self.label.pack(side="left")
        
        # Date Navigation
        self.nav_frame = ctk.CTkFrame(self.header, fg_color="transparent")
        self.nav_frame.pack(side="right")

        self.prev_btn = ctk.CTkButton(self.nav_frame, text="<", width=30, command=self.prev_day)
        self.prev_btn.pack(side="left", padx=5)
        
        self.current_date = date.today()
        self.date_label = ctk.CTkLabel(self.nav_frame, text=str(self.current_date), font=ctk.CTkFont(size=14))
        self.date_label.pack(side="left", padx=5)

        self.next_btn = ctk.CTkButton(self.nav_frame, text=">", width=30, command=self.next_day)
        self.next_btn.pack(side="left", padx=5)

        # -- Main Content --
        # Left Sidebar (Entry List)
        self.sidebar = ctk.CTkFrame(self, width=200, corner_radius=0)
        self.sidebar.grid(row=1, column=0, sticky="nsew", padx=(0,5))
        self.sidebar.grid_rowconfigure(1, weight=1)
        
        self.new_btn = ctk.CTkButton(self.sidebar, text="+ New Entry", command=self.create_new_entry)
        self.new_btn.grid(row=0, column=0, padx=10, pady=10, sticky="ew")
        
        self.entry_list = ctk.CTkScrollableFrame(self.sidebar, width=180)
        self.entry_list.grid(row=1, column=0, padx=5, pady=5, sticky="nsew")

        # Right Content (Editor)
        self.editor_frame = ctk.CTkFrame(self, fg_color="transparent")
        self.editor_frame.grid(row=1, column=1, sticky="nsew", padx=10)
        self.editor_frame.grid_columnconfigure(0, weight=1)
        self.editor_frame.grid_rowconfigure(2, weight=1)

        # Title Input
        self.title_var = ctk.StringVar()
        self.title_entry = ctk.CTkEntry(self.editor_frame, textvariable=self.title_var, placeholder_text="Entry Title (e.g., Morning Thoughts)")
        self.title_entry.grid(row=0, column=0, sticky="ew", pady=(0, 10))

        # Toolbar (Snippets, etc)
        self.toolbar_frame = ctk.CTkFrame(self.editor_frame, fg_color="transparent")
        self.toolbar_frame.grid(row=1, column=0, sticky="ew", pady=(0, 5))
        
        from utils import SNIPPETS
        self.snippet_var = ctk.StringVar(value="Quick Insert...")
        self.snippet_opt = ctk.CTkComboBox(self.toolbar_frame, values=SNIPPETS, variable=self.snippet_var, command=self.insert_snippet, width=150)
        self.snippet_opt.pack(side="left")
        
        # Preview Toggle Button
        self.preview_btn = ctk.CTkButton(self.toolbar_frame, text="👁 Preview Markdown", width=120, 
                                         fg_color="#3B8ED0", hover_color="#2C6C9E",
                                         command=self.toggle_preview)
        self.preview_btn.pack(side="left", padx=10)
        
        self.phi_warning = ctk.CTkLabel(self.toolbar_frame, text="", text_color="#FF4B4B", font=ctk.CTkFont(size=12, weight="bold"))
        self.phi_warning.pack(side="right")

        # Text Area / Preview Area Container
        self.content_frame = ctk.CTkFrame(self.editor_frame, fg_color="transparent")
        self.content_frame.grid(row=2, column=0, sticky="nsew")
        self.content_frame.grid_rowconfigure(0, weight=1)
        self.content_frame.grid_columnconfigure(0, weight=1)

        # Editor Textbox
        self.textbox = ctk.CTkTextbox(self.content_frame, width=400, height=300)
        self.textbox.grid(row=0, column=0, sticky="nsew")
        self.textbox.bind("<KeyRelease>", self.on_text_change)
        
        # HTML Preview Label (Hidden by default)
        try:
            from tkinterweb import HtmlFrame
            self.preview_label = HtmlFrame(self.content_frame, messages_enabled=False)
        except ImportError:
            import tkinter as tk
            self.preview_label = tk.Label(self.content_frame, text="tkinterweb missing.\nPlease 'pip install tkinterweb markdown'")

        # Action Buttons
        self.actions_frame = ctk.CTkFrame(self.editor_frame, fg_color="transparent")
        self.actions_frame.grid(row=3, column=0, sticky="ew", pady=10)
        
        self.delete_btn = ctk.CTkButton(self.actions_frame, text="Delete", fg_color="#FF4B4B", hover_color="#C0392B", width=80, command=self.delete_current_entry)
        self.delete_btn.pack(side="left")
        
        self.save_btn = ctk.CTkButton(self.actions_frame, text="Save Changes", command=self.save_current_entry)
        self.save_btn.pack(side="right", padx=(10, 0))
        
        self.sync_btn = ctk.CTkButton(self.actions_frame, text="Sync Tasks", command=self.sync_tasks, fg_color="#3B8ED0")
        self.sync_btn.pack(side="right")
        
        self.print_btn = ctk.CTkButton(self.actions_frame, text="🖨 Print", command=self.print_journal, fg_color="#9B59B6", width=80)
        self.print_btn.pack(side="right", padx=(0, 10))


        # Initial Load
        self.refresh_entries()

    def prev_day(self):
        from datetime import timedelta
        self.current_date -= timedelta(days=1)
        self.date_label.configure(text=str(self.current_date))
        self.refresh_entries()

    def next_day(self):
        from datetime import timedelta
        self.current_date += timedelta(days=1)
        self.date_label.configure(text=str(self.current_date))
        self.refresh_entries()

    def refresh_entries(self):
        # Clear list
        for w in self.entry_list.winfo_children():
            w.destroy()
            
        date_str = str(self.current_date)
        entries = self.journal_manager.get_entries(date_str)
        
        for entry in entries:
            btn = ctk.CTkButton(self.entry_list, text=entry['title'] or "Untitled", 
                                fg_color="transparent", border_width=1, border_color="gray",
                                text_color=("gray10", "gray90"), anchor="w",
                                command=lambda e=entry: self.load_entry(e))
            btn.pack(fill="x", pady=2)
        
        if entries:
            # If we have entries for this day, load the last one (or first?)
            if self.current_entry_id is None or self.current_entry_id not in [e['id'] for e in entries]:
                 self.load_entry(entries[0])
        else:
            self.clear_editor()

    def create_new_entry(self):
        # Ensure we are on today or warn?
        # For now, allow creating entry for displayed date
        self.clear_editor()
        self.title_var.set("New Entry")
        self.current_entry_id = None # Marks as new
        self.textbox.focus_set()

    def load_entry(self, entry):
        self.current_entry_id = entry['id']
        self.title_var.set(entry['title'])
        self.textbox.delete("1.0", "end")
        self.textbox.insert("1.0", entry['content'])
        self.phi_warning.configure(text="")
        if self.is_preview_mode:
            self.update_preview_content()

    def clear_editor(self):
        self.current_entry_id = None
        self.title_var.set("")
        self.textbox.delete("1.0", "end")
        self.phi_warning.configure(text="")
        if self.is_preview_mode:
            self.update_preview_content()

    def insert_snippet(self, snippet):
        self.textbox.insert("insert", f"{snippet}\n")
        self.on_text_change()

    def on_text_change(self, event=None):
        from utils import check_phi
        content = self.textbox.get("1.0", "end-1c")
        warnings = check_phi(content)
        if warnings:
            self.phi_warning.configure(text=f"⚠ {warnings[0]}")
        else:
            self.phi_warning.configure(text="")
            
    def toggle_preview(self):
        self.is_preview_mode = not self.is_preview_mode
        if self.is_preview_mode:
            # Switch to Preview
            self.preview_btn.configure(text="✏️ Edit Markdown", fg_color="#E38D13", hover_color="#C87A0C")
            self.textbox.grid_remove()
            self.preview_label.grid(row=0, column=0, sticky="nsew")
            self.update_preview_content()
        else:
            # Switch to Edit
            self.preview_btn.configure(text="👁 Preview Markdown", fg_color="#3B8ED0", hover_color="#2C6C9E")
            self.preview_label.grid_remove()
            self.textbox.grid(row=0, column=0, sticky="nsew")
            
    def update_preview_content(self):
        content = self.textbox.get("1.0", "end-1c")
        try:
            import markdown
            import re
            
            # Clean up broken tables with hard line breaks inside cells
            content = re.sub(r'\n+(?=(<br>.*?) \|)', '', content)
            
            # Convert markdown to HTML (enable tables and newlines)
            html = markdown.markdown(content, extensions=['tables', 'nl2br', 'fenced_code'])
            
            # Add some basic CSS for tkinterweb
            is_dark = ctk.get_appearance_mode() == "Dark"
            text_col = "#EAEAEA" if is_dark else "#333333"
            link_col = "#3B8ED0"
            bg_col = "#2B2B2B" if is_dark else "white"
            
            styled_html = f"""
            <html>
            <head>
            <style>
                body {{ font-family: sans-serif; color: {text_col}; background-color: {bg_col}; line-height: 1.5; font-size: 14px; margin: 10px; }}
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
            try:
                self.preview_label.html.config(text="tkinterweb or markdown missing")
            except AttributeError:
                self.preview_label.configure(text="tkinterweb or markdown missing")

    def save_current_entry(self):
        today = str(self.current_date) # Use currently navigated date
        title = self.title_var.get()
        content = self.textbox.get("1.0", "end-1c")
        
        if not title:
            title = "Untitled"
            
        if self.current_entry_id:
            self.journal_manager.update_entry(self.current_entry_id, title, content)
        else:
            self.journal_manager.add_entry(today, title, content)
            
        # self.refresh_entries() # This might reset selection
        # Instead just reload list to show new title, try to keep selection?
        # For simplicity, refresh and reload last entry logic is needed.
        self.refresh_entries_and_select_last()

    def refresh_entries_and_select_last(self):
        # Helper to refresh and keeping selection logic is complex without ID tracking.
        # But we know the ID if we just updated.
        # If we just added, we don't know the new ID easily without return from DB.
        # So we'll just reload and select the one with matching title/content or just last one?
        # Let's just refresh. User can click.
        self.refresh_entries()
        
    def delete_current_entry(self):
        if not self.current_entry_id:
            return
        
        if messagebox.askyesno("Delete", "Delete this entry?"):
            self.journal_manager.delete_entry(self.current_entry_id)
            self.current_entry_id = None
            self.refresh_entries()

    def sync_tasks(self):
        today = str(date.today())
        completed_tasks = self.task_manager.get_completed_today(today)
        
        if not completed_tasks:
            messagebox.showinfo("Sync Tasks", "今日の完了タスクはありません。\n(No completed tasks found for today)")
            return
            
        current_text = self.textbox.get("1.0", "end-1c")
        new_text = "\n\n## Completed Tasks\n"
        for task in completed_tasks:
            new_text += f"- [x] {task['title']} ({task['category']})\n"
            
        self.textbox.insert("end", new_text)
        print("Tasks synced to journal.")
        messagebox.showinfo("Sync Success", f"{len(completed_tasks)} 件のタスクを追記しました。")

    def print_journal(self):
        """Journalエントリをpdf出力"""
        from tkinter import filedialog, messagebox
        from print_utils import print_journal_to_pdf
        
        date_str = str(self.current_date)
        entries = self.journal_manager.get_entries(date_str)
        
        if not entries:
            messagebox.showinfo("Print", "印刷するエントリがありません。")
            return
        
        # 保存先選択
        file_path = filedialog.asksaveasfilename(
            defaultextension=".pdf",
            filetypes=[("PDF Files", "*.pdf")],
            initialfile=f"journal_{date_str}.pdf"
        )
        
        if file_path:
            try:
                print_journal_to_pdf(date_str, entries, file_path)
                messagebox.showinfo("Print Success", f"PDFを保存しました:\n{file_path}")
            except Exception as e:
                messagebox.showerror("Print Error", f"PDF生成に失敗しました:\n{str(e)}")



class DashboardFrame(ctk.CTkFrame):
    def __init__(self, master, **kwargs):
        super().__init__(master, **kwargs)
        self.grid_columnconfigure((0, 1), weight=1)
        self.grid_rowconfigure(1, weight=1)

        # Header Frame
        header_frame = ctk.CTkFrame(self, fg_color="transparent")
        header_frame.grid(row=0, column=0, columnspan=2, padx=20, pady=20, sticky="ew")

        self.label = ctk.CTkLabel(header_frame, text="Dashboard", font=ctk.CTkFont(size=24, weight="bold"))
        self.label.pack(side="left")
        
        # Print Button
        self.print_btn = ctk.CTkButton(header_frame, text="🖨 Print", command=self.print_dashboard,
                                       fg_color="#9B59B6", hover_color="#8E44AD", width=100)
        self.print_btn.pack(side="right")

        # Stats Container
        self.stats_frame = ctk.CTkFrame(self, fg_color="transparent")
        self.stats_frame.grid(row=1, column=0, columnspan=2, sticky="nsew", padx=20)
        self.stats_frame.grid_columnconfigure((0, 1, 2), weight=1)

        self.task_manager = TaskManager()
        self.refresh_dashboard()


    def create_stat_card(self, parent, title, value, color, column):
        card = ctk.CTkFrame(parent, fg_color=("#EAEAEA", "#2B2B2B"), corner_radius=10)
        card.grid(row=0, column=column, padx=10, pady=10, sticky="nsew")
        
        label = ctk.CTkLabel(card, text=title, font=ctk.CTkFont(size=14))
        label.pack(pady=(15, 0))
        
        val_label = ctk.CTkLabel(card, text=str(value), font=ctk.CTkFont(size=32, weight="bold"), text_color=color)
        val_label.pack(pady=(5, 15))
        return card

    def refresh_dashboard(self):
        # Clear existing
        for widget in self.stats_frame.winfo_children():
            widget.destroy()

        stats = self.task_manager.get_stats()
        
        # Summary Cards
        self.create_stat_card(self.stats_frame, "Total Tasks", stats["total"], "#3B8ED0", 0)
        self.create_stat_card(self.stats_frame, "Completed", stats["completed"], "#2FA572", 1)
        
        pending = stats["total"] - stats["completed"]
        self.create_stat_card(self.stats_frame, "Pending", pending, "#E38D13", 2)

        # -- Weekly Productivity Chart --
        chart_frame = ctk.CTkFrame(self.stats_frame, fg_color="transparent")
        chart_frame.grid(row=2, column=0, columnspan=3, pady=20, sticky="ew")
        
        ctk.CTkLabel(chart_frame, text="Weekly Productivity (Last 7 Days)", font=ctk.CTkFont(size=18, weight="bold")).pack(anchor="w", padx=10)
        
        weekly_stats = self.task_manager.get_weekly_stats()
        days = list(weekly_stats.keys())
        counts = list(weekly_stats.values())
        formatted_days = [d[5:] for d in days] # MM-DD
        
        # Determine colors based on appearance mode
        mode = ctk.get_appearance_mode()
        is_dark = mode == "Dark" or (mode == "System" and self._get_appearance_mode() == "dark")
        # Fallback manual check if needed, but 'Dark' is standard string in ctk
        
        bg_color = "#2B2B2B" if is_dark else "#EAEAEA"
        text_color = "white" if is_dark else "black"
        
        # Create Figure
        fig = Figure(figsize=(6, 3), dpi=100)
        fig.patch.set_facecolor(bg_color)
        
        ax = fig.add_subplot(111)
        ax.set_facecolor(bg_color)
        
        # Bar chart
        bars = ax.bar(formatted_days, counts, color="#3B8ED0")
        
        # Styling
        ax.tick_params(axis='x', colors=text_color)
        ax.tick_params(axis='y', colors=text_color)
        for spine in ax.spines.values():
            spine.set_color(text_color)
            
        from matplotlib.ticker import MaxNLocator
        ax.yaxis.set_major_locator(MaxNLocator(integer=True))
        
        canvas = FigureCanvasTkAgg(fig, master=chart_frame)
        canvas.draw()
        canvas.get_tk_widget().pack(fill="both", expand=True, padx=10)

        # -- Category Progress --
        cat_frame = ctk.CTkFrame(self.stats_frame, fg_color="transparent")
        cat_frame.grid(row=3, column=0, columnspan=3, pady=20, sticky="ew")
        
        ctk.CTkLabel(cat_frame, text="Tasks by Category", font=ctk.CTkFont(size=18, weight="bold")).pack(anchor="w", padx=10)
        
        for cat, count in stats["categories"].items():
            row = ctk.CTkFrame(cat_frame, fg_color=("#F5F5F5", "#333333"), height=35)
            row.pack(fill="x", pady=2, padx=10)
            row.pack_propagate(False)
            
            ctk.CTkLabel(row, text=cat).pack(side="left", padx=10)
            
            # Simple progress bar logic
            percentage = (count / stats["total"]) if stats["total"] > 0 else 0
            bar_bg = ctk.CTkFrame(row, fg_color=("#D0D0D0", "#1A1A1A"), width=200, height=10)
            bar_bg.pack(side="right", padx=10)
            bar_bg.pack_propagate(False)
            
            progress_width = int(200 * percentage)
            ctk.CTkFrame(bar_bg, fg_color="#3B8ED0", width=progress_width, height=10).pack(side="left")
            
            ctk.CTkLabel(row, text=str(count)).pack(side="right", padx=10)

    def print_dashboard(self):
        """ダッシュボードをPDF出力"""
        from tkinter import filedialog, messagebox
        from print_utils import print_dashboard_to_pdf
        
        stats = self.task_manager.get_stats()
        weekly_stats = self.task_manager.get_weekly_stats()
        
        # 保存先選択
        file_path = filedialog.asksaveasfilename(
            defaultextension=".pdf",
            filetypes=[("PDF Files", "*.pdf")],
            initialfile="dashboard_report.pdf"
        )
        
        if file_path:
            try:
                print_dashboard_to_pdf(stats, weekly_stats, file_path)
                messagebox.showinfo("Print Success", f"PDFを保存しました:\n{file_path}")
            except Exception as e:
                messagebox.showerror("Print Error", f"PDF生成に失敗しました:\n{str(e)}")


class MonthlyReportFrame(ctk.CTkFrame):
    def __init__(self, master, **kwargs):
        super().__init__(master, **kwargs)
        self.grid_columnconfigure(0, weight=1)
        self.grid_rowconfigure(2, weight=1)
        
        self.task_manager = TaskManager()
        
        # Header
        self.label = ctk.CTkLabel(self, text="Monthly Report", font=ctk.CTkFont(size=24, weight="bold"))
        self.label.grid(row=0, column=0, padx=20, pady=20, sticky="w")
        
        # Month Selection
        self.selector_frame = ctk.CTkFrame(self, fg_color="transparent")
        self.selector_frame.grid(row=1, column=0, padx=20, pady=10, sticky="ew")
        
        from datetime import date
        current_year = date.today().year
        current_month = date.today().month
        
        ctk.CTkLabel(self.selector_frame, text="Year:").pack(side="left", padx=5)
        self.year_var = ctk.StringVar(value=str(current_year))
        self.year_combo = ctk.CTkComboBox(
            self.selector_frame,
            values=[str(y) for y in range(current_year - 2, current_year + 1)],
            variable=self.year_var,
            command=lambda _: self.refresh_report(),
            width=100
        )
        self.year_combo.pack(side="left", padx=5)
        
        ctk.CTkLabel(self.selector_frame, text="Month:").pack(side="left", padx=5)
        self.month_var = ctk.StringVar(value=str(current_month))
        self.month_combo = ctk.CTkComboBox(
            self.selector_frame,
            values=[str(m) for m in range(1, 13)],
            variable=self.month_var,
            command=lambda _: self.refresh_report(),
            width=80
        )
        self.month_combo.pack(side="left", padx=5)
        
        # Print Button
        self.print_btn = ctk.CTkButton(self.selector_frame, text="🖨 Print", command=self.print_report,
                                       fg_color="#9B59B6", hover_color="#8E44AD", width=100)
        self.print_btn.pack(side="right", padx=10)
        
        # Report Container
        self.report_frame = ctk.CTkScrollableFrame(self)
        self.report_frame.grid(row=2, column=0, padx=20, pady=10, sticky="nsew")
        
        self.refresh_report()
    
    def refresh_report(self):
        # Clear existing
        for widget in self.report_frame.winfo_children():
            widget.destroy()
        
        year = int(self.year_var.get())
        month = int(self.month_var.get())
        
        stats = self.task_manager.get_monthly_stats(year, month)
        
        # Summary Card
        summary_frame = ctk.CTkFrame(self.report_frame, fg_color=("#EAEAEA", "#2B2B2B"), corner_radius=10)
        summary_frame.pack(fill="x", pady=10, padx=10)
        
        ctk.CTkLabel(summary_frame, text=f"{year}年{month}月 サマリー", 
                    font=ctk.CTkFont(size=18, weight="bold")).pack(pady=10)
        
        ctk.CTkLabel(summary_frame, text=f"完了タスク数: {stats['total']}", 
                    font=ctk.CTkFont(size=16)).pack(pady=5)
        
        # Daily Chart
        chart_frame = ctk.CTkFrame(self.report_frame, fg_color="transparent")
        chart_frame.pack(fill="both", expand=True, pady=10)
        
        ctk.CTkLabel(chart_frame, text="日別完了タスク数", 
                    font=ctk.CTkFont(size=16, weight="bold")).pack(anchor="w", padx=10, pady=5)
        
        daily_stats = stats['daily']
        days = list(daily_stats.keys())
        counts = list(daily_stats.values())
        formatted_days = [d.split('-')[2] for d in days]  # Day only
        
        # Determine colors based on appearance mode
        mode = ctk.get_appearance_mode()
        is_dark = mode == "Dark"
        
        bg_color = "#2B2B2B" if is_dark else "#EAEAEA"
        text_color = "white" if is_dark else "black"
        
        # Create Figure
        fig = Figure(figsize=(8, 4), dpi=100)
        fig.patch.set_facecolor(bg_color)
        
        ax = fig.add_subplot(111)
        ax.set_facecolor(bg_color)
        
        # Bar chart
        bars = ax.bar(formatted_days, counts, color="#3B8ED0")
        
        # Styling
        ax.set_xlabel("Day", color=text_color)
        ax.set_ylabel("Completed Tasks", color=text_color)
        ax.tick_params(axis='x', colors=text_color, labelsize=8)
        ax.tick_params(axis='y', colors=text_color)
        for spine in ax.spines.values():
            spine.set_color(text_color)
        
        from matplotlib.ticker import MaxNLocator
        ax.yaxis.set_major_locator(MaxNLocator(integer=True))
        
        canvas = FigureCanvasTkAgg(fig, master=chart_frame)
        canvas.draw()
        canvas.get_tk_widget().pack(fill="both", expand=True, padx=10)
        
        # Category Table
        cat_frame = ctk.CTkFrame(self.report_frame, fg_color="transparent")
        cat_frame.pack(fill="x", pady=10)
        
        ctk.CTkLabel(cat_frame, text="カテゴリ別集計", 
                    font=ctk.CTkFont(size=16, weight="bold")).pack(anchor="w", padx=10, pady=5)
        
        if stats['categories']:
            for cat, count in stats['categories'].items():
                row = ctk.CTkFrame(cat_frame, fg_color=("#F5F5F5", "#333333"), height=35)
                row.pack(fill="x", pady=2, padx=10)
                row.pack_propagate(False)
                
                ctk.CTkLabel(row, text=cat).pack(side="left", padx=10)
                ctk.CTkLabel(row, text=str(count)).pack(side="right", padx=10)
        else:
            ctk.CTkLabel(cat_frame, text="データなし", text_color="gray").pack(padx=10, pady=5)

    def print_report(self):
        """月次レポートをPDF出力"""
        from tkinter import filedialog, messagebox
        from print_utils import print_monthly_report_to_pdf
        
        year = int(self.year_var.get())
        month = int(self.month_var.get())
        stats = self.task_manager.get_monthly_stats(year, month)
        
        # 保存先選択
        file_path = filedialog.asksaveasfilename(
            defaultextension=".pdf",
            filetypes=[("PDF Files", "*.pdf")],
            initialfile=f"monthly_report_{year}_{month:02d}.pdf"
        )
        
        if file_path:
            try:
                print_monthly_report_to_pdf(year, month, stats, file_path)
                messagebox.showinfo("Print Success", f"PDFを保存しました:\n{file_path}")
            except Exception as e:
                messagebox.showerror("Print Error", f"PDF生成に失敗しました:\n{str(e)}")

