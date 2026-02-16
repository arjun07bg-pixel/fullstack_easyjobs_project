const API_BASE_URL = "http://127.0.0.1:8000/api";

document.addEventListener("DOMContentLoaded", async () => {
    const tableBody = document.getElementById("applications-body");
    const headerRow = document.getElementById("table-header-row");
    const title = document.getElementById("dashboard-title");
    const subtitle = document.getElementById("dashboard-subtitle");
    const logoutBtn = document.getElementById("logoutBtn");

    // Check Auth
    const token = localStorage.getItem("token");
    const user = JSON.parse(localStorage.getItem("user") || "{}");

    if (!token || !user) {
        window.location.href = "/login.html";
        return;
    }

    // Logout
    if (logoutBtn) {
        logoutBtn.addEventListener("click", (e) => {
            e.preventDefault();
            localStorage.removeItem("user");
            localStorage.removeItem("token");
            window.location.href = "/login.html";
        });
    }

    if (!tableBody) return;

    // Determine Role and Endpoint
    const isJobSeeker = user.role !== "employer" && user.role !== "admin";

    // Set Headers & Title
    if (isJobSeeker) {
        if (title) title.innerText = "My Applications";
        if (subtitle) subtitle.innerText = "Track status of your job applications";
        headerRow.innerHTML = `
                <th>S.No</th>
                <th>Company</th>
                <th>Job Role</th>
                <th>Location</th>
                <th>Experience</th>
                <th>Status</th>
                <th>Action</th>
            `;
    } else {
        if (title) title.innerText = "Received Applications";
        if (subtitle) subtitle.innerText = "Manage candidates applying to your jobs";
        headerRow.innerHTML = `
            <th>S.No</th>
            <th>Candidate</th>
            <th>Email</th>
            <th>Role / Company</th>
            <th>Experience</th>
            <th>Resume</th>
            <th>Actions</th>
        `;
    }

    try {
        let endpoint = isJobSeeker
            ? `${API_BASE_URL}/applications/user/${user.user_id}`
            : `${API_BASE_URL}/applications/`;

        console.log(`Fetching from: ${endpoint}`);
        const response = await fetch(endpoint);

        if (!response.ok) throw new Error("Failed to fetch data");

        const applications = await response.json();
        tableBody.innerHTML = "";

        if (applications.length === 0) {
            tableBody.innerHTML = `<tr><td colspan="${isJobSeeker ? 6 : 7}" style="text-align:center; padding: 2rem;">No applications found.</td></tr>`;
            return;
        }

        applications.forEach((app, index) => {
            const row = document.createElement("tr");

            if (isJobSeeker) {
                // Job Seeker View
                row.innerHTML = `
                    <td>${index + 1}</td>
                    <td style="font-weight:600;">${app.company_name}</td>
                    <td>Job ID: ${app.job_id}</td>
                    <td>${app.Current_Location}</td>
                    <td>${app.Total_Experience} Years</td>
                    <td><span class="status-tag applied">Applied</span></td>
                    <td><button class="view-btn" onclick="showDetails(${app.application_id})">View Details</button></td>
                `;
            } else {
                // Employer View
                const resumeLink = app.resume ? `<a href="#" onclick="alert('Resume download coming soon: ${app.resume}')">📄 View</a>` : "-";
                row.innerHTML = `
                    <td>${index + 1}</td>
                    <td>${app.name}</td>
                    <td>${app.email}</td>
                    <td>${app.company_name}</td>
                    <td>${app.Total_Experience} Years</td>
                    <td>${resumeLink}</td>
                    <td>
                        <button class="view-btn" onclick="showDetails(${app.application_id})">Details</button> 
                    </td>
                `;
            }
            tableBody.appendChild(row);
        });

        // Store applications globally for Details modal
        window.allApplications = applications;

    } catch (error) {
        console.error("Dashboard Error:", error);
        tableBody.innerHTML = `<tr><td colspan="7" style="text-align:center; color:red;">Error loading data. Ensure backend is running.</td></tr>`;
    }
});

// Global Details Function
window.showDetails = function (appId) {
    const app = window.allApplications.find(a => a.application_id == appId);
    if (app) {
        alert(`
Application Details:
--------------------
Candidate: ${app.name}
Email: ${app.email}
Phone: ${app.phone_number}
Position: ${app.company_name}
Experience: ${app.Total_Experience} years
Current Salary: ₹${app.Current_salary} LPA
Notice Period: ${app.Notice_Period} days
Location: ${app.Current_Location}
Portfolio: ${app.portfolio_link || 'N/A'}
Cover Letter: ${app.Cover_Letter || 'N/A'}
        `);
    }
};
