import os
import re

directory = r"c:\EasyJobs_FullStack_Project\frontend\pages"
files = ["IT_software.html", "Engineering.html", "Finance&accounting.html", "sales&marketing.html"]

bookmark_html = """
                    <button class="save-job-btn" onclick="saveJob(201, this)" style="position: absolute; top: 35px; right: 30px; background: none; border: none; color: var(--slate-400); cursor: pointer; font-size: 1.4rem; transition: 0.3s; z-index: 20;">
                        <i class="far fa-bookmark"></i>
                    </button>"""

for filename in files:
    path = os.path.join(directory, filename)
    if not os.path.exists(path):
        print(f"File not found: {path}")
        continue
        
    with open(path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Target: After <div class="job-card-tag">New Post</div>
    # or at the start of <article class="job-card">
    
    def add_bookmark(match):
        job_id = 200 + hash(match.group(0)) % 1000  # Generate pseudo-unique ID
        return match.group(0) + bookmark_html.replace("201", str(job_id))

    # Match <article class="job-card"> followed by tag
    new_content = re.sub(r'(<article class="job-card">[\s\n]*<div class="job-card-tag">[^<]+</div>)', 
                         add_bookmark, 
                         content)
    
    if new_content != content:
        with open(path, 'w', encoding='utf-8') as f:
            f.write(new_content)
        print(f"Updated {filename}")
    else:
        print(f"No changes for {filename}")
