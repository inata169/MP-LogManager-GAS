"""
印刷機能ユーティリティ
各フレームのデータをPDF形式で出力
"""

from reportlab.lib.pagesizes import A4
from reportlab.lib import colors
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.platypus import SimpleDocTemplate, Table, TableStyle, Paragraph, Spacer, PageBreak
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.lib.units import mm
from datetime import datetime
import os

# 日本語フォント設定（Windows標準フォント）
def setup_japanese_font():
    """日本語フォントを登録"""
    try:
        # Windows標準の日本語フォント
        font_path = "C:\\Windows\\Fonts\\msgothic.ttc"
        if os.path.exists(font_path):
            pdfmetrics.registerFont(TTFont('Japanese', font_path))
            return True
    except Exception as e:
        print(f"Font registration failed: {e}")
    return False

def print_tasks_to_pdf(tasks, filename="tasks_report.pdf"):
    """タスクリストをPDF出力"""
    doc = SimpleDocTemplate(filename, pagesize=A4)
    story = []
    
    # 日本語フォント設定
    has_japanese = setup_japanese_font()
    font_name = 'Japanese' if has_japanese else 'Helvetica'
    
    # スタイル
    styles = getSampleStyleSheet()
    title_style = ParagraphStyle(
        'CustomTitle',
        parent=styles['Heading1'],
        fontName=font_name,
        fontSize=18,
        spaceAfter=20
    )
    
    # タイトル
    story.append(Paragraph("Task List Report", title_style))
    story.append(Paragraph(f"Generated: {datetime.now().strftime('%Y-%m-%d %H:%M')}", styles['Normal']))
    story.append(Spacer(1, 20))
    
    # テーブルデータ
    data = [['Title', 'Category', 'Priority', 'Status', 'Due Date']]
    for task in tasks:
        data.append([
            task.get('title', '')[:50],  # 長すぎる場合は切り詰め
            task.get('category', ''),
            task.get('priority', ''),
            task.get('status', ''),
            task.get('due_date', '')
        ])
    
    # テーブル作成
    table = Table(data, colWidths=[80*mm, 30*mm, 25*mm, 20*mm, 25*mm])
    table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), colors.grey),
        ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
        ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
        ('FONTNAME', (0, 0), (-1, 0), font_name),  # ヘッダー行
        ('FONTNAME', (0, 1), (-1, -1), font_name),  # データ行
        ('FONTSIZE', (0, 0), (-1, 0), 10),
        ('FONTSIZE', (0, 1), (-1, -1), 9),
        ('BOTTOMPADDING', (0, 0), (-1, 0), 12),
        ('BACKGROUND', (0, 1), (-1, -1), colors.beige),
        ('GRID', (0, 0), (-1, -1), 1, colors.black)
    ]))
    
    story.append(table)
    doc.build(story)
    return filename


def print_journal_to_pdf(date_str, entries, filename="journal_report.pdf"):
    """Journalエントリをpdf出力"""
    doc = SimpleDocTemplate(filename, pagesize=A4)
    story = []
    
    # 日本語フォント設定
    has_japanese = setup_japanese_font()
    font_name = 'Japanese' if has_japanese else 'Helvetica'
    
    # スタイル
    styles = getSampleStyleSheet()
    title_style = ParagraphStyle(
        'CustomTitle',
        parent=styles['Heading1'],
        fontName=font_name,
        fontSize=18,
        spaceAfter=20
    )
    
    entry_title_style = ParagraphStyle(
        'EntryTitle',
        parent=styles['Heading2'],
        fontName=font_name,
        fontSize=14,
        spaceAfter=10
    )
    
    body_style = ParagraphStyle(
        'Body',
        parent=styles['Normal'],
        fontName=font_name,
        fontSize=11,
        spaceAfter=15
    )
    
    # タイトル
    story.append(Paragraph(f"Journal - {date_str}", title_style))
    story.append(Spacer(1, 20))
    
    # エントリ
    for entry in entries:
        story.append(Paragraph(entry.get('title', 'Untitled'), entry_title_style))
        
        # 本文（改行を保持）
        content = entry.get('content', '').replace('\n', '<br/>')
        story.append(Paragraph(content, body_style))
        story.append(Spacer(1, 10))
    
    doc.build(story)
    return filename

