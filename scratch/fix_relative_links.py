import os
import re

directory = r'c:\Users\NagaarjunBushuGovind\Downloads\EasyJobs_Project (1)\frontend\pages'
page_files = [f for f in os.listdir(directory) if f.endswith('.html')]

for filename in page_files:
    path = os.path.join(directory, filename)
    with open(path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # 1. Fix incorrect ../ in links for files in the same directory
    # We look for href="../filename.html" and change it to href="./filename.html"
    # ONLY if filename.html exists in the same directory.
    new_content = content
    for other_page in page_files:
        # Avoid greedy matching by using word boundaries or specific patterns
        pattern = r'href="\.\./' + re.escape(other_page) + r'(\?|")'
        replacement = r'href="./' + other_page + r'\1'
        new_content = re.sub(pattern, replacement, new_content)
    
    # 2. Fix it for index.html as well (it is at ../../index.html)
    # If a page in frontend/pages/ has href="../index.html", it's WRONG. It should be ../../index.html.
    new_content = new_content.replace('href="../index.html"', 'href="../../index.html"')
    
    if new_content != content:
        with open(path, 'w', encoding='utf-8') as f:
            f.write(new_content)
        print(f'Updated links in {filename}')
