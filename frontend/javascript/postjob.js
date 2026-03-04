// Utility to get the correct API URL (Port 8000 for Python backend)
const getAPIURL = () => { if (window.getEasyJobsAPI) return window.getEasyJobsAPI(); if (window.location.port === "8000") return window.location.origin + "/api"; return "http://" + (window.location.hostname || "127.0.0.1") + ":8000/api"; };

document.addEventListener("DOMContentLoaded", () => {
    const userString = localStorage.getItem("user");
    const user = userString ? JSON.parse(userString) : null;
    const isEmployer = user && (user.role === "employer" || user.role === "admin");

    const landing = document.getElementById("employer-landing");
    const formContainer = document.getElementById("job-form-container");
    const dashLink = document.getElementById("nav-dash-link");
    const authBtns = document.getElementById("header-auth-btns");

    // ─── Role-Based UI Toggle ──────────────────
    if (isEmployer) {
        if (formContainer) formContainer.style.display = "block";
        if (landing) landing.style.display = "none";
        if (dashLink) dashLink.style.display = "inline-block";
        if (authBtns) authBtns.style.display = "none";

        // Auto-fill company name
        const companyInput = document.getElementById("company-name");
        if (companyInput && user.company_name) {
            companyInput.value = user.company_name;
            companyInput.readOnly = true;
            companyInput.style.background = "#f1f5f9";
        }
    } else {
        if (landing) landing.style.display = "block";
        if (formContainer) formContainer.style.display = "none";
    }

    // ─── Form Submission ──────────────────────
    const postJobForm = document.getElementById("post-job-form");
    const submitBtn = document.getElementById("submit-btn");

    if (postJobForm) {
        postJobForm.addEventListener("submit", async (e) => {
            e.preventDefault();

            const formData = {
                job_title: document.getElementById("job-title").value,
                company_name: document.getElementById("company-name").value,
                location: document.getElementById("job-location").value,
                job_type: document.getElementById("job-type").value,
                work_mode: document.getElementById("work-mode").value,
                experience_level: parseInt(document.getElementById("exp-level").value) || 0,
                salary: parseInt(document.getElementById("salary-range").value) || 0,
                description: document.getElementById("job-desc").value,
                employer_id: user ? user.user_id : null
            };

            const originalBtnHtml = submitBtn.innerHTML;
            submitBtn.disabled = true;
            submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> <span>Publishing...</span>';

            try {
                const API_BASE_URL = getAPIURL();
                const response = await fetch(`${API_BASE_URL}/jobs/`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(formData)
                });

                if (response.ok) {
                    alert("Success! Your job has been posted successfully. ✓");
                    window.location.href = "/frontend/pages/dashboard.html"; // Redirect to dashboard to see the job
                } else {
                    const errorData = await response.json();
                    alert(`Failed to post job: ${errorData.detail || "Server error occurred"}`);
                }
            } catch (error) {
                console.error("Post job error:", error);
                alert("Network error. Please ensure the backend is running.");
            } finally {
                submitBtn.disabled = false;
                submitBtn.innerHTML = originalBtnHtml;
            }
        });
    }
});

