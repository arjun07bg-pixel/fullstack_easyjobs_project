/**
 * Companies Page – Search & Click Logic
 */

document.addEventListener("DOMContentLoaded", () => {

    const searchInput =
        document.querySelector("#company-search") ||
        document.querySelector(".search-box input");

    const grid = document.querySelector(".companies-grid");

    let cards = document.querySelectorAll(".company-card");


    // ── "No results" message ──────────────────────────────
    const noResultsMsg = document.createElement("p");

    noResultsMsg.id = "no-results-msg";

    noResultsMsg.style.cssText =
        "grid-column:1/-1;text-align:center;padding:40px 20px;" +
        "color:#94a3b8;font-size:1rem;display:none;";

    noResultsMsg.textContent =
        "No companies found matching your search.";

    if (grid) grid.appendChild(noResultsMsg);



    // ── Search: filter by name, tag, or description ───────
    if (searchInput) {

        searchInput.addEventListener("input", () => {

            const query = searchInput.value
                .toLowerCase()
                .trim();

            let visible = 0;

            // refresh cards (in case dynamic content added)
            cards = document.querySelectorAll(".company-card");

            cards.forEach(card => {

                const name =
                    (card.querySelector("h3")?.innerText || "")
                    .toLowerCase();

                const tags = Array
                    .from(card.querySelectorAll(".tag"))
                    .map(t => t.innerText.toLowerCase())
                    .join(" ");

                const desc =
                    (card.querySelector(".company-description")?.innerText || "")
                    .toLowerCase();


                const matches =
                    !query ||
                    name.includes(query) ||
                    tags.includes(query) ||
                    desc.includes(query);

                card.style.display = matches ? "flex" : "none";

                if (matches) visible++;

            });

            noResultsMsg.style.display =
                visible === 0 ? "block" : "none";

        });

    }



    // ── Make entire card clickable (not just the button) ──
    cards.forEach(card => {

        card.addEventListener("click", (e) => {

            // Ignore button / anchor clicks
            if (
                e.target.closest("a") ||
                e.target.closest("button")
            ) return;

            const link = card.querySelector(".view-btn");

            if (link?.href)
                window.location.href = link.href;

        });

    });

});