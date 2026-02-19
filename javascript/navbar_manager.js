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

    // 1. Handle General Navbars (.nav-menu, .category-navbar, .nav-links)
    const menus = document.querySelectorAll(".nav-menu ul, .category-navbar .nav-links, .nav-links ul");

    menus.forEach(menu => {
        // Find Profile link
        const profileLink = Array.from(menu.querySelectorAll("a")).find(a => a.href.includes("profile.html") || a.textContent.toLowerCase().includes("profile"));

        if (profileLink && !menu.querySelector(".nav-avatar-item")) {
            // Ensure Saved Jobs icon exists
            const hasSavedJobs = Array.from(menu.querySelectorAll("a")).some(a => a.href.includes("saved_jobs.html"));
            if (!hasSavedJobs) {
                const savedJobsLi = document.createElement("li");
                savedJobsLi.innerHTML = `<a href="/saved_jobs.html" class="nav-link" title="Saved Jobs"><i class="fas fa-bookmark"></i></a>`;
                menu.insertBefore(savedJobsLi, profileLink.parentElement);
            }

            // Ensure My Applications exists
            const hasMyApps = Array.from(menu.querySelectorAll("a")).some(a => a.href.includes("my_applications.html"));
            if (!hasMyApps && !menu.classList.contains('no-apps-link')) {
                const myAppsLi = document.createElement("li");
                myAppsLi.innerHTML = `<a href="/my_applications.html" class="nav-link">My Applications</a>`;
                menu.insertBefore(myAppsLi, profileLink.parentElement);
            }

            // Create Avatar Element
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
            img.style.border = "2px solid #2563eb";

            // Link Text
            const link = document.createElement("a");
            link.href = "/profile.html";
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
                avatarHtml.href = "profile.html";
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
