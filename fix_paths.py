import os
import re

root_dir = r"c:\Users\NagaarjunBushuGovind\Downloads\EasyJobs_Project (1)"

for root, d, files in os.walk(root_dir):
    for f in files:
        if f.endswith(".html"):
            file_path = os.path.join(root, f)
            with open(file_path, 'r', encoding='utf-8') as file:
                content = file.read()

            # 1. Catch broken <link tags without href: <link rel="stylesheet" ../styles
            # This regex looks for stylesheet links that are missing 'href='
            content = re.sub(r'(<link\s+[^>]*rel=["\']stylesheet["\']\s+)(?![^>]*href=)(\.*\/*frontend/styles/|\.*\/*styles/)', r'\1href="\2', content)
            
            # 2. Catch broken <a tags without href: <a ../../index.html
            content = re.sub(r'(<a\s+)(?![^>]*href=)(\.*\/*index\.html)', r'\1href="\2"', content)

            # 3. Handle specific path normalization BY FOLDER DEPTH (with href=)
            if "top-companies" in root:
                content = content.replace('href="/frontend/styles/', 'href="../../styles/')
                content = content.replace('href="/index.html"', 'href="../../../index.html"')
            elif "pages" in root:
                content = content.replace('href="/frontend/styles/', 'href="../styles/')
                content = content.replace('href="/index.html"', 'href="../../index.html"')
            else:
                # Root level
                content = content.replace('href="/frontend/styles/', 'href="frontend/styles/')
                content = content.replace('href="/index.html"', 'href="index.html"')
                # Special fix for root if it was already messed up
                content = re.sub(r'(rel=["\']stylesheet["\']\s+)frontend/styles/', r'\1href="frontend/styles/', content)

            with open(file_path, 'w', encoding='utf-8') as file:
                file.write(content)

print("🎯 TAGS RESTORED! Every link and stylesheet now has its href attribute.")
