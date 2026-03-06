import os
import re

def fix_category_pages():
    pages_dir = r"c:\EasyJobs_FullStack_Project\frontend\pages"
    category_pages = [
        "it_software.html",
        "engineering.html",
        "sales_marketing.html",
        "finance_accounting.html"
    ]
    
    # Mapping for standardized links (old mixed/wrong -> new lowercase)
    link_map = {
        "IT_software.html": "it_software.html",
        "Engineering.html": "engineering.html",
        "Sales&marketing.html": "sales_marketing.html",
        "sales&marketing.html": "sales_marketing.html",
        "Finance&accounting.html": "finance_accounting.html",
        "Finance_accounting.html": "finance_accounting.html"
    }

    for page in category_pages:
        full_path = os.path.join(pages_dir, page)
        if not os.path.exists(full_path):
            print(f"Skipping {page}, not found.")
            continue
            
        print(f"Processing {page}...")
        
        # Read content (handling potential encoding issues)
        try:
            with open(full_path, "r", encoding="utf-8", errors="ignore") as f:
                content = f.read()
        except Exception as e:
            print(f"Error reading {page}: {e}")
            continue

        # 1. Add id="jobs-container" to <section class="job-list">
        if '<section class="job-list">' in content and 'id="jobs-container"' not in content:
            content = content.replace('<section class="job-list">', '<section class="job-list" id="jobs-container">')
            print(f"  Added jobs-container ID to {page}")

        # 2. Fix inconsistent internal links
        for old, new in link_map.items():
            if old in content:
                content = content.replace(old, new)
                print(f"  Fixed link: {old} -> {new}")
                
        # 3. Ensure category_search.js is present (if any script at bottom)
        if "category_search.js" not in content and "</body>" in content:
            # Check for existing scripts and insert category_search.js before </body>
            if 'navbar_manager.js"></script>' in content:
                content = content.replace('navbar_manager.js"></script>', 'navbar_manager.js"></script>\n  <script src="/frontend/javascript/category_search.js"></script>')
            else:
                content = content.replace("</body>", '  <script src="/frontend/javascript/category_search.js"></script>\n</body>')
            print(f"  Ensured category_search.js in {page}")

        # Write back (clean UTF8)
        try:
            with open(full_path, "w", encoding="utf-8") as f:
                f.write(content)
            print(f"  Successfully saved {page}.")
        except Exception as e:
            print(f"Error saving {page}: {e}")

if __name__ == "__main__":
    fix_category_pages()
