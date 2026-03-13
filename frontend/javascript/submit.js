/**
 * submit.js
 * Handles dynamic data population and auto-redirect for the Job Application Success page
 */
document.addEventListener("DOMContentLoaded", () => {
    // ─── 1. Load last application data from localStorage ─────────
    const lastAppStr = localStorage.getItem("lastApplication");
    const jobTitleDisplay = document.getElementById("job-title-display");
    const companyNameDisplay = document.getElementById("company-name-display");
    const appIdValue = document.getElementById("app-id-value");
    const countdownEl = document.getElementById("countdown");

    if (lastAppStr) {
        try {
            const data = JSON.parse(lastAppStr);
            console.log("📝 Loaded application data:", data);

            if (jobTitleDisplay) jobTitleDisplay.innerText = data.jobTitle || "Position";
            if (companyNameDisplay) companyNameDisplay.innerText = data.companyName || "Company";

            if (appIdValue) {
                const id = data.applicationId || Math.floor(100000 + Math.random() * 900000);
                appIdValue.innerText = `#EJ-${id}`;
            }
        } catch (err) {
            console.error("Error parsing last application data:", err);
        }
    } else {
        // Fallback for direct page access
        if (jobTitleDisplay) jobTitleDisplay.innerText = "Application Submitted";
        if (companyNameDisplay) companyNameDisplay.innerText = "EasyJobs Network";
        if (appIdValue) appIdValue.innerText = "#EJ-SYSTEM";
    }

    // ─── 2. Auto-redirect countdown ─────────────────────────────
    let timeLeft = 15;
    const timer = setInterval(() => {
        timeLeft--;
        if (countdownEl) countdownEl.innerText = timeLeft;

        if (timeLeft <= 0) {
            clearInterval(timer);
            window.location.href="/index.html";
        }
    }, 1000);

    // ─── 3. Clean up timer on page unload ───────────────────────
    window.addEventListener("beforeunload", () => {
        clearInterval(timer);
    });
});