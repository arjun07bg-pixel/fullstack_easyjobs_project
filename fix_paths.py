import os
import re

root_dir = r"c:\Users\NagaarjunBushuGovind\Downloads\EasyJobs_Project (1)"

def get_rel_prefix(file_path):
    rel_dir = os.path.relpath(os.path.dirname(file_path), root_dir).replace("\\", "/")
    if rel_dir == ".": return ""
    elif rel_dir == "frontend/pages": return "../"
    elif rel_dir == "frontend/pages/top-companies": return "../../"
    return ""

def fix_html_paths(file_path):
    with open(file_path, 'r', encoding='utf-8') as file:
        content = file.read()

    # STEP 1: RESTORE BROKEN TAGS (If href=" or src=" was missing)
    # Restore <link rel="stylesheet" ...
    content = re.sub(r'(<link\s+[^>]*rel=["\']stylesheet["\']\s+)(?![^>]*href=)(\.*\/*frontend/styles/|\.*\/*styles/)([^"\'>\s]+)', r'\1href="/frontend/styles/\3"', content)
    # Restore <script ...
    content = re.sub(r'(<script\s+)(?![^>]*src=)(\.*\/*frontend/javascript/|\.*\/*javascript/)([^"\'>\s]+)', r'\1src="/frontend/javascript/\3"', content)
    # Restore <a ...
    content = re.sub(r'(<a\s+)(?![^>]*href=)(\.*\/*index\.html|\.*\/*frontend/pages/|\.*\/*pages/)([^"\'>\s]*)', r'\1href="/\2\3"', content)

    # STEP 2: NORMALIZE ALL INTERNAL LINKS TO ROOT-ABSOLUTE (starting with /)
    # Normalize styles
    content = re.sub(r'href=["\']\.*/*frontend/styles/', 'href="/frontend/styles/', content)
    content = re.sub(r'href=["\']\.*/*styles/', 'href="/frontend/styles/', content)
    # Normalize scripts
    content = re.sub(r'src=["\']\.*/*frontend/javascript/', 'src="/frontend/javascript/', content)
    content = re.sub(r'src=["\']\.*/*javascript/', 'src="/frontend/javascript/', content)
    # Normalize pages
    content = re.sub(r'href=["\']\.*/*frontend/pages/', 'href="/frontend/pages/', content)
    content = re.sub(r'href=["\']\.*/*index\.html"', 'href="/index.html"', content)

    # STEP 3: APPLY CORRECT RELATIVE PREFIXES
    prefix = get_rel_prefix(file_path)
    
    # Apply to styles/scripts
    content = content.replace('href="/frontend/styles/', f'href="{prefix}styles/')
    content = content.replace('src="/frontend/javascript/', f'src="{prefix}javascript/')
    content = content.replace('href="/frontend/javascript/', f'href="{prefix}javascript/')
    
    # Apply to internal page links
    if prefix == "": # Root index.html
        content = content.replace('href="/frontend/pages/', 'href="frontend/pages/')
        content = content.replace('href="/index.html"', 'href="index.html"')
    elif prefix == "../": # frontend/pages/
        content = content.replace('href="/frontend/pages/', 'href="')
        content = content.replace('href="/index.html"', 'href="../../index.html"')
    elif prefix == "../../": # top-companies/
        content = content.replace('href="/frontend/pages/', 'href="../')
        content = content.replace('href="/index.html"', 'href="../../../index.html"')

    with open(file_path, 'w', encoding='utf-8') as file:
        file.write(content)

for root, d, files in os.walk(root_dir):
    for f in files:
        if f.endswith(".html"):
            fix_html_paths(os.path.join(root, f))

print("🎯 UNIVERSAL AUDIT COMPLETE! All links are now root-relative and properly formatted.")
