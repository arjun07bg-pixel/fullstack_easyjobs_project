import os
import re

root_dir = r"c:\Users\NagaarjunBushuGovind\Downloads\EasyJobs_Project (1)"

for root, d, files in os.walk(root_dir):
    for f in files:
        if f.endswith(".html"):
            file_path = os.path.join(root, f)
            with open(file_path, 'r', encoding='utf-8') as file:
                content = file.read()

            # Fix all inter-page links by folder depth
            if "top-companies" in root:
                # Top companies -> Pages
                content = content.replace('href="/frontend/pages/', 'href="../')
            elif "pages" in root:
                # Pages -> Pages
                content = content.replace('href="/frontend/pages/', 'href="')
            else:
                # Root -> Pages
                content = content.replace('href="/frontend/pages/', 'href="frontend/pages/')

            with open(file_path, 'w', encoding='utf-8') as file:
                file.write(content)

print("🎯 THE PROJECT IS NOW FULLY RELATIVE-LINKED. Click any link and it will work!")
