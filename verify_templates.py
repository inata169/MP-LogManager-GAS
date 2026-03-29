from models import TemplateManager

def test_template_manager():
    tm = TemplateManager()
    templates = tm.get_all_templates()
    print(f"Total templates: {len(templates)}")
    
    for t in templates:
        print(f"Template: {t['name']} -> Title: {t['title']}")
        
    # Check specific template
    morning_qa = tm.get_template_by_name("毎朝QA (Morning QA)")
    if morning_qa and morning_qa['priority'] == 'High':
        print("Verification SUCCESS: Morning QA template found with correct priority.")
    else:
        print("Verification FAILED: Morning QA template error.")

if __name__ == "__main__":
    test_template_manager()
