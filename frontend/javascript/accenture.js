const API_BASE_URL = "http://127.0.0.1:8000/api";

document.addEventListener("DOMContentLoaded", async () => {
    const jobList = document.querySelector(".job-list");

    const fetchAccentureJobs = async () => {
        try {
            const response = await fetch(`${API_BASE_URL}/jobs/`);
            if (!response.ok) throw new Error("Failed to fetch jobs");

            const allJobs = await response.json();
            const accentureJobs = allJobs.filter(job =>
                job.company_name.toLowerCase().includes("accenture")
            );

            if (accentureJobs.length > 0 && jobList) {
                jobList.innerHTML = "";
                accentureJobs.forEach(job => {
                    const article = document.createElement("article");
                    article.className = "job-card";
                    article.innerHTML = `
                        <div class="job-title"><i class="fas fa-building"></i> ${job.job_title}</div>
                        <div class="company">${job.company_name}</div>
                        <div class="location"><i class="fas fa-map-marker-alt"></i> ${job.location}</div>
                        <div class="salary">₹${job.salary}</div>
                        <p class="details">${job.description}</p>
                        <a href="/apply?job_id=${job.job_id}" class="apply-btn">Apply Now</a>
                    `;
                    jobList.appendChild(article);
                });
            }
        } catch (error) {
            console.error("Error loading Accenture jobs:", error);
        }
    };

    fetchAccentureJobs();
});
