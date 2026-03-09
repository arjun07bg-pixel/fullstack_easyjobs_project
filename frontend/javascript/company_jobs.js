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

    // ─────────────────────────────────────────────
    // Part 1: Fix Static Job Links
    // ─────────────────────────────────────────────

    function updateCardLinks() {

        const staticJobCards = document.querySelectorAll(".job-card");

        staticJobCards.forEach(card => {

            const title = card.querySelector("h3")?.innerText.trim();
            const link = card.querySelector(".apply-link");

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

        });

    }

    updateCardLinks();


    // ─────────────────────────────────────────────
    // Part 2: Filter Utilities
    // ─────────────────────────────────────────────

    const searchInput = document.querySelector(".search-bar input");
    const searchBtn = document.querySelector(".search-btn");
    const applyBtn = document.querySelector(".apply-filters-btn");


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

        let visibleCount = 0;

        jobCards.forEach(card => {

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