document.addEventListener("DOMContentLoaded", updateNavbarProfile);

function updateNavbarProfile() {

    const userString = localStorage.getItem("user");
    if (!userString) return;

    const user = JSON.parse(userString);
    const photo = localStorage.getItem("userProfilePhoto");
    const isEmployer = user.role === "employer";
    const isAdmin = user.role === "admin";

    const menus = document.querySelectorAll(".nav-menu ul, .category-navbar .nav-links, .nav-links ul");

    menus.forEach(menu => {

        if (menu.querySelector(".nav-avatar-item")) return;

        const links = Array.from(menu.querySelectorAll("a"));

        const profileLink = links.find(a =>
            a.href.includes("./profile.html") ||
            a.textContent.toLowerCase().includes("profile")
        );

        if (!profileLink) return;

        if (isEmployer || isAdmin) {

            links.forEach(a => {
                if (a !== profileLink && a.parentElement?.tagName.toLowerCase() === "li") {
                    a.parentElement.remove();
                }
            });

            if (isAdmin) {

                const dashLi = document.createElement("li");
                dashLi.innerHTML =
                    `<a href="./dashboard.html" class="nav-link">
                        <i class="fas fa-tachometer-alt"></i> Dashboard
                    </a>`;

                menu.insertBefore(dashLi, profileLink.parentElement);
            }

            const postJobLi = document.createElement("li");
            postJobLi.innerHTML =
                `<a href="./Postjob_home.html" class="nav-link" style="color:#16a34a;font-weight:700;">
                    <i class="fas fa-plus-circle"></i> Post Job
                </a>`;

            menu.insertBefore(postJobLi, profileLink.parentElement);

        } else {

            if (!links.some(a => a.href.includes("./saved_jobs.html"))) {

                const savedLi = document.createElement("li");
                savedLi.innerHTML =
                    `<a href="./saved_jobs.html" class="nav-link">
                        <i class="fas fa-bookmark"></i>
                    </a>`;

                menu.insertBefore(savedLi, profileLink.parentElement);
            }

            if (!links.some(a => a.href.includes("./my_applications.html"))) {

                const appsLi = document.createElement("li");
                appsLi.innerHTML =
                    `<a href="./my_applications.html" class="nav-link">
                        My Applications
                    </a>`;

                menu.insertBefore(appsLi, profileLink.parentElement);
            }
        }

        const avatarLi = document.createElement("li");
        avatarLi.classList.add("nav-avatar-item");

        const img = document.createElement("img");

        const initials =
            `${user.first_name || ""} ${user.last_name || ""}`;

        img.src =
            photo ||
            `https://ui-avatars.com/api/?name=${encodeURIComponent(initials)}&background=random`;

        img.style.width = "32px";
        img.style.height = "32px";
        img.style.borderRadius = "50%";
        img.style.objectFit = "cover";

        const link = document.createElement("a");
        link.href = "./profile.html";
        link.innerText = user.first_name;
        link.classList.add("nav-link");

        avatarLi.append(img, link);

        profileLink.parentElement.replaceWith(avatarLi);
    });

}