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

    if (!companyHeader || !jobListings) return;

    const companyName = companyHeader.textContent
        .replace("Careers", "")
        .replace("Job Openings", "")
        .trim();

    console.log(`🚀 Company Jobs Manager active for: ${companyName}`);

<<<<<<< HEAD
    // --- Part 1: Fix Static Job Links & Save Buttons ---
    function updateStaticCards() {
=======
    // ─────────────────────────────────────────────
    // Part 1: Fix Static Job Links
    // ─────────────────────────────────────────────

    function updateCardLinks() {

>>>>>>> a40fdfebe27c4604f34940a046c81aa58b0b117f
        const staticJobCards = document.querySelectorAll(".job-card");

        staticJobCards.forEach(card => {

            const title = card.querySelector("h3")?.innerText.trim();
            const link = card.querySelector(".apply-link");
            const saveBtn = card.querySelector(".comp-save-btn");

<<<<<<< HEAD
            // Fix Link
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

            // Click to Apply
            card.addEventListener("click", () => {
                if (link) window.location.href = link.href;
            });

            // Save Logic for Static Cards
            if (saveBtn) {
                saveBtn.addEventListener("click", async (e) => {
                    e.stopPropagation();
                    const user = JSON.parse(localStorage.getItem("user") || "{}");
                    if (!user.user_id) {
                        if (window.showMessage) window.showMessage("Please login to save.", "error");
                        else alert("Please login to save.");
                        return;
                    }
                    saveBtn.innerHTML = '<i class="fas fa-bookmark" style="color:#2563eb"></i> Saved';
                    if (window.showMessage) window.showMessage("Job saved!", "success");
                });
            }
=======
            if (!title || !link) return;

            const meta = card.querySelector(".job-meta")?.innerText || "";

            const parts = meta.split("|");

            const location =
                parts[0]?.replace(/[^a-zA-Z\s]/g, "").trim() || "Remote";

            const type =
                parts[1]?.trim() || "Full-Time";

            const exp =
                parts[2]?.trim() || "Not Specified";

            const desc =
                card.querySelector(".job-description")?.innerText.trim() || "";

            const params = new URLSearchParams({
                title: title,
                company: companyName,
                location: location,
                type: type,
                exp: exp,
                desc: desc,
                mode: "On-site"
            });

            link.href = `./apply_home.html?${params.toString()}`;

>>>>>>> a40fdfebe27c4604f34940a046c81aa58b0b117f
        });

<<<<<<< HEAD
    // --- Part 2: Fetch Dynamic Jobs from API ---
    try {
        const API_BASE_URL = getAPIURL();
        const response = await fetch(`${API_BASE_URL}/jobs/`);
        if (response.ok) {
            const allJobs = await response.json();
            const companyJobs = allJobs.filter(job =>
                job.company_name.toLowerCase().includes(companyName.toLowerCase())
            );

            if (companyJobs.length > 0) {
                companyJobs.forEach(job => {
                    const card = document.createElement("div");
                    card.className = "job-card";
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
                            <span class="tag">New Opening</span>
                            <span class="tag">${job.job_type || 'Full-Time'}</span>
                        </div>
                        <div class="job-footer">
                            <span class="posted-date">Posted Just Now</span>
                            <div class="action-btns">
                                <a href="/frontend/pages/apply_home.html?job_id=${job.job_id}" class="apply-link">Apply Now</a>
                                <button class="comp-save-btn" data-id="${job.job_id}"><i class="far fa-bookmark"></i> Save</button>
                            </div>
                        </div>
                    `;

                    // Handle Save
                    const saveBtn = card.querySelector(".comp-save-btn");
                    saveBtn.addEventListener("click", async (e) => {
                        e.stopPropagation();
                        const user = JSON.parse(localStorage.getItem("user") || "{}");
                        if (!user.user_id) {
                            if (window.showMessage) window.showMessage("Please login to save.", "error");
                            else alert("Please login to save.");
                            return;
                        }

                        try {
                            const res = await fetch(`${getAPIURL()}/saved-jobs/`, {
                                method: "POST",
                                headers: { "Content-Type": "application/json" },
                                body: JSON.stringify({ user_id: user.user_id, job_id: job.job_id })
                            });
                            if (res.ok) {
                                saveBtn.innerHTML = '<i class="fas fa-bookmark" style="color:#2563eb"></i> Saved';
                                if (window.showMessage) window.showMessage("Job saved!", "success");
                            }
                        } catch (err) { console.error(err); }
                    });

                    // Card Click to Details
                    card.addEventListener("click", () => {
                        window.location.href = card.querySelector(".apply-link").href;
                    });

                    jobListings.appendChild(card);
                });
            }
        }
    } catch (error) {
        console.warn("⚠️ API fetch failed:", error);
=======
>>>>>>> a40fdfebe27c4604f34940a046c81aa58b0b117f
    }

    updateStaticCards();


    // ─────────────────────────────────────────────
    // Part 2: Filter Utilities
    // ─────────────────────────────────────────────

    const searchInput = document.querySelector(".search-bar input");
    const searchBtn = document.querySelector(".search-btn");
    const applyBtn = document.querySelector(".apply-filters-btn");

<<<<<<< HEAD
    function filterJobs() {
        const query = (searchInput?.value || "").toLowerCase().trim();
        const jobCards = document.querySelectorAll(".job-card");

        const getActiveValues = (selector) => {
            const section = document.querySelector(selector);
            if (!section) return [];
            const checked = Array.from(section.querySelectorAll('input:checked'));
            if (checked.length > 0) return checked.map(cb => cb.value.toLowerCase());
            const select = section.querySelector('select');
            if (select && select.value) return [select.value.toLowerCase()];
            return [];
        };

        const activeLocations = getActiveValues('.filter-section:nth-of-type(1)');
        const activeExps = getActiveValues('.filter-section:nth-of-type(2)');
        const activeTypes = getActiveValues('.filter-section:nth-of-type(3)');
=======

    function getSelectedOptions(keyword) {

        const sections =
            document.querySelectorAll(".filter-section, .filter-group");

        let selected = [];

        sections.forEach(sec => {

            const heading =
                (sec.querySelector("h4") ||
                    sec.querySelector("label") ||
                    sec.querySelector("h3"))?.textContent.toLowerCase() || "";

            if (!heading.includes(keyword.toLowerCase())) return;

            const checkboxes =
                sec.querySelectorAll('input[type="checkbox"]:checked');

            checkboxes.forEach(cb => {

                const label =
                    cb.parentElement.textContent
                        .trim()
                        .toLowerCase();

                const cleanName =
                    label.split("(")[0].trim();

                selected.push(cleanName);

            });

            const select = sec.querySelector("select");

            if (select && select.value &&
                !select.value.toLowerCase().includes("all")) {

                selected.push(
                    select.value.toLowerCase().trim()
                );
            }

        });

        return selected;
    }


    // ─────────────────────────────────────────────
    // Part 3: Filtering Logic
    // ─────────────────────────────────────────────

    function filterJobs() {

        const query =
            searchInput?.value.toLowerCase().trim() || "";

        const jobCards =
            document.querySelectorAll(".job-card");

        const activeLocations = getSelectedOptions("location");
        const activeTypes = getSelectedOptions("type");
        const activeModes = getSelectedOptions("mode");
        const activeFunctions = getSelectedOptions("function");
>>>>>>> a40fdfebe27c4604f34940a046c81aa58b0b117f

        let visibleCount = 0;

        jobCards.forEach(card => {
<<<<<<< HEAD
            const title = card.querySelector("h3")?.innerText.toLowerCase() || "";
            const meta = card.querySelector(".job-meta")?.innerText.toLowerCase() || "";
            const desc = card.querySelector(".job-description")?.innerText.toLowerCase() || "";
            const tags = Array.from(card.querySelectorAll(".tag")).map(t => t.innerText.toLowerCase()).join(" ");

            const matchesQuery = !query || title.includes(query) || desc.includes(query) || tags.includes(query);
            const matchesLoc = activeLocations.length === 0 || activeLocations.some(loc => meta.includes(loc));

            // Smarter exp matching: if user picks "1-3 Years", match cards that contain "1-3" or "1+" or "2+" etc.
            const matchesExp = activeExps.length === 0 || activeExps[0] === "" || activeExps.some(exp => {
                const baseExp = exp.split('-')[0].split(' ')[0].trim(); // Get "1" from "1-3 Years"
                return meta.includes(exp) || meta.includes(baseExp);
            });

            const matchesType = activeTypes.length === 0 || activeTypes.some(t => meta.includes(t));
=======

            const titleElement =
                card.querySelector(".job-title") ||
                card.querySelector("h3");

            const metaElement =
                card.querySelector(".job-meta-naukri") ||
                card.querySelector(".job-meta");

            const descElement =
                card.querySelector(".job-desc-naukri") ||
                card.querySelector(".job-description");

            if (!titleElement || !metaElement || !descElement) return;

            const title = titleElement.innerText.toLowerCase();
            const meta = metaElement.innerText.toLowerCase();
            const desc = descElement.innerText.toLowerCase();

            const tags = Array
                .from(card.querySelectorAll(".tag, .skill-tag"))
                .map(t => t.innerText.toLowerCase());

            const matchesQuery =
                !query ||
                title.includes(query) ||
                desc.includes(query) ||
                tags.some(t => t.includes(query)) ||
                meta.includes(query);

            const matchesLoc =
                activeLocations.length === 0 ||
                activeLocations.some(loc =>
                    meta.includes(loc)
                );

            const matchesType =
                activeTypes.length === 0 ||
                activeTypes.some(t =>
                    meta.includes(t)
                );

            const matchesMode =
                activeModes.length === 0 ||
                activeModes.some(m =>
                    meta.includes(m) ||
                    desc.includes(m)
                );

            const matchesFunc =
                activeFunctions.length === 0 ||
                activeFunctions.some(func => {

                    const key =
                        func.split(" ")[0];

                    return (
                        title.includes(key) ||
                        desc.includes(key) ||
                        tags.some(t => t.includes(key))
                    );
                });

            if (
                matchesQuery &&
                matchesLoc &&
                matchesType &&
                matchesMode &&
                matchesFunc
            ) {
>>>>>>> a40fdfebe27c4604f34940a046c81aa58b0b117f

                card.style.display = "block";
                visibleCount++;

            } else {

                card.style.display = "none";

            }

        });


        const numHeader =
            jobListings.querySelector("h2");

        if (numHeader)
            numHeader.textContent =
                `Showing ${visibleCount} Jobs`;

    }


    // ─────────────────────────────────────────────
    // Event Listeners
    // ─────────────────────────────────────────────

    if (searchBtn)
        searchBtn.addEventListener("click", filterJobs);

    if (applyBtn) {

        applyBtn.addEventListener("click", (e) => {

            e.preventDefault();
            filterJobs();

        });

<<<<<<< HEAD
        const heading = jobListings.querySelector("h2");
        if (heading) {
            heading.textContent = visibleCount === 0 ? "No Jobs Found matching your filters" : `Showing ${visibleCount} Jobs`;
        }
    }

    if (searchBtn) searchBtn.addEventListener("click", filterJobs);
    if (applyBtn) applyBtn.addEventListener("click", filterJobs);
    if (searchInput) searchInput.addEventListener("keyup", (e) => { if (e.key === "Enter") filterJobs(); });

    // Initial heading update
    const initialHeading = jobListings.querySelector("h2");
    if (initialHeading) initialHeading.textContent = `Showing ${document.querySelectorAll(".job-card").length} Jobs`;
});





=======
    }

    if (searchInput) {

        searchInput.addEventListener("keyup", (e) => {

            if (e.key === "Enter")
                filterJobs();

        });

    }


    // ─────────────────────────────────────────────
    // Initial Job Count
    // ─────────────────────────────────────────────

    setTimeout(() => {

        const jobCards =
            document.querySelectorAll(".job-card");

        const numHeader =
            document.querySelector(".job-listings h2");

        if (numHeader)
            numHeader.textContent =
                `Showing ${jobCards.length} Jobs`;

    }, 200);

});
>>>>>>> a40fdfebe27c4604f34940a046c81aa58b0b117f
