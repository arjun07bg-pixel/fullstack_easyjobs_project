import os

companies = [
    ("Google", "#4285F4"),
    ("Microsoft", "#F25022"),
    ("Amazon", "#FF9900"),
    ("TCS", "#000000"),
    ("Flipkart", "#2874F0"),
    ("Infosys", "#007CC3"),
    ("Wipro", "#000000"),
    ("Accenture", "#A100FF"),
    ("IBM", "#054ADA"),
    ("Cognizant", "#0033A0"),
    ("HCL", "#005EB8"),
    ("Deloitte", "#86BC25"),
    ("Paytm", "#00BAF2"),
    ("Zomato", "#CB202D"),
    ("Swiggy", "#FC8019"),
    ("Ola", "#F4F4F4"), # Ola background usually light so text dark
    ("PhonePe", "#6739B7"),
    ("Byjus", "#813588"),
    ("Snapdeal", "#E40046")
]

base_dir = r"c:\EasyJobs_FullStack_Project\assets\images\companies"
if not os.path.exists(base_dir):
    os.makedirs(base_dir)

for name, color in companies:
    filename = os.path.join(base_dir, f"{name.lower()}.svg")
    svg_content = f'''<svg width="100" height="100" xmlns="http://www.w3.org/2000/svg">
      <rect width="100%" height="100%" fill="{color}" rx="15" ry="15"/>
      <text x="50%" y="50%" font-family="Arial" font-size="20" fill="white" text-anchor="middle" dy=".3em">{name[0]}</text>
    </svg>'''
    with open(filename, "w") as f:
        f.write(svg_content)
    print(f"Created {filename}")
