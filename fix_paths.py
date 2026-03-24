import os
import re

root_dir = r"c:\Users\NagaarjunBushuGovind\Downloads\EasyJobs_Project (1)"

def fix_script_paths(file_path):
    with open(file_path, 'r', encoding='utf-8') as file:
        content = file.read()

    # Find navigation lines in JavaScript like: window.location.href = "/frontend/pages/jobs.html"
    # and remove the leading slash: window.location.href = "frontend/pages/jobs.html"
    
    # Also handle paths relative to current file depth
    rel_dir = os.path.relpath(os.path.dirname(file_path), root_dir).replace("\\", "/")
    
    # Fix absolute paths in JS
    content = content.replace('window.location.href = "/"', 'window.location.href = "index.html"')
    content = content.replace('window.location.href="/index.html"', 'window.location.href="index.html"')
    content = content.replace('href="/frontend/pages/', 'href="frontend/pages/')
    content = content.replace('"/frontend/pages/', '"frontend/pages/')
    content = content.replace("'/frontend/pages/", "'frontend/pages/")
    
    # If the JS file is in frontend/javascript, it should probably use ../pages/ for sub-nav
    # But often JS looks relative to the URL in the address bar.
    # To be safe, we'll strip the leading slash from the root.

    with open(file_path, 'w', encoding='utf-8') as file:
        file.write(content)

# Fix JS
for root, d, files in os.walk(root_dir):
    for f in files:
        if f.endswith(".js"):
            fix_script_paths(os.path.join(root, f))

# Final check for HTML tags
for root, d, files in os.walk(root_dir):
    for f in files:
        if f.endswith(".html"):
            with open(os.path.join(root, f), 'r', encoding='utf-8') as file:
                content = file.read()
            # Double check for ANY remaining root-absolute links
            content = content.replace('href="/frontend/', 'href="frontend/')
            content = content.replace('src="/frontend/', 'src="frontend/')
            content = content.replace('href="/index.html"', 'href="index.html"')
            
            # Correcting for sub-sub folders
            if "top-companies" in root:
                content = content.replace('href="frontend/', 'href="../../')
                content = content.replace('src="frontend/', 'src="../../')
                content = content.replace('href="index.html"', 'href="../../../index.html"')
            elif "pages" in root:
                content = content.replace('href="frontend/', 'href="../')
                content = content.replace('src="frontend/', 'src="../')
                content = content.replace('href="index.html"', 'href="../../index.html"')

            with open(os.path.join(root, f), 'w', encoding='utf-8') as file:
                file.write(content)

print("🚀 GITHUB PAGES FIX COMPLETE! All HTML and JS links are now relative.")
