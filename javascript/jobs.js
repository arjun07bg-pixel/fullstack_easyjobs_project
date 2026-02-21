const getBaseURL = () => {
    if (window.location.port !== '8000' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')) {
        return `http://127.0.0.1:8000/api`;
    }
    return "/api";
};
const API_BASE_URL = getBaseURL();

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
        job_type: initialType
    };

    // Extra Static Jobs to ensure content is always present (increased to 44 jobs for 8 pages)
    const extraJobs = [
        { job_id: 1001, job_title: "Senior Software Engineer", company_name: "TCS", location: "Chennai", experience_level: 3, salary: 12, job_type: "Full Time", work_mode: "Hybrid", description: "Design and develop scalable web applications using modern frameworks. Collaborate with cross-functional teams to deliver high-quality software solutions." },
        { job_id: 1002, job_title: "Data Analyst", company_name: "Infosys", location: "Bangalore", experience_level: 2, salary: 8, job_type: "Full Time", work_mode: "Office", description: "Analyze complex datasets to provide actionable insights. Skills in SQL, Python, and Tableau required for this high-impact role." },
        { job_id: 1003, job_title: "UX Designer", company_name: "Wipro", location: "Hyderabad", experience_level: 4, salary: 15, job_type: "Full Time", work_mode: "Remote", description: "Create intuitive user experiences for global clients. Proficiency in Figma and Adobe Creative Suite is essential." },
        { job_id: 1004, job_title: "Backend Developer", company_name: "HCL Tech", location: "Noida", experience_level: 3, salary: 10, job_type: "Full Time", work_mode: "Hybrid", description: "Build robust server-side logic and database schemas. Experience with Node.js and PostgreSQL is preferred." },
        { job_id: 1005, job_title: "Full Stack Developer", company_name: "Zoho", location: "Chennai", experience_level: 1, salary: 7, job_type: "Full Time", work_mode: "Office", description: "Join our core product team to build world-class SaaS applications. Must be comfortable with both frontend and backend technologies." },
        { job_id: 1006, job_title: "Mobile App Developer", company_name: "Freshworks", location: "Chennai", experience_level: 2, salary: 9, job_type: "Full Time", work_mode: "Remote", description: "Develop high-performance iOS and Android applications. Knowledge of Flutter or React Native is a plus." },
        { job_id: 1007, job_title: "Cloud Architect", company_name: "LTIMindtree", location: "Mumbai", experience_level: 5, salary: 22, job_type: "Full Time", work_mode: "Hybrid", description: "Architect and manage AWS/Azure infrastructure for enterprise clients. Strong focus on security and cost-optimization." },
        { job_id: 1008, job_title: "DevOps Engineer", company_name: "Tech Mahindra", location: "Pune", experience_level: 3, salary: 14, job_type: "Full Time", work_mode: "Hybrid", description: "Implement CI/CD pipelines and manage containerized applications using Kubernetes and Docker." },
        { job_id: 1009, job_title: "Cybersecurity Analyst", company_name: "Cognizant", location: "Bangalore", experience_level: 2, salary: 11, job_type: "Full Time", work_mode: "Office", description: "Protect our clients' digital assets from high-level threats. Experience in network security and ethical hacking is required." },
        { job_id: 1010, job_title: "Product Manager", company_name: "Reliance Jio", location: "Mumbai", experience_level: 5, salary: 25, job_type: "Full Time", work_mode: "Office", description: "Lead product strategy for next-gen consumer applications. Strong analytical and communication skills are mandatory." },
        { job_id: 1011, job_title: "Software Engineering Intern", company_name: "Google", location: "Bangalore", experience_level: 0, salary: 1, job_type: "Internship", work_mode: "Hybrid", description: "Learn state-of-the-art software development practices. Work on real-world projects with expert mentors." },
        { job_id: 1012, job_title: "Data Science Intern", company_name: "Microsoft", location: "Hyderabad", experience_level: 0, salary: 1, job_type: "Internship", work_mode: "Remote", description: "Apply statistical and machine learning models to real datasets. Assist in data cleaning and analysis." },
        { job_id: 1013, job_title: "Frontend Developer", company_name: "Adobe", location: "Noida", experience_level: 2, salary: 18, job_type: "Full Time", work_mode: "Office", description: "Work on world-class creative tools. Specialist in React and CSS animations." },
        { job_id: 1014, job_title: "Business Analyst", company_name: "Deloitte", location: "Hyderabad", experience_level: 3, salary: 14, job_type: "Full Time", work_mode: "Hybrid", description: "Translate business requirements into technical specifications for enterprise clients." },
        { job_id: 1015, job_title: "HR Manager", company_name: "Cognizant", location: "Chennai", experience_level: 5, salary: 16, job_type: "Full Time", work_mode: "Office", description: "Handle talent acquisition and employee relations for a large workforce." },
        { job_id: 1016, job_title: "System Administrator", company_name: "Wipro", location: "Pune", experience_level: 4, salary: 12, job_type: "Full Time", work_mode: "On-site", description: "Manage server infrastructure, network security, and user access controls." },
        { job_id: 1017, job_title: "Marketing Specialist", company_name: "HubSpot", location: "Remote", experience_level: 2, salary: 11, job_type: "Full Time", work_mode: "Remote", description: "Drive inbound marketing campaigns and manage social media presence." },
        { job_id: 1018, job_title: "Java Developer", company_name: "Oracle", location: "Bangalore", experience_level: 3, salary: 20, job_type: "Full Time", work_mode: "Hybrid", description: "Contribute to the development of enterprise-level Java applications and cloud services." },
        { job_id: 1019, job_title: "Content Writer", company_name: "Zomato", location: "Gurgaon", experience_level: 1, salary: 6, job_type: "Full Time", work_mode: "Office", description: "Create engaging content for the app and social media platforms." },
        { job_id: 1020, job_title: "QA Automation Engineer", company_name: "Salesforce", location: "Hyderabad", experience_level: 3, salary: 15, job_type: "Full Time", work_mode: "Hybrid", description: "Develop and execute automated test scripts using Selenium and Java." },
        { job_id: 1021, job_title: "Machine Learning Engineer", company_name: "NVIDIA", location: "Bangalore", experience_level: 4, salary: 30, job_type: "Full Time", work_mode: "Office", description: "Optimize deep learning models for high-performance computing hardware." },
        { job_id: 1022, job_title: "Project Coordinator", company_name: "Accenture", location: "Mumbai", experience_level: 2, salary: 9, job_type: "Full Time", work_mode: "Hybrid", description: "Ensure timely delivery of projects by coordinating between clients and developers." },
        { job_id: 1023, job_title: "SEO Executive", company_name: "Flipkart", location: "Bangalore", experience_level: 2, salary: 8, job_type: "Full Time", work_mode: "Office", description: "Improve website rankings and drive organic traffic through advanced SEO strategies." },
        { job_id: 1024, job_title: "Network Security Engineer", company_name: "Cisco", location: "Bangalore", experience_level: 5, salary: 24, job_type: "Full Time", work_mode: "Office", description: "Protect internal and client networks from sophisticated cyber threats." },
        { job_id: 1025, job_title: "UI Developer", company_name: "Swiggy", location: "Bangalore", experience_level: 2, salary: 13, job_type: "Full Time", work_mode: "Office", description: "Build high-speed, interactive user interfaces for millions of daily active users." },
        { job_id: 1026, job_title: "Technical Lead", company_name: "Paytm", location: "Noida", experience_level: 7, salary: 35, job_type: "Full Time", work_mode: "Hybrid", description: "Lead a team of engineers to build next-gen fintech solutions." },
        { job_id: 1027, job_title: "Digital Marketing Manager", company_name: "Myntra", location: "Bangalore", experience_level: 5, salary: 22, job_type: "Full Time", work_mode: "Office", description: "Oversee digital advertising budgets and campaign performance across all channels." },
        { job_id: 1028, job_title: "Sales Executive", company_name: "Byju's", location: "Chennai", experience_level: 1, salary: 7, job_type: "Full Time", work_mode: "On-site", description: "Engage with students and parents to promote our educational products." },
        { job_id: 1029, job_title: "Customer Success Associate", company_name: "ZenDesk", location: "Remote", experience_level: 2, salary: 10, job_type: "Full Time", work_mode: "Remote", description: "Ensure client satisfaction and retention through proactive support." },
        { job_id: 1030, job_title: "Financial Analyst", company_name: "Goldman Sachs", location: "Bangalore", experience_level: 3, salary: 25, job_type: "Full Time", work_mode: "Office", description: "Provide detailed financial modeling and analysis for investment banking." },
        { job_id: 1031, job_title: "React Native Developer", company_name: "CureFit", location: "Bangalore", experience_level: 2, salary: 14, job_type: "Full Time", work_mode: "Hybrid", description: "Develop and maintain cross-platform mobile applications for health and fitness." },
        { job_id: 1032, job_title: "Graphic Designer", company_name: "Canva", location: "Remote", experience_level: 2, salary: 9, job_type: "Full Time", work_mode: "Remote", description: "Design promotional graphics and templates for global users." },
        { job_id: 1033, job_title: "Social Media Manager", company_name: "Netflix", location: "Mumbai", experience_level: 4, salary: 18, job_type: "Full Time", work_mode: "Office", description: "Manage brand presence and engagement across Instagram, Twitter, and TikTok." },
        { job_id: 1034, job_title: "PHP Developer", company_name: "BigBasket", location: "Bangalore", experience_level: 3, salary: 11, job_type: "Full Time", work_mode: "Office", description: "Maintain and upgrade internal tools using PHP and Laravel frameworks." },
        { job_id: 1035, job_title: "Operations Manager", company_name: "Delhivery", location: "Gurgaon", experience_level: 6, salary: 20, job_type: "Full Time", work_mode: "On-site", description: "Streamline logistics and delivery operations across North India." },
        { job_id: 1036, job_title: "Embedded Systems Engineer", company_name: "Samsung", location: "Bangalore", experience_level: 4, salary: 22, job_type: "Full Time", work_mode: "Office", description: "Develop firmware for next-generation mobile and IoT devices." },
        { job_id: 1037, job_title: "Risk Analyst", company_name: "American Express", location: "Gurgaon", experience_level: 3, salary: 16, job_type: "Full Time", work_mode: "Hybrid", description: "Identify and mitigate credit risk for corporate cardholders." },
        { job_id: 1038, job_title: "Game Artist", company_name: "Ubisoft", location: "Pune", experience_level: 3, salary: 14, job_type: "Full Time", work_mode: "Office", description: "Create 3D assets and environments for AAA game titles." },
        { job_id: 1039, job_title: "Corporate Trainer", company_name: "NIIT", location: "Chennai", experience_level: 5, salary: 12, job_type: "Full Time", work_mode: "Hybrid", description: "Conduct technical training sessions for corporate employees on new technologies." },
        { job_id: 1040, job_title: "Database Administrator", company_name: "IBM", location: "Hyderabad", experience_level: 5, salary: 19, job_type: "Full Time", work_mode: "Office", description: "Optimize large-scale DB2 and Oracle databases for banking clients." },
        { job_id: 1041, job_title: "Mobile App Tester", company_name: "Uber", location: "Bangalore", experience_level: 2, salary: 10, job_type: "Full Time", work_mode: "Hybrid", description: "Ensure the highest quality for Uber's passenger and driver apps." },
        { job_id: 1042, job_title: "Legal Associate", company_name: "L&T", location: "Mumbai", experience_level: 4, salary: 15, job_type: "Full Time", work_mode: "Office", description: "Manage contracts and compliance for infrastructure projects." },
        { job_id: 1043, job_title: "Public Relations Officer", company_name: "Reliance", location: "Mumbai", experience_level: 5, salary: 18, job_type: "Full Time", work_mode: "Office", description: "Maintain positive media relations and manage corporate communication." },
        { job_id: 1044, job_title: "Architectural Designer", company_name: "Tata Projects", location: "Bangalore", experience_level: 6, salary: 20, job_type: "Full Time", work_mode: "On-site", description: "Design sustainable architectural solutions for large-scale urban projects." },
        { job_id: 1045, job_title: "Blockchain Developer", company_name: "Polygon", location: "Bangalore", experience_level: 3, salary: 28, job_type: "Full Time", work_mode: "Remote", description: "Build scalable Web3 infrastructure and smart contracts." },
        { job_id: 1046, job_title: "Supply Chain Lead", company_name: "Amazon", location: "Mumbai", experience_level: 5, salary: 24, job_type: "Full Time", work_mode: "Office", description: "Optimize supply chain efficiency for national logistics networks." },
        { job_id: 1047, job_title: "Content Strategist", company_name: "Google", location: "Gurgaon", experience_level: 4, salary: 20, job_type: "Full Time", work_mode: "Hybrid", description: "Develop content strategies for global marketing initiatives." },
        { job_id: 1048, job_title: "AI Research Scientist", company_name: "Microsoft", location: "Bangalore", experience_level: 5, salary: 40, job_type: "Full Time", work_mode: "Remote", description: "Push the boundaries of AI with cutting-edge research in deep learning." },
        { job_id: 1049, job_title: "Financial Controller", company_name: "HSBC", location: "Hyderabad", experience_level: 8, salary: 32, job_type: "Full Time", work_mode: "Office", description: "Manage financial risk and reporting for corporate banking divisions." },
        { job_id: 1050, job_title: "Sales Director", company_name: "Oracle", location: "Mumbai", experience_level: 10, salary: 45, job_type: "Full Time", work_mode: "Hybrid", description: "Lead the national sales team for enterprise cloud solutions." },
        { job_id: 1051, job_title: "Brand Manager", company_name: "Coca-Cola", location: "Gurgaon", experience_level: 6, salary: 22, job_type: "Full Time", work_mode: "Office", description: "Drive brand growth and marketing campaigns for landmark beverage lines." },
        { job_id: 1052, job_title: "Video Editor", company_name: "Netflix", location: "Mumbai", experience_level: 3, salary: 12, job_type: "Full Time", work_mode: "Remote", description: "Edit high-quality promotional content for global streaming releases." },
        { job_id: 1053, job_title: "Security Consultant", company_name: "PwC", location: "Bangalore", experience_level: 5, salary: 18, job_type: "Full Time", work_mode: "Hybrid", description: "Provide expert cybersecurity consulting for high-profile clients." },
        { job_id: 1054, job_title: "Cloud Infrastructure Engineer", company_name: "IBM", location: "Chennai", experience_level: 4, salary: 16, job_type: "Full Time", work_mode: "Office", description: "Build and maintain resilient cloud infrastructure for banking sectors." },
        { job_id: 1055, job_title: "Retail Manager", company_name: "Reliance Retail", location: "Mumbai", experience_level: 5, salary: 14, job_type: "Full Time", work_mode: "On-site", description: "Oversee operations for large-scale retail outlets in urban hubs." },
        { job_id: 1056, job_title: "iOS Developer", company_name: "PhonePe", location: "Bangalore", experience_level: 3, salary: 20, job_type: "Full Time", work_mode: "Hybrid", description: "Enhance the user experience of India's leading digital payments app." },
        { job_id: 1057, job_title: "Public Relations Manager", company_name: "TATA", location: "Mumbai", experience_level: 8, salary: 26, job_type: "Full Time", work_mode: "Office", description: "Manage the public image and communications of the TATA Group." },
        { job_id: 1058, job_title: "Business Intelligence Lead", company_name: "Walmart", location: "Bangalore", experience_level: 6, salary: 28, job_type: "Full Time", work_mode: "Hybrid", description: "Turn massive data streams into actionable business intelligence." },
        { job_id: 1059, job_title: "E-commerce Specialist", company_name: "Swiggy Instamart", location: "Bangalore", experience_level: 3, salary: 12, job_type: "Full Time", work_mode: "Office", description: "Scale e-commerce operations for fast-growing grocery delivery services." },
        { job_id: 1060, job_title: "Site Reliability Engineer", company_name: "Atlassian", location: "Remote", experience_level: 4, salary: 35, job_type: "Full Time", work_mode: "Remote", description: "Ensure the reliability and uptime of mission-critical collaboration tools." },
        { job_id: 1061, job_title: "Logistics Coordinator", company_name: "Delhivery", location: "Noida", experience_level: 2, salary: 8, job_type: "Full Time", work_mode: "On-site", description: "Coordinate end-to-end logistics for e-commerce deliveries." },
        { job_id: 1062, job_title: "Technical Architect", company_name: "Accenture", location: "Pune", experience_level: 10, salary: 42, job_type: "Full Time", work_mode: "Hybrid", description: "Design complex software architectures for multi-industry clients." },
        { job_id: 1063, job_title: "Event Manager", company_name: "Paytm Insider", location: "Mumbai", experience_level: 4, salary: 11, job_type: "Full Time", work_mode: "Office", description: "Organize and promote large-scale digital and physical events." },
        { job_id: 1064, job_title: "Customer Support Manager", company_name: "Lenskart", location: "Gurgaon", experience_level: 5, salary: 13, job_type: "Full Time", work_mode: "Office", description: "Lead the customer excellence team for a growing lifestyle brand." },
        { job_id: 1065, job_title: "Python Developer", company_name: "Zerodha", location: "Bangalore", experience_level: 3, salary: 25, job_type: "Full Time", work_mode: "Hybrid", description: "Build high-speed trading systems using Python and Go." },
        { job_id: 1066, job_title: "Strategy Analyst", company_name: "Ola Electric", location: "Bangalore", experience_level: 3, salary: 18, job_type: "Full Time", work_mode: "Office", description: "Perform market analysis to drive the growth of the EV sector." },
        { job_id: 1067, job_title: "VFX Artist", company_name: "Double Negative", location: "Chennai", experience_level: 4, salary: 15, job_type: "Full Time", work_mode: "Office", description: "Create world-class visual effects for international film releases." },
        { job_id: 1068, job_title: "Talent Acquisition Lead", company_name: "Cognizant", location: "Kolkata", experience_level: 6, salary: 16, job_type: "Full Time", work_mode: "Hybrid", description: "Lead the recruitment drive for specialized technology roles." },
        { job_id: 1069, job_title: "Legal Counsel", company_name: "Adani Group", location: "Ahmedabad", experience_level: 7, salary: 30, job_type: "Full Time", work_mode: "Office", description: "Manage legal risks and contracts for global energy projects." },
        { job_id: 1070, job_title: "Product Designer", company_name: "Razorpay", location: "Bangalore", experience_level: 4, salary: 22, job_type: "Full Time", work_mode: "Hybrid", description: "Design the simplest checkout experiences for millions of商家." },
        { job_id: 1071, job_title: "Network Engineer", company_name: "Cisco Systems", location: "Bangalore", experience_level: 3, salary: 15, job_type: "Full Time", work_mode: "Office", description: "Deploy and optimize global network infrastructure." },
        { job_id: 1072, job_title: "Copywriter", company_name: "Ogilvy", location: "Mumbai", experience_level: 3, salary: 10, job_type: "Full Time", work_mode: "Hybrid", description: "Write powerful copy for legendary advertising campaigns." },
        { job_id: 1073, job_title: "System Architect", company_name: "Intel", location: "Hyderabad", experience_level: 8, salary: 38, job_type: "Full Time", work_mode: "Office", description: "Define the architecture of future high-performance computing chipsets." },
        { job_id: 1074, job_title: "Accountant", company_name: "EY India", location: "Delhi", experience_level: 2, salary: 9, job_type: "Full Time", work_mode: "Office", description: "Provide audit and tax services for Fortune 500 clients." },
        { job_id: 1075, job_title: "Operations Lead", company_name: "Dunzo", location: "Bangalore", experience_level: 4, salary: 14, job_type: "Full Time", work_mode: "On-site", description: "Manage hyper-local delivery operations in a fast-paced environment." },
        { job_id: 1076, job_title: "Software Engineer - C++", company_name: "MathWorks", location: "Bangalore", experience_level: 3, salary: 18, job_type: "Full Time", work_mode: "Hybrid", description: "Develop scientific computing tools used by engineers worldwide." },
        { job_id: 1077, job_title: "Marketing Coordinator", company_name: "Red Bull", location: "Mumbai", experience_level: 2, salary: 7, job_type: "Full Time", work_mode: "Office", description: "Execute field marketing and event sponsorship programs." },
        { job_id: 1078, job_title: "Solutions Architect", company_name: "Salesforce", location: "Hyderabad", experience_level: 6, salary: 30, job_type: "Full Time", work_mode: "Remote", description: "Help enterprise customers digitally transform using the Salesforce platform." },
        { job_id: 1079, job_title: "Head of Marketing", company_name: "Boat Lifestyle", location: "Delhi", experience_level: 10, salary: 50, job_type: "Full Time", work_mode: "Office", description: "Lead the marketing strategy for India's #1 wearable brand." },
        { job_id: 1080, job_title: "Junior Data Scientist", company_name: "Fractal Analytics", location: "Mumbai", experience_level: 1, salary: 10, job_type: "Full Time", work_mode: "Hybrid", description: "Learn to build enterprise-grade AI solutions for retail leaders." },
        { job_id: 1081, job_title: "Scrum Master", company_name: "L&T Infotech", location: "Pune", experience_level: 5, salary: 16, job_type: "Full Time", work_mode: "Hybrid", description: "Facilitate agile transformation for high-performance software teams." },
        { job_id: 1082, job_title: "Civil Engineer", company_name: "Shapoorji Pallonji", location: "Mumbai", experience_level: 4, salary: 12, job_type: "Full Time", work_mode: "On-site", description: "Engineer the future of urban infrastructure and landmark towers." },
        { job_id: 1083, job_title: "Pharmacist", company_name: "Apollo Pharmacy", location: "Chennai", experience_level: 2, salary: 5, job_type: "Full Time", work_mode: "On-site", description: "Ensure the safe and efficient delivery of life-saving medical supplies." },
        { job_id: 1084, job_title: "App Support Developer", company_name: "Capgemini", location: "Hyderabad", experience_level: 3, salary: 11, job_type: "Full Time", work_mode: "Hybrid", description: "Support and optimize mission-critical applications for global banks." },
        { job_id: 1085, job_title: "Creative Director", company_name: "Dentsu", location: "Kochi", experience_level: 12, salary: 40, job_type: "Full Time", work_mode: "Hybrid", description: "Visionary lead for national award-winning creative campaigns." },
        { job_id: 1086, job_title: "Quality Controller", company_name: "ITC", location: "Kolkata", experience_level: 4, salary: 10, job_type: "Full Time", work_mode: "On-site", description: "Ensure the highest standards for flagship consumer goods." },
        { job_id: 1087, job_title: "Web Designer", company_name: "Shopify", location: "Remote", experience_level: 3, salary: 15, job_type: "Full Time", work_mode: "Remote", description: "Empower entrepreneurs by designing world-class e-commerce themes." },
        { job_id: 1088, job_title: "Database Specialist", company_name: "MongoDB", location: "Gurgaon", experience_level: 5, salary: 28, job_type: "Full Time", work_mode: "Remote", description: "Expert consulting on modern NoSQL database architectures." },
        { job_id: 1089, job_title: "Relationship Manager", company_name: "HDFC Bank", location: "Coimbatore", experience_level: 3, salary: 8, job_type: "Full Time", work_mode: "Office", description: "Build and maintain relationships with high-net-worth individuals." },
        { job_id: 1090, job_title: "Robotics Programmer", company_name: "ABB", location: "Bangalore", experience_level: 4, salary: 22, job_type: "Full Time", work_mode: "Hybrid", description: "Program complex industrial robots for automated manufacturing lines." },
        { job_id: 1091, job_title: "Research Intern - Physics", company_name: "ISRO", location: "Trivandrum", experience_level: 0, salary: 1, job_type: "Internship", work_mode: "On-site", description: "Support the next generation of space exploration research." },
        { job_id: 1092, job_title: "Market Researcher", company_name: "Kantar", location: "Bangalore", experience_level: 2, salary: 9, job_type: "Full Time", work_mode: "Hybrid", description: "Decode consumer behavior for the world's leading brands." },
        { job_id: 1093, job_title: "Mechanical Engineer", company_name: "TATA Motors", location: "Jamshedpur", experience_level: 3, salary: 11, job_type: "Full Time", work_mode: "On-site", description: "Innovate the future of commercial and passenger vehicle engineering." },
        { job_id: 1094, job_title: "Financial Accountant", company_name: "State Street", location: "Hyderabad", experience_level: 4, salary: 13, job_type: "Full Time", work_mode: "Office", description: "Manage global investment accounts and regulatory reporting." },
        { job_id: 1095, job_title: "Hardware Engineer", company_name: "Qualcomm", location: "Bangalore", experience_level: 5, salary: 32, job_type: "Full Time", work_mode: "Office", description: "Design the chipsets that power the world's most advanced smartphones." },
        { job_id: 1096, job_title: "Cloud Sales Lead", company_name: "AWS India", location: "Mumbai", experience_level: 8, salary: 45, job_type: "Full Time", work_mode: "Hybrid", description: "Lead cloud adoption for India's largest enterprise organizations." },
        { job_id: 1097, job_title: "Senior Android Developer", company_name: "Paytm", location: "Noida", experience_level: 5, salary: 22, job_type: "Full Time", work_mode: "Hybrid", description: "Design and build advanced applications for the Android platform. Impact millions of users." },
        { job_id: 1098, job_title: "ML Ops Engineer", company_name: "Uber", location: "Bangalore", experience_level: 4, salary: 30, job_type: "Full Time", work_mode: "Office", description: "Build and maintain scalable machine learning pipelines and infrastructure for Uber's global services." },
        { job_id: 1099, job_title: "UI/UX Designer", company_name: "Myntra", location: "Bangalore", experience_level: 3, salary: 18, job_type: "Full Time", work_mode: "Office", description: "Create delightful and intuitive shopping experiences for fashion enthusiasts across India." },
        { job_id: 1100, job_title: "Site Engineer", company_name: "DLF", location: "Delhi", experience_level: 2, salary: 10, job_type: "Full Time", work_mode: "On-site", description: "Supervise construction activities and ensure adherence to safety and quality standards on-site." },
        { job_id: 1101, job_title: "Finance Manager", company_name: "JP Morgan", location: "Mumbai", experience_level: 6, salary: 28, job_type: "Full Time", work_mode: "Office", description: "Manage financial planning, risk analysis, and corporate reporting for global banking operations." },
        { job_id: 1102, job_title: "Content Creator", company_name: "Swiggy", location: "Bangalore", experience_level: 1, salary: 7, job_type: "Full Time", work_mode: "Office", description: "Develop engaging content for social media and in-app marketing campaigns." },
        { job_id: 1103, job_title: "Security Architect", company_name: "Cisco", location: "Pune", experience_level: 7, salary: 35, job_type: "Full Time", work_mode: "Hybrid", description: "Design secure network architectures and implement advanced threat protection systems." },
        { job_id: 1104, job_title: "HR Specialist", company_name: "HCL", location: "Chennai", experience_level: 3, salary: 12, job_type: "Full Time", work_mode: "Office", description: "Manage talent acquisition and employee engagement programs for large-scale IT departments." },
        { job_id: 1105, job_title: "Sales Manager", company_name: "Byju's", location: "Hyderabad", experience_level: 4, salary: 15, job_type: "Full Time", work_mode: "On-site", description: "Lead the sales team to achieve targets for revolutionary education products." },
        { job_id: 1106, job_title: "Customer Support", company_name: "Zomato", location: "Gurgaon", experience_level: 1, salary: 6, job_type: "Full Time", work_mode: "Office", description: "Provide world-class support to our restaurant partners and customers." },
        { job_id: 1107, job_title: "Data Engineer", company_name: "Flipkart", location: "Bangalore", experience_level: 3, salary: 20, job_type: "Full Time", work_mode: "Office", description: "Build and scale high-performance data pipelines for India's largest e-commerce platform." },
        { job_id: 1108, job_title: "DevSecOps Engineer", company_name: "Atlassian", location: "Remote", experience_level: 5, salary: 32, job_type: "Full Time", work_mode: "Remote", description: "Integrate security into the CI/CD pipeline and maintain high standards of infrastructure protection." },
        { job_id: 1109, job_title: "Project Head", company_name: "L&T", location: "Mumbai", experience_level: 10, salary: 45, job_type: "Full Time", work_mode: "On-site", description: "Over-see massive infrastructure projects from inception to completion." },
        { job_id: 1110, job_title: "Test Engineer", company_name: "Infosys", location: "Pune", experience_level: 2, salary: 8, job_type: "Full Time", work_mode: "Office", description: "Conduct manual and automated testing to ensure the highest quality for global software projects." },
        { job_id: 1111, job_title: "Backend Lead", company_name: "PhonePe", location: "Bangalore", experience_level: 6, salary: 38, job_type: "Full Time", work_mode: "Hybrid", description: "Lead the development of high-availability backend systems for digital payments." },
        { job_id: 1112, job_title: "Marketing Lead", company_name: "Nykaa", location: "Mumbai", experience_level: 5, salary: 24, job_type: "Full Time", work_mode: "Office", description: "Drive brand growth and marketing strategy for the leading beauty e-commerce platform." },
        { job_id: 1113, job_title: "Supply Chain Manager", company_name: "Reliance Retail", location: "Mumbai", experience_level: 4, salary: 16, job_type: "Full Time", work_mode: "On-site", description: "Optimize national logistics and warehouse operations for retail scalability." },
        { job_id: 1114, job_title: "Business Analyst", company_name: "Deloitte", location: "Hyderabad", experience_level: 3, salary: 14, job_type: "Full Time", work_mode: "Hybrid", description: "Provide strategic insights and technical analysis for enterprise consulting projects." },
        { job_id: 1115, job_title: "Graphic Artist", company_name: "Adobe", location: "Noida", experience_level: 2, salary: 11, job_type: "Full Time", work_mode: "Office", description: "Design revolutionary creative assets for global software product lines." },
        { job_id: 1116, job_title: "Java Architect", company_name: "TCS", location: "Chennai", experience_level: 8, salary: 30, job_type: "Full Time", work_mode: "Office", description: "Design complex, high-scale Java architectures for international banking clients." },
        { job_id: 1117, job_title: "Python Developer", company_name: "Zoho", location: "Chennai", experience_level: 3, salary: 15, job_type: "Full Time", work_mode: "Office", description: "Build scalable SaaS backend systems using Python and Django." },
        { job_id: 1118, job_title: "Node.js Developer", company_name: "Freshworks", location: "Chennai", experience_level: 2, salary: 13, job_type: "Full Time", work_mode: "Hybrid", description: "Help build modern customer engagement software using Node.js and AWS." },
        { job_id: 1119, job_title: "Cloud Specialist", company_name: "Azure India", location: "Bangalore", experience_level: 5, salary: 28, job_type: "Full Time", work_mode: "Hybrid", description: "Advise enterprise clients on cloud migration and cloud-native architecture." },
        { job_id: 1120, job_title: "Research Intern", company_name: "DRDO", location: "Hyderabad", experience_level: 0, salary: 1, job_type: "Internship", work_mode: "On-site", description: "Support critical defense research programs under expert guidance." },
        { job_id: 1121, job_title: "QA Analyst", company_name: "Swiggy", location: "Bangalore", experience_level: 2, salary: 9, job_type: "Full Time", work_mode: "Office", description: "Test mobile and web applications to maintain seamless delivery experiences." },
        { job_id: 1122, job_title: "Brand Strategist", company_name: "Coca-Cola", location: "Gurgaon", experience_level: 5, salary: 22, job_type: "Full Time", work_mode: "Office", description: "Develop marketing strategies for iconic global beverage brands." },
        { job_id: 1123, job_title: "Game Designer", company_name: "Ubisoft", location: "Pune", experience_level: 3, salary: 16, job_type: "Full Time", work_mode: "Office", description: "Design levels and gameplay mechanics for world-renowned AAA titles." },
        { job_id: 1124, job_title: "Network Admin", company_name: "Wipro", location: "Bangalore", experience_level: 4, salary: 12, job_type: "Full Time", work_mode: "Office", description: "Manage internal networks and ensure zero downtime for global business units." },
        { job_id: 1125, job_title: "Legal Head", company_name: "Adani", location: "Ahmedabad", experience_level: 12, salary: 55, job_type: "Full Time", work_mode: "Office", description: "Lead the corporate legal department for global energy and infrastructure projects." },
        { job_id: 1126, job_title: "Frontend Lead", company_name: "Razorpay", location: "Bangalore", experience_level: 5, salary: 32, job_type: "Full Time", work_mode: "Hybrid", description: "Lead the frontend engineering team for India's leading payment gateway." },
        { job_id: 1127, job_title: "Product Designer", company_name: "CRED", location: "Bangalore", experience_level: 4, salary: 28, job_type: "Full Time", work_mode: "Office", description: "Design world-class experiences for high-trust financial products." },
        { job_id: 1128, job_title: "Data Scientist", company_name: "Ola", location: "Bangalore", experience_level: 3, salary: 22, job_type: "Full Time", work_mode: "Office", description: "Use data science to solve complex logistics and transportation problems." },
        { job_id: 1129, job_title: "Site Reliability Engineer", company_name: "Google", location: "Hyderabad", experience_level: 4, salary: 40, job_type: "Full Time", work_mode: "Hybrid", description: "Ensure the reliability and performance of Google's global infra." },
        { job_id: 1130, job_title: "Operations Lead", company_name: "Dunzo", location: "Bangalore", experience_level: 3, salary: 12, job_type: "Full Time", work_mode: "On-site", description: "Lead hyper-local delivery operations for major urban clusters." },
        { job_id: 1131, job_title: "Embedded Developer", company_name: "Samsung", location: "Bangalore", experience_level: 4, salary: 20, job_type: "Full Time", work_mode: "Office", description: "Develop firmware for the next generation of mobile devices." },
        { job_id: 1132, job_title: "Risk Analyst", company_name: "Amex", location: "Gurgaon", experience_level: 3, salary: 16, job_type: "Full Time", work_mode: "Hybrid", description: "Analyze credit risk and protect financial integrity for cardholders." },
        { job_id: 1133, job_title: "Technical Writer", company_name: "Microsoft", location: "Remote", experience_level: 2, salary: 14, job_type: "Full Time", work_mode: "Remote", description: "Document complex cloud technologies for developers worldwide." },
        { job_id: 1134, job_title: "Sales Executive", company_name: "WhiteHat Jr", location: "Mumbai", experience_level: 1, salary: 8, job_type: "Full Time", work_mode: "Office", description: "Drive growth for online education programs across India." },
        { job_id: 1135, job_title: "Finance Analyst", company_name: "Goldman Sachs", location: "Bangalore", experience_level: 2, salary: 18, job_type: "Full Time", work_mode: "Office", description: "Support investment banking with high-level financial analysis." },
        { job_id: 1136, job_title: "SEO Specialist", company_name: "Myntra", location: "Bangalore", experience_level: 2, salary: 10, job_type: "Full Time", work_mode: "Office", description: "Drive organic traffic growth for India's biggest fashion store." },
        { job_id: 1137, job_title: "UI Developer", company_name: "Swiggy", location: "Bangalore", experience_level: 2, salary: 13, job_type: "Full Time", work_mode: "Office", description: "Build highly responsive web interfaces for food delivery services." },
        { job_id: 1138, job_title: "Backend Developer", company_name: "Paytm", location: "Noida", experience_level: 3, salary: 16, job_type: "Full Time", work_mode: "Office", description: "Work on mission-critical payment systems using microservices." },
        { job_id: 1139, job_title: "Android Developer", company_name: "Ola", location: "Bangalore", experience_level: 3, salary: 18, job_type: "Full Time", work_mode: "Office", description: "Help build the future of mobility with advanced Android apps." },
        { job_id: 1140, job_title: "iOS Developer", company_name: "PhonePe", location: "Bangalore", experience_level: 3, salary: 20, job_type: "Full Time", work_mode: "Hybrid", description: "Innovate on high-speed payment experiences for the iOS platform." },
        { job_id: 1141, job_title: "Full Stack Developer", company_name: "Zoho", location: "Chennai", experience_level: 2, salary: 12, job_type: "Full Time", work_mode: "Office", description: "Develop end-to-end features for top-tier SaaS products." },
        { job_id: 1142, job_title: "DevOps", company_name: "HCL", location: "Noida", experience_level: 4, salary: 15, job_type: "Full Time", work_mode: "Office", description: "Manage cloud infrastructure and automation for multinational clients." },
        { job_id: 1143, job_title: "Cloud Developer", company_name: "TCS", location: "Mumbai", experience_level: 3, salary: 14, job_type: "Full Time", work_mode: "Office", description: "Build cloud-native applications for enterprise digital transformation." },
        { job_id: 1144, job_title: "ML Engineer", company_name: "Infosys", location: "Bangalore", experience_level: 3, salary: 18, job_type: "Full Time", work_mode: "Office", description: "Apply AI to real-world business problems at a global scale." },
        { job_id: 1145, job_title: "Data Analyst", company_name: "Wipro", location: "Hyderabad", experience_level: 2, salary: 10, job_type: "Full Time", work_mode: "Office", description: "Analyze large datasets to drive better business outcomes." },
        { job_id: 1146, job_title: "UX Designer", company_name: "Tech Mahindra", location: "Pune", experience_level: 3, salary: 14, job_type: "Full Time", work_mode: "Office", description: "Design simple, effective digital solutions for enterprise users." },
        { job_id: 1147, job_title: "Project Manager", company_name: "Accenture", location: "Mumbai", experience_level: 5, salary: 22, job_type: "Full Time", work_mode: "Office", description: "Lead delivery teams for complex technology modernization programs." },
        { job_id: 1148, job_title: "System Admin", company_name: "Oracle", location: "Bangalore", experience_level: 4, salary: 16, job_type: "Full Time", work_mode: "Office", description: "Support global infrastructure for cloud computing leaders." },
        { job_id: 1149, job_title: "HR Manager", company_name: "Cognizant", location: "Chennai", experience_level: 5, salary: 15, job_type: "Full Time", work_mode: "Office", description: "Handle senior recruitment and talent management for IT sectors." },
        { job_id: 1150, job_title: "Software Developer", company_name: "Reliance Jio", location: "Mumbai", experience_level: 2, salary: 12, job_type: "Full Time", work_mode: "Office", description: "Work on cutting-edge telecom and 5G software solutions." }
    ];


    const fetchJobs = async (page = 1, filters = {}) => {
        try {
            currentPage = page;
            currentFilters = filters;
            const skip = (page - 1) * jobsPerPage;

            let jobs = [];
            let totalJobs = extraJobs.length;

            try {
                let url = `${API_BASE_URL}/jobs/?skip=${skip}&limit=${jobsPerPage}`;
                const hasFilters = filters.keyword || filters.location || filters.experience_level || filters.job_type || filters.work_mode;

                if (hasFilters) {
                    const params = new URLSearchParams();
                    if (filters.keyword) params.append("keyword", filters.keyword);
                    if (filters.location) params.append("location", filters.location);
                    if (filters.experience_level) params.append("experience_level", filters.experience_level);
                    if (filters.job_type) params.append("job_type", filters.job_type);
                    if (filters.work_mode) params.append("work_mode", filters.work_mode);
                    params.append("skip", skip);
                    params.append("limit", jobsPerPage);
                    url = `${API_BASE_URL}/filters/jobs?${params.toString()}`;
                }

                const response = await fetch(url);
                if (response.ok) {
                    const apiJobs = await response.json();

                    // Fetch total count
                    const totalRes = await fetch(`${API_BASE_URL}/jobs/`);
                    if (totalRes.ok) {
                        const allJobs = await totalRes.json();
                        totalJobs = allJobs.length + extraJobs.length;
                    }

                    // Merge with static jobs that match filters
                    const filteredExtra = extraJobs.filter(j => {
                        const matchesKey = !filters.keyword || j.job_title.toLowerCase().includes(filters.keyword.toLowerCase()) || j.company_name.toLowerCase().includes(filters.keyword.toLowerCase());
                        const matchesLoc = !filters.location || j.location.toLowerCase().includes(filters.location.toLowerCase());
                        const matchesExp = !filters.experience_level || j.experience_level >= parseInt(filters.experience_level);
                        const matchesType = !filters.job_type || j.job_type === filters.job_type;
                        const matchesMode = !filters.work_mode || j.work_mode === filters.work_mode;
                        return matchesKey && matchesLoc && matchesExp && matchesType && matchesMode;
                    });

                    // Combine them
                    const combined = [...apiJobs, ...filteredExtra];
                    const start = (page - 1) * jobsPerPage;
                    jobs = combined.slice(start, start + jobsPerPage);
                } else {
                    throw new Error("API Failure");
                }
            } catch (e) {
                console.log("Serving static jobs only due to API error/empty state");
                const filteredExtra = extraJobs.filter(j => {
                    const matchesKey = !filters.keyword || j.job_title.toLowerCase().includes(filters.keyword.toLowerCase()) || j.company_name.toLowerCase().includes(filters.keyword.toLowerCase());
                    const matchesLoc = !filters.location || j.location.toLowerCase().includes(filters.location.toLowerCase());
                    const matchesExp = !filters.experience_level || j.experience_level >= parseInt(filters.experience_level);
                    const matchesType = !filters.job_type || j.job_type === filters.job_type;
                    const matchesMode = !filters.work_mode || j.work_mode === filters.work_mode;
                    return matchesKey && matchesLoc && matchesExp && matchesType && matchesMode;
                });
                totalJobs = filteredExtra.length;
                jobs = filteredExtra.slice((page - 1) * jobsPerPage, page * jobsPerPage);
            }

            renderJobs(jobs);
            renderPagination(totalJobs);
        } catch (error) {
            console.error("Fetch Error:", error);
            jobsContainer.innerHTML = `<div class="no-jobs">Error loading jobs. Please try again.</div>`;
        }
    };

    const renderJobs = (jobs) => {
        jobsContainer.innerHTML = "";

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

            const getSkillsByTitle = (title) => {
                const t = title.toLowerCase();
                if (t.includes("engineer") || t.includes("developer")) return ["React", "JavaScript", "TypeScript", "Node.js", "Docker"];
                if (t.includes("data")) return ["Python", "SQL", "Pandas", "Scikit-Learn", "Tableau"];
                if (t.includes("designer") || t.includes("ux")) return ["Figma", "Adobe XD", "Sketch", "UI Design", "UX Research"];
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
                            <h3 class="job-title">${job.job_title}</h3>
                            <p class="company-name">${job.company_name}</p>
                            <p class="job-location">📍 ${job.location || 'Remote'}</p>
                        </div>
                    </div>
                    <button class="save-btn" data-id="${job.job_id}">💾 Save</button>
                </div>

                <div class="job-details">
                    <div class="job-detail-item">
                        <span class="detail-icon">💼</span>
                        <span>${job.experience_level !== null ? job.experience_level + '+ years' : '0 years'}</span>
                    </div>
                    <div class="job-detail-item">
                        <span class="detail-icon">💰</span>
                        <span>₹${job.salary || 0} LPA</span>
                    </div>
                    <div class="job-detail-item">
                        <span class="detail-icon">🏢</span>
                        <span>${job.job_type || 'Full Time'}</span>
                    </div>
                    <div class="job-detail-item">
                        <span class="detail-icon">🏠</span>
                        <span>${job.work_mode || 'Hybrid'}</span>
                    </div>
                </div>

                <div class="job-tags">${tagHtml}</div>

                <p class="job-description">
                    ${job.description ? job.description.replace(/<[^>]*>/g, '').substring(0, 160) + '...' : "Join our team to work on exciting projects and grow your professional career with us."}
                </p>

                <div class="job-footer">
                    <span class="posted-time">Posted Recently</span>
                    <a href="/apply_home.html?job_id=${job.job_id}&title=${encodeURIComponent(job.job_title)}&company=${encodeURIComponent(job.company_name)}&location=${encodeURIComponent(job.location)}&type=${encodeURIComponent(job.job_type)}&experience=${encodeURIComponent(job.experience_level)}&desc=${encodeURIComponent(job.description || '')}" class="apply-btn">Apply Now</a>
                </div>
            `;

            // Handle Save Button
            const saveBtn = card.querySelector(".save-btn");
            saveBtn.addEventListener("click", async (e) => {
                e.preventDefault();
                const user = JSON.parse(localStorage.getItem("user") || "{}");
                if (!user.user_id) {
                    alert("Please login to save this job.");
                    window.location.href = "/login.html";
                    return;
                }

                try {
                    const res = await fetch(`${API_BASE_URL}/saved-jobs/`, {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({
                            user_id: user.user_id,
                            job_id: job.job_id
                        })
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
                job_type: Array.from(document.querySelectorAll(".type-check:checked")).map(c => c.value)[0] || "",
                work_mode: Array.from(document.querySelectorAll(".mode-check:checked")).map(c => c.value)[0] || ""
            };
            fetchJobs(1, filters);
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
