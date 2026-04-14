import os
import re

directory = r'c:\Users\NagaarjunBushuGovind\Downloads\EasyJobs_Project (1)\frontend\pages'

for filename in os.listdir(directory):
    if filename.endswith('.html'):
        path = os.path.join(directory, filename)
        with open(path, 'r', encoding='utf-8') as f:
            content = f.read()
        
        # 1. Replace absolute links with relative ones
        new_content = content.replace('/frontend/pages/', './')
        
        # 2. Fix broken script tags (missing src or extra quotes)
        # Handle cases like <script ../../javascript/index.js"></script>
        new_content = re.sub(r'<script\s+(?!src=)(\.\./(javascript|styles)/)', r'<script src="\1', new_content)
        
        # Handle cases like <script src="../javascript/index.js""></script>
        new_content = new_content.replace('""', '"')
        
        # 3. Fix category cards specifically if they still use /frontend/pages/ (with trailing space sometimes)
        new_content = new_content.replace('href="/frontend/pages/', 'href="./')
        
        if new_content != content:
            with open(path, 'w', encoding='utf-8') as f:
                f.write(new_content)
            print(f'Updated {filename}')