def print_monthly_report_to_pdf(year, month, stats, filename="monthly_report.pdf"):
    """月次レポートをPDF出力"""
    doc = SimpleDocTemplate(filename, pagesize=A4)
    story = []
    
    # 日本語フォント設定
    has_japanese = setup_japanese_font()
    font_name = 'Japanese' if has_japanese else 'Helvetica'
    
    # スタイル
    styles = getSampleStyleSheet()
    title_style = ParagraphStyle(
        'CustomTitle',
        parent=styles['Heading1'],
        fontName=font_name,
        fontSize=18,
        spaceAfter=20
    )
    
    # タイトル
    story.append(Paragraph(f"Monthly Report - {year}/{month:02d}", title_style))
    story.append(Paragraph(f"Generated: {datetime.now().strftime('%Y-%m-%d %H:%M')}", styles['Normal']))
    story.append(Spacer(1, 20))
    
    # サマリー
    story.append(Paragraph(f"Total Completed Tasks: {stats['total']}", styles['Heading2']))
    story.append(Spacer(1, 15))
    
    # カテゴリ別集計
    story.append(Paragraph("Tasks by Category", styles['Heading2']))
    story.append(Spacer(1, 10))
    
    cat_data = [['Category', 'Count']]
    for cat, count in stats['categories'].items():
        cat_data.append([cat, str(count)])
    
    cat_table = Table(cat_data, colWidths=[100*mm, 50*mm])
    cat_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), colors.grey),
        ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
        ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
        ('FONTNAME', (0, 0), (-1, 0), font_name),
        ('FONTNAME', (0, 1), (-1, -1), font_name),
        ('FONTSIZE', (0, 0), (-1, 0), 12),
        ('FONTSIZE', (0, 1), (-1, -1), 11),
        ('BOTTOMPADDING', (0, 0), (-1, 0), 12),
        ('BACKGROUND', (0, 1), (-1, -1), colors.beige),
        ('GRID', (0, 0), (-1, -1), 1, colors.black)
    ]))
    
    story.append(cat_table)
    doc.build(story)
    return filename

def print_dashboard_to_pdf(stats, weekly_stats, filename="dashboard_report.pdf"):
    """ダッシュボードをPDF出力"""
    doc = SimpleDocTemplate(filename, pagesize=A4)
    story = []
    
    # 日本語フォント設定
    has_japanese = setup_japanese_font()
    font_name = 'Japanese' if has_japanese else 'Helvetica'
    
    # スタイル
    styles = getSampleStyleSheet()
    
    # タイトル
    story.append(Paragraph("Dashboard Report", styles['Heading1']))
    story.append(Paragraph(f"Generated: {datetime.now().strftime('%Y-%m-%d %H:%M')}", styles['Normal']))
    story.append(Spacer(1, 20))
    
    # サマリー
    story.append(Paragraph(f"Total Tasks: {stats['total']}", styles['Heading2']))
    story.append(Paragraph(f"Completed: {stats['completed']}", styles['Normal']))
    story.append(Paragraph(f"Pending: {stats['total'] - stats['completed']}", styles['Normal']))
    story.append(Spacer(1, 20))
    
    # 週間統計
    story.append(Paragraph("Weekly Productivity (Last 7 Days)", styles['Heading2']))
    story.append(Spacer(1, 10))
    
    weekly_data = [['Date', 'Completed']]
    for date, count in weekly_stats.items():
        weekly_data.append([date, str(count)])
    
    weekly_table = Table(weekly_data, colWidths=[80*mm, 50*mm])
    weekly_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), colors.grey),
        ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
        ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
        ('FONTNAME', (0, 0), (-1, 0), font_name),
        ('FONTNAME', (0, 1), (-1, -1), font_name),
        ('FONTSIZE', (0, 0), (-1, 0), 12),
        ('FONTSIZE', (0, 1), (-1, -1), 11),
        ('BOTTOMPADDING', (0, 0), (-1, 0), 12),
        ('BACKGROUND', (0, 1), (-1, -1), colors.beige),
        ('GRID', (0, 0), (-1, -1), 1, colors.black)
    ]))
    
    story.append(weekly_table)
    story.append(Spacer(1, 20))
    
    # カテゴリ別
    story.append(Paragraph("Tasks by Category", styles['Heading2']))
    story.append(Spacer(1, 10))
    
    cat_data = [['Category', 'Count']]
    for cat, count in stats['categories'].items():
        cat_data.append([cat, str(count)])
    
    cat_table = Table(cat_data, colWidths=[80*mm, 50*mm])
    cat_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), colors.grey),
        ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
        ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
        ('FONTNAME', (0, 0), (-1, 0), font_name),
        ('FONTNAME', (0, 1), (-1, -1), font_name),
        ('FONTSIZE', (0, 0), (-1, 0), 12),
        ('FONTSIZE', (0, 1), (-1, -1), 11),
        ('BOTTOMPADDING', (0, 0), (-1, 0), 12),
        ('BACKGROUND', (0, 1), (-1, -1), colors.beige),
        ('GRID', (0, 0), (-1, -1), 1, colors.black)
    ]))
    
    story.append(cat_table)
    doc.build(story)
    return filename
