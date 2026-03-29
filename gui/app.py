import customtkinter as ctk
from .frames import TaskFrame, JournalFrame, DashboardFrame, MonthlyReportFrame

class App(ctk.CTk):
    def __init__(self):
        super().__init__()

        self.title("MP-LogManager")
        self.geometry("1000x700")

        # Load theme from config
        from utils import get_current_theme
        theme = get_current_theme()
        ctk.set_appearance_mode("dark" if theme == "dark" else "light")

        # Layout configuration
        self.grid_rowconfigure(0, weight=1)
        self.grid_columnconfigure(1, weight=1)

        # Menu Bar
        self.create_menu()

        # Navigation Frame (Sidebar)
        self.navigation_frame = ctk.CTkFrame(self, corner_radius=0)
        self.navigation_frame.grid(row=0, column=0, sticky="nsew")
        self.navigation_frame.grid_rowconfigure(6, weight=1)

        self.logo_label = ctk.CTkLabel(self.navigation_frame, text="MP-LogManager",
                                     font=ctk.CTkFont(size=20, weight="bold"))
        self.logo_label.grid(row=0, column=0, padx=20, pady=20)

        self.dash_button = ctk.CTkButton(self.navigation_frame, corner_radius=0, height=40, border_spacing=10,
                                       text="Dashboard",
                                       fg_color="transparent", text_color=("gray10", "gray90"), hover_color=("gray70", "gray30"),
                                       anchor="w", command=self.show_dashboard)
        self.dash_button.grid(row=1, column=0, sticky="ew")

        self.home_button = ctk.CTkButton(self.navigation_frame, corner_radius=0, height=40, border_spacing=10,
                                       text="Tasks",
                                       fg_color="transparent", text_color=("gray10", "gray90"), hover_color=("gray70", "gray30"),
                                       anchor="w", command=self.show_tasks)
        self.home_button.grid(row=2, column=0, sticky="ew")

        self.journal_button = ctk.CTkButton(self.navigation_frame, corner_radius=0, height=40, border_spacing=10,
                                          text="Journal",
                                          fg_color="transparent", text_color=("gray10", "gray90"), hover_color=("gray70", "gray30"),
                                          anchor="w", command=self.show_journal)
        self.journal_button.grid(row=3, column=0, sticky="ew")

        self.monthly_button = ctk.CTkButton(self.navigation_frame, corner_radius=0, height=40, border_spacing=10,
                                           text="Monthly Report",
                                           fg_color="transparent", text_color=("gray10", "gray90"), hover_color=("gray70", "gray30"),
                                           anchor="w", command=self.show_monthly)
        self.monthly_button.grid(row=4, column=0, sticky="ew")

        # Main Content Frames
        self.dashboard_frame = DashboardFrame(self)
        self.task_frame = TaskFrame(self)
        self.journal_frame = JournalFrame(self)
        self.monthly_frame = MonthlyReportFrame(self)

        # Default View
        self.show_dashboard()

    def create_menu(self):
        """メニューバーを作成"""
        import tkinter as tk
        menubar = tk.Menu(self)
        self.config(menu=menubar)
        
        # View Menu
        view_menu = tk.Menu(menubar, tearoff=0)
        menubar.add_cascade(label="View", menu=view_menu)
        view_menu.add_command(label="Toggle Dark Mode", command=self.toggle_theme)

    def toggle_theme(self):
        """ダークモード切り替え"""
        from utils import get_current_theme, save_theme
        
        current = get_current_theme()
        new_theme = "dark" if current == "light" else "light"
        
        # Save to config
        save_theme(new_theme)
        
        # Apply theme
        ctk.set_appearance_mode("dark" if new_theme == "dark" else "light")
        
        # Refresh all frames
        self.dashboard_frame.refresh_dashboard()
        self.task_frame.refresh_tasks()
        self.journal_frame.refresh_entries()
        self.monthly_frame.refresh_report()

    def show_dashboard(self):
        self.dashboard_frame.refresh_dashboard()
        self.select_frame_by_name("dashboard")

    def show_tasks(self):
        self.select_frame_by_name("tasks")

    def show_journal(self):
        self.select_frame_by_name("journal")

    def show_monthly(self):
        self.select_frame_by_name("monthly")

    def select_frame_by_name(self, name):
        # Update button colors
        self.dash_button.configure(fg_color=("gray75", "gray25") if name == "dashboard" else "transparent")
        self.home_button.configure(fg_color=("gray75", "gray25") if name == "tasks" else "transparent")
        self.journal_button.configure(fg_color=("gray75", "gray25") if name == "journal" else "transparent")
        self.monthly_button.configure(fg_color=("gray75", "gray25") if name == "monthly" else "transparent")

        # Show frame
        self.dashboard_frame.grid(row=0, column=1, sticky="nsew") if name == "dashboard" else self.dashboard_frame.grid_forget()
        self.task_frame.grid(row=0, column=1, sticky="nsew") if name == "tasks" else self.task_frame.grid_forget()
        self.journal_frame.grid(row=0, column=1, sticky="nsew") if name == "journal" else self.journal_frame.grid_forget()
        self.monthly_frame.grid(row=0, column=1, sticky="nsew") if name == "monthly" else self.monthly_frame.grid_forget()
