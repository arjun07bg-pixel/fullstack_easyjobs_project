/**
 * EasyJobs - Company Page Search Enhancements
 * Features:
 *   1. Real-time autocomplete suggestions on search input
 *   2. "No jobs found" empty state message
 *   3. Active filter chips displayed above job listings
 */

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

        // Build suggestion pool from job titles and skill tags
        function buildSuggestions() {
            const pool = new Set();
            document.querySelectorAll('.job-card').forEach(card => {
                const title = card.querySelector('.job-title');
                if (title) {
                    // Add full title
                    pool.add(title.innerText.trim());
                    // Add individual words (longer than 3 chars)
                    title.innerText.trim().split(/\s+/).forEach(word => {
                        if (word.length > 3) pool.add(word);
                    });
                }
                card.querySelectorAll('.skill-tag').forEach(tag => {
                    pool.add(tag.innerText.trim());
                });
                const meta = card.querySelector('.job-meta-naukri');
                if (meta) {
                    // Extract location words from meta
                    meta.querySelectorAll('span').forEach(span => {
                        const txt = span.innerText.replace(/[^\w\s,]/g, '').trim();
                        if (txt.length > 2) pool.add(txt);
                    });
                }
            });
            return Array.from(pool);
        }

        // Create dropdown element
        const dropdown = document.createElement('div');
        dropdown.id = 'ej-autocomplete';
        dropdown.style.cssText = [
            'position:absolute', 'top:100%', 'left:0', 'right:0',
            'background:white', 'border:1px solid #e2e8f0',
            'border-top:none', 'border-radius:0 0 12px 12px',
            'box-shadow:0 8px 24px rgba(0,0,0,0.1)',
            'z-index:1000', 'display:none', 'max-height:240px',
            'overflow-y:auto', 'font-family:Poppins,sans-serif'
        ].join(';');

        if (searchInput) {
            // Wrap search input in relative container
            const searchBar = searchInput.closest('.search-bar');
            if (searchBar) {
                searchBar.style.position = 'relative';
                searchBar.appendChild(dropdown);
            }

            let suggestions = [];
            // Delay build until cards are rendered
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
                    // Highlight matching part
                    const idx = m.toLowerCase().indexOf(query);
                    const before = m.slice(0, idx);
                    const match = m.slice(idx, idx + query.length);
                    const after = m.slice(idx + query.length);
                    return `<div class="ej-suggestion" data-value="${m}"
                        style="padding:10px 16px; cursor:pointer; font-size:13px; color:#334155;
                               display:flex; align-items:center; gap:8px; border-bottom:1px solid #f8fafc;
                               transition:background 0.1s;"
                        onmouseover="this.style.background='#f0f7ff'"
                        onmouseout="this.style.background='white'">
                        <i class="fas fa-search" style="color:#94a3b8; font-size:11px;"></i>
                        ${before}<strong style="color:#2563eb;">${match}</strong>${after}
                    </div>`;
                }).join('');

                dropdown.style.display = 'block';

                // Click suggestion → fill input and trigger filter
                dropdown.querySelectorAll('.ej-suggestion').forEach(item => {
                    item.addEventListener('click', function () {
                        searchInput.value = this.dataset.value;
                        dropdown.style.display = 'none';
                        // Trigger the page's own filter
                        const searchBtn = document.getElementById('search-btn');
                        if (searchBtn) searchBtn.click();
                        else searchInput.dispatchEvent(new Event('input', { bubbles: true }));
                    });
                });
            });

            // Close on outside click
            document.addEventListener('click', function (e) {
                if (!searchInput.contains(e.target) && !dropdown.contains(e.target)) {
                    dropdown.style.display = 'none';
                }
            });

            // Close on Escape
            searchInput.addEventListener('keydown', function (e) {
                if (e.key === 'Escape') dropdown.style.display = 'none';
            });
        }

        // ══════════════════════════════════════════════════════════════════════
        // FEATURE 2: "NO JOBS FOUND" EMPTY STATE
        // ══════════════════════════════════════════════════════════════════════

        // Create/remove the no-results card
        function showNoResults(query) {
            removeNoResults(); // prevent duplicates
            const div = document.createElement('div');
            div.id = 'ej-no-results';
            div.style.cssText = [
                'background:white', 'border-radius:16px',
                'border:1px dashed #cbd5e1', 'padding:52px 32px',
                'text-align:center', 'margin-top:8px',
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
                    style="background:#2563eb; color:white; border:none; border-radius:10px;
                           padding:12px 28px; font-size:14px; font-weight:600; cursor:pointer;
                           font-family:Poppins,sans-serif; transition:background 0.2s;"
                    onmouseover="this.style.background='#1d4ed8'"
                    onmouseout="this.style.background='#2563eb'">
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
        // FEATURE 3: ACTIVE FILTER CHIPS
        // ══════════════════════════════════════════════════════════════════════

        // Create filter chips container (placed between heading and first card)
        const chipsContainer = document.createElement('div');
        chipsContainer.id = 'ej-filter-chips';
        chipsContainer.style.cssText = [
            'display:flex', 'flex-wrap:wrap', 'gap:8px',
            'margin:0 0 12px', 'min-height:0',
            'font-family:Poppins,sans-serif'
        ].join(';');

        // Insert chips container right after the results heading
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
            // Also add search query chip if any
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

            // "Active Filters:" label
            const label = document.createElement('span');
            label.style.cssText = 'font-size:12px; color:#94a3b8; font-weight:600; display:flex; align-items:center; padding:4px 0;';
            label.innerText = 'Active Filters:';
            chipsContainer.appendChild(label);

            active.forEach(filter => {
                const chip = document.createElement('div');
                chip.style.cssText = [
                    'display:inline-flex', 'align-items:center', 'gap:6px',
                    'background:#eff6ff', 'color:#2563eb',
                    'border:1px solid #bfdbfe', 'border-radius:20px',
                    'padding:4px 12px', 'font-size:12px', 'font-weight:600',
                    'cursor:pointer', 'transition:all 0.15s ease',
                    'white-space:nowrap'
                ].join(';');
                chip.innerHTML = `
                    <span style="color:#94a3b8; font-size:10px;">${filter.section}:</span>
                    ${filter.label}
                    <i class="fas fa-times" style="font-size:10px; margin-left:2px; color:#93c5fd;"></i>
                `;
                chip.addEventListener('mouseover', () => {
                    chip.style.background = '#dbeafe';
                    chip.style.borderColor = '#93c5fd';
                });
                chip.addEventListener('mouseout', () => {
                    chip.style.background = '#eff6ff';
                    chip.style.borderColor = '#bfdbfe';
                });
                chip.addEventListener('click', () => {
                    if (filter.isSearch) {
                        if (searchInput) {
                            searchInput.value = '';
                            searchInput.dispatchEvent(new Event('input', { bubbles: true }));
                        }
                    } else if (filter.checkbox) {
                        filter.checkbox.checked = false;
                        filter.checkbox.dispatchEvent(new Event('change', { bubbles: true }));
                    }
                    refreshFilterChips();
                });
                chipsContainer.appendChild(chip);
            });

            // "Clear All" chip
            if (active.length > 1) {
                const clearChip = document.createElement('div');
                clearChip.style.cssText = [
                    'display:inline-flex', 'align-items:center', 'gap:6px',
                    'background:#fef2f2', 'color:#ef4444',
                    'border:1px solid #fecaca', 'border-radius:20px',
                    'padding:4px 12px', 'font-size:12px', 'font-weight:600',
                    'cursor:pointer', 'transition:all 0.15s ease'
                ].join(';');
                clearChip.innerHTML = '<i class="fas fa-times-circle"></i> Clear All';
                clearChip.addEventListener('click', () => {
                    const clearBtn = document.getElementById('clear-filters-btn');
                    if (clearBtn) clearBtn.click();
                    if (searchInput) {
                        searchInput.value = '';
                        searchInput.dispatchEvent(new Event('input', { bubbles: true }));
                    }
                    refreshFilterChips();
                    removeNoResults();
                });
                clearChip.addEventListener('mouseover', () => { clearChip.style.background = '#fee2e2'; });
                clearChip.addEventListener('mouseout', () => { clearChip.style.background = '#fef2f2'; });
                chipsContainer.appendChild(clearChip);
            }
        }

        // ══════════════════════════════════════════════════════════════════════
        // HOOK INTO EXISTING FILTER SYSTEM
        // ══════════════════════════════════════════════════════════════════════

        // Watch for visible card changes using MutationObserver + polling
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

        // Listen to all checkbox changes
        document.querySelectorAll('.sidebar input[type="checkbox"]').forEach(cb => {
            cb.addEventListener('change', function () {
                setTimeout(() => {
                    refreshFilterChips();
                    checkVisibility();
                }, 50);
            });
        });

        // Listen to search button click
        const searchBtn = document.getElementById('search-btn');
        if (searchBtn) {
            searchBtn.addEventListener('click', function () {
                setTimeout(() => {
                    refreshFilterChips();
                    checkVisibility();
                    if (dropdown) dropdown.style.display = 'none';
                }, 50);
            });
        }

        // Listen to clear button
        const clearBtn = document.getElementById('clear-filters-btn');
        if (clearBtn) {
            clearBtn.addEventListener('click', function () {
                setTimeout(() => {
                    refreshFilterChips();
                    removeNoResults();
                }, 50);
            });
        }

        // Listen to Enter key on search input
        if (searchInput) {
            searchInput.addEventListener('keyup', function (e) {
                if (e.key === 'Enter') {
                    setTimeout(() => {
                        refreshFilterChips();
                        checkVisibility();
                        dropdown.style.display = 'none';
                    }, 50);
                }
            });
        }

        // Listen to apply filters button
        const applyBtn = document.getElementById('apply-filters-btn');
        if (applyBtn) {
            applyBtn.addEventListener('click', function () {
                setTimeout(() => {
                    refreshFilterChips();
                    checkVisibility();
                }, 50);
            });
        }

        // ══════════════════════════════════════════════════════════════════════
        // FEATURE 4: ADMIN DELETE BUTTON
        // ══════════════════════════════════════════════════════════════════════
        function setupAdminFeatures() {
            const user = JSON.parse(localStorage.getItem('user') || '{}');
            if (user.user_type !== 'admin') return;

            document.querySelectorAll('.job-card').forEach(card => {
                const actions = card.querySelector('.job-actions');
                if (actions && !card.querySelector('.admin-delete-btn')) {
                    const deleteBtn = document.createElement('button');
                    deleteBtn.className = 'admin-delete-btn';
                    deleteBtn.innerHTML = '<i class="fas fa-trash-alt"></i>';
                    deleteBtn.title = 'Delete Job (Admin)';
                    deleteBtn.style.cssText = [
                        'background:#fee2e2', 'color:#ef4444',
                        'border:none', 'border-radius:8px',
                        'width:36px', 'height:36px',
                        'display:flex', 'align-items:center', 'justify-content:center',
                        'cursor:pointer', 'transition:0.2s', 'font-size:14px'
                    ].join(';');

                    deleteBtn.addEventListener('mouseover', () => { deleteBtn.style.background = '#fecaca'; });
                    deleteBtn.addEventListener('mouseout', () => { deleteBtn.style.background = '#fee2e2'; });

                    deleteBtn.addEventListener('click', function (e) {
                        e.preventDefault();
                        if (confirm('Are you sure you want to delete this job posting? (Admin Action)')) {
                            card.style.transition = 'all 0.3s ease';
                            card.style.transform = 'scale(0.95)';
                            card.style.opacity = '0';
                            setTimeout(() => {
                                card.remove();
                                // Refresh count if necessary
                                const heading = document.getElementById('results-heading');
                                if (heading) {
                                    const count = document.querySelectorAll('.job-card').length;
                                    heading.textContent = 'Showing ' + count + ' Job' + (count !== 1 ? 's' : '');
                                }
                                refreshFilterChips();
                            }, 300);
                        }
                    });

                    actions.prepend(deleteBtn);
                }
            });
        }

        // Initial count set
        setTimeout(() => {
            refreshFilterChips();
            setupAdminFeatures();
        }, 300);

    }); // end DOMContentLoaded

})();
