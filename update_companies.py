import re

file_path = r"c:\EasyJobs_FullStack_Project\companies.html"
with open(file_path, "r", encoding="utf-8") as f:
    content = f.read()

# Pattern to find company card parts
# We look for <div class="company-logo">...</div> ... <h3>Name</h3>
# This requires a regex that spans multiple lines.

def replace_logo(match):
    full_match = match.group(0)
    logo_div = match.group(1)
    company_name = match.group(2)
    
    # Check if we have a logo for this company
    # Filenames are lowercase, e.g. google.svg
    # specialized handling for names with extra words if needed, but my generator used name[0] from list.
    # The generator list: Google, Microsoft, Amazon, etc.
    # So "TCS" -> tcs.svg
    # "HCL Technologies" -> hcl.svg ??? No, generator list had "HCL". The html has "HCL Technologies".
    
    # Mapping for complex names
    name_map = {
        "HCL Technologies": "hcl",
        "BYJU'S": "byjus"
    }
    
    clean_name = name_map.get(company_name, company_name.split()[0].lower())
    clean_name = clean_name.replace("'", "").lower()

    # Construct image tag
    img_tag = f'<img src="/assets/images/companies/{clean_name}.svg" alt="{company_name} Logo" class="company-logo-img">'
    
    # Replace the logo div with the image tag
    return full_match.replace(logo_div, img_tag)

# Regex explanation:
# (<div class="company-logo">.*?</div>)  -> group 1: the logo div
# \s*                                    -> whitespace
# <div class="company-info">\s*          -> start of info
# <h3>(.*?)</h3>                         -> group 2: company name
pattern = re.compile(r'(<div class="company-logo">.*?</div>)\s*<div class="company-info">\s*<h3>(.*?)</h3>', re.DOTALL)

new_content = pattern.sub(replace_logo, content)

with open(file_path, "w", encoding="utf-8") as f:
    f.write(new_content)

print("Updated companies.html with logo images.")
