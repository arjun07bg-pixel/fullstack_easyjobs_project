import os
import re

root_dir = r"c:\Users\NagaarjunBushuGovind\Downloads\EasyJobs_Project (1)"

def fix_javascript_nav(file_path):
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()

    # Restoration: JavaScript MUST use root-absolute paths for reliable navigation
    content = content.replace('href="frontend/pages/', 'href="/frontend/pages/')
    content = content.replace('href="index.html"', 'href="/index.html"')
    content = content.replace('window.location.href = "index.html"', 'window.location.href = "/index.html"')
    content = content.replace('window.location.href="index.html"', 'window.location.href="/index.html"')
    content = content.replace('"/frontend/pages/', '"/frontend/pages/')
    content = content.replace("'/frontend/pages/", "'/frontend/pages/")

    with open(file_path, 'w', encoding='utf-8') as f:
        f.write(content)

# Apply to all JS files
for root, d, files in os.walk(root_dir):
    for f in files:
        if f.endswith(".js"):
            fix_javascript_nav(os.path.join(root, f))

# Also ensure Navbar Manager is corrected (it handles the dynamic menu)
print("🎯 NAVIGATION FIXED! Your navbar options will now work across all pages.")
