import { API_URL } from "./config.js";

// Utility to get the correct API URL (Port 8000 for Python backend)
const getAPIURL = () => { return API_URL || "/api"; };

document.addEventListener("DOMContentLoaded", () => {
    // About page mostly static, could add stats from backend if available
    console.log("About Us page initialized.");

    // Example: Dynamically updating "EasyJobs" success stats if needed
    // const stats = fetchStats(); 
});