document.addEventListener("DOMContentLoaded", updateNavbarProfile);

function updateNavbarProfile() {
    const userString = localStorage.getItem("user");
    if (!userString) return; // Not logged in

    const user = JSON.parse(userString);
    const photo = localStorage.getItem("userProfilePhoto");
    const isEmployer = user.role === "employer";
    const isAdmin = user.role === "admin";

    // ── 1. Update Navbars ──
    const menus = document.querySelectorAll(".nav-menu ul, .category-navbar .nav-links, .nav-links ul");

    menus.forEach(menu => {
        if (menu.querySelector(".nav-avatar-item")) return; // already updated

        const links = Array.from(menu.querySelectorAll("a"));
        const profileLink = links.find(a => a.href.includes("./profile.html") || a.textContent.toLowerCase().includes("profile"));
        if (!profileLink) return;

        if (isEmployer || isAdmin) {
            // Remove all except Profile
            links.forEach(a => {
                const keep = a === profileLink;
                if (!keep && a.parentElement?.tagName.toLowerCase() === "li") a.parentElement.remove();
            });

            // Admin Dashboard link
            if (isAdmin) {
                const dashLi = document.createElement("li");
                dashLi.innerHTML = `<a href="./dashboard.html" class="nav-link" title="Admin Dashboard"><i class="fas fa-tachometer-alt"></i> Dashboard</a>`;
                menu.insertBefore(dashLi, profileLink.parentElement);
            }

            // Post Job link
            const postJobLi = document.createElement("li");
            postJobLi.innerHTML = `<a href="./Postjob_home.html" class="nav-link" style="color:#16a34a;font-weight:700;" title="Post a Job"><i class="fas fa-plus-circle"></i> Post Job</a>`;
            menu.insertBefore(postJobLi, profileLink.parentElement);

        } else {
            // Job Seeker links
            if (!links.some(a => a.href.includes("./saved_jobs.html"))) {
                const savedLi = document.createElement("li");
                savedLi.innerHTML = `<a href="./saved_jobs.html" class="nav-link" title="Saved Jobs"><i class="fas fa-bookmark"></i></a>`;
                menu.insertBefore(savedLi, profileLink.parentElement);
            }

            if (!links.some(a => a.href.includes("./my_applications.html")) && !menu.classList.contains("no-apps-link")) {
                const appsLi = document.createElement("li");
                appsLi.innerHTML = `<a href="./my_applications.html" class="nav-link">My Applications</a>`;
                menu.insertBefore(appsLi, profileLink.parentElement);
            }
        }

        // ── Avatar Replacement ──
        const avatarLi = document.createElement("li");
        avatarLi.classList.add("nav-avatar-item");
        avatarLi.style.display = "flex";
        avatarLi.style.alignItems = "center";
        avatarLi.style.gap = "10px";
        avatarLi.style.paddingLeft = "10px";

        const img = document.createElement("img");
        const initials = `${user.first_name || ""}${user.last_name ? " " + user.last_name : ""}`;
        img.src = photo || `https://ui-avatars.com/api/?name=${encodeURIComponent(initials)}&background=random`;
        img.style.width = "32px";
        img.style.height = "32px";
        img.style.borderRadius = "50%";
        img.style.objectFit = "cover";
        img.style.border = isEmployer ? "2px solid #16a34a" : "2px solid #2563eb";

        const link = document.createElement("a");
        link.href = "./profile.html";
        link.innerText = user.first_name;
        link.classList.add("nav-link");
        link.style.fontWeight = "600";

        avatarLi.append(img, link);
        profileLink.parentElement.replaceWith(avatarLi);
    });

    // ── 2. Dashboard Header ──
    const dashNav = document.querySelector("header.navbar nav");
    if (!dashNav || document.getElementById("nav-user-avatar")) return;

    const logoutBtn = dashNav.querySelector("#logoutBtn");
    if (!logoutBtn) return;

    const avatarHtml = document.createElement("a");
    avatarHtml.id = "nav-user-avatar";
    avatarHtml.href = "./profile.html";
    avatarHtml.style.display = "flex";
    avatarHtml.style.alignItems = "center";
    avatarHtml.style.gap = "8px";
    avatarHtml.style.textDecoration = "none";
    avatarHtml.style.marginRight = "1rem";

    avatarHtml.innerHTML = `
        <img src="${photo || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.first_name)}`}" 
             style="width:32px; height:32px; border-radius:50%; object-fit:cover; border:1px solid #ccc;">
        <span style="font-weight:600; color:#333;">${user.first_name}</span>
    `;
    dashNav.insertBefore(avatarHtml, logoutBtn);
}