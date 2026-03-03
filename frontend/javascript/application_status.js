// Utility to get the correct API URL (Port 8000 for Python backend)
const getAPIURL = () => { if (window.getEasyJobsAPI) return window.getEasyJobsAPI(); if (window.location.port === "8000") return window.location.origin + "/api"; return "http://" + window.location.hostname + ":8000/api"; };

document.addEventListener("DOMContentLoaded", async () => {
    const tableBody = document.querySelector("table tbody");

    // Fetch applications specifically for the status view
    try {
        const API_BASE_URL = getAPIURL();
        const response = await fetch(`${API_BASE_URL}/applications/`);

        if (!response.ok) {
            throw new Error("Failed to fetch applications");
        }

        const applications = await response.json();

        if (tableBody) {
            tableBody.innerHTML = "";

            if (applications.length === 0) {
                tableBody.innerHTML = "<tr><td colspan='5' style='text-align:center;'>No applications found</td></tr>";
            } else {
                applications.forEach((app, index) => {
                    const row = document.createElement("tr");
                    row.innerHTML = `
                        <td>${index + 1}</td>
                        <td>${app.name}</td>
                        <td>${app.email}</td>
                        <td>${app.company_name || 'N/A'}</td>
                        <td><span class="status applied">Applied</span></td>
                    `;
                    tableBody.appendChild(row);
                });
            }
        }
    } catch (error) {
        console.error("Error loading application status:", error);
    }
});
