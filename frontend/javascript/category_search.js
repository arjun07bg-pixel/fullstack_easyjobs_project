// Utility to get the correct API URL (Port 8000 for Python backend)
const getAPIURL = () => { if (window.getEasyJobsAPI) return window.getEasyJobsAPI(); if (window.location.port === "8000") return window.location.origin + "/api"; return "http://" + (window.location.hostname || "127.0.0.1") + ":8000/api"; };

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

    async function loadJobs() {
        try {
            const API_BASE_URL = getAPIURL();
            const response = await fetch(`${API_BASE_URL}/jobs/`);
            if (!response.ok) throw new Error("Failed to fetch jobs");

            const allJobs = await response.json();

            const filteredJobs = allJobs.filter(job => {
                const text = (job.job_title + " " + job.description).toLowerCase();
                if (category === "software") return text.includes("software") || text.includes("developer") || text.includes("it") || text.includes("qa") || text.includes("test");
                if (category === "marketing") return text.includes("marketing") || text.includes("sales") || text.includes("ad");
                if (category === "finance") return text.includes("finance") || text.includes("account") || text.includes("bank");
                if (category === "engineering") return text.includes("engineer") || text.includes("civil") || text.includes("mechanical") || text.includes("qa") || text.includes("test");
                return false;
            });

            if (filteredJobs.length > 0 && jobList) {
                console.log(`Found ${filteredJobs.length} dynamic jobs for this category.`);

                filteredJobs.forEach(job => {
                    const article = document.createElement("article");
                    article.className = "job-card";
                    article.innerHTML = `
                        <div class="job-card-header" style="display:flex; justify-content:space-between; align-items:flex-start;">
                            <div class="job-title"><i class="fas fa-briefcase"></i> ${job.job_title}</div>
                            <button class="cat-save-btn" data-id="${job.job_id}" style="background:none; border:none; color:#94a3b8; cursor:pointer; font-size:1.2rem; transition:0.3s;"><i class="far fa-bookmark"></i></button>
                        </div>
                        <div class="company">${job.company_name}</div>
                        <div class="location"><i class="fas fa-map-marker-alt"></i> ${job.location}</div>
                        <div class="salary">₹${job.salary} LPA</div>
                        <p class="details">${cleanDescription(job.description)}</p>
                        <a href="/frontend/pages/apply_home.html?job_id=${job.job_id}&title=${encodeURIComponent(job.job_title)}&company=${encodeURIComponent(job.company_name)}&location=${encodeURIComponent(job.location)}&salary=${encodeURIComponent(job.salary)}&desc=${encodeURIComponent(job.description)}" class="apply-btn">Apply Now</a>
                    `;

                    // Handle Save
                    const saveBtn = article.querySelector(".cat-save-btn");
                    saveBtn.addEventListener("click", async (e) => {
                        e.preventDefault();
                        const user = JSON.parse(localStorage.getItem("user") || "{}");
                        if (!user.user_id) {
                            alert("Please login to save this job.");
                            window.location.href = "/frontend/pages/login.html";
                            return;
                        }

                        try {
                            const res = await fetch(`${API_BASE_URL}/saved-jobs/`, {
                                method: "POST",
                                headers: { "Content-Type": "application/json" },
                                body: JSON.stringify({ user_id: user.user_id, job_id: job.job_id })
                            });
                            if (res.ok) {
                                saveBtn.innerHTML = '<i class="fas fa-bookmark"></i>';
                                saveBtn.style.color = "#2563eb";
                                showMessage("Job saved successfully! ✓\nவேலை வெற்றிகரமாக சேமிக்கப்பட்டது!", "success");
                            } else {
                                const err = await res.json();
                                showMessage(err.detail || "Error saving job.", "info");
                            }
                        } catch (err) { showMessage("Network error.", "error"); }
                    });

                    jobList.prepend(article);
                });
            }
        } catch (error) {
            console.error("Error loading category jobs:", error);
        }
    };

    fetchCategoryJobs();
});
