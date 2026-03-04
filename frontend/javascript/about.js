// Utility to get the correct API URL (Port 8000 for Python backend)
const getAPIURL = () => { if (window.getEasyJobsAPI) return window.getEasyJobsAPI(); if (window.location.port === "8000") return window.location.origin + "/api"; return "http://" + (window.location.hostname || "127.0.0.1") + ":8000/api"; };

document.addEventListener("DOMContentLoaded", () => {
    // About page mostly static, could add stats from backend if available
    console.log("About Us page initialized.");

    // Example: Dynamically updating "EasyJobs" success stats if needed
    // const stats = fetchStats(); 
});
