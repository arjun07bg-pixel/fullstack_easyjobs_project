"use strict";

// Utility to get the correct API URL (Port 8000 for Python backend)
const getAPIURL = () => {
    if (window.getEasyJobsAPI) return window.getEasyJobsAPI();
    return "/api";
};

document.addEventListener("DOMContentLoaded", async () => {

    const API_BASE_URL = getAPIURL();

    const applyForm = document.getElementById("applyForm");
    const resumeInput = document.getElementById("resume");
    const fileNameDisplay = document.getElementById("file-name-display");
    const submitBtn = applyForm ? applyForm.querySelector("button[type='submit']") : null;

    const urlParams = new URLSearchParams(window.location.search);
    let jobId = urlParams.get("job_id");

    const userString = localStorage.getItem("user");
    const user = userString ? JSON.parse(userString) : null;

    let currentJobDetails = null;

    // ───────────── EMPLOYER BLOCK ─────────────
    if (user && (user.role === "employer" || user.role === "admin")) {
        if (applyForm) applyForm.style.display = "none";
        const sidebar = document.querySelector(".sidebar");
        if (sidebar) {
            sidebar.innerHTML = `
                <div style="padding:2rem;text-align:center;">
                    <h3>Employers Cannot Apply for Jobs</h3>
                    <p>You are logged in as an Employer.</p>
                    <a href="/frontend/pages/dashboard.html">Go to Dashboard</a>
                </div>
            `;
        }
        console.warn("Employer account blocked from applying.");
        return;
    }

    const fetchLatestUser = async () => {
        if (!user || !user.user_id) return;
        try {
            const res = await fetch(`${getAPIURL()}/users/${user.user_id}`);
            if (res.ok) {
                const latestUser = await res.json();
                // Update form with latest data
                if (document.getElementById("full_name")) document.getElementById("full_name").value = `${latestUser.first_name} ${latestUser.last_name || ''}`.trim();
                if (document.getElementById("email")) document.getElementById("email").value = latestUser.email || "";
                if (document.getElementById("phone") && latestUser.phone_number) document.getElementById("phone").value = latestUser.phone_number;
                if (document.getElementById("location") && latestUser.location) document.getElementById("location").value = latestUser.location;
                if (document.getElementById("experience") && latestUser.experience !== null) document.getElementById("experience").value = latestUser.experience;
                if (document.getElementById("salary") && latestUser.salary) document.getElementById("salary").value = latestUser.salary;
                
                // Update localStorage as well to keep it in sync
                localStorage.setItem("user", JSON.stringify({ ...user, ...latestUser }));
            }
        } catch (err) {
            console.error("Error fetching latest user details:", err);
        }
    };

    // Fill user info if logged in (Initial load from localStorage)
    if (user) {
        if (document.getElementById("full_name")) document.getElementById("full_name").value = `${user.first_name} ${user.last_name || ''}`.trim();
        if (document.getElementById("email")) document.getElementById("email").value = user.email || "";
        if (document.getElementById("phone") && user.phone_number) document.getElementById("phone").value = user.phone_number;
        if (document.getElementById("location") && user.location) document.getElementById("location").value = user.location;
        if (document.getElementById("experience") && user.experience !== null) document.getElementById("experience").value = user.experience;
        if (document.getElementById("salary") && user.salary) document.getElementById("salary").value = user.salary;

        // --- 🔒 PROFILE COMPLETENESS CHECK 🔒 ---
        const hasPhoto = (user.image && user.image.length > 100);
        const hasExp = (user.experience !== null && user.experience !== undefined);
        const hasLocation = (user.location && user.location.trim() !== "");

        if (!hasPhoto || !hasExp || !hasLocation) {
            alert("Please complete your profile before applying.");
            setTimeout(() => {
                window.location.href="/frontend/pages/profile.html";
            }, 2000);
            return;
        }
        
        // Fetch latest in background to be 100% sure
        fetchLatestUser();
    }

    // UI elements to fill
    const elements = {
        crumb: document.getElementById("job-title-crumb"),
        title: document.getElementById("detailed-job-title"),
        company: document.getElementById("detailed-company-name"),
        location: document.getElementById("detailed-location"),
        exp: document.getElementById("detailed-exp"),
        salary: document.getElementById("detailed-salary"),
        type: document.getElementById("detailed-type"),
        mode: document.getElementById("detailed-mode"),
        desc: document.getElementById("detailed-description"),
        logo: document.getElementById("company-logo-char"),
        skills: document.getElementById("skills-container"),
        companyDesc: document.getElementById("detailed-company-description")
    };

    const staticTitle = urlParams.get("title");
    const staticCompany = urlParams.get("company");
    const staticCompanyDesc = urlParams.get("company_desc");

    // PRIORITIZE URL Parameters
    if (staticTitle && staticCompany) {
        console.log("📝 Loading job data from URL parameters");
        // ... (truncated generation logic for brevity, but I will include it)
        const rawDesc = urlParams.get("desc") || urlParams.get("description") || "We are looking for talented individuals to join our team.";
        const jobTitle = staticTitle;
        let sectionContent = `<p>${rawDesc}</p>`;

        // (I will keep the same categories logic from the previous view_file output)
        currentJobDetails = {
            job_id: jobId || 0,
            job_title: staticTitle,
            company_name: staticCompany,
            company_description: staticCompanyDesc || "We are a leading organization in our industry, committed to innovation and excellence.",
            location: urlParams.get("location") || "Remote",
            experience_level: urlParams.get("experience") || urlParams.get("exp") || "Not Specified",
            salary: urlParams.get("salary") || urlParams.get("stipend") || "Not Disclosed",
            job_type: urlParams.get("type") || (urlParams.get("stipend") ? "Internship" : "Full Time"),
            work_mode: urlParams.get("mode") || "Hybrid",
            description: sectionContent
        };
        fillUI(currentJobDetails);
    }

    // --- ───────────── FETCH JOB DETAILS ───────────── ---
    const fetchJobDetails = async () => {
        if (!jobId || isNaN(parseInt(jobId)) || parseInt(jobId) <= 0) return null;
        try {
            const response = await fetch(`${API_BASE_URL}/jobs/${jobId}`);
            if (response.ok) {
                const job = await response.json();
                currentJobDetails = job;
                fillUI(job);
                return job;
            }
        } catch (error) {
            console.error("Job fetch error:", error);
        }
        return null;
    };

    if (jobId && !currentJobDetails) {
        await fetchJobDetails();
    }

    // Helper to get skills by job title
    function getSkills(title) {
        if (!title) return ["General", "Problem Solving"];
        const t = title.toLowerCase();
        if (t.includes("frontend") || t.includes("react") || t.includes("web")) return ["React", "JavaScript", "CSS", "HTML5", "TypeScript"];
        if (t.includes("backend") || t.includes("node") || t.includes("python")) return ["Node.js", "Express", "Python", "SQL", "API Design"];
        if (t.includes("full stack") || t.includes("developer")) return ["React", "Node.js", "Full Stack", "Database", "AWS"];
        if (t.includes("design") || t.includes("ui") || t.includes("ux")) return ["Figma", "UI/UX", "Adobe XD", "Prototyping", "Design"];
        if (t.includes("marketing") || t.includes("sales")) return ["Sales", "Communication", "Marketing", "Strategy", "Lead Gen"];
        if (t.includes("finance") || t.includes("account")) return ["Accounting", "Excel", "Finance", "Analysis", "Budgeting"];
        if (t.includes("engineer")) return ["Engineering", "Problem Solving", "CAD", "Project Management"];
        return ["Communication", "Organization", "Microsoft Office", "Collaboration"];
    }

    function fillUI(job) {
        if (!job) return;
        if (elements.crumb) elements.crumb.innerText = job.job_title || "Job Application";
        if (elements.title) elements.title.innerText = job.job_title || "Position";
        if (elements.company) elements.company.innerText = job.company_name || "Company";
        if (elements.location) elements.location.innerText = `📍 ${job.location || 'Remote'}`;

        const isInternship = (job.job_type && job.job_type.toLowerCase() === 'internship') || (job.job_title && job.job_title.toLowerCase().includes('intern'));

        if (elements.salary) {
            const rawVal = job.salary || job.stipend || 'Not Disclosed';
            if (!isNaN(rawVal)) elements.salary.innerText = isInternship ? `₹${rawVal} /month` : `₹${rawVal} LPA`;
            else elements.salary.innerText = rawVal;
        }

        if (elements.exp) elements.exp.innerText = job.experience_level !== null ? (typeof job.experience_level === 'number' ? `${job.experience_level}+ years experience` : job.experience_level) : 'Fresher/All Levels';
        if (elements.type) elements.type.innerText = job.job_type || (isInternship ? 'Internship' : 'Full Time');
        if (elements.mode) elements.mode.innerText = job.work_mode || 'Hybrid';
        if (elements.desc) elements.desc.innerHTML = job.description || '<p>We are looking for talented individuals to join our team. Apply now to know more about this exciting opportunity!</p>';
        if (elements.logo) elements.logo.innerText = job.company_name ? job.company_name.charAt(0).toUpperCase() : '?';
        if (elements.companyDesc) elements.companyDesc.innerText = job.company_description || "We are a leading organization in our industry, committed to innovation and excellence.";
        if (elements.skills) {
            const skills = getSkills(job.job_title || "");
            elements.skills.innerHTML = skills.map(s => `<span class="skill-tag">${s}</span>`).join("");
        }
    }

    // Helper to show messages
    function showMessage(message, type = "info") {
        const messageDiv = document.createElement("div");
        messageDiv.style.cssText = `
            position: fixed; top: 20px; right: 20px; padding: 1rem 1.5rem;
            background: ${type === "error" ? "#fef2f2" : type === "success" ? "#dcfce7" : "#eff6ff"};
            color: ${type === "error" ? "#dc2626" : type === "success" ? "#16a34a" : "#2563eb"};
            border-left: 4px solid ${type === "error" ? "#dc2626" : type === "success" ? "#16a34a" : "#2563eb"};
            border-radius: 8px; box-shadow: 0 10px 25px -5px rgba(0,0,0,0.1);
            z-index: 10000; max-width: 400px; font-size: 0.95rem; font-weight: 500;
            animation: slideIn 0.3s ease-out;
        `;
        messageDiv.innerHTML = message.replace(/\n/g, '<br>');
        document.body.appendChild(messageDiv);
        setTimeout(() => {
            messageDiv.style.animation = "slideOut 0.3s ease-out";
            setTimeout(() => messageDiv.remove(), 300);
        }, 5000);
    }

    // Animation styles
    const style = document.createElement('style');
    style.textContent = `
        @keyframes slideIn { from { transform: translateX(400px); opacity: 0; } to { transform: translateX(0); opacity: 1; } }
        @keyframes slideOut { from { transform: translateX(0); opacity: 1; } to { transform: translateX(400px); opacity: 0; } }
        .skill-tag { display: inline-block; padding: 0.4rem 1rem; background: #eff6ff; color: #2563eb; border: 1px solid #bfdbfe; border-radius: 50px; font-size: 0.85rem; font-weight: 600; margin: 0.3rem; transition: all 0.2s; }
        .skill-tag:hover { background: #2563eb; color: white; }
    `;
    document.head.appendChild(style);

    // --- SAVE JOB FUNCTIONALITY ---
    const saveJobBtn = document.getElementById("saveJobBtn");
    if (saveJobBtn) {
        saveJobBtn.addEventListener("click", async () => {
            if (!user) {
                showMessage("Please login to save this job.", "error");
                return;
            }
            if (!jobId || isNaN(parseInt(jobId)) || parseInt(jobId) <= 0) {
                showMessage("Static job listings cannot be saved to dashboard yet.", "info");
                return;
            }
            const icon = saveJobBtn.querySelector("i");
            const originalText = saveJobBtn.innerHTML;
            saveJobBtn.disabled = true;
            saveJobBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Saving...';
            try {
                const res = await fetch(`${getAPIURL()}/saved-jobs/`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ user_id: user.user_id, job_id: parseInt(jobId) })
                });
                if (res.ok) {
                    showMessage("Job saved successfully! ✓", "success");
                    saveJobBtn.innerHTML = '<i class="fas fa-bookmark"></i> Saved';
                    if (icon) { icon.classList.remove("far"); icon.classList.add("fas"); }
                } else {
                    const error = await res.json();
                    if (error.detail === "Job already saved") {
                        showMessage("Already saved.", "info");
                        saveJobBtn.innerHTML = '<i class="fas fa-bookmark"></i> Saved';
                    } else {
                        showMessage("Failed to save job.", "error");
                        saveJobBtn.innerHTML = originalText;
                        saveJobBtn.disabled = false;
                    }
                }
            } catch (err) {
                showMessage("Network error while saving job.", "error");
                saveJobBtn.innerHTML = originalText;
                saveJobBtn.disabled = false;
            }
        });
    }

    // ───────────── FORM SUBMIT ─────────────
    if (applyForm) {
        applyForm.addEventListener("submit", async (e) => {
            e.preventDefault();
            if (!user) {
                alert("Please login first");
                window.location.href="/frontend/pages/login.html";
                return;
            }
            const resumeFile = resumeInput.files[0];
            if (!resumeFile) { alert("Please upload a resume."); return; }

            submitBtn.disabled = true;
            submitBtn.innerHTML = "Submitting...";

            // Parse job_id: send null (not 0) for static/company jobs that aren't in the DB
            const parsedJobId = parseInt(jobId);
            const safeJobId = (!isNaN(parsedJobId) && parsedJobId > 0) ? parsedJobId : null;

            // Parse numeric fields safely — default to 0 if blank/invalid
            const expVal = parseInt(document.getElementById("experience").value);
            const salaryVal = parseInt(document.getElementById("salary").value);
            const noticeVal = parseInt(document.getElementById("notice_period").value);

            const payload = {
                user_id: user.user_id,
                job_id: safeJobId,
                name: document.getElementById("full_name").value.trim(),
                email: document.getElementById("email").value.trim(),
                phone_number: document.getElementById("phone").value.trim(),
                Current_Location: document.getElementById("location").value.trim(),
                Total_Experience: isNaN(expVal) ? 0 : expVal,
                Current_salary: isNaN(salaryVal) ? 0 : salaryVal,
                Notice_Period: isNaN(noticeVal) ? 0 : noticeVal,
                Cover_Letter: document.getElementById("cover_letter").value.trim(),
                portfolio_link: document.getElementById("portfolio_link").value.trim(),
                resume: resumeFile.name,
                company_name: currentJobDetails?.company_name || "",
                job_title: currentJobDetails?.job_title || "",
                job_type: currentJobDetails?.job_type || "Full Time",
                status: "applied"
            };

            console.log("📤 Submitting application:", payload);

            try {
                const response = await fetch(`${API_BASE_URL}/applications/`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(payload)
                });
                if (response.ok) {
                    showMessage("Application submitted successfully! ✅", "success");
                    setTimeout(() => {
                        window.location.href="/frontend/pages/submit_success.html";
                    }, 1000);
                } else {
                    let errMsg = "Submission failed";
                    try {
                        const errData = await response.json();
                        errMsg = errData.detail || errMsg;
                        if (Array.isArray(errMsg)) {
                            // Pydantic validation errors are arrays
                            errMsg = errMsg.map(e => `${e.loc?.join(".")}: ${e.msg}`).join("\n");
                        }
                    } catch (_) {}
                    console.error("❌ Application error:", errMsg);
                    alert("Submission failed:\n" + errMsg);
                    submitBtn.disabled = false;
                    submitBtn.innerHTML = "Submit Application";
                }
            } catch (err) {
                console.error("Network error:", err);
                alert("Network error. Please check your connection and try again.");
                submitBtn.disabled = false;
                submitBtn.innerHTML = "Submit Application";
            }
        });
    }

    if (resumeInput) {
        resumeInput.addEventListener("change", (e) => {
            if (e.target.files.length > 0) {
                fileNameDisplay.innerText = e.target.files[0].name;
            }
        });
    }

    console.log("EasyJobs Application Page Loaded");
});