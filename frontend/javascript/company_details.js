// company_details.js

document.addEventListener('DOMContentLoaded', () => {

    // 1. Get Company Name from URL Query Parameter
    const urlParams = new URLSearchParams(window.location.search);
    const companyKey = decodeURIComponent(urlParams.get('name') || '');

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
            description: "Google is a multinational corporation that specializes in Internet-related services and products including search engine, cloud computing, software and hardware.",
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
            description: "Microsoft empowers every person and organization to achieve more by building best-in-class platforms and productivity services.",
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
            description: "Amazon focuses on customer obsession, innovation, operational excellence and long-term thinking.",
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
            description: "TCS is a global IT services and consulting company and part of the Tata Group.",
            jobs: [
                { title: "System Engineer", location: "Mumbai", type: "Full-Time" },
                { title: "Digital Innovator", location: "Pune", type: "Full-Time" },
                { title: "Consultant", location: "Bangalore", type: "Full-Time" }
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
            description: "Infosys is a global leader in next-generation digital services and consulting.",
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
            description: "Wipro is a leading global information technology and consulting company.",
            jobs: [
                { title: "Project Engineer", location: "Bangalore", type: "Full-Time" },
                { title: "Test Engineer", location: "Chennai", type: "Full-Time" }
            ]
        }

    };

    // 3. Find Company Data
    let data = null;

    if (companyKey) {
        const normalizedKey = Object.keys(companiesData)
            .find(key => key.toLowerCase() === companyKey.toLowerCase());

        data = normalizedKey ? companiesData[normalizedKey] : null;
    }

    // 4. Company Not Found
    if (!data) {

        const mainContainer = document.querySelector('.company-main');

        if (mainContainer) {
            mainContainer.innerHTML = `
            <div class="details-card">
                <h2>Company Not Found</h2>
                <p>
                We couldn't find details for the company you requested.
                <a href="/frontend/pages/companies.html">Browse Top Companies</a>
                </p>
            </div>`;
        }

        return;
    }

    // 5. Inject Company Data

    document.title = `${data.fullName} - Company Details`;

    const logoEl = document.getElementById('companyLogo');
    if (logoEl) logoEl.innerText = data.logo;

    const nameEl = document.getElementById('companyName');
    if (nameEl) nameEl.innerText = data.fullName;

    const locEl = document.getElementById('companyLocation');
    if (locEl)
        locEl.innerHTML = `<i class="fas fa-map-marker-alt"></i> ${data.location}`;

    const sizeEl = document.getElementById('companySize');
    if (sizeEl)
        sizeEl.innerHTML = `<i class="fas fa-users"></i> ${data.size}`;

    const indEl = document.getElementById('companyIndustry');
    if (indEl)
        indEl.innerHTML = `<i class="fas fa-industry"></i> ${data.industry}`;

    const descEl = document.getElementById('companyDescription');
    if (descEl) descEl.innerText = data.description;

    const foundedEl = document.getElementById('foundedYear');
    if (foundedEl) foundedEl.innerText = data.founded;

    const webLink = document.getElementById('companyWebsite');

    if (webLink && data.website) {
        webLink.href = data.website;
        webLink.innerText = "Visit Website";
        webLink.target = "_blank";
        webLink.rel = "noopener";
    }

    // 6. Inject Jobs

    const jobsContainer = document.getElementById('jobsList');
    const jobCount = document.getElementById('jobCount');

    if (jobsContainer && data.jobs) {

        if (data.jobs.length > 0) {

            if (jobCount)
                jobCount.innerText = `(${data.jobs.length})`;

            jobsContainer.innerHTML = '';

            data.jobs.forEach(job => {

                const jobEl = document.createElement('div');
                jobEl.className = 'job-item';

                const infoDiv = document.createElement('div');
                infoDiv.className = 'job-info';

                const title = document.createElement('h4');
                title.innerText = job.title;

                const meta = document.createElement('div');
                meta.className = 'job-meta';
                meta.innerHTML = `
                <span><i class="fas fa-map-marker-alt"></i> ${job.location}</span>
                •
                <span><i class="fas fa-clock"></i> ${job.type}</span>`;

                infoDiv.appendChild(title);
                infoDiv.appendChild(meta);

                const applyBtn = document.createElement('button');
                applyBtn.className = 'job-apply-btn';
                applyBtn.innerText = "Apply Now";

                applyBtn.onclick = () => {

                    const params = new URLSearchParams({
                        title: job.title,
                        company: data.fullName,
                        company_desc: data.description,
                        location: job.location || data.location,
                        type: job.type || "Full-Time",
                        mode: "On-site"
                    });

                    window.location.href =
                        `./apply_home.html?${params.toString()}`;
                };

                jobEl.appendChild(infoDiv);
                jobEl.appendChild(applyBtn);

                jobsContainer.appendChild(jobEl);

            });

        } else {

            if (jobCount)
                jobCount.innerText = "(0)";

            jobsContainer.innerHTML =
                `<p class="text-muted">
                No open positions currently listed for this company.
                </p>`;
        }
    }

});