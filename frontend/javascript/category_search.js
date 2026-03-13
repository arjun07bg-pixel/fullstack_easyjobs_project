// category_search.js - Final Ultra Neat Professional Design Logic

const getAPIURL = () => { 
    if (window.getEasyJobsAPI) return window.getEasyJobsAPI(); 
    return "/api"; 
};

// Global saveJob logic
window.saveJob = async function(jobId, btn) {

    const user = JSON.parse(localStorage.getItem("user") || "{}");

    if (!user.user_id) {
        alert("Please login to save jobs.");
        window.location.href="/frontend/pages/login.html";
        return;
    }

    const API_BASE_URL = getAPIURL();

    try {

        const res = await fetch(`${API_BASE_URL}/saved-jobs/`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                user_id: user.user_id,
                job_id: jobId
            })
        });

        if (res.ok) {

            btn.innerHTML = '<i class="fas fa-check"></i> Saved';
            btn.style.color = "#1faa59";
            btn.style.fontWeight = "700";

            alert("Job saved successfully!");

        } else {

            const err = await res.json();
            alert(err.detail || "Already saved or error occurred.");

        }

    } catch (e) {

        alert("Server connection error.");

    }
};


document.addEventListener("DOMContentLoaded", async () => {

    const jobsContainer = document.getElementById("jobs-container");
    const roleSearchInput = document.getElementById("roleSearchInput");
    const locationSearchInput = document.getElementById("locationSearchInput");
    const searchBtn = document.getElementById("categorySearchBtn");

    const path = window.location.pathname.toLowerCase();
    let category = "";

    if (path.includes("it_software")) category = "software";
    else if (path.includes("sales_and_marketing") || path.includes("sales_marketing")) category = "marketing";
    else if (path.includes("finance_and_accounting") || path.includes("finance_accounting")) category = "finance";
    else if (path.includes("engineering")) category = "engineering";


    // Standard Cleaner for Database Descriptions
    const cleanDesc = (t) => {

        if (!t)
            return "Professional opportunity with a market leader. Join a high-performing team to build the future of India's industry.";

        let c = t.replace(/Role|Overview|Responsibilities|Requirements|Key/gi, "").trim();

        return c.length > 200
            ? c.substring(0, 180) + "..."
            : c;
    };


    // Ultra-Neat Professional Rendering
    const renderJob = (job, isAdmin) => {

        const logoText = job.company_name?.substring(0,2).toUpperCase() || 'CO';

        const article = document.createElement("article");

        article.className = "job-card dynamic-job";
        article.setAttribute("data-job-id", job.job_id);

        const applyLink = `/frontend/pages/apply_home.html?job_id=${job.job_id}&title=${encodeURIComponent(job.job_title || '')}&company=${encodeURIComponent(job.company_name || '')}&location=${encodeURIComponent(job.location || '')}&desc=${encodeURIComponent(job.description || '')}`;

        article.innerHTML = `
            <div class="job-card-header">
                <div>
                    <a href="${applyLink}" class="job-title">${job.job_title}</a>
                    <div class="company">${job.company_name}</div>
                </div>
                <div class="company-logo-placeholder">${logoText}</div>
            </div>
            
            <div class="job-meta-grid">
                <div class="meta-item location"><i class="fas fa-map-marker-alt"></i> ${job.location || 'India'}</div>
                <div class="meta-item"><i class="fas fa-briefcase"></i> ${job.experience_level || '0-3'} Yrs</div>
                <div class="meta-item"><i class="fas fa-wallet"></i> ${job.salary || 'Not Disclosed'}</div>
            </div>

            <div class="job-tags">
                <span class="job-tag">${job.job_type || 'Full Time'}</span>
                <span class="job-tag">${category.toUpperCase()}</span>
                <span class="job-tag">Verified</span>
            </div>

            <p class="details">${cleanDesc(job.description)}</p>
            
            <div class="job-footer">

                <span class="posted-date">Posted Just Now</span>

                <div style="display: flex; gap: 15px; align-items: center;">

                    ${isAdmin ? `
                    <button class="save-job-btn-flat" 
                    style="color:#ff4d4d;" 
                    onclick="adminDel(${job.job_id}, this)">
                    <i class="fas fa-trash"></i> Delete
                    </button>` : ''}

                    <button class="save-job-btn-flat" 
                    onclick="saveJob(${job.job_id}, this)">
                    <i class="far fa-bookmark"></i> Save
                    </button>

                    <a href="${applyLink}" class="apply-btn">
                    View Details
                    </a>

                </div>

            </div>
        `;

        return article;
    };


    window.adminDel = async (id, btn) => {

        if (!confirm("Permanently remove this job?")) return;

        try {

            const res = await fetch(`${getAPIURL()}/admin/jobs/${id}`, {
                method: "DELETE"
            });

            if (res.ok)
                btn.closest(".job-card").remove();

        } catch (e) {

            alert("Delete failed");

        }
    };


    // Global Search Filter Logic
    const performSearch = () => {

        const roleQuery = roleSearchInput ? roleSearchInput.value.toLowerCase().trim() : "";
        const locQuery = locationSearchInput ? locationSearchInput.value.toLowerCase().trim() : "";

        const allCards = document.querySelectorAll(".job-card");

        let count = 0;

        allCards.forEach(card => {

            const fullText = card.innerText.toLowerCase();

            const locationElem = card.querySelector('.location');
            const locText = locationElem ? locationElem.innerText.toLowerCase() : "";

            const matchRole = roleQuery === "" || fullText.includes(roleQuery);
            const matchLoc = locQuery === "" || locText.includes(locQuery);

            if (matchRole && matchLoc) {

                card.style.display = "block";
                count++;

            } else {

                card.style.display = "none";

            }

        });


        const existingNoResults = document.getElementById("noResultsBox");

        if (count === 0) {

            if (!existingNoResults) {

                const box = document.createElement("div");

                box.id = "noResultsBox";

                box.style.cssText = `
                text-align:center;
                padding:50px 0;
                color:#888;
                `;

                box.innerHTML = `
                    <i class="fas fa-search" 
                    style="font-size:3rem; opacity:0.1; margin-bottom:15px;"></i>

                    <h3>No matching jobs found</h3>

                    <p>Try searching for different keywords.</p>
                `;

                jobsContainer.appendChild(box);

            }
        } else if (existingNoResults) {

            existingNoResults.remove();

        }

    };


    if (searchBtn)
        searchBtn.addEventListener("click", performSearch);

    if (roleSearchInput)
        roleSearchInput.addEventListener("keyup", (e) => {
            if (e.key === "Enter") performSearch();
        });

    if (locationSearchInput)
        locationSearchInput.addEventListener("keyup", (e) => {
            if (e.key === "Enter") performSearch();
        });


    // Sync with DB
    async function init() {

        try {

            const API_BASE_URL = getAPIURL();

            const user = JSON.parse(localStorage.getItem("user") || "{}");

            const isAdmin = user.role === "admin";

            const res = await fetch(`${API_BASE_URL}/jobs/`);

            if (res.ok) {

                const jobs = await res.json();

                const filtered = jobs.filter(j => {

                    const text = (j.job_title + (j.description || "")).toLowerCase();

                    if (category === "software") return /software|developer|it|tech|web|frontend|backend|fullstack|qa|node|react|java/i.test(text);
                    if (category === "marketing") return /marketing|sales|growth|brand|executive|seo|social|ppc|content/i.test(text);
                    if (category === "finance") return /finance|account|audit|tax|ca|analyst|billing|treasury|budget/i.test(text);
                    if (category === "engineering") return /engineer|civil|mechanical|structural|design|electrical|industrial/i.test(text);

                    return false;

                });

                filtered.forEach(j => {
                    jobsContainer.appendChild(renderJob(j, isAdmin));
                });

            }

        } catch (e) {

            console.error("Data Sync Failure");

        }

    }

    init();

});