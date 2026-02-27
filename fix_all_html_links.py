
import os
import re

def fix_links_in_html(directory):
    for root, dirs, files in os.walk(directory):
        for file in files:
            if file.endswith(".html"):
                path = os.path.join(root, file)
                with open(path, "r", encoding="utf-8") as f:
                    content = f.read()
                
                # Fix /apply_home.html -> /frontend/pages/apply_home.html
                # Match links that don't already have the prefix
                new_content = re.sub(r'href="/apply_home\.html', r'href="/frontend/pages/apply_home.html', content)
                new_content = re.sub(r"href='/apply_home\.html", r"href='/frontend/pages/apply_home.html", new_content)
                
                # Fix /jobs.html -> /frontend/pages/jobs.html
                new_content = re.sub(r'href="/jobs\.html', r'href="/frontend/pages/jobs.html', new_content)
                new_content = re.sub(r"href='/jobs\.html", r"href='/frontend/pages/jobs.html", new_content)

                # Fix /companies.html -> /frontend/pages/companies.html
                new_content = re.sub(r'href="/companies\.html', r'href="/frontend/pages/companies.html', new_content)
                new_content = re.sub(r"href='/companies\.html", r"href='/frontend/pages/companies.html", new_content)

                # Fix /internship.html -> /frontend/pages/internship.html
                new_content = re.sub(r'href="/internship\.html', r'href="/frontend/pages/internship.html', new_content)
                new_content = re.sub(r"href='/internship\.html", r"href='/frontend/pages/internship.html", new_content)
                
                if content != new_content:
                    print(f"Fixed links in {path}")
                    with open(path, "w", encoding="utf-8") as f:
                        f.write(new_content)

if __name__ == "__main__":
    fix_links_in_html("frontend/pages")
    # Also check index.html in the root
    fix_links_in_html(".")
