import { API_URL } from "./config.js";

/**
 * EasyJobs - Company Page Search Enhancements
 * Features:
 *   1. Real-time autocomplete suggestions on search input
 *   2. "No jobs found" empty state message
 *   3. Active filter chips displayed above job listings
 */

// Utility to get the correct API URL (Port 8000 for Python backend)
const getAPIURL = () => { return API_URL || "/api"; };

(function () {
    'use strict';

    document.addEventListener('DOMContentLoaded', function () {

        const searchInput = document.getElementById('job-search');
        const jobListings = document.querySelector('.job-listings');
        const resultsHeading = document.getElementById('results-heading');

        if (!jobListings) return;

        // ══════════════════════════════════════════════════════════════════════
        // FEATURE 1: AUTOCOMPLETE SUGGESTIONS
        // ══════════════════════════════════════════════════════════════════════

        function buildSuggestions() {
            const pool = new Set();
            document.querySelectorAll('.job-card').forEach(card => {
                const title = card.querySelector('.job-title');
                if (title) {
                    pool.add(title.innerText.trim());
                    title.innerText.trim().split(/\s+/).forEach(word => {
                        if (word.length > 3) pool.add(word);
                    });
                }

                card.querySelectorAll('.skill-tag').forEach(tag => {
                    pool.add(tag.innerText.trim());
                });

                const meta = card.querySelector('.job-meta-naukri');
                if (meta) {
                    meta.querySelectorAll('span').forEach(span => {
                        const txt = span.innerText.replace(/[^\w\s,]/g, '').trim();
                        if (txt.length > 2) pool.add(txt);
                    });
                }
            });

            return Array.from(pool);
        }

        const dropdown = document.createElement('div');
        dropdown.id = 'ej-autocomplete';
        dropdown.style.cssText = [
            'position:absolute','top:100%','left:0','right:0',
            'background:white','border:1px solid #e2e8f0',
            'border-top:none','border-radius:0 0 12px 12px',
            'box-shadow:0 8px 24px rgba(0,0,0,0.1)',
            'z-index:1000','display:none','max-height:240px',
            'overflow-y:auto','font-family:Poppins,sans-serif'
        ].join(';');

        if (searchInput) {

            const searchBar = searchInput.closest('.search-bar');
            if (searchBar) {
                searchBar.style.position = 'relative';
                searchBar.appendChild(dropdown);
            }

            let suggestions = [];
            setTimeout(() => { suggestions = buildSuggestions(); }, 200);

            searchInput.addEventListener('input', function () {

                const query = this.value.toLowerCase().trim();

                if (query.length < 2) {
                    dropdown.style.display = 'none';
                    dropdown.innerHTML = '';
                    return;
                }

                const matches = suggestions.filter(s =>
                    s.toLowerCase().includes(query) && s.toLowerCase() !== query
                ).slice(0, 7);

                if (matches.length === 0) {
                    dropdown.style.display = 'none';
                    return;
                }

                dropdown.innerHTML = matches.map(m => {

                    const idx = m.toLowerCase().indexOf(query);
                    const before = m.slice(0, idx);
                    const match = m.slice(idx, idx + query.length);
                    const after = m.slice(idx + query.length);

                    return `
                        <div class="ej-suggestion" data-value="${m}"
                        style="padding:10px 16px; cursor:pointer; font-size:13px; color:#334155;
                               display:flex; align-items:center; gap:8px; border-bottom:1px solid #f8fafc;
                               transition:background 0.1s;"
                        onmouseover="this.style.background='#f0f7ff'"
                        onmouseout="this.style.background='white'">

                        <i class="fas fa-search" style="color:#94a3b8; font-size:11px;"></i>
                        ${before}<strong style="color:#2563eb;">${match}</strong>${after}

                        </div>
                    `;
                }).join('');

                dropdown.style.display = 'block';

                dropdown.querySelectorAll('.ej-suggestion').forEach(item => {

                    item.addEventListener('click', function () {

                        searchInput.value = this.dataset.value;
                        dropdown.style.display = 'none';

                        const searchBtn = document.getElementById('search-btn');
                        if (searchBtn) searchBtn.click();
                        else searchInput.dispatchEvent(new Event('input', { bubbles: true }));

                    });

                });

            });

            document.addEventListener('click', function (e) {
                if (!searchInput.contains(e.target) && !dropdown.contains(e.target)) {
                    dropdown.style.display = 'none';
                }
            });

            searchInput.addEventListener('keydown', function (e) {
                if (e.key === 'Escape') dropdown.style.display = 'none';
            });

        }

        // ══════════════════════════════════════════════════════════════════════
        // FEATURE 2: "NO JOBS FOUND"
        // ══════════════════════════════════════════════════════════════════════

        function showNoResults(query) {

            removeNoResults();

            const div = document.createElement('div');
            div.id = 'ej-no-results';

            div.style.cssText = [
                'background:white','border-radius:16px',
                'border:1px dashed #cbd5e1','padding:52px 32px',
                'text-align:center','margin-top:8px',
                'font-family:Poppins,sans-serif'
            ].join(';');

            div.innerHTML = `
                <div style="font-size:48px; margin-bottom:16px;">🔍</div>
                <h3 style="font-size:18px; font-weight:700; color:#0f172a; margin:0 0 8px;">
                    No Jobs Found
                </h3>

                <p style="font-size:14px; color:#64748b; margin:0 0 24px; line-height:1.6;">
                    ${query
                    ? `No results for <strong>"${query}"</strong>. Try a different keyword or clear the filters.`
                    : 'No jobs match your current filters. Try adjusting the filters on the left.'}
                </p>

                <button id="ej-clear-all-btn"
                    style="background:#2563eb;color:white;border:none;border-radius:10px;
                           padding:12px 28px;font-size:14px;font-weight:600;cursor:pointer;
                           font-family:Poppins,sans-serif;transition:background 0.2s;">

                    <i class="fas fa-times"></i> Clear All Filters

                </button>
            `;

            jobListings.appendChild(div);

            const clearAll = document.getElementById('ej-clear-all-btn');

            if (clearAll) {

                clearAll.addEventListener('click', function () {

                    const clearBtn = document.getElementById('clear-filters-btn');
                    if (clearBtn) clearBtn.click();

                    if (searchInput) {
                        searchInput.value = '';
                        searchInput.dispatchEvent(new Event('input', { bubbles: true }));
                    }

                    removeNoResults();
                    refreshFilterChips();

                });

            }

        }

        function removeNoResults() {
            const existing = document.getElementById('ej-no-results');
            if (existing) existing.remove();
        }

        // ══════════════════════════════════════════════════════════════════════
        // FEATURE 3: FILTER CHIPS
        // ══════════════════════════════════════════════════════════════════════

        const chipsContainer = document.createElement('div');

        chipsContainer.id = 'ej-filter-chips';

        chipsContainer.style.cssText = [
            'display:flex','flex-wrap:wrap','gap:8px',
            'margin:0 0 12px','min-height:0',
            'font-family:Poppins,sans-serif'
        ].join(';');

        if (resultsHeading) {
            resultsHeading.insertAdjacentElement('afterend', chipsContainer);
        }

        function getActiveFilters() {

            const chips = [];

            document.querySelectorAll('.sidebar .filter-section').forEach(section => {

                const label = section.querySelector('h4')?.innerText || '';

                section.querySelectorAll('input[type="checkbox"]:checked').forEach(cb => {

                    chips.push({
                        label: cb.parentElement.innerText.trim(),
                        section: label,
                        checkbox: cb
                    });

                });

            });

            if (searchInput && searchInput.value.trim()) {

                chips.push({
                    label: `"${searchInput.value.trim()}"`,
                    section: 'Search',
                    isSearch: true
                });

            }

            return chips;

        }

        function refreshFilterChips() {

            const active = getActiveFilters();

            chipsContainer.innerHTML = '';

            if (active.length === 0) return;

            const label = document.createElement('span');
            label.style.cssText = 'font-size:12px;color:#94a3b8;font-weight:600;display:flex;align-items:center;padding:4px 0;';
            label.innerText = 'Active Filters:';
            chipsContainer.appendChild(label);

            active.forEach(filter => {

                const chip = document.createElement('div');

                chip.style.cssText = [
                    'display:inline-flex','align-items:center','gap:6px',
                    'background:#eff6ff','color:#2563eb',
                    'border:1px solid #bfdbfe','border-radius:20px',
                    'padding:4px 12px','font-size:12px','font-weight:600',
                    'cursor:pointer','transition:all 0.15s ease',
                    'white-space:nowrap'
                ].join(';');

                chip.innerHTML = `
                    <span style="color:#94a3b8;font-size:10px;">${filter.section}:</span>
                    ${filter.label}
                    <i class="fas fa-times" style="font-size:10px;margin-left:2px;color:#93c5fd;"></i>
                `;

                chip.addEventListener('click', () => {

                    if (filter.isSearch) {

                        searchInput.value = '';
                        searchInput.dispatchEvent(new Event('input', { bubbles: true }));

                    } else if (filter.checkbox) {

                        filter.checkbox.checked = false;
                        filter.checkbox.dispatchEvent(new Event('change', { bubbles: true }));

                    }

                    refreshFilterChips();

                });

                chipsContainer.appendChild(chip);

            });

        }

        function checkVisibility() {

            const cards = document.querySelectorAll('.job-card');
            const visible = Array.from(cards).filter(c => c.style.display !== 'none');
            const query = searchInput ? searchInput.value.trim() : '';

            if (visible.length === 0 && cards.length > 0) {
                showNoResults(query);
            } else {
                removeNoResults();
            }

        }

        setTimeout(() => {
            refreshFilterChips();
        }, 300);

    });

})();