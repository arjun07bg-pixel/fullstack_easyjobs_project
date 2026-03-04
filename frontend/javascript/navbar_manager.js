/**
 * Navbar Manager
 * Updates navigation bars across the site with User Profile Photo and Name.
 */

document.addEventListener("DOMContentLoaded", () => {
    updateNavbarProfile();
});

function updateNavbarProfile() {
    const userString = localStorage.getItem("user");
    if (!userString) return; // Not logged in

    const user = JSON.parse(userString);
    const photo = localStorage.getItem("userProfilePhoto");
    const isEmployer = user.role === "employer" || user.role === "admin";

    // 1. Handle General Navbars (.nav-menu, .category-navbar, .nav-links)
    const menus = document.querySelectorAll(".nav-menu ul, .category-navbar .nav-links, .nav-links ul");

    menus.forEach(menu => {
        // Find Profile link
        const profileLink = Array.from(menu.querySelectorAll("a")).find(a => a.href.includes("/frontend/pages/profile.html") || a.textContent.toLowerCase().includes("profile"));

        if (profileLink && !menu.querySelector(".nav-avatar-item")) {

            if (isEmployer) {
                // ── EMPLOYER NAV: Show Post Jobs + Dashboard ──────────────────
                // Remove My Applications link if it exists
                const myAppsLink = Array.from(menu.querySelectorAll("a")).find(a => a.href.includes("/frontend/pages/my_applications.html"));
                if (myAppsLink) myAppsLink.parentElement.remove();

                // Remove Saved Jobs link if it exists
                const savedJobsLink = Array.from(menu.querySelectorAll("a")).find(a => a.href.includes("/frontend/pages/saved_jobs.html"));
                if (savedJobsLink) savedJobsLink.parentElement.remove();

                // Add Dashboard link if not present
                const hasDashboard = Array.from(menu.querySelectorAll("a")).some(a => a.href.includes("/frontend/pages/dashboard.html"));
                if (!hasDashboard) {
                    const dashLi = document.createElement("li");
                    dashLi.innerHTML = `<a href="/frontend/pages/dashboard.html" class="nav-link" title="Employer Dashboard"><i class="fas fa-tachometer-alt"></i> Dashboard</a>`;
                    menu.insertBefore(dashLi, profileLink.parentElement);
                }

                // Add Post Jobs link if not present
                const hasPostJobs = Array.from(menu.querySelectorAll("a")).some(a => a.href.includes("/frontend/pages/Postjob_home.html"));
                if (!hasPostJobs) {
                    const postJobLi = document.createElement("li");
                    postJobLi.innerHTML = `<a href="/frontend/pages/Postjob_home.html" class="nav-link" style="color: #16a34a; font-weight: 700;" title="Post a Job"><i class="fas fa-plus-circle"></i> Post Job</a>`;
                    menu.insertBefore(postJobLi, profileLink.parentElement);
                }

            } else {
                // ── JOB SEEKER NAV: Show Saved Jobs + My Applications ─────────
                const hasSavedJobs = Array.from(menu.querySelectorAll("a")).some(a => a.href.includes("/frontend/pages/saved_jobs.html"));
                if (!hasSavedJobs) {
                    const savedJobsLi = document.createElement("li");
                    savedJobsLi.innerHTML = `<a href="/frontend/pages/saved_jobs.html" class="nav-link" title="Saved Jobs"><i class="fas fa-bookmark"></i></a>`;
                    menu.insertBefore(savedJobsLi, profileLink.parentElement);
                }

                const hasMyApps = Array.from(menu.querySelectorAll("a")).some(a => a.href.includes("/frontend/pages/my_applications.html"));
                if (!hasMyApps && !menu.classList.contains('no-apps-link')) {
                    const myAppsLi = document.createElement("li");
                    myAppsLi.innerHTML = `<a href="/frontend/pages/my_applications.html" class="nav-link">My Applications</a>`;
                    menu.insertBefore(myAppsLi, profileLink.parentElement);
                }
            }

            // Create Avatar Element (same for both roles)
            const avatarContainer = document.createElement("li");
            avatarContainer.classList.add("nav-avatar-item");
            avatarContainer.style.display = "flex";
            avatarContainer.style.alignItems = "center";
            avatarContainer.style.gap = "10px";
            avatarContainer.style.paddingLeft = "10px";

            // Avatar Image
            const img = document.createElement("img");
            img.src = photo || ("https://ui-avatars.com/api/?name=" + user.first_name + "&background=random");
            img.style.width = "32px";
            img.style.height = "32px";
            img.style.borderRadius = "50%";
            img.style.objectFit = "cover";
            img.style.border = isEmployer ? "2px solid #16a34a" : "2px solid #2563eb";

            // Link Text
            const link = document.createElement("a");
            link.href = "/frontend/pages/profile.html";
            link.innerText = user.first_name;
            link.classList.add("nav-link");
            link.style.fontWeight = "600";

            avatarContainer.appendChild(img);
            avatarContainer.appendChild(link);

            // Replace existing "Profile" link with Avatar
            profileLink.parentElement.replaceWith(avatarContainer);
        }
    });

    // 2. Handle Dashboard Header
    const dashboardHeader = document.querySelector(".dashboard-header");
    // If we are in dashboard, maybe show it there too or relying on sidebar?
    // The Dashboard.html already has a specific header. Let's update that.

    const dashNav = document.querySelector("header.navbar nav");
    if (dashNav) {
        // Look for Logout button to insert before
        const logoutBtn = dashNav.querySelector("#logoutBtn");
        if (logoutBtn) {
            // Check if already added
            if (!document.getElementById("nav-user-avatar")) {
                const avatarHtml = document.createElement("a");
                avatarHtml.id = "nav-user-avatar";
                avatarHtml.href = "/frontend/pages/profile.html";
                avatarHtml.style.display = "flex";
                avatarHtml.style.alignItems = "center";
                avatarHtml.style.gap = "8px";
                avatarHtml.style.textDecoration = "none";
                avatarHtml.style.marginRight = "1rem";

                const imgSrc = photo || ("https://ui-avatars.com/api/?name=" + user.first_name);

                avatarHtml.innerHTML = `
                    <img src="${imgSrc}" style="width:32px; height:32px; border-radius:50%; object-fit:cover; border:1px solid #ccc;">
                    <span style="font-weight:600; color:#333;">${user.first_name}</span>
                 `;

                dashNav.insertBefore(avatarHtml, logoutBtn);
            }
        }
    }
}
