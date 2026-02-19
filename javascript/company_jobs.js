/**
 * Company Specific Jobs Logic
 * Handles both API-fetched jobs and static HTML job cards.
 */

const API_BASE_URL = "http://127.0.0.1:8000/api";

document.addEventListener("DOMContentLoaded", async () => {
    const jobListings = document.querySelector(".job-listings");
    const companyHeader = document.querySelector("h1");
    if (!companyHeader || !jobListings) return;

    // Extract company name from header (e.g., "Amazon Careers" -> "Amazon")
    const companyName = companyHeader.textContent.replace("Careers", "").replace("Job Openings", "").trim();
    console.log(`🚀 Company Jobs Manager active for: ${companyName}`);

    // --- Part 1: Fix Static Job Links ---
    function updateCardLinks() {
        const staticJobCards = document.querySelectorAll(".job-card");
        staticJobCards.forEach(card => {
            const title = card.querySelector("h3")?.innerText.trim();
            const link = card.querySelector(".apply-link");

            if (title && link) {
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
                    mode: 'On-site' // Default for company jobs
                });
                link.href = `/apply_home.html?${params.toString()}`;
            }
        });
    }

    // --- Part 2: Fetch Dynamic Jobs from API ---
    try {
        const response = await fetch(`${API_BASE_URL}/jobs/`);
        if (response.ok) {
            const allJobs = await response.json();
            const companyJobs = allJobs.filter(job =>
                job.company_name.toLowerCase().includes(companyName.toLowerCase())
            );

            if (companyJobs.length > 0) {
                const heading = jobListings.querySelector("h2");
                companyJobs.forEach(job => {
                    const card = document.createElement("div");
                    card.className = "job-card";
                    card.innerHTML = `
                        <div style="display:flex; justify-content:space-between; align-items:center;">
                            <h3>${job.job_title}</h3>
                            <button class="comp-save-btn" data-id="${job.job_id}" style="background:none; border:none; color:#2563eb; cursor:pointer; font-size:1.1rem; padding:5px;"><i class="far fa-bookmark"></i> Save</button>
                        </div>
                        <p class="job-meta">
                            <span class="location">📍 ${job.location || 'Remote'}</span> |
                            <span class="type">${job.job_type || 'Full-Time'}</span> |
                            <span class="exp">${job.experience_level}+ years exp</span>
                        </p>
                        <p class="job-description">${job.description || 'Job details are provided in the company portal.'}</p>
                        <div class="job-tags">
                            <span class="tag">System</span>
                            <span class="tag">Innovation</span>
                        </div>
                        <a href="/apply_home.html?job_id=${job.job_id}" class="apply-link">View Details & Apply</a>
                    `;

                    // Handle Save
                    const saveBtn = card.querySelector(".comp-save-btn");
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
                                body: JSON.stringify({ user_id: user.user_id, job_id: job.job_id })
                            });
                            if (res.ok) {
                                saveBtn.innerHTML = '<i class="fas fa-bookmark"></i> Saved';
                                alert("Job saved successfully!");
                            } else {
                                const err = await res.json();
                                alert(err.detail || "Error saving job.");
                            }
                        } catch (err) { alert("Network error."); }
                    });

                    jobListings.appendChild(card);
                });
            }
        }
    } catch (error) {
        console.warn("⚠️ API fetch failed:", error);
    }

    updateCardLinks();

    // --- Part 3: Live Filtering & Search ---
    const searchInput = document.querySelector(".search-bar input");
    const searchBtn = document.querySelector(".search-btn");
    const applyBtn = document.querySelector(".apply-filters-btn");

    function filterJobs() {
        const query = searchInput?.value.toLowerCase().trim() || "";
        const jobCards = document.querySelectorAll(".job-card");

        // Get active filters
        const activeLocations = Array.from(document.querySelectorAll('.filter-section:nth-of-type(1) input:checked')).map(cb => cb.value.toLowerCase());
        const activeExps = Array.from(document.querySelectorAll('.filter-section:nth-of-type(2) input:checked')).map(cb => cb.value.toLowerCase());
        const activeModes = Array.from(document.querySelectorAll('.filter-section:nth-of-type(3) input:checked')).map(cb => cb.value.toLowerCase());
        const activeTypes = Array.from(document.querySelectorAll('.filter-section:nth-of-type(4) input:checked')).map(cb => cb.value.toLowerCase());

        let visibleCount = 0;
        jobCards.forEach(card => {
            const title = card.querySelector("h3").innerText.toLowerCase();
            const meta = card.querySelector(".job-meta").innerText.toLowerCase();
            const desc = card.querySelector(".job-description").innerText.toLowerCase();

            const matchesQuery = !query || title.includes(query) || desc.includes(query);
            const matchesLoc = activeLocations.length === 0 || activeLocations.some(loc => meta.includes(loc));
            const matchesExp = activeExps.length === 0 || activeExps.some(exp => meta.includes(exp));
            const matchesType = activeTypes.length === 0 || activeTypes.some(t => meta.includes(t));

            if (matchesQuery && matchesLoc && matchesExp && matchesType) {
                card.style.display = "block";
                visibleCount++;
            } else {
                card.style.display = "none";
            }
        });

        const heading = jobListings.querySelector("h2");
        if (heading) heading.textContent = `Showing ${visibleCount} Jobs`;
    }

    if (searchBtn) searchBtn.addEventListener("click", filterJobs);
    if (applyBtn) applyBtn.addEventListener("click", filterJobs);
    if (searchInput) {
        searchInput.addEventListener("keyup", (e) => {
            if (e.key === "Enter") filterJobs();
        });
    }

    // Initialize display count
    const initialHeading = jobListings.querySelector("h2");
    if (initialHeading) {
        initialHeading.textContent = `Showing ${document.querySelectorAll(".job-card").length} Jobs`;
    }
});
