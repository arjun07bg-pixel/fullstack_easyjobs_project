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

    // 1. Handle Category Pages Navbar (.category-navbar)
    const navLinks = document.querySelector(".category-navbar .nav-links");
    if (navLinks) {
        // Find the Profile link
        const profileLink = Array.from(navLinks.querySelectorAll("a")).find(a => a.href.includes("profile"));

        if (profileLink) {
            // Create Avatar Element
            const avatarContainer = document.createElement("li");
            avatarContainer.style.display = "flex";
            avatarContainer.style.alignItems = "center";
            avatarContainer.style.gap = "8px";

            // Avatar Image
            const img = document.createElement("img");
            if (photo) {
                img.src = photo;
            } else {
                img.src = "https://ui-avatars.com/api/?name=" + user.first_name + "&background=random";
            }
            img.style.width = "30px";
            img.style.height = "30px";
            img.style.borderRadius = "50%";
            img.style.objectFit = "cover";
            img.style.border = "2px solid #2563eb";

            // Link Text
            const link = document.createElement("a");
            link.href = "profile.html";
            link.innerText = user.first_name;
            link.style.fontWeight = "600";
            link.style.color = "#334155";

            avatarContainer.appendChild(img);
            avatarContainer.appendChild(link);

            // Replace existing "Profile" link with Avatar
            profileLink.parentElement.replaceWith(avatarContainer);
        }
    }

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
