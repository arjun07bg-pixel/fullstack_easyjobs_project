/**
 * EasyJobs - Universal Search Functionality
 * Provides a consistent search experience across category pages and main job board.
 */
(function () {
    'use strict';

    document.addEventListener('DOMContentLoaded', function () {
        // 1. Identify search input and button (if any)
        const searchInput = document.getElementById('universal-search-input');
        const searchBtn = document.getElementById('universal-search-btn');

        // 2. Initialize search logic
        const performSearch = () => {
            const query = searchInput?.value.trim();
            if (!query) {
                alert("Please enter a search term.");
                return;
            }
            // Redirect to jobs page with query param
            window.location.href = `/frontend/pages/jobs.html?search=${encodeURIComponent(query)}`;
        };

        // 3. Handle button click
        if (searchBtn) {
            searchBtn.addEventListener('click', performSearch);
        }

        // 4. Handle Enter key in input
        if (searchInput) {
            searchInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    performSearch();
                }
            });
        }

        console.log("Universal Search initialized.");
    });
})();