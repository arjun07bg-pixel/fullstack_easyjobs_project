/**
 * Companies Page Search Logic
 * Filters the existing static company cards based on search input.
 */

document.addEventListener("DOMContentLoaded", () => {
    const searchInput = document.querySelector(".search-box input");
    const cards = document.querySelectorAll(".company-card");
    const grid = document.querySelector(".companies-grid");

    // Helper to showing "No results" message
    const noResultsMsg = document.createElement("p");
    noResultsMsg.style.gridColumn = "1/-1";
    noResultsMsg.style.textAlign = "center";
    noResultsMsg.style.fontSize = "1.2rem";
    noResultsMsg.style.color = "#64748b";
    noResultsMsg.style.marginTop = "2rem";
    noResultsMsg.innerText = "No companies found matching your search.";
    noResultsMsg.style.display = "none";

    if (grid) grid.appendChild(noResultsMsg);

    if (searchInput) {
        searchInput.addEventListener("input", (e) => {
            const query = e.target.value.toLowerCase().trim();
            let visibleCount = 0;

            cards.forEach(card => {
                const name = card.querySelector("h3")?.innerText.toLowerCase() || "";
                const tags = Array.from(card.querySelectorAll(".tag")).map(t => t.innerText.toLowerCase()).join(" ");

                if (name.includes(query) || tags.includes(query)) {
                    card.style.display = "flex"; // Restore display
                    visibleCount++;
                } else {
                    card.style.display = "none";
                }
            });

            // Toggle No Results Message
            if (visibleCount === 0) {
                noResultsMsg.style.display = "block";
            } else {
                noResultsMsg.style.display = "none";
            }
        });
    }

    // Make entire company card clickable
    cards.forEach(card => {
        card.addEventListener("click", (e) => {
            // If the user didn't click on the link directly (it already handles itself)
            if (e.target.tagName !== 'A') {
                const link = card.querySelector(".view-btn");
                if (link && link.href) {
                    window.location.href = link.href;
                }
            }
        });

        // Add visual feedback for clickability
        card.style.cursor = "pointer";
    });
});
