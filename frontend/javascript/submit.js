// Utility to get the correct API URL (Port 8000 for Python backend)
const getAPIURL = () => { if (window.getEasyJobsAPI) return window.getEasyJobsAPI(); if (window.location.port === "8000") return window.location.origin + "/api"; return "http://" + (window.location.hostname || "127.0.0.1") + ":8000/api"; };

document.addEventListener("DOMContentLoaded", () => {
    console.log("Application status confirmed.");
});

