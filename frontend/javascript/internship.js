/**
 * Internship Page Filters
 * Handles real-time filtering of static internship cards.
 */

document.addEventListener("DOMContentLoaded", () => {
    const profileFilter = document.getElementById("filter-profile");
    const locationFilter = document.getElementById("filter-location");
    const wfhFilter = document.getElementById("filter-wfh");
    const partTimeFilter = document.getElementById("filter-part-time");
    const stipendFilter = document.getElementById("filter-stipend");
    const clearBtn = document.getElementById("clear-filters");
    const cards = document.querySelectorAll(".is-card");
    const headingCount = document.querySelector(".is-heading h1");

    function applyFilters() {
        const profile = (profileFilter?.value || "").toLowerCase().trim();
        const location = (locationFilter?.value || "").toLowerCase().trim();
        const minStipend = parseInt(stipendFilter?.value || "0");
        const isWFH = wfhFilter?.checked;
        const isPartTime = partTimeFilter?.checked;

        let visibleCount = 0;
        cards.forEach(card => {
            const title = card.querySelector(".is-title")?.innerText.toLowerCase() || "";
            const company = card.querySelector(".is-company")?.innerText.toLowerCase() || "";
            const locText = card.querySelector(".is-location")?.innerText.toLowerCase() || "";

            let stipendVal = 0;
            card.querySelectorAll(".detail-item").forEach(item => {
                if (item.innerText.includes("STIPEND")) {
                    const valText = item.querySelector(".detail-value")?.innerText || "0";
                    stipendVal = parseInt(valText.replace(/[^0-9]/g, "")) || 0;
                }
            });

            const matchesProfile = !profile || title.includes(profile) || company.includes(profile);
            const matchesLocation = !location || locText.includes(location);
            const matchesStipend = stipendVal >= minStipend;

            const tags = Array.from(card.querySelectorAll(".is-tag")).map(t => t.innerText.toLowerCase());
            const matchesWFH = !isWFH || tags.some(t => t.includes("home") || t.includes("remote")) || locText.includes("home") || locText.includes("remote");
            const matchesPartTime = !isPartTime || tags.some(t => t.includes("part"));

            if (matchesProfile && matchesLocation && matchesStipend && matchesWFH && matchesPartTime) {
                card.style.display = "block";
                visibleCount++;
            } else {
                card.style.display = "none";
            }
        });

        if (headingCount) {
            headingCount.innerText = visibleCount > 0
                ? `${visibleCount.toLocaleString()}+ internships matching your choice`
                : `No internships matching your criteria`;
        }
    }

    // Event Listeners
    [profileFilter, locationFilter].forEach(el => el?.addEventListener("keyup", applyFilters)); // Better responsiveness
    [wfhFilter, partTimeFilter, stipendFilter].forEach(el => el?.addEventListener("change", applyFilters));

    clearBtn?.addEventListener("click", () => {
        if (profileFilter) profileFilter.value = "";
        if (locationFilter) locationFilter.value = "";
        if (wfhFilter) wfhFilter.checked = false;
        if (partTimeFilter) partTimeFilter.checked = false;
        if (stipendFilter) stipendFilter.value = "0";
        applyFilters();
    });

    // URL Param Support
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get("keyword") && profileFilter) profileFilter.value = urlParams.get("keyword");
    if (urlParams.get("location") && locationFilter) locationFilter.value = urlParams.get("location");

    applyFilters();
});
