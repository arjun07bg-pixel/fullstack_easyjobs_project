// company_details.js

document.addEventListener('DOMContentLoaded', () => {
    // 1. Get Company Name from URL Query Parameter
    const urlParams = new URLSearchParams(window.location.search);
    const companyKey = urlParams.get('name'); // e.g. "Google", "Amazon"

    // 2. Mock Data for Companies
    const companiesData = {
        "Google": {
            logo: "G",
            fullName: "Google",
            location: "Bangalore, India",
            size: "10,000+ employees",
            industry: "Technology, Internet, AI",
            founded: "1998",
            website: "https://careers.google.com",
            description: "Google is a multinational corporation that specializes in Internet-related services and products, which include online advertising technologies, search engine, cloud computing, software, and hardware.",
            jobs: [
                { title: "Software Engineer, Early Career", location: "Bangalore", type: "Full-Time" },
                { title: "Product Manager, Cloud", location: "Hyderabad", type: "Full-Time" },
                { title: "UX Designer", location: "Bangalore", type: "Full-Time" },
                { title: "Data Scientist", location: "Gurugram", type: "Full-Time" }
            ]
        },
        "Microsoft": {
            logo: "M",
            fullName: "Microsoft",
            location: "Hyderabad, India",
            size: "8,000+ employees",
            industry: "Software, Cloud, Enterprise",
            founded: "1975",
            website: "https://careers.microsoft.com",
            description: "Microsoft's mission is to empower every person and every organization on the planet to achieve more. We build best-in-class platforms and productivity services for a mobile-first, cloud-first world.",
            jobs: [
                { title: "Software Engineer II", location: "Hyderabad", type: "Full-Time" },
                { title: "Support Engineer", location: "Bangalore", type: "Full-Time" },
                { title: "Cloud Solution Architect", location: "Pune", type: "Full-Time" }
            ]
        },
        "Amazon": {
            logo: "A",
            fullName: "Amazon",
            location: "Bangalore, India",
            size: "50,000+ employees",
            industry: "E-commerce, Cloud Computing",
            founded: "1994",
            website: "https://www.amazon.jobs",
            description: "Amazon is guided by four principles: customer obsession rather than competitor focus, passion for invention, commitment to operational excellence, and long-term thinking.",
            jobs: [
                { title: "SDE I", location: "Bangalore", type: "Full-Time" },
                { title: "Operations Manager", location: "Hyderabad", type: "Full-Time" },
                { title: "Business Analyst", location: "Chennai", type: "Full-Time" },
                { title: "Machine Learning Engineer", location: "Bangalore", type: "Full-Time" }
            ]
        },
        "TCS": {
            logo: "T",
            fullName: "Tata Consultancy Services",
            location: "Mumbai, India",
            size: "100,000+ employees",
            industry: "IT Services, Consulting",
            founded: "1968",
            website: "https://www.tcs.com/careers",
            description: "TCS is an Indian multinational information technology services and consulting company. It is a subsidiary of the Tata Group and operates in 149 locations across 46 countries.",
            jobs: [
                { title: "System Engineer", location: "Mumbai", type: "Full-Time" },
                { title: "Digital Innovator", location: "Pune", type: "Full-Time" },
                { title: "Consultant", location: "Bangalore", type: "Full-Time" }
            ]
        },
        "Flipkart": {
            logo: "F",
            fullName: "Flipkart",
            location: "Bangalore, India",
            size: "15,000+ employees",
            industry: "E-commerce, Retail",
            founded: "2007",
            website: "https://www.flipkartcareers.com",
            description: "Flipkart is India's leading e-commerce marketplace with over 80 million products across 80+ categories. We are known for our customer-centric innovations.",
            jobs: [
                { title: "UI Engineer", location: "Bangalore", type: "Full-Time" },
                { title: "Supply Chain Manager", location: "Bangalore", type: "Full-Time" },
                { title: "Product Analyst", location: "Bangalore", type: "Full-Time" }
            ]
        },
        "Infosys": {
            logo: "I",
            fullName: "Infosys",
            location: "Bangalore, India",
            size: "80,000+ employees",
            industry: "IT Services, Consulting",
            founded: "1981",
            website: "https://www.infosys.com/careers",
            description: "Infosys is a global leader in next-generation digital services and consulting. We enable clients in 46 countries to navigate their digital transformation.",
            jobs: [
                { title: "Specialist Programmer", location: "Mysore", type: "Full-Time" },
                { title: "Senior Associate", location: "Pune", type: "Full-Time" }
            ]
        },
        "Wipro": {
            logo: "W",
            fullName: "Wipro",
            location: "Bangalore, India",
            size: "75,000+ employees",
            industry: "IT Services, BPO",
            founded: "1945",
            website: "https://careers.wipro.com",
            description: "Wipro Limited is a leading global information technology, consulting and business process services company.",
            jobs: [
                { title: "Project Engineer", location: "Bangalore", type: "Full-Time" },
                { title: "Test Engineer", location: "Chennai", type: "Full-Time" }
            ]
        },
        "Accenture": {
            logo: "A",
            fullName: "Accenture",
            location: "Multiple Cities",
            size: "60,000+ employees",
            industry: "Consulting, Strategy",
            founded: "1989",
            website: "https://www.accenture.com",
            description: "Accenture is a global professional services company with leading capabilities in digital, cloud and security.",
            jobs: [
                { title: "Application Develpment Associate", location: "Gurugram", type: "Full-Time" },
                { title: "Management Consultant", location: "Mumbai", type: "Full-Time" }
            ]
        },
        "IBM": {
            logo: "I",
            fullName: "IBM",
            location: "Bangalore, India",
            size: "50,000+ employees",
            industry: "Technology, AI, Cloud",
            founded: "1911",
            website: "https://www.ibm.com",
            description: "IBM is a global technology and innovation company. It is the largest technology and consulting employer in the world.",
            jobs: [
                { title: "Backend Developer", location: "Bangalore", type: "Full-Time" },
                { title: "AI Researcher", location: "Bangalore", type: "Full-Time" }
            ]
        },
        "Cognizant": {
            logo: "C",
            fullName: "Cognizant",
            location: "Chennai, India",
            size: "70,000+ employees",
            industry: "IT Services, Digital",
            founded: "1994",
            website: "https://careers.cognizant.com",
            description: "Cognizant is one of the world's leading professional services companies, transforming clients' business, operating and technology models for the digital era.",
            jobs: [
                { title: "Programmer Analyst", location: "Chennai", type: "Full-Time" },
                { title: "Associate", location: "Kolkata", type: "Full-Time" }
            ]
        },
        "HCL Technologies": {
            logo: "H",
            fullName: "HCL Technologies",
            location: "Noida, India",
            size: "65,000+ employees",
            industry: "IT Services, Engineering",
            founded: "1976",
            website: "https://www.hcltech.com",
            description: "HCL Technologies is a next-generation global technology company that helps enterprises reimagine their businesses for the digital age.",
            jobs: [
                { title: "Senior Developer", location: "Noida", type: "Full-Time" }
            ]
        },
        "Deloitte": {
            logo: "D",
            fullName: "Deloitte",
            location: "Mumbai, India",
            size: "40,000+ employees",
            industry: "Consulting, Audit, Finance",
            founded: "1845",
            website: "https://www2.deloitte.com",
            description: "Deloitte provides audit and assurance, consulting, financial advisory, risk advisory, tax, and related services to public and private clients.",
            jobs: [
                { title: "Analyst", location: "Hyderabad", type: "Full-Time" },
                { title: "Consultant", location: "Mumbai", type: "Full-Time" }
            ]
        },
        "Paytm": {
            logo: "P",
            fullName: "Paytm",
            location: "Noida, India",
            size: "15,000+ employees",
            industry: "Fintech, Payments",
            founded: "2010",
            website: "https://paytm.com",
            description: "Paytm is India's leading financial services company that offers full-stack payments & financial solutions to consumers, offline merchants and online platforms.",
            jobs: [
                { title: "Product Manager", location: "Noida", type: "Full-Time" },
                { title: "iOS Developer", location: "Noida", type: "Full-Time" }
            ]
        },
        "Zomato": {
            logo: "Z",
            fullName: "Zomato",
            location: "Gurugram, India",
            size: "5,000+ employees",
            industry: "Food Tech, Platform",
            founded: "2008",
            website: "https://www.zomato.com",
            description: "Zomato is an Indian restaurant aggregator and food delivery company.",
            jobs: [
                { title: "Marketing Manager", location: "Gurugram", type: "Full-Time" },
                { title: "Area Sales Manager", location: "Delhi", type: "Full-Time" }
            ]
        },
        "Swiggy": {
            logo: "S",
            fullName: "Swiggy",
            location: "Bangalore, India",
            size: "6,000+ employees",
            industry: "Food Tech, Logistics",
            founded: "2014",
            website: "https://www.swiggy.com",
            description: "Swiggy is India’s leading on-demand delivery platform with a tech-first approach to logistics.",
            jobs: [
                { title: "Software Development Engineer II", location: "Bangalore", type: "Full-Time" },
                { title: "Business Development Executive", location: "Bangalore", type: "Full-Time" }
            ]
        },
        "Ola": {
            logo: "O",
            fullName: "Ola",
            location: "Bangalore, India",
            size: "10,000+ employees",
            industry: "Mobility, Technology",
            founded: "2010",
            website: "https://olacabs.com",
            description: "Ola is India’s largest mobility platform and one of the world’s largest ride-hailing companies.",
            jobs: [
                { title: "Data Analyst", location: "Bangalore", type: "Full-Time" }
            ]
        },
        "PhonePe": {
            logo: "P",
            fullName: "PhonePe",
            location: "Bangalore, India",
            size: "3,000+ employees",
            industry: "Fintech, UPI",
            founded: "2015",
            website: "https://www.phonepe.com",
            description: "PhonePe is a digital payments and financial services company headquarters in Bengaluru, India.",
            jobs: [
                { title: "Android Developer", location: "Bangalore", type: "Full-Time" }
            ]
        },
        "BYJU'S": {
            logo: "B",
            fullName: "Byju's",
            location: "Bangalore, India",
            size: "20,000+ employees",
            industry: "EdTech, Education",
            founded: "2011",
            website: "https://byjus.com",
            description: "BYJU'S is India's largest ed-tech company and the creator of India's most loved school learning app.",
            jobs: [
                { title: "Business Development Associate", location: "Remote", type: "Full-Time" },
                { title: "Content Writer", location: "Bangalore", type: "Full-Time" }
            ]
        },
        "Snapdeal": {
            logo: "S",
            fullName: "Snapdeal",
            location: "Gurugram, India",
            size: "20,000+ employees",
            industry: "E-commerce, Retail",
            founded: "2010",
            website: "https://www.snapdeal.com",
            description: "Snapdeal is India's leading value e-commerce platform.",
            jobs: [
                { title: "Category Manager", location: "Gurugram", type: "Full-Time" }
            ]
        }
    };

    // Find company by case-insensitive name matching
    let data = null;
    if (companyKey) {
        const normalizedKey = Object.keys(companiesData).find(key => key.toLowerCase() === companyKey.toLowerCase());
        data = normalizedKey ? companiesData[normalizedKey] : null;
    }

    if (!data) {
        document.querySelector('.company-main').innerHTML = `
            <div class="details-card">
                <h2>Company Not Found</h2>
                <p>We couldn't find details for the company you requested. <a href="/companies.html">Browse Top Companies</a></p>
            </div>`;
        return;
    }

    // 3. Inject Data into Page
    document.title = `${data.fullName} - Company Details`;

    // Logo (Simulated)
    const logoEl = document.getElementById('companyLogo');
    if (logoEl) logoEl.innerText = data.logo;

    const nameEl = document.getElementById('companyName');
    if (nameEl) nameEl.innerText = data.fullName;

    const locEl = document.getElementById('companyLocation');
    if (locEl) locEl.innerHTML = `<i class="fas fa-map-marker-alt"></i> ${data.location}`;

    const sizeEl = document.getElementById('companySize');
    if (sizeEl) sizeEl.innerHTML = `<i class="fas fa-users"></i> ${data.size}`;

    const indEl = document.getElementById('companyIndustry');
    if (indEl) indEl.innerHTML = `<i class="fas fa-industry"></i> ${data.industry}`;

    const descEl = document.getElementById('companyDescription');
    if (descEl) descEl.innerText = data.description;

    const foundedEl = document.getElementById('foundedYear');
    if (foundedEl) foundedEl.innerText = data.founded;

    if (data.website && data.website !== '#') {
        const webLink = document.getElementById('companyWebsite');
        if (webLink) {
            webLink.href = data.website;
            webLink.innerText = "Visit Website";
        }
    }

    // 4. Inject Jobs
    const jobsContainer = document.getElementById('jobsList');
    const jobCount = document.getElementById('jobCount');

    if (jobsContainer && data.jobs) {
        if (data.jobs.length > 0) {
            if (jobCount) jobCount.innerText = `(${data.jobs.length})`;

            // Clear loading text or previous content
            jobsContainer.innerHTML = '';

            data.jobs.forEach(job => {
                const jobEl = document.createElement('div');
                jobEl.className = 'job-item';

                // Create clean HTML structure
                const infoDiv = document.createElement('div');
                infoDiv.className = 'job-info';

                const titleH4 = document.createElement('h4');
                titleH4.innerText = job.title;

                const metaDiv = document.createElement('div');
                metaDiv.className = 'job-meta';
                metaDiv.innerHTML = `<span><i class="fas fa-map-marker-alt"></i> ${job.location}</span> &bull; <span><i class="fas fa-clock"></i> ${job.type}</span>`;

                infoDiv.appendChild(titleH4);
                infoDiv.appendChild(metaDiv);

                const applyBtn = document.createElement('button');
                applyBtn.className = 'job-apply-btn';
                applyBtn.innerText = 'Apply Now';
                applyBtn.onclick = function () {
                    const queryParams = new URLSearchParams({
                        title: job.title,
                        company: data.fullName,
                        company_desc: data.description,
                        location: job.location || data.location,
                        type: job.type || 'Full-Time',
                        mode: 'On-site' // Default for company page jobs
                    }).toString();
                    window.location.href = `/apply_home.html?${queryParams}`;
                };

                jobEl.appendChild(infoDiv);
                jobEl.appendChild(applyBtn);
                jobsContainer.appendChild(jobEl);
            });
        } else {
            if (jobCount) jobCount.innerText = "(0)";
            jobsContainer.innerHTML = '<p class="text-muted">No open positions currently listed for this company.</p>';
        }
    }
});
