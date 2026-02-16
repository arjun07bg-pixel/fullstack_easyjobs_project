const API_BASE_URL = "http://127.0.0.1:8000/api";

document.addEventListener("DOMContentLoaded", async () => {
    const jobList = document.querySelector(".job-grid") || document.querySelector(".job-list");

    const path = window.location.pathname;
    let category = "";
    if (path.includes("IT_software")) category = "software";
    if (path.includes("sales&marketing")) category = "marketing";
    if (path.includes("Finance&accounting")) category = "finance";
    if (path.includes("Engineering")) category = "engineering";

    console.log(`Connecting category page: ${category}`);

    const cleanDescription = (text) => {
        if (!text) return "Explore this opportunity and grow your career with us.";

        // Remove known headers that make cards too busy
        let clean = text.replace(/Role Overview|Key Responsibilities|Requirements|Responsibilities/gi, "");

        // Truncate to a reasonable length for the grid
        if (clean.length > 150) {
            return clean.substring(0, 150).trim() + "...";
        }
        return clean;
    };

    const fetchCategoryJobs = async () => {
        try {
            const response = await fetch(`${API_BASE_URL}/jobs/`);
            if (!response.ok) throw new Error("Failed to fetch jobs");

            const allJobs = await response.json();

            const filteredJobs = allJobs.filter(job => {
                const text = (job.job_title + " " + job.description).toLowerCase();
                if (category === "software") return text.includes("software") || text.includes("developer") || text.includes("it");
                if (category === "marketing") return text.includes("marketing") || text.includes("sales") || text.includes("ad");
                if (category === "finance") return text.includes("finance") || text.includes("account") || text.includes("bank");
                if (category === "engineering") return text.includes("engineer") || text.includes("civil") || text.includes("mechanical");
                return false;
            });

            if (filteredJobs.length > 0 && jobList) {
                console.log(`Found ${filteredJobs.length} dynamic jobs for this category.`);

                filteredJobs.forEach(job => {
                    const article = document.createElement("article");
                    article.className = "job-card";
                    article.innerHTML = `
                        <div class="job-card-tag">NEW POST</div>
                        <div class="job-title"><i class="fas fa-briefcase"></i> ${job.job_title}</div>
                        <div class="company">${job.company_name}</div>
                        <div class="location"><i class="fas fa-map-marker-alt"></i> ${job.location}</div>
                        <div class="salary">₹${job.salary} LPA</div>
                        <p class="details">${cleanDescription(job.description)}</p>
                        <a href="/apply_home.html?job_id=${job.job_id}&title=${encodeURIComponent(job.job_title)}&company=${encodeURIComponent(job.company_name)}&location=${encodeURIComponent(job.location)}&salary=${encodeURIComponent(job.salary)}&desc=${encodeURIComponent(job.description)}" class="apply-btn">Apply Now</a>
                    `;
                    jobList.prepend(article);
                });
            }
        } catch (error) {
            console.error("Error loading category jobs:", error);
        }
    };

    fetchCategoryJobs();
});
