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
            const title = card.querySelector(".is-title")?.textContent.toLowerCase() || "";
            const company = card.querySelector(".is-company")?.textContent.toLowerCase() || "";
            const locText = card.querySelector(".is-location")?.textContent.toLowerCase() || "";

            // Calculate stipend
            let stipendVal = 0;
            card.querySelectorAll(".detail-item").forEach(item => {
                if (item.textContent.includes("STIPEND")) {
                    const valText = item.querySelector(".detail-value")?.textContent || "0";
                    stipendVal = parseInt(valText.replace(/[^0-9]/g, "")) || 0;
                }
            });

            const tags = Array.from(card.querySelectorAll(".is-tag")).map(t => t.textContent.toLowerCase());

            const matchesProfile = !profile || title.includes(profile) || company.includes(profile);
            const matchesLocation = !location || locText.includes(location);
            const matchesStipend = stipendVal >= minStipend;
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
            headingCount.textContent = visibleCount
                ? `${visibleCount.toLocaleString()}+ internships matching your choice`
                : `No internships matching your criteria`;
        }
    }

    // Admin Delete Feature
    const user = JSON.parse(localStorage.getItem("user") || "{}");
    const isAdmin = user.user_type === "admin";

    if (isAdmin) {
        cards.forEach(card => {
            const footer = card.querySelector(".is-card-footer");
            if (footer) {
                const deleteBtn = document.createElement("button");
                deleteBtn.innerHTML = '<i class="fas fa-trash-alt"></i> Delete';
                deleteBtn.className = "admin-delete-btn";
                deleteBtn.style.cssText = `
                    background:#fee2e2; color:#ef4444; border:none;
                    padding:8px 15px; border-radius:4px; cursor:pointer;
                    font-weight:600; font-size:13px; margin-right:15px;
                `;
                deleteBtn.addEventListener("click", e => {
                    e.preventDefault();
                    if (confirm("Are you sure you want to delete this internship?")) {
                        card.style.transition = "opacity 0.3s";
                        card.style.opacity = "0";
                        setTimeout(() => {
                            card.remove();
                            applyFilters();
                        }, 300);
                    }
                });
                footer.prepend(deleteBtn);
            }
        });
    }

    // Event Listeners
    [profileFilter, locationFilter].forEach(el => el?.addEventListener("keyup", applyFilters));
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