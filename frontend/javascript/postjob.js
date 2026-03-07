// Utility to get the correct API URL (Port 8000 for Python backend)
const getAPIURL = () => { if (window.getEasyJobsAPI) return window.getEasyJobsAPI(); return "/api"; };

document.addEventListener("DOMContentLoaded", () => {
    const userString = localStorage.getItem("user");
    const user = userString ? JSON.parse(userString) : null;
    const isEmployer = user && (user.role === "employer" || user.role === "admin");
    const isAdmin = user && user.role === "admin";

    const landing = document.getElementById("employer-landing");
    const formContainer = document.getElementById("job-form-container");
    const dashLink = document.getElementById("nav-dash-link");
    const authBtns = document.getElementById("header-auth-btns");

    // ─── Role-Based UI Toggle ──────────────────
    if (isEmployer) {
        if (formContainer) formContainer.style.display = "block";
        if (landing) landing.style.display = "none";
        if (dashLink) dashLink.style.display = isAdmin ? "inline-block" : "none";
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
            submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> <span>Publishing Job...</span>';

            try {
                const API_BASE_URL = getAPIURL();
                const response = await fetch(`${API_BASE_URL}/jobs/`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(formData)
                });

                if (response.ok) {
                    // Show custom success message
                    if (typeof showMessage === 'function') {
                        showMessage("Job Posted Successfully! ✓", "success");
                    } else {
                        alert("Job Posted Successfully! ✓");
                    }

                    // Replace form with success card for better understanding
                    if (formContainer) {
                        formContainer.innerHTML = `
                            <div style="text-align: center; padding: 60px 20px; background: white; border-radius: 20px; box-shadow: 0 10px 30px rgba(0,0,0,0.1);">
                                <div style="width: 80px; height: 80px; background: #dcfce7; color: #16a34a; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 2.5rem; margin: 0 auto 25px;">
                                    <i class="fas fa-check"></i>
                                </div>
                                <h2 style="color: #1e293b; margin-bottom: 10px;">Job Published Live!</h2>
                                <p style="color: #64748b; margin-bottom: 30px; line-height: 1.6;">
                                    Your job opportunity for <strong>${formData.job_title}</strong> is now live on EasyJobs.
                                </p>
                                <div style="display: flex; gap: 15px; justify-content: center;">
                                    <button onclick="window.location.reload()" class="btn-register" style="padding: 12px 25px; border-radius: 50px;">Post Another Job</button>
                                    <a href="${isAdmin ? '/frontend/pages/dashboard.html' : '/index.html'}" class="btn-login" style="padding: 12px 25px; border-radius: 50px; text-decoration: none;">Go to ${isAdmin ? 'Dashboard' : 'Home'}</a>
                                </div>
                            </div>
                        `;
                    }
                } else {
                    const errorData = await response.json();
                    const detail = errorData.detail || "Server error";
                    if (typeof showMessage === 'function') {
                        showMessage(`Failed to post: ${detail}`, "error");
                    } else {
                        alert(`Failed: ${detail}`);
                    }
                }
            } catch (error) {
                console.error("Post job error:", error);
                if (typeof showMessage === 'function') {
                    showMessage("Network Error. Ensure backend is running.", "error");
                } else {
                    alert("Network error.");
                }
            } finally {
                if (submitBtn) {
                    submitBtn.disabled = false;
                    submitBtn.innerHTML = originalBtnHtml;
                }
            }
        });
    }
});

