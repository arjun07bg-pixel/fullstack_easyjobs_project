// Utility to get the correct API URL (Port 8000 for Python backend)
const getAPIURL = () => {
    if (window.getEasyJobsAPI) return window.getEasyJobsAPI();
    return "/api"; // Standard fallback
};

document.addEventListener("DOMContentLoaded", async () => {
    const urlParams = new URLSearchParams(window.location.search);
    const jobsContainer = document.getElementById("jobs-container");
    const countText = document.getElementById("jobs-count-text");
    const applyBtn = document.getElementById("applyFiltersBtn");
    const clearBtn = document.getElementById("clearAllBtn");
    const paginationContainer = document.getElementById("pagination-container");

    let currentPage = 1;
    const jobsPerPage = 6;

    // Initialize filters from URL parameters
    const initialKeyword = urlParams.get("keyword") || "";
    const initialLocation = urlParams.get("location") || "";
    const initialType = urlParams.get("type") || "";

    if (initialKeyword) document.getElementById("keyword-search").value = initialKeyword;
    if (initialLocation) document.getElementById("location-search").value = initialLocation;

    // Set initial checkboxes for job type if present in URL
    if (initialType) {
        const typeCheckboxes = document.querySelectorAll('input[name="job_type"]');
        typeCheckboxes.forEach(cb => {
            if (cb.value === initialType) cb.checked = true;
        });
    }

    let currentFilters = {
        keyword: initialKeyword,
        location: initialLocation,
        job_type: initialType ? [initialType] : [],
        work_mode: []
    };

    // Extra Static Jobs to ensure content is always present (increased to 44 jobs for 8 pages)
    const extraJobs = [
        { job_id: 1001, job_title: "Senior Software Engineer", company_name: "TCS", location: "Chennai", experience_level: 3, salary: 12, job_type: "Full Time", work_mode: "Hybrid", description: "Design and develop scalable web applications using modern frameworks. Collaborate with cross-functional teams to deliver high-quality software solutions." },
        { job_id: 1002, job_title: "Data Analyst", company_name: "Infosys", location: "Bangalore", experience_level: 2, salary: 8, job_type: "Full Time", work_mode: "On-site", description: "Analyze complex datasets to provide actionable insights. Skills in SQL, Python, and Tableau required for this high-impact role." },
        { job_id: 1003, job_title: "UX Designer", company_name: "Wipro", location: "Hyderabad", experience_level: 4, salary: 15, job_type: "Full Time", work_mode: "Remote", description: "Create intuitive user experiences for global clients. Proficiency in Figma and Adobe Creative Suite is essential." },
        { job_id: 1004, job_title: "Backend Developer", company_name: "HCL Tech", location: "Noida", experience_level: 3, salary: 10, job_type: "Full Time", work_mode: "Hybrid", description: "Build robust server-side logic and database schemas. Experience with Node.js and PostgreSQL is preferred." },
        { job_id: 1005, job_title: "Full Stack Developer", company_name: "Zoho", location: "Chennai", experience_level: 1, salary: 7, job_type: "Full Time", work_mode: "On-site", description: "Join our core product team to build world-class SaaS applications. Must be comfortable with both frontend and backend technologies." },
        { job_id: 1006, job_title: "Mobile App Developer", company_name: "Freshworks", location: "Chennai", experience_level: 2, salary: 9, job_type: "Full Time", work_mode: "Remote", description: "Develop high-performance iOS and Android applications. Knowledge of Flutter or React Native is a plus." },
        { job_id: 1007, job_title: "Cloud Architect", company_name: "LTIMindtree", location: "Mumbai", experience_level: 5, salary: 22, job_type: "Full Time", work_mode: "Hybrid", description: "Architect and manage AWS/Azure infrastructure for enterprise clients. Strong focus on security and cost-optimization." },
        { job_id: 1008, job_title: "DevOps Engineer", company_name: "Tech Mahindra", location: "Pune", experience_level: 3, salary: 14, job_type: "Full Time", work_mode: "Hybrid", description: "Implement CI/CD pipelines and manage containerized applications using Kubernetes and Docker." },
        { job_id: 1009, job_title: "Cybersecurity Analyst", company_name: "Cognizant", location: "Bangalore", experience_level: 2, salary: 11, job_type: "Full Time", work_mode: "On-site", description: "Protect our clients' digital assets from high-level threats. Experience in network security and ethical hacking is required." },
        { job_id: 1010, job_title: "Product Manager", company_name: "Reliance Jio", location: "Mumbai", experience_level: 5, salary: 25, job_type: "Full Time", work_mode: "On-site", description: "Lead product strategy for next-gen consumer applications. Strong analytical and communication skills are mandatory." },
        { job_id: 1011, job_title: "Software Engineering Intern", company_name: "Google", location: "Bangalore", experience_level: 0, salary: 1, job_type: "Internship", work_mode: "Hybrid", description: "Learn state-of-the-art software development practices. Work on real-world projects with expert mentors." },
        { job_id: 1012, job_title: "Data Science Intern", company_name: "Microsoft", location: "Hyderabad", experience_level: 0, salary: 1, job_type: "Internship", work_mode: "Remote", description: "Apply statistical and machine learning models to real datasets. Assist in data cleaning and analysis." },
        { job_id: 1013, job_title: "Frontend Developer", company_name: "Adobe", location: "Noida", experience_level: 2, salary: 18, job_type: "Full Time", work_mode: "On-site", description: "Work on world-class creative tools. Specialist in React and CSS animations." },
        { job_id: 1014, job_title: "Business Analyst", company_name: "Deloitte", location: "Hyderabad", experience_level: 3, salary: 14, job_type: "Full Time", work_mode: "Hybrid", description: "Translate business requirements into technical specifications for enterprise clients." },
        { job_id: 1015, job_title: "HR Manager", company_name: "Cognizant", location: "Chennai", experience_level: 5, salary: 16, job_type: "Full Time", work_mode: "On-site", description: "Handle talent acquisition and employee relations for a large workforce." },
        { job_id: 1016, job_title: "System Administrator", company_name: "Wipro", location: "Pune", experience_level: 4, salary: 12, job_type: "Full Time", work_mode: "On-site", description: "Manage server infrastructure, network security, and user access controls." },
        { job_id: 1017, job_title: "Marketing Specialist", company_name: "HubSpot", location: "Remote", experience_level: 2, salary: 11, job_type: "Full Time", work_mode: "Remote", description: "Drive inbound marketing campaigns and manage social media presence." },
        { job_id: 1018, job_title: "Java Developer", company_name: "Oracle", location: "Bangalore", experience_level: 3, salary: 20, job_type: "Full Time", work_mode: "Hybrid", description: "Contribute to the development of enterprise-level Java applications and cloud services." },
        { job_id: 1019, job_title: "Content Writer", company_name: "Zomato", location: "Gurgaon", experience_level: 1, salary: 6, job_type: "Full Time", work_mode: "On-site", description: "Create engaging content for the app and social media platforms." },
        { job_id: 1020, job_title: "QA Automation Engineer", company_name: "Salesforce", location: "Hyderabad", experience_level: 3, salary: 15, job_type: "Full Time", work_mode: "Hybrid", description: "Develop and execute automated test scripts using Selenium and Java." },
        { job_id: 1021, job_title: "Machine Learning Engineer", company_name: "NVIDIA", location: "Bangalore", experience_level: 4, salary: 30, job_type: "Full Time", work_mode: "On-site", description: "Optimize deep learning models for high-performance computing hardware." },
        { job_id: 1022, job_title: "Project Coordinator", company_name: "Accenture", location: "Mumbai", experience_level: 2, salary: 9, job_type: "Full Time", work_mode: "Hybrid", description: "Ensure timely delivery of projects by coordinating between clients and developers." },
        { job_id: 1023, job_title: "SEO Executive", company_name: "Flipkart", location: "Bangalore", experience_level: 2, salary: 8, job_type: "Full Time", work_mode: "On-site", description: "Improve website rankings and drive organic traffic through advanced SEO strategies." },
        { job_id: 1024, job_title: "Network Security Engineer", company_name: "Cisco", location: "Bangalore", experience_level: 5, salary: 24, job_type: "Full Time", work_mode: "On-site", description: "Protect internal and client networks from sophisticated cyber threats." },
        { job_id: 1025, job_title: "UI Developer", company_name: "Swiggy", location: "Bangalore", experience_level: 2, salary: 13, job_type: "Full Time", work_mode: "On-site", description: "Build high-speed, interactive user interfaces for millions of daily active users." },
        { job_id: 1026, job_title: "Technical Lead", company_name: "Paytm", location: "Noida", experience_level: 7, salary: 35, job_type: "Full Time", work_mode: "Hybrid", description: "Lead a team of engineers to build next-gen fintech solutions." },
        { job_id: 1027, job_title: "Digital Marketing Manager", company_name: "Myntra", location: "Bangalore", experience_level: 5, salary: 22, job_type: "Full Time", work_mode: "On-site", description: "Oversee digital advertising budgets and campaign performance across all channels." },
        { job_id: 1028, job_title: "Sales Executive", company_name: "Byju's", location: "Chennai", experience_level: 1, salary: 7, job_type: "Full Time", work_mode: "On-site", description: "Engage with students and parents to promote our educational products." },
        { job_id: 1029, job_title: "Customer Success Associate", company_name: "ZenDesk", location: "Remote", experience_level: 2, salary: 10, job_type: "Full Time", work_mode: "Remote", description: "Ensure client satisfaction and retention through proactive support." },
        { job_id: 1030, job_title: "Financial Analyst", company_name: "Goldman Sachs", location: "Bangalore", experience_level: 3, salary: 25, job_type: "Full Time", work_mode: "On-site", description: "Provide detailed financial modeling and analysis for investment banking." },
        { job_id: 1031, job_title: "React Native Developer", company_name: "CureFit", location: "Bangalore", experience_level: 2, salary: 14, job_type: "Full Time", work_mode: "Hybrid", description: "Develop and maintain cross-platform mobile applications for health and fitness." },
        { job_id: 1032, job_title: "Graphic Designer", company_name: "Canva", location: "Remote", experience_level: 2, salary: 9, job_type: "Full Time", work_mode: "Remote", description: "Design promotional graphics and templates for global users." },
        { job_id: 1033, job_title: "Social Media Manager", company_name: "Netflix", location: "Mumbai", experience_level: 4, salary: 18, job_type: "Full Time", work_mode: "On-site", description: "Manage brand presence and engagement across Instagram, Twitter, and TikTok." },
        { job_id: 1034, job_title: "PHP Developer", company_name: "BigBasket", location: "Bangalore", experience_level: 3, salary: 11, job_type: "Full Time", work_mode: "On-site", description: "Maintain and upgrade internal tools using PHP and Laravel frameworks." },
        { job_id: 1035, job_title: "Operations Manager", company_name: "Delhivery", location: "Gurgaon", experience_level: 6, salary: 20, job_type: "Full Time", work_mode: "On-site", description: "Streamline logistics and delivery operations across North India." },
        { job_id: 1036, job_title: "Embedded Systems Engineer", company_name: "Samsung", location: "Bangalore", experience_level: 4, salary: 22, job_type: "Full Time", work_mode: "On-site", description: "Develop firmware for next-generation mobile and IoT devices." },
        { job_id: 1037, job_title: "Risk Analyst", company_name: "American Express", location: "Gurgaon", experience_level: 3, salary: 16, job_type: "Full Time", work_mode: "Hybrid", description: "Identify and mitigate credit risk for corporate cardholders." },
        { job_id: 1038, job_title: "Game Artist", company_name: "Ubisoft", location: "Pune", experience_level: 3, salary: 14, job_type: "Full Time", work_mode: "On-site", description: "Create 3D assets and environments for AAA game titles." },
        { job_id: 1039, job_title: "Corporate Trainer", company_name: "NIIT", location: "Chennai", experience_level: 5, salary: 12, job_type: "Full Time", work_mode: "Hybrid", description: "Conduct technical training sessions for corporate employees on new technologies." },
        { job_id: 1040, job_title: "Database Administrator", company_name: "IBM", location: "Hyderabad", experience_level: 5, salary: 19, job_type: "Full Time", work_mode: "On-site", description: "Optimize large-scale DB2 and Oracle databases for banking clients." },
        { job_id: 1041, job_title: "Mobile App Tester", company_name: "Uber", location: "Bangalore", experience_level: 2, salary: 10, job_type: "Full Time", work_mode: "Hybrid", description: "Ensure the highest quality for Uber's passenger and driver apps." },
        { job_id: 1042, job_title: "Legal Associate", company_name: "L&T", location: "Mumbai", experience_level: 4, salary: 15, job_type: "Full Time", work_mode: "On-site", description: "Manage contracts and compliance for infrastructure projects." },
        { job_id: 1043, job_title: "Public Relations Officer", company_name: "Reliance", location: "Mumbai", experience_level: 5, salary: 18, job_type: "Full Time", work_mode: "On-site", description: "Maintain positive media relations and manage corporate communication." },
        { job_id: 1044, job_title: "Architectural Designer", company_name: "Tata Projects", location: "Bangalore", experience_level: 6, salary: 20, job_type: "Full Time", work_mode: "On-site", description: "Design sustainable architectural solutions for large-scale urban projects." },
        { job_id: 1045, job_title: "Blockchain Developer", company_name: "Polygon", location: "Bangalore", experience_level: 3, salary: 28, job_type: "Full Time", work_mode: "Remote", description: "Build scalable Web3 infrastructure and smart contracts." },
        { job_id: 1046, job_title: "Supply Chain Lead", company_name: "Amazon", location: "Mumbai", experience_level: 5, salary: 24, job_type: "Full Time", work_mode: "On-site", description: "Optimize supply chain efficiency for national logistics networks." },
        { job_id: 1047, job_title: "Content Strategist", company_name: "Google", location: "Gurgaon", experience_level: 4, salary: 20, job_type: "Full Time", work_mode: "Hybrid", description: "Develop content strategies for global marketing initiatives." },
        { job_id: 1048, job_title: "AI Research Scientist", company_name: "Microsoft", location: "Bangalore", experience_level: 5, salary: 40, job_type: "Full Time", work_mode: "Remote", description: "Push the boundaries of AI with cutting-edge research in deep learning." },
        { job_id: 1049, job_title: "Financial Controller", company_name: "HSBC", location: "Hyderabad", experience_level: 8, salary: 32, job_type: "Full Time", work_mode: "On-site", description: "Manage financial risk and reporting for corporate banking divisions." },
        { job_id: 1050, job_title: "Sales Director", company_name: "Oracle", location: "Mumbai", experience_level: 10, salary: 45, job_type: "Full Time", work_mode: "Hybrid", description: "Lead the national sales team for enterprise cloud solutions." },
        { job_id: 1051, job_title: "Brand Manager", company_name: "Coca-Cola", location: "Gurgaon", experience_level: 6, salary: 22, job_type: "Full Time", work_mode: "On-site", description: "Drive brand growth and marketing campaigns for landmark beverage lines." },
        { job_id: 1052, job_title: "Video Editor", company_name: "Netflix", location: "Mumbai", experience_level: 3, salary: 12, job_type: "Full Time", work_mode: "Remote", description: "Edit high-quality promotional content for global streaming releases." },
        { job_id: 1053, job_title: "Security Consultant", company_name: "PwC", location: "Bangalore", experience_level: 5, salary: 18, job_type: "Full Time", work_mode: "Hybrid", description: "Provide expert cybersecurity consulting for high-profile clients." },
        { job_id: 1054, job_title: "Cloud Infrastructure Engineer", company_name: "IBM", location: "Chennai", experience_level: 4, salary: 16, job_type: "Full Time", work_mode: "On-site", description: "Build and maintain resilient cloud infrastructure for banking sectors." },
        { job_id: 1055, job_title: "Retail Manager", company_name: "Reliance Retail", location: "Mumbai", experience_level: 5, salary: 14, job_type: "Full Time", work_mode: "On-site", description: "Oversee operations for large-scale retail outlets in urban hubs." },
        { job_id: 1056, job_title: "iOS Developer", company_name: "PhonePe", location: "Bangalore", experience_level: 3, salary: 20, job_type: "Full Time", work_mode: "Hybrid", description: "Enhance the user experience of India's leading digital payments app." },
        { job_id: 1057, job_title: "Public Relations Manager", company_name: "TATA", location: "Mumbai", experience_level: 8, salary: 26, job_type: "Full Time", work_mode: "On-site", description: "Manage the public image and communications of the TATA Group." },
        { job_id: 1058, job_title: "Business Intelligence Lead", company_name: "Walmart", location: "Bangalore", experience_level: 6, salary: 28, job_type: "Full Time", work_mode: "Hybrid", description: "Turn massive data streams into actionable business intelligence." },
        { job_id: 1059, job_title: "E-commerce Specialist", company_name: "Swiggy Instamart", location: "Bangalore", experience_level: 3, salary: 12, job_type: "Full Time", work_mode: "On-site", description: "Scale e-commerce operations for fast-growing grocery delivery services." },
        { job_id: 1060, job_title: "Site Reliability Engineer", company_name: "Atlassian", location: "Remote", experience_level: 4, salary: 35, job_type: "Full Time", work_mode: "Remote", description: "Ensure the reliability and uptime of mission-critical collaboration tools." },
        { job_id: 1061, job_title: "Logistics Coordinator", company_name: "Delhivery", location: "Noida", experience_level: 2, salary: 8, job_type: "Full Time", work_mode: "On-site", description: "Coordinate end-to-end logistics for e-commerce deliveries." },
        { job_id: 1062, job_title: "Technical Architect", company_name: "Accenture", location: "Pune", experience_level: 10, salary: 42, job_type: "Full Time", work_mode: "Hybrid", description: "Design complex software architectures for multi-industry clients." },
        { job_id: 1063, job_title: "Event Manager", company_name: "Paytm Insider", location: "Mumbai", experience_level: 4, salary: 11, job_type: "Full Time", work_mode: "On-site", description: "Organize and promote large-scale digital and physical events." },
        { job_id: 1064, job_title: "Customer Support Manager", company_name: "Lenskart", location: "Gurgaon", experience_level: 5, salary: 13, job_type: "Full Time", work_mode: "On-site", description: "Lead the customer excellence team for a growing lifestyle brand." },
        { job_id: 1065, job_title: "Python Developer", company_name: "Zerodha", location: "Bangalore", experience_level: 3, salary: 25, job_type: "Full Time", work_mode: "Hybrid", description: "Build high-speed trading systems using Python and Go." },
        { job_id: 1066, job_title: "Strategy Analyst", company_name: "Ola Electric", location: "Bangalore", experience_level: 3, salary: 18, job_type: "Full Time", work_mode: "On-site", description: "Perform market analysis to drive the growth of the EV sector." },
        { job_id: 1067, job_title: "VFX Artist", company_name: "Double Negative", location: "Chennai", experience_level: 4, salary: 15, job_type: "Full Time", work_mode: "On-site", description: "Create world-class visual effects for international film releases." },
        { job_id: 1068, job_title: "Talent Acquisition Lead", company_name: "Cognizant", location: "Kolkata", experience_level: 6, salary: 16, job_type: "Full Time", work_mode: "Hybrid", description: "Lead the recruitment drive for specialized technology roles." },
        { job_id: 1069, job_title: "Legal Counsel", company_name: "Adani Group", location: "Ahmedabad", experience_level: 7, salary: 30, job_type: "Full Time", work_mode: "On-site", description: "Manage legal risks and contracts for global energy projects." },
        { job_id: 1070, job_title: "Product Designer", company_name: "Razorpay", location: "Bangalore", experience_level: 4, salary: 22, job_type: "Full Time", work_mode: "Hybrid", description: "Design the simplest checkout experiences for millions of商家." },
        { job_id: 1071, job_title: "Network Engineer", company_name: "Cisco Systems", location: "Bangalore", experience_level: 3, salary: 15, job_type: "Full Time", work_mode: "On-site", description: "Deploy and optimize global network infrastructure." },
        { job_id: 1072, job_title: "Copywriter", company_name: "Ogilvy", location: "Mumbai", experience_level: 3, salary: 10, job_type: "Full Time", work_mode: "Hybrid", description: "Write powerful copy for legendary advertising campaigns." },
        { job_id: 1073, job_title: "System Architect", company_name: "Intel", location: "Hyderabad", experience_level: 8, salary: 38, job_type: "Full Time", work_mode: "On-site", description: "Define the architecture of future high-performance computing chipsets." },
        { job_id: 1074, job_title: "Accountant", company_name: "EY India", location: "Delhi", experience_level: 2, salary: 9, job_type: "Full Time", work_mode: "On-site", description: "Provide audit and tax services for Fortune 500 clients." },
        { job_id: 1075, job_title: "Operations Lead", company_name: "Dunzo", location: "Bangalore", experience_level: 4, salary: 14, job_type: "Full Time", work_mode: "On-site", description: "Manage hyper-local delivery operations in a fast-paced environment." },
        { job_id: 1076, job_title: "Software Engineer - C++", company_name: "MathWorks", location: "Bangalore", experience_level: 3, salary: 18, job_type: "Full Time", work_mode: "Hybrid", description: "Develop scientific computing tools used by engineers worldwide." },
        { job_id: 1077, job_title: "Marketing Coordinator", company_name: "Red Bull", location: "Mumbai", experience_level: 2, salary: 7, job_type: "Full Time", work_mode: "On-site", description: "Execute field marketing and event sponsorship programs." },
        { job_id: 1078, job_title: "Solutions Architect", company_name: "Salesforce", location: "Hyderabad", experience_level: 6, salary: 30, job_type: "Full Time", work_mode: "Remote", description: "Help enterprise customers digitally transform using the Salesforce platform." },
        { job_id: 1079, job_title: "Head of Marketing", company_name: "Boat Lifestyle", location: "Delhi", experience_level: 10, salary: 50, job_type: "Full Time", work_mode: "On-site", description: "Lead the marketing strategy for India's #1 wearable brand." },
        { job_id: 1080, job_title: "Junior Data Scientist", company_name: "Fractal Analytics", location: "Mumbai", experience_level: 1, salary: 10, job_type: "Full Time", work_mode: "Hybrid", description: "Learn to build enterprise-grade AI solutions for retail leaders." },
        { job_id: 1081, job_title: "Scrum Master", company_name: "L&T Infotech", location: "Pune", experience_level: 5, salary: 16, job_type: "Full Time", work_mode: "Hybrid", description: "Facilitate agile transformation for high-performance software teams." },
        { job_id: 1082, job_title: "Civil Engineer", company_name: "Shapoorji Pallonji", location: "Mumbai", experience_level: 4, salary: 12, job_type: "Full Time", work_mode: "On-site", description: "Engineer the future of urban infrastructure and landmark towers." },
        { job_id: 1083, job_title: "Pharmacist", company_name: "Apollo Pharmacy", location: "Chennai", experience_level: 2, salary: 5, job_type: "Full Time", work_mode: "On-site", description: "Ensure the safe and efficient delivery of life-saving medical supplies." },
        { job_id: 1084, job_title: "App Support Developer", company_name: "Capgemini", location: "Hyderabad", experience_level: 3, salary: 11, job_type: "Full Time", work_mode: "Hybrid", description: "Support and optimize mission-critical applications for global banks." },
        { job_id: 1085, job_title: "Creative Director", company_name: "Dentsu", location: "Kochi", experience_level: 12, salary: 40, job_type: "Full Time", work_mode: "Hybrid", description: "Visionary lead for national award-winning creative campaigns." },
        { job_id: 1086, job_title: "Quality Controller", company_name: "ITC", location: "Kolkata", experience_level: 4, salary: 10, job_type: "Full Time", work_mode: "On-site", description: "Ensure the highest standards for flagship consumer goods." },
        { job_id: 1087, job_title: "Web Designer", company_name: "Shopify", location: "Remote", experience_level: 3, salary: 15, job_type: "Full Time", work_mode: "Remote", description: "Empower entrepreneurs by designing world-class e-commerce themes." },
        { job_id: 1088, job_title: "Database Specialist", company_name: "MongoDB", location: "Gurgaon", experience_level: 5, salary: 28, job_type: "Full Time", work_mode: "Remote", description: "Expert consulting on modern NoSQL database architectures." },
        { job_id: 1089, job_title: "Relationship Manager", company_name: "HDFC Bank", location: "Coimbatore", experience_level: 3, salary: 8, job_type: "Full Time", work_mode: "On-site", description: "Build and maintain relationships with high-net-worth individuals." },
        { job_id: 1090, job_title: "Robotics Programmer", company_name: "ABB", location: "Bangalore", experience_level: 4, salary: 22, job_type: "Full Time", work_mode: "Hybrid", description: "Program complex industrial robots for automated manufacturing lines." },
        { job_id: 1091, job_title: "Research Intern - Physics", company_name: "ISRO", location: "Trivandrum", experience_level: 0, salary: 1, job_type: "Internship", work_mode: "On-site", description: "Support the next generation of space exploration research." },
        { job_id: 1092, job_title: "Market Researcher", company_name: "Kantar", location: "Bangalore", experience_level: 2, salary: 9, job_type: "Full Time", work_mode: "Hybrid", description: "Decode consumer behavior for the world's leading brands." },
        { job_id: 1093, job_title: "Mechanical Engineer", company_name: "TATA Motors", location: "Jamshedpur", experience_level: 3, salary: 11, job_type: "Full Time", work_mode: "On-site", description: "Innovate the future of commercial and passenger vehicle engineering." },
        { job_id: 1094, job_title: "Financial Accountant", company_name: "State Street", location: "Hyderabad", experience_level: 4, salary: 13, job_type: "Full Time", work_mode: "On-site", description: "Manage global investment accounts and regulatory reporting." },
        { job_id: 1095, job_title: "Hardware Engineer", company_name: "Qualcomm", location: "Bangalore", experience_level: 5, salary: 32, job_type: "Full Time", work_mode: "On-site", description: "Design the chipsets that power the world's most advanced smartphones." },
        { job_id: 1096, job_title: "Cloud Sales Lead", company_name: "AWS India", location: "Mumbai", experience_level: 8, salary: 45, job_type: "Full Time", work_mode: "Hybrid", description: "Lead cloud adoption for India's largest enterprise organizations." },
        { job_id: 1097, job_title: "Senior Android Developer", company_name: "Paytm", location: "Noida", experience_level: 5, salary: 22, job_type: "Full Time", work_mode: "Hybrid", description: "Design and build advanced applications for the Android platform. Impact millions of users." },
        { job_id: 1098, job_title: "ML Ops Engineer", company_name: "Uber", location: "Bangalore", experience_level: 4, salary: 30, job_type: "Full Time", work_mode: "On-site", description: "Build and maintain scalable machine learning pipelines and infrastructure for Uber's global services." },
        { job_id: 1099, job_title: "UI/UX Designer", company_name: "Myntra", location: "Bangalore", experience_level: 3, salary: 18, job_type: "Full Time", work_mode: "On-site", description: "Create delightful and intuitive shopping experiences for fashion enthusiasts across India." },
        { job_id: 1100, job_title: "Site Engineer", company_name: "DLF", location: "Delhi", experience_level: 2, salary: 10, job_type: "Full Time", work_mode: "On-site", description: "Supervise construction activities and ensure adherence to safety and quality standards on-site." },
        { job_id: 1101, job_title: "Finance Manager", company_name: "JP Morgan", location: "Mumbai", experience_level: 6, salary: 28, job_type: "Full Time", work_mode: "On-site", description: "Manage financial planning, risk analysis, and corporate reporting for global banking operations." },
        { job_id: 1102, job_title: "Content Creator", company_name: "Swiggy", location: "Bangalore", experience_level: 1, salary: 7, job_type: "Full Time", work_mode: "On-site", description: "Develop engaging content for social media and in-app marketing campaigns." },
        { job_id: 1103, job_title: "Security Architect", company_name: "Cisco", location: "Pune", experience_level: 7, salary: 35, job_type: "Full Time", work_mode: "Hybrid", description: "Design secure network architectures and implement advanced threat protection systems." },
        { job_id: 1104, job_title: "HR Specialist", company_name: "HCL", location: "Chennai", experience_level: 3, salary: 12, job_type: "Full Time", work_mode: "On-site", description: "Manage talent acquisition and employee engagement programs for large-scale IT departments." },
        { job_id: 1105, job_title: "Sales Manager", company_name: "Byju's", location: "Hyderabad", experience_level: 4, salary: 15, job_type: "Full Time", work_mode: "On-site", description: "Lead the sales team to achieve targets for revolutionary education products." },
        { job_id: 1106, job_title: "Customer Support", company_name: "Zomato", location: "Gurgaon", experience_level: 1, salary: 6, job_type: "Full Time", work_mode: "On-site", description: "Provide world-class support to our restaurant partners and customers." },
        { job_id: 1107, job_title: "Data Engineer", company_name: "Flipkart", location: "Bangalore", experience_level: 3, salary: 20, job_type: "Full Time", work_mode: "On-site", description: "Build and scale high-performance data pipelines for India's largest e-commerce platform." },
        { job_id: 1108, job_title: "DevSecOps Engineer", company_name: "Atlassian", location: "Remote", experience_level: 5, salary: 32, job_type: "Full Time", work_mode: "Remote", description: "Integrate security into the CI/CD pipeline and maintain high standards of infrastructure protection." },
        { job_id: 1109, job_title: "Project Head", company_name: "L&T", location: "Mumbai", experience_level: 10, salary: 45, job_type: "Full Time", work_mode: "On-site", description: "Over-see massive infrastructure projects from inception to completion." },
        { job_id: 1110, job_title: "Test Engineer", company_name: "Infosys", location: "Pune", experience_level: 2, salary: 8, job_type: "Full Time", work_mode: "On-site", description: "Conduct manual and automated testing to ensure the highest quality for global software projects." },
        { job_id: 1111, job_title: "Backend Lead", company_name: "PhonePe", location: "Bangalore", experience_level: 6, salary: 38, job_type: "Full Time", work_mode: "Hybrid", description: "Lead the development of high-availability backend systems for digital payments." },
        { job_id: 1112, job_title: "Marketing Lead", company_name: "Nykaa", location: "Mumbai", experience_level: 5, salary: 24, job_type: "Full Time", work_mode: "On-site", description: "Drive brand growth and marketing strategy for the leading beauty e-commerce platform." },
        { job_id: 1113, job_title: "Supply Chain Manager", company_name: "Reliance Retail", location: "Mumbai", experience_level: 4, salary: 16, job_type: "Full Time", work_mode: "On-site", description: "Optimize national logistics and warehouse operations for retail scalability." },
        { job_id: 1114, job_title: "Business Analyst", company_name: "Deloitte", location: "Hyderabad", experience_level: 3, salary: 14, job_type: "Full Time", work_mode: "Hybrid", description: "Provide strategic insights and technical analysis for enterprise consulting projects." },
        { job_id: 1115, job_title: "Graphic Artist", company_name: "Adobe", location: "Noida", experience_level: 2, salary: 11, job_type: "Full Time", work_mode: "On-site", description: "Design revolutionary creative assets for global software product lines." },
        { job_id: 1116, job_title: "Java Architect", company_name: "TCS", location: "Chennai", experience_level: 8, salary: 30, job_type: "Full Time", work_mode: "On-site", description: "Design complex, high-scale Java architectures for international banking clients." },
        { job_id: 1117, job_title: "Python Developer", company_name: "Zoho", location: "Chennai", experience_level: 3, salary: 15, job_type: "Full Time", work_mode: "On-site", description: "Build scalable SaaS backend systems using Python and Django." },
        { job_id: 1118, job_title: "Node.js Developer", company_name: "Freshworks", location: "Chennai", experience_level: 2, salary: 13, job_type: "Full Time", work_mode: "Hybrid", description: "Help build modern customer engagement software using Node.js and AWS." },
        { job_id: 1119, job_title: "Cloud Specialist", company_name: "Azure India", location: "Bangalore", experience_level: 5, salary: 28, job_type: "Full Time", work_mode: "Hybrid", description: "Advise enterprise clients on cloud migration and cloud-native architecture." },
        { job_id: 1120, job_title: "Research Intern", company_name: "DRDO", location: "Hyderabad", experience_level: 0, salary: 1, job_type: "Internship", work_mode: "On-site", description: "Support critical defense research programs under expert guidance." },
        { job_id: 1121, job_title: "QA Analyst", company_name: "Swiggy", location: "Bangalore", experience_level: 2, salary: 9, job_type: "Full Time", work_mode: "On-site", description: "Test mobile and web applications to maintain seamless delivery experiences." },
        { job_id: 1122, job_title: "Brand Strategist", company_name: "Coca-Cola", location: "Gurgaon", experience_level: 5, salary: 22, job_type: "Full Time", work_mode: "On-site", description: "Develop marketing strategies for iconic global beverage brands." },
        { job_id: 1123, job_title: "Game Designer", company_name: "Ubisoft", location: "Pune", experience_level: 3, salary: 16, job_type: "Full Time", work_mode: "On-site", description: "Design levels and gameplay mechanics for world-renowned AAA titles." },
        { job_id: 1124, job_title: "Network Admin", company_name: "Wipro", location: "Bangalore", experience_level: 4, salary: 12, job_type: "Full Time", work_mode: "On-site", description: "Manage internal networks and ensure zero downtime for global business units." },
        { job_id: 1125, job_title: "Legal Head", company_name: "Adani", location: "Ahmedabad", experience_level: 12, salary: 55, job_type: "Full Time", work_mode: "On-site", description: "Lead the corporate legal department for global energy and infrastructure projects." },
        { job_id: 1126, job_title: "Frontend Lead", company_name: "Razorpay", location: "Bangalore", experience_level: 5, salary: 32, job_type: "Full Time", work_mode: "Hybrid", description: "Lead the frontend engineering team for India's leading payment gateway." },
        { job_id: 1127, job_title: "Product Designer", company_name: "CRED", location: "Bangalore", experience_level: 4, salary: 28, job_type: "Full Time", work_mode: "On-site", description: "Design world-class experiences for high-trust financial products." },
        { job_id: 1128, job_title: "Data Scientist", company_name: "Ola", location: "Bangalore", experience_level: 3, salary: 22, job_type: "Full Time", work_mode: "On-site", description: "Use data science to solve complex logistics and transportation problems." },
        { job_id: 1129, job_title: "Site Reliability Engineer", company_name: "Google", location: "Hyderabad", experience_level: 4, salary: 40, job_type: "Full Time", work_mode: "Hybrid", description: "Ensure the reliability and performance of Google's global infra." },
        { job_id: 1130, job_title: "Operations Lead", company_name: "Dunzo", location: "Bangalore", experience_level: 3, salary: 12, job_type: "Full Time", work_mode: "On-site", description: "Lead hyper-local delivery operations for major urban clusters." },
        { job_id: 1131, job_title: "Embedded Developer", company_name: "Samsung", location: "Bangalore", experience_level: 4, salary: 20, job_type: "Full Time", work_mode: "On-site", description: "Develop firmware for the next generation of mobile devices." },
        { job_id: 1132, job_title: "Risk Analyst", company_name: "Amex", location: "Gurgaon", experience_level: 3, salary: 16, job_type: "Full Time", work_mode: "Hybrid", description: "Analyze credit risk and protect financial integrity for cardholders." },
        { job_id: 1133, job_title: "Technical Writer", company_name: "Microsoft", location: "Remote", experience_level: 2, salary: 14, job_type: "Full Time", work_mode: "Remote", description: "Document complex cloud technologies for developers worldwide." },
        { job_id: 1134, job_title: "Sales Executive", company_name: "WhiteHat Jr", location: "Mumbai", experience_level: 1, salary: 8, job_type: "Full Time", work_mode: "On-site", description: "Drive growth for online education programs across India." },
        { job_id: 1135, job_title: "Finance Analyst", company_name: "Goldman Sachs", location: "Bangalore", experience_level: 2, salary: 18, job_type: "Full Time", work_mode: "On-site", description: "Support investment banking with high-level financial analysis." },
        { job_id: 1136, job_title: "SEO Specialist", company_name: "Myntra", location: "Bangalore", experience_level: 2, salary: 10, job_type: "Full Time", work_mode: "On-site", description: "Drive organic traffic growth for India's biggest fashion store." },
        { job_id: 1137, job_title: "UI Developer", company_name: "Swiggy", location: "Bangalore", experience_level: 2, salary: 13, job_type: "Full Time", work_mode: "On-site", description: "Build highly responsive web interfaces for food delivery services." },
        { job_id: 1138, job_title: "Backend Developer", company_name: "Paytm", location: "Noida", experience_level: 3, salary: 16, job_type: "Full Time", work_mode: "On-site", description: "Work on mission-critical payment systems using microservices." },
        { job_id: 1139, job_title: "Android Developer", company_name: "Ola", location: "Bangalore", experience_level: 3, salary: 18, job_type: "Full Time", work_mode: "On-site", description: "Help build the future of mobility with advanced Android apps." },
        { job_id: 1140, job_title: "iOS Developer", company_name: "PhonePe", location: "Bangalore", experience_level: 3, salary: 20, job_type: "Full Time", work_mode: "Hybrid", description: "Innovate on high-speed payment experiences for the iOS platform." },
        { job_id: 1141, job_title: "Full Stack Developer", company_name: "Zoho", location: "Chennai", experience_level: 2, salary: 12, job_type: "Full Time", work_mode: "On-site", description: "Develop end-to-end features for top-tier SaaS products." },
        { job_id: 1142, job_title: "DevOps", company_name: "HCL", location: "Noida", experience_level: 4, salary: 15, job_type: "Full Time", work_mode: "On-site", description: "Manage cloud infrastructure and automation for multinational clients." },
        { job_id: 1143, job_title: "Cloud Developer", company_name: "TCS", location: "Mumbai", experience_level: 3, salary: 14, job_type: "Full Time", work_mode: "On-site", description: "Build cloud-native applications for enterprise digital transformation." },
        { job_id: 1144, job_title: "ML Engineer", company_name: "Infosys", location: "Bangalore", experience_level: 3, salary: 18, job_type: "Full Time", work_mode: "On-site", description: "Apply AI to real-world business problems at a global scale." },
        { job_id: 1145, job_title: "Data Analyst", company_name: "Wipro", location: "Hyderabad", experience_level: 2, salary: 10, job_type: "Full Time", work_mode: "On-site", description: "Analyze large datasets to drive better business outcomes." },
        { job_id: 1146, job_title: "UX Designer", company_name: "Tech Mahindra", location: "Pune", experience_level: 3, salary: 14, job_type: "Full Time", work_mode: "On-site", description: "Design simple, effective digital solutions for enterprise users." },
        { job_id: 1147, job_title: "Project Manager", company_name: "Accenture", location: "Mumbai", experience_level: 5, salary: 22, job_type: "Full Time", work_mode: "On-site", description: "Lead delivery teams for complex technology modernization programs." },
        { job_id: 1148, job_title: "System Admin", company_name: "Oracle", location: "Bangalore", experience_level: 4, salary: 16, job_type: "Full Time", work_mode: "On-site", description: "Support global infrastructure for cloud computing leaders." },
        { job_id: 1149, job_title: "HR Manager", company_name: "Cognizant", location: "Chennai", experience_level: 5, salary: 15, job_type: "Full Time", work_mode: "On-site", description: "Handle senior recruitment and talent management for IT sectors." },
        { job_id: 1150, job_title: "Software Developer", company_name: "Reliance Jio", location: "Mumbai", experience_level: 2, salary: 12, job_type: "Full Time", work_mode: "On-site", description: "Work on cutting-edge telecom and 5G software solutions." },
        { job_id: 1151, job_title: "Cyber Security Lead", company_name: "CISCO", location: "Bangalore", experience_level: 8, salary: 42, job_type: "Full Time", work_mode: "On-site", description: "Lead the security architecture and incident response teams for global network infrastructure." },
        { job_id: 1152, job_title: "Cloud Support Engineer", company_name: "AWS India", location: "Hyderabad", experience_level: 2, salary: 14, job_type: "Full Time", work_mode: "Hybrid", description: "Resolve complex technical issues for AWS customers using a wide range of cloud services." },
        { job_id: 1153, job_title: "Digital Strategist", company_name: "HubSpot", location: "Remote", experience_level: 4, salary: 18, job_type: "Full Time", work_mode: "Remote", description: "Develop and implement complex inbound marketing strategies for international corporate clients." },
        { job_id: 1154, job_title: "Senior UX Researcher", company_name: "Canva", location: "Remote", experience_level: 5, salary: 22, job_type: "Full Time", work_mode: "Remote", description: "Conduct deep user research to drive the product roadmap for world-leading design tools." },
        { job_id: 1155, job_title: "Logistics Operations Specialist", company_name: "Amazon India", location: "Mumbai", experience_level: 3, salary: 11, job_type: "Full Time", work_mode: "On-site", description: "Manage large-scale delivery networks and ensure peak operational efficiency in urban hubs." },
        { job_id: 1156, job_title: "Infrastructure Engineer", company_name: "IBM", location: "Chennai", experience_level: 4, salary: 15, job_type: "Full Time", work_mode: "On-site", description: "Maintain and optimize large-scale server environments for banking and finance clients." },
        { job_id: 1157, job_title: "Frontend Developer (React)", company_name: "Razorpay", location: "Bangalore", experience_level: 2, salary: 20, job_type: "Full Time", work_mode: "Hybrid", description: "Build elegant and performant web interfaces for India's best payment experience." },
        { job_id: 1158, job_title: "Content Manager", company_name: "Netflix India", location: "Mumbai", experience_level: 5, salary: 28, job_type: "Full Time", work_mode: "Remote", description: "Oversee the localized content strategy and creative writing for the Indian market." },
        { job_id: 1159, job_title: "Junior Data Analyst", company_name: "Swiggy", location: "Bangalore", experience_level: 1, salary: 9, job_type: "Full Time", work_mode: "On-site", description: "Extract actionable insights from supply and demand data to optimize food delivery times." },
        { job_id: 1160, job_title: "Product Lead", company_name: "CRED", location: "Bangalore", experience_level: 7, salary: 55, job_type: "Full Time", work_mode: "On-site", description: "Drive the vision and execution for high-trust financial products at massive scale." },
        { job_id: 1161, job_title: "AI Engineer", company_name: "OpenAI", location: "Remote", experience_level: 4, salary: 120, job_type: "Full Time", work_mode: "Remote", description: "Develop and fine-tune large language models for global applications." },
        { job_id: 1162, job_title: "Robotics Engineer", company_name: "Tesla India", location: "Pune", experience_level: 5, salary: 45, job_type: "Full Time", work_mode: "On-site", description: "Design robotic systems for automated manufacturing and EV assembly lines." },
        { job_id: 1163, job_title: "Sustainability Consultant", company_name: "Tata Power", location: "Mumbai", experience_level: 3, salary: 18, job_type: "Full Time", work_mode: "Hybrid", description: "Advise on renewable energy integration and carbon footprint reduction strategies." },
        { job_id: 1164, job_title: "Growth Manager", company_name: "Zomato", location: "Gurgaon", experience_level: 5, salary: 30, job_type: "Full Time", work_mode: "On-site", description: "Lead customer acquisition and retention strategies for the food delivery platform." },
        { job_id: 1165, job_title: "iOS Architect", company_name: "Apple", location: "Hyderabad", experience_level: 10, salary: 85, job_type: "Full Time", work_mode: "On-site", description: "Lead the technical architecture for core iOS applications and frameworks." },
        { job_id: 1166, job_title: "Blockchain Architect", company_name: "Polygon", location: "Remote", experience_level: 6, salary: 70, job_type: "Full Time", work_mode: "Remote", description: "Design layer-2 scaling solutions and high-performance smart contract systems." },
        { job_id: 1167, job_title: "Network Lead", company_name: "Reliance Jio", location: "Navi Mumbai", experience_level: 8, salary: 38, job_type: "Full Time", work_mode: "On-site", description: "Manage large-scale 5G core network infrastructure and performance." },
        { job_id: 1168, job_title: "UX Director", company_name: "Flipkart", location: "Bangalore", experience_level: 12, salary: 95, job_type: "Full Time", work_mode: "Hybrid", description: "Shape the future of e-commerce experience for millions of Indian shoppers." },
        { job_id: 1169, job_title: "SpaceTech Engineer", company_name: "Skyroot Aerospace", location: "Hyderabad", experience_level: 4, salary: 28, job_type: "Full Time", work_mode: "On-site", description: "Lead development of propulsion systems for low-earth orbit rocket launches." },
        { job_id: 1170, job_title: "Quant Analyst", company_name: "Zerodha", location: "Bangalore", experience_level: 3, salary: 40, job_type: "Full Time", work_mode: "On-site", description: "Develop mathematical models for risk assessment and algorithmic trading." },
        { job_id: 1171, job_title: "Security Specialist", company_name: "Paytm", location: "Noida", experience_level: 5, salary: 32, job_type: "Full Time", work_mode: "On-site", description: "Conduct depth penetration testing and security audits for fintech applications." },
        { job_id: 1172, job_title: "Content Lead", company_name: "SpotiFy", location: "Mumbai", experience_level: 6, salary: 26, job_type: "Full Time", work_mode: "Hybrid", description: "Lead the podcast and music content strategy for the Indian subcontinent." },
        { job_id: 1173, job_title: "EV Systems Designer", company_name: "Ola Electric", location: "Bangalore", experience_level: 4, salary: 24, job_type: "Full Time", work_mode: "On-site", description: "Design high-efficiency battery management systems for electric scooters." },
        { job_id: 1174, job_title: "Cloud Consultant", company_name: "Google Cloud", location: "Bangalore", experience_level: 5, salary: 50, job_type: "Full Time", work_mode: "Hybrid", description: "Help enterprise clients digitally transform using GCP's advanced data analytics." },
        { job_id: 1175, job_title: "Product Marketing Manager", company_name: "Freshworks", location: "Chennai", experience_level: 5, salary: 24, job_type: "Full Time", work_mode: "Remote", description: "Define product positioning and go-to-market strategies for SaaS platforms." },
        { job_id: 1176, job_title: "Backend Engineer (Go)", company_name: "Swiggy", location: "Bangalore", experience_level: 3, salary: 22, job_type: "Full Time", work_mode: "On-site", description: "Build high-concurrency order management systems using Go and Kafka." },
        { job_id: 1177, job_title: "Operations Director", company_name: "Delhivery", location: "Gurgaon", experience_level: 10, salary: 60, job_type: "Full Time", work_mode: "On-site", description: "Manage national-scale supply chain and automated sorting facilities." },
        { job_id: 1178, job_title: "Lead Game Developer", company_name: "Dream11", location: "Mumbai", experience_level: 6, salary: 55, job_type: "Full Time", work_mode: "Hybrid", description: "Architect real-time multiplayer gaming experiences for millions of users." },
        { job_id: 1179, job_title: "Financial Risk Lead", company_name: "HDFC Bank", location: "Mumbai", experience_level: 8, salary: 45, job_type: "Full Time", work_mode: "On-site", description: "Manage credit risk and regulatory compliance for corporate lending divisions." },
        { job_id: 1180, job_title: "Site Reliability Lead", company_name: "Atlassian", location: "Remote", experience_level: 7, salary: 75, job_type: "Full Time", work_mode: "Remote", description: "Scale global infrastructure for Jira and Confluence with focus on 99.9% uptime." },
        { job_id: 1181, job_title: "Full Stack Intern", company_name: "Meta India", location: "Bangalore", experience_level: 0, salary: 5, job_type: "Internship", work_mode: "Hybrid", description: "Work with the product engineering teams to build social experiences for billions." },
        { job_id: 1182, job_title: "AR/VR Engineer", company_name: "Snap Inc.", location: "Mumbai", experience_level: 3, salary: 45, job_type: "Full Time", work_mode: "On-site", description: "Develop cutting-edge augmented reality lenses and camera experiences for Snapchat." },
        { job_id: 1183, job_title: "Data Privacy Lead", company_name: "WhatsApp", location: "Hyderabad", experience_level: 8, salary: 80, job_type: "Full Time", work_mode: "Hybrid", description: "Oversee data protection and encryption standards for the world's leading messaging app." },
        { job_id: 1184, job_title: "Cloud Security Architect", company_name: "Palo Alto Networks", location: "Bangalore", experience_level: 6, salary: 55, job_type: "Full Time", work_mode: "On-site", description: "Architect zero-trust security solutions for enterprise cloud environments." },
        { job_id: 1185, job_title: "Fintech Product Lead", company_name: "Stripe", location: "Remote", experience_level: 7, salary: 90, job_type: "Full Time", work_mode: "Remote", description: "Lead the expansion of payment infrastructure for internet businesses across Asia." },
        { job_id: 1186, job_title: "Hardware Design Engineer", company_name: "Intel", location: "Bangalore", experience_level: 4, salary: 35, job_type: "Full Time", work_mode: "On-site", description: "Design and verify next-generation processor architectures and chipsets." },
        { job_id: 1187, job_title: "AI Ethics Researcher", company_name: "Anthropic", location: "Remote", experience_level: 5, salary: 110, job_type: "Full Time", work_mode: "Remote", description: "Research and implement safety protocols for large-scale generative AI models." },
        { job_id: 1188, job_title: "Logistics Strategy Lead", company_name: "Blue Dart", location: "Mumbai", experience_level: 6, salary: 28, job_type: "Full Time", work_mode: "On-site", description: "Optimize national air and surface logistics networks for peak e-commerce demand." },
        { job_id: 1189, job_title: "HealthTech Product Manager", company_name: "Practo", location: "Bangalore", experience_level: 4, salary: 32, job_type: "Full Time", work_mode: "Hybrid", description: "Drive the roadmap for digital healthcare solutions connecting millions of patients." },
        { job_id: 1190, job_title: "Agritech Software Lead", company_name: "Ninjacart", location: "Bangalore", experience_level: 5, salary: 26, job_type: "Full Time", work_mode: "On-site", description: "Build tech solutions to modernize the agricultural supply chain from farm to fork." },
        { job_id: 1191, job_title: "EdTech Content Director", company_name: "Unacademy", location: "Bangalore", experience_level: 8, salary: 42, job_type: "Full Time", work_mode: "Hybrid", description: "Over-see the pedagogical content strategy for top-tier competitive exam preparation." },
        { job_id: 1192, job_title: "Game Engine Developer", company_name: "Epic Games", location: "Pune", experience_level: 5, salary: 65, job_type: "Full Time", work_mode: "On-site", description: "Contribute to the development of Unreal Engine and the future of real-time 3D." },
        { job_id: 1193, job_title: "Search Algorithm Lead", company_name: "Microsoft Bing", location: "Hyderabad", experience_level: 7, salary: 75, job_type: "Full Time", work_mode: "Hybrid", description: "Optimize search relevance and AI integration for the next generation of Bing." },
        { job_id: 1194, job_title: "VR/AR UI Designer", company_name: "Unity Technologies", location: "Remote", experience_level: 4, salary: 40, job_type: "Full Time", work_mode: "Remote", description: "Design immersive user interfaces for the world's leading real-time 3D engine." },
        { job_id: 1195, job_title: "Automotive Software Lead", company_name: "Mahindra Electric", location: "Bangalore", experience_level: 6, salary: 32, job_type: "Full Time", work_mode: "On-site", description: "Lead the development of embedded software for next-gen electric vehicle platforms." },
        { job_id: 1196, job_title: "Telecom Policy Manager", company_name: "Airtel India", location: "Gurgaon", experience_level: 8, salary: 35, job_type: "Full Time", work_mode: "On-site", description: "Manage regulatory compliance and spectrum policy for national 5G rollouts." },
        { job_id: 1197, job_title: "E-sports Manager", company_name: "Fnatic India", location: "Mumbai", experience_level: 4, salary: 18, job_type: "Full Time", work_mode: "Hybrid", description: "Manage professional gaming teams and brand partnerships in the Indian market." },
        { job_id: 1198, job_title: "Blockchain Legal Consultant", company_name: "Chainalysis", location: "Remote", experience_level: 6, salary: 50, job_type: "Full Time", work_mode: "Remote", description: "Provide legal expertise on cryptocurrency regulations and financial forensics." },
        { job_id: 1199, job_title: "Venture Capital Analyst", company_name: "Sequoia Capital", location: "Bangalore", experience_level: 3, salary: 55, job_type: "Full Time", work_mode: "On-site", description: "Identify and analyze high-growth technology startups for potential investment." },
        { job_id: 1200, job_title: "Space Operations Specialist", company_name: "ISRO (Contract)", location: "Sriharikota", experience_level: 5, salary: 24, job_type: "Full Time", work_mode: "On-site", description: "Support ground operations for satellite launches and space exploration missions." }
    ];


    async function fetchJobs(page = 1, filters = {}) {
        try {
            const API_BASE_URL = getAPIURL();
            currentPage = page;
            currentFilters = filters;
            const skip = (page - 1) * jobsPerPage;

            if (jobsContainer) {
                jobsContainer.innerHTML = `
                    <div style="text-align: center; padding: 60px 20px; grid-column: 1/-1;">
                        <i class="fas fa-spinner fa-spin" style="font-size: 3rem; color: #2563eb; margin-bottom: 20px;"></i>
                        <h3 style="color: #1e293b; margin-bottom: 10px;">Finding Best Matches...</h3>
                        <p style="color: #64748b;">Curating the latest opportunities for you.</p>
                    </div>`;
            }

            let apiJobs = [];
            try {
                let url = `${API_BASE_URL}/jobs/`;
                const hasFilters = filters.keyword || filters.location || filters.experience_level || filters.job_type || filters.work_mode;

                if (hasFilters) {
                    const params = new URLSearchParams();
                    if (filters.keyword) params.append("keyword", filters.keyword);
                    if (filters.location) params.append("location", filters.location);
                    if (filters.experience_level) params.append("experience_level", filters.experience_level);

                    // Send multiple values correctly for FastAPI List[str]
                    if (filters.job_type && filters.job_type.length > 0) {
                        filters.job_type.forEach(val => params.append("job_type", val));
                    }
                    if (filters.work_mode && filters.work_mode.length > 0) {
                        filters.work_mode.forEach(val => params.append("work_mode", val));
                    }

                    url = `${API_BASE_URL}/filters/jobs?${params.toString()}`;
                }

                const response = await fetch(url);
                if (response.ok) {
                    apiJobs = await response.json();
                }
            } catch (e) {
                console.warn("Backend connection issue, showing local job listings.", e);
            }

            const filteredExtra = extraJobs.filter(j => {
                const q = (filters.keyword || "").toLowerCase().trim();
                const l = (filters.location || "").toLowerCase().trim();
                const qParts = q.split(/\s+/).filter(p => p.length > 0);

                // Match keyword in title, company OR description
                const matchesKey = !q || qParts.every(part =>
                    j.job_title.toLowerCase().includes(part) ||
                    j.company_name.toLowerCase().includes(part) ||
                    j.location.toLowerCase().includes(part) ||
                    (j.description && j.description.toLowerCase().includes(part))
                );

                const matchesLoc = !l || j.location.toLowerCase().includes(l);
                const matchesExp = !filters.experience_level || j.experience_level >= parseInt(filters.experience_level);

                const matchesType = !filters.job_type || filters.job_type.length === 0 || filters.job_type.includes(j.job_type);
                const matchesMode = !filters.work_mode || filters.work_mode.length === 0 || filters.work_mode.includes(j.work_mode);
                return matchesKey && matchesLoc && matchesExp && matchesType && matchesMode;
            });

            // 3. Combine and Paginate
            const allMatching = [...apiJobs, ...filteredExtra];
            const jobsToDisplay = allMatching.slice(skip, skip + jobsPerPage);

            renderJobs(jobsToDisplay);
            renderPagination(allMatching.length);

            if (countText) {
                countText.innerText = `Showing ${allMatching.length} matches`;
            }

        } catch (error) {
            console.error("Error in fetchJobs:", error);
            if (jobsContainer) {
                jobsContainer.innerHTML = `
                <div style="text-align: center; padding: 60px 20px; grid-column: 1/-1;">
                    <i class="fas fa-exclamation-triangle" style="font-size: 3rem; color: #f59e0b; margin-bottom: 20px;"></i>
                    <h3 style="color: #1e293b; margin-bottom: 10px;">Display issue</h3>
                    <p style="color: #64748b;">Something went wrong while displaying jobs. Please refresh.</p>
                    <button onclick="location.reload()" style="margin-top: 20px; padding: 10px 20px; background: #2563eb; color: #fff; border: none; border-radius: 6px; cursor: pointer;">Refresh Page</button>
                </div>`;
            }
        }
    };

    // Move renderJobs outside fetchJobs to be clean
    const renderJobs = (jobs) => {
        jobsContainer.innerHTML = "";
        const user = JSON.parse(localStorage.getItem("user") || "{}");
        const isAdmin = user.user_type === "admin";

        if (jobs.length === 0) {
            countText.innerText = "No jobs found";
            jobsContainer.innerHTML = `<div class="no-jobs">No jobs found matching your criteria.</div>`;
            return;
        }

        // Update count text more professionally
        countText.innerText = `Showing page ${currentPage}`;

        jobs.forEach(job => {
            const card = document.createElement("div");
            card.className = "job-card";
            
            // Mock rating/reviews for extraJobs if they don't have them
            const rating = job.rating || (3.5 + Math.random() * 1.5).toFixed(1);
            const reviews = job.reviews || `${Math.floor(Math.random() * 5000) + 100} Reviews`;

            const getSkillsByTitle = (title) => {
                const t = title.toLowerCase();
                if (t.includes("qa") || t.includes("test") || t.includes("quality")) return ["Selenium", "JIRA", "Automation", "Manual Testing"];
                if (t.includes("engineer") || t.includes("developer")) return ["React", "JavaScript", "TypeScript", "Node.js"];
                if (t.includes("data")) return ["Python", "SQL", "Pandas", "Scikit-Learn"];
                if (t.includes("designer") || t.includes("ux")) return ["Figma", "Adobe XD", "Sketch", "UI Design"];
                if (t.includes("hr") || t.includes("recruitment")) return ["Hiring", "Interviews", "Payroll", "Policy"];
                if (t.includes("manager") || t.includes("lead")) return ["Leadership", "Strategy", "Management", "Operations"];
                if (t.includes("cyber") || t.includes("security")) return ["Ethical Hacking", "Networks", "Firewalls", "SOC"];
                return ["Teamwork", "Problem Solving", "Adaptability"];
            };

            const tags = getSkillsByTitle(job.job_title);
            const tagHtml = tags.map(t => `<span class="tag">${t}</span>`).join("");

            card.innerHTML = `
                <div class="job-card-header">
                    <div style="display: flex; gap: 15px; flex: 1;">
                        <div class="company-logo">${job.company_name ? job.company_name.charAt(0).toUpperCase() : '?'}</div>
                        <div class="job-info">
                            <h3 class="job-title" style="margin:0; font-size:1.25rem;">${job.job_title}</h3>
                            <div class="company-meta" style="display: flex; align-items: center; gap: 10px; margin-top: 5px;">
                                <span class="company-name" style="margin:0;">${job.company_name}</span>
                                <span class="rating" style="background: #f1f5f9; padding: 2px 8px; border-radius: 4px; font-size: 13px; font-weight: 600; color: #475569; display: flex; align-items: center; gap: 4px;">
                                    ${rating} <i class="fas fa-star" style="color: #f59e0b; font-size: 11px;"></i>
                                    <span class="reviews" style="color: #94a3b8; font-weight: 400; font-size: 12px; margin-left: 4px;">(${reviews})</span>
                                </span>
                            </div>
                            <p class="job-location" style="margin-top: 8px; font-size: 13.5px;"><i class="fas fa-map-marker-alt" style="color: #64748b;"></i> ${job.location || 'Remote'}</p>
                        </div>
                    </div>
                </div>

                <div class="job-details" style="display: flex; gap: 15px; margin: 15px 0;">
                    <div class="job-detail-item" style="color: #64748b; font-size: 13.5px;">
                        <i class="fas fa-briefcase" style="margin-right: 5px;"></i> ${job.experience_level !== null ? job.experience_level + '-' + (job.experience_level + 3) + ' Yrs' : '0-2 Yrs'}
                    </div>
                    <div class="job-detail-item" style="color: #64748b; font-size: 13.5px;">
                        <i class="fas fa-indian-rupee-sign" style="margin-right: 5px;"></i> ${job.salary || 'Not Disclosed'} LPA
                    </div>
                </div>

                <div class="job-tags" style="display: flex; gap: 8px; margin: 10px 0; flex-wrap: wrap;">${tagHtml}</div>

                <p class="job-description" style="color: #475569; font-size: 14px; line-height: 1.5; margin: 10px 0;">
                    ${job.description ? job.description.replace(/<[^>]*>/g, '').substring(0, 150) + '...' : "Join our team to work on exciting projects and grow your professional career with us."}
                </p>

                <div class="job-footer" style="display: flex; justify-content: space-between; align-items: center; margin-top: 15px; border-top: 1px solid #f1f5f9; padding-top: 15px;">
                    <span class="posted-time" style="font-size: 12.5px; color: #94a3b8;">Posted Just Now</span>
                    <div style="display: flex; gap: 10px;">
                        ${isAdmin ? `<button class="delete-btn" style="background: #fee2e2; color: #ef4444; border: none; padding: 10px 18px; border-radius: 8px; font-weight: 600; cursor: pointer; transition: 0.2s;" data-id="${job.job_id}"><i class="fas fa-trash-alt"></i> Delete</button>` : ''}
                        <button class="save-btn" data-id="${job.job_id}" style="background: #f8fafc; color: #64748b; border: 1px solid #e2e8f0; padding: 10px 18px; border-radius: 8px; font-weight: 600; cursor: pointer; transition: 0.2s;">💾 Save</button>
                        <a href="./apply_home.html?job_id=${job.job_id}&title=${encodeURIComponent(job.job_title)}&company=${encodeURIComponent(job.company_name)}&location=${encodeURIComponent(job.location)}&type=${encodeURIComponent(job.job_type)}&experience=${encodeURIComponent(job.experience_level)}&desc=${encodeURIComponent(job.description || '')}" class="apply-btn" style="background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%); color: white; padding: 10px 22px; border-radius: 8px; font-weight: 600; text-decoration: none; display: inline-block;">Apply Now</a>
                    </div>
                </div>
            `;

            // Handle Admin Delete
            if (isAdmin) {
                const deleteBtn = card.querySelector(".delete-btn");
                deleteBtn.addEventListener("click", async (e) => {
                    e.preventDefault();
                    if (confirm("Are you sure you want to delete this job?")) {
                        try {
                            const API_BASE_URL = getAPIURL();
                            const res = await fetch(`${API_BASE_URL}/admin/jobs/${job.job_id}`, {
                                method: "DELETE"
                            });
                            if (res.ok) {
                                alert("Job deleted successfully!");
                                card.remove();
                                countText.innerText = countText.innerText.replace(/\d+/, prev => parseInt(prev) - 1);
                            } else {
                                alert("Failed to delete job.");
                            }
                        } catch (err) { alert("Network error."); }
                    }
                });
            }

            // Handle Save Button
            const saveBtn = card.querySelector(".save-btn");
            saveBtn.addEventListener("click", async (e) => {
                e.preventDefault();
                if (!user.user_id) {
                    alert("Please login to save this job.");
                    window.location.href = "./login.html";
                    return;
                }

                try {
                    const API_BASE_URL = getAPIURL();
                    const res = await fetch(`${API_BASE_URL}/saved-jobs/`, {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ user_id: user.user_id, job_id: job.job_id })
                    });

                    if (res.ok) {
                        saveBtn.innerHTML = "✅ Saved";
                        saveBtn.style.color = "#16a34a";
                        saveBtn.disabled = true;
                    } else {
                        const err = await res.json();
                        alert(err.detail || "Already saved or error.");
                    }
                } catch (err) { alert("Network error."); }
            });

            jobsContainer.appendChild(card);
        });
    };

    const renderPagination = (totalJobsCount) => {
        paginationContainer.innerHTML = "";
        const totalPages = Math.ceil(totalJobsCount / jobsPerPage);

        for (let i = 1; i <= totalPages; i++) {
            const pageBox = document.createElement("a");
            pageBox.href = "#";
            pageBox.className = `page-btn ${i === currentPage ? 'active' : ''}`;
            pageBox.innerText = i;

            pageBox.addEventListener("click", (e) => {
                e.preventDefault();
                if (i !== currentPage) {
                    fetchJobs(i, currentFilters);
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                }
            });

            paginationContainer.appendChild(pageBox);
        }
    };

    // Filter Trigger
    if (applyBtn) {
        applyBtn.addEventListener("click", () => {
            const filters = {
                keyword: document.getElementById("keyword-search").value,
                location: document.getElementById("location-search").value,
                experience_level: document.getElementById("exp-select").value,
                job_type: Array.from(document.querySelectorAll('input[name="job_type"]:checked')).map(c => c.value),
                work_mode: Array.from(document.querySelectorAll('input[name="work_mode"]:checked')).map(c => c.value)
            };
            console.log("Applying filters:", filters);
            fetchJobs(1, filters);
        });

        // Add Enter key support
        [document.getElementById("keyword-search"), document.getElementById("location-search")].forEach(input => {
            input?.addEventListener("keypress", (e) => {
                if (e.key === "Enter") applyBtn.click();
            });
        });
    }

    if (clearBtn) {
        clearBtn.addEventListener("click", () => {
            document.getElementById("keyword-search").value = "";
            document.getElementById("location-search").value = "";
            document.getElementById("exp-select").selectedIndex = 0;
            document.querySelectorAll("input[type='checkbox']").forEach(c => c.checked = false);
            fetchJobs(1, {});
        });
    }

    // Initial Load
    fetchJobs(1, currentFilters);
});
