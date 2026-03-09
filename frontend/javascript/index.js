window.getEasyJobsAPI = () => {
    const { hostname, port, protocol } = window.location;

    // 1. Same-Origin Check (Optimal for production)
    if (port === '8000') return "/api";

    // 2. Dynamic Host Check (Crucial for CORS stability)
    // If we have a hostname (localhost, 127.0.0.1, or network name), use it with port 8000
    if (hostname && hostname !== "") {
        // Ensure we always use http for the API backend (Port 8000)
        return `http://${hostname}:8000/api`;
    }

    // 3. File-System Fallback (file:/// URLs)
    return "http://127.0.0.1:8000/api";
};

// Log API status on load for debugging
console.log(`🚀 EasyJobs API Target: ${window.getEasyJobsAPI()}`);

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

            window.location.href = `../pages/jobs.html?${params.toString()}`;
        });
    }

    // Global Header Search Handler
    const headerSearchForm = document.querySelector(".header-search-form");
    const headerSearchInput = document.querySelector(".header-search-input");

    if (headerSearchForm && headerSearchInput) {
        headerSearchForm.addEventListener("submit", (e) => {
            e.preventDefault();
            const keyword = headerSearchInput.value.trim();
            if (keyword) {
                window.location.href = `../pages/jobs.html?keyword=${encodeURIComponent(keyword)}`;
            }
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

        const actionLink = user.role === 'admin'
            ? `<a href="../pages/dashboard.html" class="btn-login" style="padding: 10px 20px; font-size: 0.9rem;"><i class="fas fa-columns"></i> Dashboard</a>`
            : user.role === 'employer'
                ? `<a href="../pages/Postjob_home.html" class="btn-login" style="padding: 10px 20px; font-size: 0.9rem;"><i class="fas fa-plus-circle"></i> Post a Job</a>`
                : '';

        const savedJobsIcon = (user.role !== 'admin' && user.role !== 'employer')
            ? `<a href="../pages/saved_jobs.html" style="color: #cbd5e1; font-size: 1.1rem; transition: 0.3s;" title="Saved Jobs">
                    <i class="fas fa-bookmark"></i>
                </a>`
            : '';

        authButtons.innerHTML = `
            <div style="display: flex; align-items: center; gap: 15px;">
                ${savedJobsIcon}
                <a href="../pages/profile.html" style="display: flex; align-items: center; gap: 8px; text-decoration: none; transition: 0.3s; padding: 5px 10px; border-radius: 50px;">
                    ${avatarHtml}
                    <span style="font-weight: 600; color: white; display: none; @media (min-width: 600px) { display: inline; }">Hi, ${user.first_name}!</span>
                </a>
                ${actionLink}
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
            window.location.href = "/index.html";
        });
    }
});

// --- GLOBAL HELPERS ---

/**
 * Common showMessage function for consistent UX
 */
function showMessage(message, type = "info") {
    const messageDiv = document.createElement("div");
    const colors = {
        error: { bg: "#fef2f2", text: "#dc2626", border: "#dc2626" },
        success: { bg: "#dcfce7", text: "#16a34a", border: "#16a34a" },
        info: { bg: "#eff6ff", text: "#2563eb", border: "#2563eb" }
    }[type] || { bg: "#eff6ff", text: "#2563eb", border: "#2563eb" };

    messageDiv.style.cssText = `
        position: fixed;
        top: 25px;
        right: 25px;
        padding: 1.2rem 1.8rem;
        background: ${colors.bg};
        color: ${colors.text};
        border-left: 5px solid ${colors.border};
        border-radius: 12px;
        box-shadow: 0 15px 35px -5px rgba(0,0,0,0.15);
        z-index: 11000;
        max-width: 420px;
        font-family: 'Poppins', sans-serif;
        font-size: 0.95rem;
        font-weight: 500;
        animation: toastIn 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
    `;

    // Add keyframe if not present
    if (!document.getElementById('toast-styles')) {
        const style = document.createElement('style');
        style.id = 'toast-styles';
        style.textContent = `
            @keyframes toastIn { from { transform: translateX(120%); opacity: 0; } to { transform: translateX(0); opacity: 1; } }
            @keyframes toastOut { from { transform: translateX(0); opacity: 1; } to { transform: translateX(120%); opacity: 0; } }
        `;
        document.head.appendChild(style);
    }

    messageDiv.innerHTML = message.replace(/\n/g, '<br>');
    document.body.appendChild(messageDiv);

    setTimeout(() => {
        messageDiv.style.animation = "toastOut 0.4s forwards";
        setTimeout(() => messageDiv.remove(), 400);
    }, 4500);
}

/**
 * Global saveJob function for static/dynamic job cards
 */
async function saveJob(jobId, btnElement) {
    const user = JSON.parse(localStorage.getItem("user") || "{}");

    if (!user.user_id) {
        showMessage("Please login to save this job.\nJob-ஐ சேமிக்க லாகின் செய்யவும்.", "error");
        setTimeout(() => window.location.href = "../pages/login.html", 2000);
        return;
    }

    try {
        const API_URL = `${window.getEasyJobsAPI()}/saved-jobs/`;
        const response = await fetch(API_URL, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ user_id: user.user_id, job_id: parseInt(jobId) })
        });

        if (response.ok) {
            if (btnElement) {
                const icon = btnElement.querySelector('i');
                if (icon) {
                    icon.classList.remove('far');
                    icon.classList.add('fas');
                    btnElement.style.color = "#2563eb";
                }
                btnElement.disabled = true;
            }
            showMessage("Job saved successfully! ✓\nவேலை வெற்றிகரமாக சேமிக்கப்பட்டது! ✓", "success");
        } else {
            const err = await response.json();
            showMessage(`Already saved or error: ${err.detail || "Error"}\nஏற்கனவே சேமிக்கப்பட்டது அல்லது பிழை.`, "info");
        }
    } catch (err) {
        console.error("Save job error:", err);
        showMessage("Network error. Please try again later.\nஇணைய பிழை. மீண்டும் முயற்சிக்கவும்.", "error");
    }
}
