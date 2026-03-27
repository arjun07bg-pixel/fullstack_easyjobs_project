/**
 * Company Specific Jobs Logic
 * Handles both API-fetched jobs and static HTML job cards with robust filtering.
 */

const getAPIURL = () => {
    if (window.getEasyJobsAPI) return window.getEasyJobsAPI();
    return "/api";
};

document.addEventListener("DOMContentLoaded", async () => {

    const jobListings = document.querySelector(".job-listings");
    const companyHeader = document.querySelector("h1");
    const searchInput = document.getElementById("job-search") || document.getElementById("jobSearch");
    const searchBtn = document.getElementById("search-btn") || document.getElementById("searchBtn");
    const filterForm = document.getElementById("filter-form") || document.getElementById("filterForm");
    const applyBtn = document.getElementById("apply-filters-btn") || document.getElementById("applyFilters");

    if (!companyHeader || !jobListings) return;

    const companyName = companyHeader.textContent
        .replace("Careers", "")
        .replace("Job Openings", "")
        .trim();

    console.log(`🚀 Company Jobs Manager active for: ${companyName}`);

    // --- 📊 Part 0: Dynamic Company Stats ---
    async function loadCompanyStats() {
        try {
            const statsContainer = document.querySelector(".co-overview-content") || document.querySelector(".company-overview");
            if (!statsContainer) return;

            const response = await fetch(`${getAPIURL()}/admin/stats/company/${encodeURIComponent(companyName)}`);
            if (!response.ok) return;
            const stats = await response.json();

            // Create or Find Stats Row
            let statsRow = document.getElementById("dynamic-company-stats");
            if (!statsRow) {
                statsRow = document.createElement("div");
                statsRow.id = "dynamic-company-stats";
                statsRow.style.cssText = "display:flex; gap:12px; flex-wrap:wrap; margin-top:16px; padding-top:16px; border-top:1px dashed #e2e8f0;";
                
                // Find existing stats row to insert after
                const existingRow = statsContainer.querySelector("div[style*='display:flex']");
                if (existingRow) {
                    existingRow.insertAdjacentElement('afterend', statsRow);
                } else {
                    statsContainer.appendChild(statsRow);
                }
            }

            statsRow.innerHTML = `
                <div class="co-stat" style="flex:1; min-width:140px; padding:12px; background:#f8fafc; border-radius:12px; text-align:center;">
                    <div style="color:#2563eb; font-size:18px; margin-bottom:4px;"><i class="fas fa-users"></i></div>
                    <div style="font-size:16px; font-weight:700; color:#0f172a;">${stats.total_applied || 0}</div>
                    <div style="font-size:10px; color:#64748b; font-weight:600; text-transform:uppercase;">People Applied</div>
                </div>
                <div class="co-stat" style="flex:1; min-width:140px; padding:12px; background:#f8fafc; border-radius:12px; text-align:center;">
                    <div style="color:#2563eb; font-size:18px; margin-bottom:4px;"><i class="fas fa-eye"></i></div>
                    <div style="font-size:16px; font-weight:700; color:#0f172a;">${stats.total_views || 0}</div>
                    <div style="font-size:10px; color:#64748b; font-weight:600; text-transform:uppercase;">Total Views</div>
                </div>
                <div class="co-stat" style="flex:1; min-width:140px; padding:12px; background:#f8fafc; border-radius:12px; text-align:center;">
                    <div style="color:#059669; font-size:18px; margin-bottom:4px;"><i class="fas fa-check-circle"></i></div>
                    <div style="font-size:16px; font-weight:700; color:#0f172a;">${stats.hired || 0}</div>
                    <div style="font-size:10px; color:#64748b; font-weight:600; text-transform:uppercase;">Recently Hired</div>
                </div>
            `;
        } catch (err) {
            console.warn("Failed to load company stats:", err);
        }
    }

    loadCompanyStats();

    /** --- 🛠️ Part 1: Fix Static Job Cards --- */
    function updateStaticCards() {
        const staticJobCards = document.querySelectorAll(".job-card");
        staticJobCards.forEach(card => {
            const title = card.querySelector("h3")?.innerText.trim();
            const link = card.querySelector(".apply-link");
            const saveBtn = card.querySelector(".comp-save-btn");

            // Fix links for static cards to point to apply_home with full params
            if (title && link && !link.href.includes('job_id=')) {
                const meta = card.querySelector(".job-meta")?.innerText || "";
                const location = meta.split("|")[0]?.replace("📍", "").trim() || "Remote";
                const type = meta.split("|")[1]?.trim() || "Full-Time";
                const exp = meta.split("|")[2]?.trim() || "Not Specified";
                const desc = card.querySelector(".job-description")?.innerText.trim() || "";

                const params = new URLSearchParams({
                    title: title,
                    company: companyName,
                    location: location,
                    type: type,
                    exp: exp,
                    desc: desc,
                    mode: 'On-site'
                });
                link.href = `/frontend/pages/apply_home.html?${params.toString()}`;
            }

            // Save logic for static cards (Uses local storage fallback if no ID)
            if (saveBtn) {
                saveBtn.addEventListener("click", async (e) => {
                    e.stopPropagation();
                    const jobId = saveBtn.getAttribute("data-id");
                    if (jobId) {
                        // Global save helper from index.js
                        if (window.saveJob) await window.saveJob(jobId, saveBtn);
                    } else {
                        // Purely static - mark as saved in UI
                        saveBtn.innerHTML = '<i class="fas fa-bookmark" style="color:#2563eb"></i> Saved';
                        if (window.showMessage) window.showMessage("Static job saved to session!", "success");
                    }
                });
            }
        });
    }

    /** --- 🌐 Part 2: Fetch and Render API Jobs --- */
    async function loadDynamicJobs() {
        try {
            const response = await fetch(`${getAPIURL()}/jobs/`);
            if (!response.ok) return;

            const allJobs = await response.json();
            const companyJobs = allJobs.filter(job => 
                job.company_name.toLowerCase().includes(companyName.toLowerCase())
            );

            if (companyJobs.length === 0) return;

            companyJobs.forEach(job => {
                const card = document.createElement("div");
                card.className = "job-card dynamic-job";
                card.setAttribute("data-type", job.job_type || "Full-Time");
                card.setAttribute("data-location", (job.location || "Remote").toLowerCase());
                
                card.innerHTML = `
                    <h3>${job.job_title}</h3>
                    <span class="comp-name">${job.company_name}</span>
                    <p class="job-meta">
                        <span class="location"><i class="fas fa-map-marker-alt"></i> ${job.location || 'Remote'}</span> |
                        <span class="type"><i class="fas fa-briefcase"></i> ${job.job_type || 'Full-Time'}</span> |
                        <span class="exp"><i class="fas fa-history"></i> ${job.experience_level}+ years</span>
                    </p>
                    <p class="job-description">${job.description || 'Join our team to drive innovation and excellence.'}</p>
                    <div class="job-tags">
                        <span class="tag">Recent</span>
                        <span class="tag">${job.job_type || 'Full-Time'}</span>
                    </div>
                    <div class="job-footer">
                        <span class="posted-date">Posted via API</span>
                        <div class="action-btns">
                            <a href="/frontend/pages/apply_home.html?job_id=${job.job_id}" class="apply-link">Apply Now</a>
                            <button class="comp-save-btn" data-id="${job.job_id}"><i class="far fa-bookmark"></i> Save</button>
                        </div>
                    </div>
                `;

                // Handle Save for dynamic card
                const saveBtn = card.querySelector(".comp-save-btn");
                saveBtn.addEventListener("click", (e) => {
                    e.stopPropagation();
                    if (window.saveJob) window.saveJob(job.job_id, saveBtn);
                });

                jobListings.appendChild(card);
            });

            console.log(`✅ Loaded ${companyJobs.length} additional jobs for ${companyName}`);
        } catch (err) {
            console.warn("Could not fetch additional jobs:", err);
        }
    }

    /** --- 🔍 Part 3: Filtering Logic --- */
    function filterJobs() {
        if (window.filterJobs) {
            window.filterJobs();
            return;
        }
        
        // Fallback filter logic if enhancements script is missing
        const query = searchInput?.value.toLowerCase().trim() || "";
        const allCards = document.querySelectorAll(".job-card");
        let visibleCount = 0;

        allCards.forEach(card => {
            const title = card.querySelector("h3")?.innerText.toLowerCase() || "";
            const desc = card.querySelector(".job-description")?.innerText.toLowerCase() || "";
            const meta = card.querySelector(".job-meta")?.innerText.toLowerCase() || "";

            const matchesQuery = !query || title.includes(query) || desc.includes(query) || meta.includes(query);

            if (matchesQuery) {
                card.style.display = "block";
                visibleCount++;
            } else {
                card.style.display = "none";
            }
        });

        const heading = jobListings.querySelector("h2") || document.getElementById("results-heading");
        if (heading) heading.textContent = visibleCount === 0 ? "No Jobs Found matching your filters" : `Showing ${visibleCount} Jobs`;
    }

    // Initialize
    updateStaticCards();
    await loadDynamicJobs();
    
    // Initial filter/count
    setTimeout(() => {
        if (window.filterJobs) window.filterJobs();
        else filterJobs();
    }, 100);

    // Listeners
    if (searchBtn) searchBtn.addEventListener("click", () => window.filterJobs ? window.filterJobs() : filterJobs());
    if (applyBtn) applyBtn.addEventListener("click", (e) => { e.preventDefault(); if (window.filterJobs) window.filterJobs(); else filterJobs(); });
    if (searchInput) searchInput.addEventListener("keyup", (e) => { if (e.key === "Enter") { if (window.filterJobs) window.filterJobs(); else filterJobs(); } });
});
