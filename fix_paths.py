import os
import re

root_dir = r"c:\Users\NagaarjunBushuGovind\Downloads\EasyJobs_Project (1)"

for root, d, files in os.walk(root_dir):
    for f in files:
        if f.endswith(".html"):
            file_path = os.path.join(root, f)
            with open(file_path, 'r', encoding='utf-8') as file:
                content = file.read()

            # Determine depth for root index.css
            rel_dir = os.path.relpath(os.path.dirname(file_path), root_dir).replace("\\", "/")
            
            if rel_dir == ".": 
                # Root index.html
                c_pre = ""
                s_pre = "frontend/"
            elif rel_dir == "frontend/pages":
                c_pre = "../../"
                s_pre = "../"
            elif rel_dir == "frontend/pages/top-companies":
                c_pre = "../../../"
                s_pre = "../../"
            else:
                continue

            # 🛠️ APPLY FIXED PATHS
            # 1. index.css is now in ROOT
            content = re.sub(r'href=["\'].*?index\.css["\']', f'href="{c_pre}index.css"', content)
            
            # 2. Other styles are still in frontend/styles/
            content = re.sub(r'href=["\'](?:.*?/)global_font\.css["\']', f'href="{s_pre}styles/global_font.css"', content)
            content = re.sub(r'href=["\'](?:.*?/)jobs\.css["\']', f'href="{s_pre}styles/jobs.css"', content)
            content = re.sub(r'href=["\'](?:.*?/)top-companies_style\.css["\']', f'href="{s_pre}styles/top-companies_style.css"', content)
            
            # 3. Inter-page links (already fixed but double checking)
            if rel_dir == ".":
                content = content.replace('href="/frontend/pages/', 'href="frontend/pages/')
            elif rel_dir == "frontend/pages":
                content = content.replace('href="/frontend/pages/', 'href="')

            with open(file_path, 'w', encoding='utf-8') as file:
                file.write(content)

print("🎯 ROOT-STYLE SYNC COMPLETE! All pages fixed to find index.css in the root.")
