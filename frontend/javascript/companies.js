/**
 * Companies Page – Search & Filter Logic
 */

document.addEventListener("DOMContentLoaded", () => {
    const searchInput = document.querySelector("#company-search") || document.querySelector(".search-box input");
    const grid = document.querySelector(".companies-grid");
    const categoryCheckboxes = document.querySelectorAll("#category-filters input");
    const locationCheckboxes = document.querySelectorAll("#location-filters input");
    const sizeCheckboxes = document.querySelectorAll("#size-filters input");
    const clearBtn = document.getElementById("clear-all-filters");
    const chipsContainer = document.getElementById("filter-chips-container");
    
    let cards = document.querySelectorAll(".company-card");

    const noResultsMsg = document.createElement("div");
    noResultsMsg.id = "no-results-msg";
    noResultsMsg.style.cssText = "grid-column:1/-1;text-align:center;padding:80px 32px;display:none;flex-direction:column;align-items:center;gap:20px;background:white;border-radius:24px;border:2px dashed #e2e8f0;margin-top:20px;";
    noResultsMsg.innerHTML = `
        <div style="width:100px; height:100px; background:#f8fafc; border-radius:50%; display:flex; align-items:center; justify-content:center; color:#cbd5e1; font-size:40px;">
            <i class="fas fa-building"></i>
        </div>
        <div>
            <h3 style="color:#0f172a; font-size:22px; font-weight:700; margin:0 0 10px;">No companies match your filters</h3>
            <p style="color:#64748b; font-size:15px; margin:0 0 24px; max-width:400px; margin-inline:auto;">We couldn't find any companies matching your current selection. Try broadening your search or clearing all filters.</p>
            <button id="no-results-clear" style="background:#2563eb; color:white; border:none; border-radius:12px; padding:12px 32px; font-weight:600; cursor:pointer; font-family:'Poppins',sans-serif; transition:0.2s;">
                <i class="fas fa-undo"></i> Clear All Filters
            </button>
        </div>
    `;
    if (grid) grid.appendChild(noResultsMsg);
    
    noResultsMsg.querySelector("#no-results-clear")?.addEventListener("click", () => {
        if (clearBtn) clearBtn.click();
    });

    const applyFilters = () => {
        const query = (searchInput?.value || "").toLowerCase().trim();
        const selectedCats = Array.from(categoryCheckboxes).filter(i => i.checked).map(i => i.value.toLowerCase());
        const selectedLocs = Array.from(locationCheckboxes).filter(i => i.checked).map(i => i.value.toLowerCase());
        const selectedSizes = Array.from(sizeCheckboxes).filter(i => i.checked).map(i => i.value.toLowerCase());

        let visibleCount = 0;
        cards = document.querySelectorAll(".company-card");

        cards.forEach(card => {
            const name = (card.querySelector("h3")?.innerText || "").toLowerCase();
            const tags = Array.from(card.querySelectorAll(".tag")).map(t => t.innerText.toLowerCase());
            const desc = (card.querySelector(".company-description")?.innerText || "").toLowerCase();
            const location = (card.querySelector(".detail-item")?.innerText || "").toLowerCase(); // First detail item is location
            const size = (card.querySelector(".detail-item:nth-child(2)")?.innerText || "").toLowerCase();

            const matchesQuery = !query || name.includes(query) || tags.some(t => t.includes(query)) || desc.includes(query);
            const matchesCat = selectedCats.length === 0 || selectedCats.some(cat => tags.includes(cat) || name.includes(cat));
            const matchesLoc = selectedLocs.length === 0 || selectedLocs.some(loc => location.includes(loc));
            const matchesSize = selectedSizes.length === 0 || selectedSizes.some(sz => size.includes(sz));

            const isVisible = matchesQuery && matchesCat && matchesLoc && matchesSize;
            card.style.display = isVisible ? "flex" : "none";
            if (isVisible) visibleCount++;
        });

        if (noResultsMsg) noResultsMsg.style.display = visibleCount === 0 ? "flex" : "none";
        renderChips(selectedCats, selectedLocs, selectedSizes);
    };

    const renderChips = (cats, locs, sizes) => {
        if (!chipsContainer) return;
        const all = [...cats, ...locs, ...sizes];
        if (all.length === 0) {
            chipsContainer.innerHTML = "";
            return;
        }

        chipsContainer.innerHTML = all.map(f => `
            <div class="chip">
                ${f.charAt(0).toUpperCase() + f.slice(1)} 
                <i class="fas fa-times" onclick="removeFilter('${f}')"></i>
            </div>
        `).join("");
    };

    window.removeFilter = (val) => {
        const cb = Array.from(document.querySelectorAll(".company-sidebar input")).find(i => i.value.toLowerCase() === val.toLowerCase());
        if (cb) {
            cb.checked = false;
            applyFilters();
        }
    };

    // ── Listeners ──────────────────────────────────────────
    if (searchInput) searchInput.addEventListener("input", applyFilters);
    [...categoryCheckboxes, ...locationCheckboxes, ...sizeCheckboxes].forEach(cb => {
        cb.addEventListener("change", applyFilters);
    });

    if (clearBtn) {
        clearBtn.addEventListener("click", () => {
            if (searchInput) searchInput.value = "";
            [...categoryCheckboxes, ...locationCheckboxes, ...sizeCheckboxes].forEach(i => i.checked = false);
            applyFilters();
        });
    }

    // ── Clickable Cards ────────────────────────────────────
    cards.forEach(card => {
        card.addEventListener("click", (e) => {
            if (e.target.closest("a") || e.target.closest("button")) return;
            const link = card.querySelector(".view-btn");
            if (link?.href) window.location.href = link.href;
        });
    });
});
