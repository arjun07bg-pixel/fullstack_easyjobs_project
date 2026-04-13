document.addEventListener("DOMContentLoaded", updateNavbarProfile);

function updateNavbarProfile() {
    const userString = localStorage.getItem("user");
    if (!userString) return;

    const user = JSON.parse(userString);
    const isEmployer = user.role === "employer";
    const isAdmin = user.role === "admin";

    // Standardize URL checking helper
    const hasLinkTo = (links, filename) => links.some(a => {
        const path = a.getAttribute("href") || "";
        return path.includes(filename);
    });

    const menus = document.querySelectorAll(".nav-menu ul, .category-navbar .nav-links, .nav-links ul");

    menus.forEach(menu => {
        // Only run once per menu
        if (menu.getAttribute("data-nav-updated")) return;
        menu.setAttribute("data-nav-updated", "true");

        const links = Array.from(menu.querySelectorAll("a"));

        // Find the profile/user link to use as an insertion point
        const profileLink = links.find(a => {
            const path = a.getAttribute("href") || "";
            return path.includes("profile.html") || a.textContent.toLowerCase().includes("profile");
        });

        if (!profileLink) return;

        // --- Role Specific Logic ---
        if (isEmployer || isAdmin) {
            // Remove seeker-only links (Browse Jobs, Internships)
            links.forEach(a => {
                const path = a.getAttribute("href") || "";
                if (path.includes("jobs.html") || path.includes("internship.html")) {
                    a.parentElement?.remove();
                }
            });

            // Ensure "Applications" / "Applicants" is visible
            if (!hasLinkTo(links, "my_applications.html")) {
                const appsLi = document.createElement("li");
                appsLi.innerHTML = `<a href="my_applications.html" class="nav-link"><i class="fas fa-file-alt"></i> ${isAdmin ? 'All Applicants' : 'Received Apps'}</a>`;
                menu.insertBefore(appsLi, profileLink.parentElement);
            } else {
                // Rename existing link
                const existingAppBtn = links.find(a => a.getAttribute("href").includes("my_applications.html"));
                if (existingAppBtn) {
                     existingAppBtn.innerHTML = `<i class="fas fa-file-alt"></i> ${isAdmin ? 'All Applicants' : 'Received Apps'}`;
                }
            }

            if (isAdmin && !hasLinkTo(links, "dashboard.html")) {
                const dashLi = document.createElement("li");
                dashLi.innerHTML = `<a href="dashboard.html" class="nav-link"><i class="fas fa-columns"></i> Dashboard</a>`;
                menu.insertBefore(dashLi, profileLink.parentElement);
            }

            if (!hasLinkTo(links, "postjob_home.html")) {
                const postJobLi = document.createElement("li");
                postJobLi.innerHTML = `<a href="postjob_home.html" class="nav-link" style="color:#16a34a;font-weight:700;"><i class="fas fa-plus-circle"></i> Post Job</a>`;
                menu.insertBefore(postJobLi, profileLink.parentElement);
            }
        } else {
            // SEEKER Logic: Ensure Saved Jobs and My Applications are present
            if (!hasLinkTo(links, "saved_jobs.html")) {
                const savedLi = document.createElement("li");
                savedLi.innerHTML = `<a href="saved_jobs.html" class="nav-link" title="Saved Jobs"><i class="fas fa-bookmark"></i></a>`;
                menu.insertBefore(savedLi, profileLink.parentElement);
            }

            if (!hasLinkTo(links, "my_applications.html")) {
                const appsLi = document.createElement("li");
                appsLi.innerHTML = `<a href="my_applications.html" class="nav-link"><i class="fas fa-file-alt"></i> My Applications</a>`;
                menu.insertBefore(appsLi, profileLink.parentElement);
            }
        }

        // --- Final Avatar Cleanup ---
        // Instead of duplicating, we'll just let index.js handle the right-side profile buttons 
        // and only keep the seeker links in the center menu.
        // We remove the profile list item from the center menu to prevent double "narayanan"
        if (profileLink.parentElement) {
             profileLink.parentElement.remove();
        }
    });

    // Final fix for alignment: ensure the header-content doesn't wrap weirdly
    const headerContent = document.querySelector(".header-content");
    if (headerContent) {
        if (window.innerWidth > 768) {
            headerContent.style.flexWrap = "nowrap";
        }
        headerContent.style.overflow = "visible";
    }
}