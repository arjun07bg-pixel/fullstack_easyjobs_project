document.addEventListener("DOMContentLoaded", () => {
    const userString = localStorage.getItem("user");
    const user = userString ? JSON.parse(userString) : null;
    const isEmployer = user && (user.role === "employer" || user.role === "admin");
    const isAdmin = user && user.role === "admin";

    const landing = document.getElementById("employer-landing");
    const formContainer = document.getElementById("job-form-container");
    const dashLink = document.getElementById("nav-dash-link");
    const authBtns = document.getElementById("header-auth-btns");

    // Role-Based UI
    if (isEmployer) {
        landing?.style.setProperty("display", "none");
        formContainer?.style.setProperty("display", "block");
        dashLink && (dashLink.style.display = isAdmin ? "inline-block" : "none");
        authBtns && (authBtns.style.display = "none");

        // Auto-fill company name
        const companyInput = document.getElementById("company-name");
        if (companyInput && user.company_name) {
            companyInput.value = user.company_name;
            companyInput.readOnly = true;
            companyInput.style.background = "#f1f5f9";
        }
    } else {
        landing?.style.setProperty("display", "block");
        formContainer?.style.setProperty("display", "none");
    }

    // Form Submission
    const postJobForm = document.getElementById("post-job-form");
    const submitBtn = document.getElementById("submit-btn");

    postJobForm?.addEventListener("submit", async (e) => {
        e.preventDefault();
        if (!submitBtn) return;

        const formData = {
            job_title: document.getElementById("job-title")?.value.trim(),
            company_name: document.getElementById("company-name")?.value.trim(),
            location: document.getElementById("job-location")?.value.trim(),
            job_type: document.getElementById("job-type")?.value.trim(),
            work_mode: document.getElementById("work-mode")?.value.trim(),
            experience_level: parseInt(document.getElementById("exp-level")?.value) || 0,
            salary: parseInt(document.getElementById("salary-range")?.value) || 0,
            description: document.getElementById("job-desc")?.value.trim(),
            employer_id: user?.user_id || null
        };

        const originalBtnHtml = submitBtn.innerHTML;
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Publishing...';

        try {
            const API_BASE = getAPIURL();
            const response = await fetch(`${API_BASE}/jobs/`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData)
            });

            let detail = "Server error";
            if (response.ok) {
                if (typeof showMessage === "function") showMessage("Job Posted Successfully! ✓", "success");
                else alert("Job Posted Successfully! ✓");

                // Show success card
                formContainer.innerHTML = `
                    <div style="text-align:center; padding:60px 20px; background:white; border-radius:20px; box-shadow:0 10px 30px rgba(0,0,0,0.1);">
                        <div style="width:80px;height:80px;background:#dcfce7;color:#16a34a;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:2.5rem;margin:0 auto 25px;">
                            <i class="fas fa-check"></i>
                        </div>
                        <h2 style="color:#1e293b;margin-bottom:10px;">Job Published Live!</h2>
                        <p style="color:#64748b;margin-bottom:30px;line-height:1.6;">
                            Your job <strong>${formData.job_title}</strong> is now live on EasyJobs.
                        </p>
                        <div style="display:flex;gap:15px;justify-content:center;">
                            <button onclick="window.location.reload()" class="btn-register" style="padding:12px 25px;border-radius:50px;">Post Another Job</button>
                            <a href="${isAdmin ? './dashboard.html' : '/index.html'}" class="btn-login" style="padding:12px 25px;border-radius:50px;text-decoration:none;">Go to ${isAdmin ? 'Dashboard' : 'Home'}</a>
                        </div>
                    </div>
                `;
            } else {
                try { detail = (await response.json()).detail || detail; } catch {}
                typeof showMessage === "function" ? showMessage(`Failed to post: ${detail}`, "error") : alert(`Failed: ${detail}`);
            }
        } catch (err) {
            console.error("Post job error:", err);
            typeof showMessage === "function" ? showMessage("Network Error. Ensure backend is running.", "error") : alert("Network error.");
        } finally {
            submitBtn.disabled = false;
            submitBtn.innerHTML = originalBtnHtml;
        }
    });
});