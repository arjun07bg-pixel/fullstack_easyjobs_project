/**
 * submit.js - Handles dynamic data population for the success page
 */
document.addEventListener("DOMContentLoaded", () => {
    // 1. Recover application data from localStorage
    const lastAppStr = localStorage.getItem("lastApplication");
    const jobTitleDisplay = document.getElementById("job-title-display");
    const companyNameDisplay = document.getElementById("company-name-display");
    const appIdValue = document.getElementById("app-id-value");
    const countdownEl = document.getElementById("countdown");

    if (lastAppStr) {
        try {
            const data = JSON.parse(lastAppStr);
            console.log("📝 Loaded application data for success page:", data);

            if (jobTitleDisplay) jobTitleDisplay.innerText = data.jobTitle || "Position";
            if (companyNameDisplay) companyNameDisplay.innerText = data.companyName || "Company";

            // Format ID nicely
            if (appIdValue) {
                const id = data.applicationId || Math.floor(100000 + Math.random() * 900000);
                appIdValue.innerText = `#EJ-${id}`;
            }
        } catch (e) {
            console.error("Error parsing application data:", e);
        }
    } else {
        // Fallback for direct page access
        if (jobTitleDisplay) jobTitleDisplay.innerText = "Application Success";
        if (companyNameDisplay) companyNameDisplay.innerText = "EasyJobs Network";
        if (appIdValue) appIdValue.innerText = "#EJ-SYSTEM";
    }

    // 2. Auto-redirect Countdown
    let timeLeft = 15;
    const timer = setInterval(() => {
        timeLeft--;
        if (countdownEl) countdownEl.innerText = timeLeft;

        if (timeLeft <= 0) {
            clearInterval(timer);
            window.location.href = "/index.html";
        }
    }, 1000);

    // 3. Clear the flag so redirect doesn't happen if user navigates away manually
    window.addEventListener("beforeunload", () => {
        clearInterval(timer);
    });
});
