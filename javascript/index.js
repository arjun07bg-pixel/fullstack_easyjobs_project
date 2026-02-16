document.addEventListener("DOMContentLoaded", () => {
    const searchForm = document.querySelector(".job-search-form");
    const keywordInput = document.querySelector(".keyword-input");
    const locationInput = document.querySelector(".location-input");

    if (searchForm) {
        searchForm.addEventListener("submit", (e) => {
            e.preventDefault();
            const keyword = keywordInput.value.trim();
            const location = locationInput.value.trim();

            // Redirect to jobs page with parameters
            const params = new URLSearchParams();
            if (keyword) params.set("keyword", keyword);
            if (location) params.set("location", location);

            window.location.href = `/jobs.html?${params.toString()}`;
        });
    }

    // Auth state check
    const user = JSON.parse(localStorage.getItem("user"));
    const authButtons = document.querySelector(".auth-buttons");

    if (user && authButtons) {
        // Use user.image from database first, then local fallback
        const userPhoto = user.image || localStorage.getItem("userProfilePhoto");
        const avatarHtml = userPhoto && userPhoto.trim() !== ""
            ? `<img src="${userPhoto}" style="width: 35px; height: 35px; border-radius: 50%; object-fit: cover; border: 2.5px solid #fff; box-shadow: 0 2px 8px rgba(0,0,0,0.2);">`
            : `<i class="fas fa-user-circle" style="font-size: 1.8rem; color: rgba(255,255,255,0.8);"></i>`;

        authButtons.innerHTML = `
            <div style="display: flex; align-items: center; gap: 15px;">
                <a href="/profile.html" style="display: flex; align-items: center; gap: 8px; text-decoration: none; transition: 0.3s; padding: 5px 10px; border-radius: 50px;">
                    ${avatarHtml}
                    <span style="font-weight: 600; color: white; display: none; @media (min-width: 600px) { display: inline; }">Hi, ${user.first_name}!</span>
                </a>
                <a href="/dashboard.html" class="btn-login" style="padding: 10px 20px; font-size: 0.9rem;"><i class="fas fa-columns"></i> Dashboard</a>
                <button id="logoutBtn" style="background: rgba(239, 68, 68, 0.9); color: white; border: none; padding: 10px 20px; border-radius: 50px; cursor: pointer; font-weight: 600; transition: all 0.3s ease; font-size: 0.9rem;">Logout</button>
            </div>
        `;

        // CSS fix for mobile greeting
        const style = document.createElement('style');
        style.innerText = "@media (max-width: 600px) { .auth-buttons span { display: none; } }";
        document.head.appendChild(style);

        document.getElementById("logoutBtn").addEventListener("click", () => {
            localStorage.removeItem("user");
            localStorage.removeItem("token");
            localStorage.removeItem("userProfilePhoto");
            window.location.href = "/";
        });
    }
});
