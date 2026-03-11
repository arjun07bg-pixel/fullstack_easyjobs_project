// Utility to get the correct API URL (Port 8000 for Python backend)
const getAPIURL = () => {
    if (window.getEasyJobsAPI) return window.getEasyJobsAPI();
    return "/api";
};

document.addEventListener("DOMContentLoaded", async () => {
    const applyForm = document.getElementById("applyForm");
    const resumeInput = document.getElementById("resume");
    const fileNameDisplay = document.getElementById("file-name-display");

    const urlParams = new URLSearchParams(window.location.search);
    let jobId = urlParams.get("job_id");

    const userString = localStorage.getItem("user");
    const user = userString ? JSON.parse(userString) : null;

    let currentJobDetails = null;

    // ── EMPLOYER BLOCK: Employers cannot apply for jobs ──────────────────────
    if (user && (user.role === "employer" || user.role === "admin")) {
        // Hide the apply form completely
        if (applyForm) applyForm.style.display = "none";

        // Show a styled block message in place of the form
        const sidebar = document.querySelector(".sidebar");
        if (sidebar) {
            sidebar.innerHTML = `
                <div style="
                    background: linear-gradient(135deg, #fff7ed, #fef3c7);
                    border: 2px solid #f59e0b;
                    border-radius: 16px;
                    padding: 2rem;
                    text-align: center;
                    box-shadow: 0 8px 24px rgba(245,158,11,0.15);
                ">
                    <div style="font-size: 3.5rem; margin-bottom: 1rem;">🏢</div>
                    <h3 style="color: #92400e; font-size: 1.3rem; margin-bottom: 0.75rem; font-weight: 700;">
                        Employers Cannot Apply for Jobs
                    </h3>
                    <p style="color: #78350f; font-size: 0.95rem; margin-bottom: 1.5rem; line-height: 1.6;">
                        You are logged in as an <strong>Employer</strong>.<br>
                        Employers can <strong>post jobs</strong> and <strong>review applications</strong>,
                        but cannot apply for positions.
                    </p>
                    <a href="/frontend/pages/dashboard.html" style="
                        display: inline-block;
                        background: linear-gradient(135deg, #f59e0b, #d97706);
                        color: white;
                        padding: 0.75rem 2rem;
                        border-radius: 8px;
                        text-decoration: none;
                        font-weight: 600;
                        font-size: 0.95rem;
                        margin-bottom: 0.75rem;
                        transition: transform 0.2s;
                    " onmouseover="this.style.transform='translateY(-2px)'" onmouseout="this.style.transform='translateY(0)'">&#128203; Go to Dashboard</a>
                    <br>
                    <a href="/frontend/pages/Postjob_home.html" style="
                        display: inline-block;
                        background: linear-gradient(135deg, #2563eb, #1d4ed8);
                        color: white;
                        padding: 0.75rem 2rem;
                        border-radius: 8px;
                        text-decoration: none;
                        font-weight: 600;
                        font-size: 0.95rem;
                        margin-top: 0.5rem;
                        transition: transform 0.2s;
                    " onmouseover="this.style.transform='translateY(-2px)'" onmouseout="this.style.transform='translateY(0)'">&#10010; Post a New Job</a>
                    <p style="margin-top: 1.25rem; font-size: 0.8rem; color: #92400e;">
                        Not an employer? <a href="/frontend/pages/login.html" style="color: #d97706; font-weight:600;">Login as Job Seeker</a>
                    </p>
                </div>
            `;
        }
        console.warn("⛔ Employer account blocked from applying for jobs.");
        return; // Stop all further execution for employers
    }
    // ── END EMPLOYER BLOCK ───────────────────────────────────────────────────

    if (window.jobContext && !jobId) {
        console.log("📝 Using job context from window.jobContext");
        jobId = window.jobContext.job_id;
        currentJobDetails = window.jobContext;
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
            console.warn("⚠️ Profile incomplete. Redirecting to profile page.");
            showMessage("Please complete your profile (Photo, Location, Experience) before applying.\nApply பண்ணுறதுக்கு முன்னாடி Profile-ல Photo மற்றும் Details-ஐ Update பண்ணுங்க!", "info");
            setTimeout(() => {
                window.location.href = "/frontend/pages/profile.html?message=complete_profile";
            }, 3000);
            if (applyForm) applyForm.innerHTML = `<div style='text-align:center; padding:2rem; color:#64748b;'><h3>Profile Incomplete</h3><p>Redirecting to profile page...</p></div>`;
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

    // PRIORITIZE URL Parameters: If we have title and company in the URL, use them.
    // This allows static links from company pages to work perfectly.
    if (staticTitle && staticCompany) {
        console.log("📝 Loading job data from URL parameters");

        const rawDesc = urlParams.get("desc") || urlParams.get("description") || "We are looking for talented individuals to join our team.";
        const jobTitle = staticTitle;
        let sectionContent = `<p>${rawDesc}</p>`;

        // Generate dynamic content based on title
        const t = jobTitle.toLowerCase();
        let responsibilities = [];
        let requiredQualifications = [];
        let preferredQualifications = [];

        if (t.includes("developer") || t.includes("engineer") || t.includes("software") || t.includes("it") || t.includes("tech")) {
            responsibilities = [
                "Design, develop, and maintain efficient, reusable, and reliable code.",
                "Collaborate with cross-functional teams to define, design, and ship new features.",
                "Identify bottlenecks and bugs, and devise solutions to these problems.",
                "Help maintain code quality, organization, and automation."
            ];
            requiredQualifications = [
                "Bachelor's degree in Computer Science, Engineering, or a related field.",
                "Strong proficiency in relevant programming languages (e.g., Java, Python, JavaScript).",
                "Experience with database design and data modeling.",
                "Familiarity with code versioning tools such as Git."
            ];
            preferredQualifications = [
                "Master's degree in Computer Science or related field.",
                "Experience with cloud platforms (AWS, Azure, GCP).",
                "Knowledge of CI/CD pipelines and DevOps practices."
            ];
        } else if (t.includes("sales") || t.includes("marketing") || t.includes("business") || t.includes("digital")) {
            responsibilities = [
                "Develop and execute strategies to drive business growth and market share.",
                "Manage customer relationships and ensure high levels of customer satisfaction.",
                "Conduct market research to identify new opportunities and trends.",
                "Collaborate with the commercial team to align efforts with product features."
            ];
            requiredQualifications = [
                "Bachelor's degree in Marketing, Business Administration, or related field.",
                "Proven work experience in sales or marketing roles.",
                "Excellent communication and negotiation skills.",
                "Ability to analyze data and draw actionable insights."
            ];
            preferredQualifications = [
                "MBA or equivalent advanced degree.",
                "Experience with CRM software (e.g., Salesforce, HubSpot).",
                "Certification in Digital Marketing."
            ];
        } else if (t.includes("finance") || t.includes("account") || t.includes("auditor") || t.includes("tax")) {
            responsibilities = [
                "Prepare financial statements, reports, and forecasts.",
                "Ensure compliance with accounting standards and regulations.",
                "Analyze financial data to identify trends and variances.",
                "Assist in budget preparation and expense management."
            ];
            requiredQualifications = [
                "Bachelor's degree in Finance, Accounting, or Economics.",
                "Strong analytical and numerical skills.",
                "Proficiency in financial software like Tally or SAP."
            ];
            preferredQualifications = [
                "Professional certification (e.g., CPA, CFA, CA, CMA).",
                "Experience with ERP systems.",
                "Master's degree in Finance or Accounting."
            ];
        } else if (t.includes("mechanical") || t.includes("civil") || t.includes("electrical") || t.includes("aerospace") || t.includes("design engineer")) {
            responsibilities = [
                "Design and analyze systems, components, and processes using CAD/CAE tools.",
                "Conduct tests and experiments to validate mechanical/structural designs.",
                "Collaborate with manufacturing and operations teams to optimize production.",
                "Ensure compliance with industry safety and quality standards."
            ];
            requiredQualifications = [
                "Bachelor's degree in relevant Engineering discipline (ME, CE, EE).",
                "Proficiency in CAD software (AutoCAD, SolidWorks, etc.).",
                "Strong problem-solving and analytical abilities.",
                "Detailed knowledge of engineering principles."
            ];
            preferredQualifications = [
                "Master's degree in Engineering.",
                "Professional Engineer (PE) license.",
                "Experience with simulation software (ANSYS, MATLAB)."
            ];
        } else {
            responsibilities = [
                "Perform assigned tasks with high quality and timeliness.",
                "Collaborate with team members to achieve project goals.",
                "Continuously learn and improve skills relevant to the role.",
                "Adhere to company policies and procedures."
            ];
            requiredQualifications = [
                "Relevant educational background or experience.",
                "Strong communication and interpersonal skills.",
                "Ability to work independently and as part of a team."
            ];
            preferredQualifications = [
                "Advanced degree or relevant certifications.",
                "Previous experience in a similar role.",
                "Proactive attitude and willingness to learn."
            ];
        }

        sectionContent += `
            <h3>Key Responsibilities:</h3>
            <ul>
                ${responsibilities.map(r => `<li>${r}</li>`).join('')}
            </ul>
            
            <h3>Required Qualifications:</h3>
            <ul>
                ${requiredQualifications.map(req => `<li>${req}</li>`).join('')}
            </ul>

            <h3>Preferred Qualifications:</h3>
            <ul>
                 ${preferredQualifications.map(pref => `<li>${pref}</li>`).join('')}
            </ul>

            <h3>Benefits:</h3>
            <ul>
                <li>Competitive salary package and annual bonuses.</li>
                <li>Comprehensive health and life insurance.</li>
                <li>Professional development and training opportunities.</li>
                <li>Dynamic and inclusive work culture.</li>
            </ul>
        `;

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
        // Removed return to allow event listeners to be attached
    }

    if (!jobId) {
        if (window.jobContext) {
            console.log("📝 Loading static job context from page source");
            currentJobDetails = window.jobContext;
            fillUI(currentJobDetails);
        } else {
            console.log("No job details provided. Showing default template.");
            // Optional: fill with dummy data or redirect
        }
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

    // Move UI filling to a helper function
    function fillUI(job) {
        if (!job) return;
        if (elements.crumb) elements.crumb.innerText = job.job_title || "Job Application";
        if (elements.title) elements.title.innerText = job.job_title || "Position";
        if (elements.company) elements.company.innerText = job.company_name || "Company";
        if (elements.location) elements.location.innerText = `📍 ${job.location || 'Remote'}`;

        // Handle Salary vs Stipend
        const isInternship = (job.job_type && job.job_type.toLowerCase() === 'internship') ||
            (job.job_title && job.job_title.toLowerCase().includes('intern'));

        if (elements.salary) {
            const rawVal = job.salary || job.stipend || 'Not Disclosed';
            if (!isNaN(rawVal)) {
                elements.salary.innerText = isInternship ? `₹${rawVal} /month` : `₹${rawVal} LPA`;
            } else {
                elements.salary.innerText = rawVal;
            }
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

    // Enhanced File Upload Handler with Validation
    if (resumeInput) {
        resumeInput.addEventListener("change", (e) => {
            if (e.target.files.length > 0) {
                const file = e.target.files[0];
                const maxSize = 5 * 1024 * 1024; // 5MB
                const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];

                // Validate file size
                if (file.size > maxSize) {
                    showMessage("File too large! Maximum 5MB allowed.\nFile size அதிகம்! Maximum 5MB மட்டுமே!", "error");
                    resumeInput.value = "";
                    fileNameDisplay.innerText = "Click to upload your resume";
                    fileNameDisplay.style.color = "#64748b";
                    return;
                }

                // Validate file type
                if (!allowedTypes.includes(file.type)) {
                    showMessage("Invalid file type! Only PDF, DOC, DOCX allowed.\nதவறான file type! PDF, DOC, DOCX மட்டுமே!", "error");
                    resumeInput.value = "";
                    fileNameDisplay.innerText = "Click to upload your resume";
                    fileNameDisplay.style.color = "#64748b";
                    return;
                }

                // Success - show file name
                fileNameDisplay.innerHTML = `✓ ${file.name} <span style="font-size: 0.75rem; color: #22c55e;">(${(file.size / 1024).toFixed(1)} KB)</span>`;
                fileNameDisplay.style.color = "#22c55e";
                fileNameDisplay.style.fontWeight = "600";
            }
        });
    }

    // Helper to show messages (English + Tamil)
    function showMessage(message, type = "info") {
        const messageDiv = document.createElement("div");
        messageDiv.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 1rem 1.5rem;
            background: ${type === "error" ? "#fef2f2" : type === "success" ? "#dcfce7" : "#eff6ff"};
            color: ${type === "error" ? "#dc2626" : type === "success" ? "#16a34a" : "#2563eb"};
            border-left: 4px solid ${type === "error" ? "#dc2626" : type === "success" ? "#16a34a" : "#2563eb"};
            border-radius: 8px;
            box-shadow: 0 10px 25px -5px rgba(0,0,0,0.1);
            z-index: 10000;
            max-width: 400px;
            font-size: 0.95rem;
            font-weight: 500;
            animation: slideIn 0.3s ease-out;
        `;

        messageDiv.innerHTML = message.replace(/\n/g, '<br>');
        document.body.appendChild(messageDiv);

        setTimeout(() => {
            messageDiv.style.animation = "slideOut 0.3s ease-out";
            setTimeout(() => messageDiv.remove(), 300);
        }, 5000);
    }

    // Add animation styles
    const style = document.createElement('style');
    style.textContent = `
        @keyframes slideIn {
            from { transform: translateX(400px); opacity: 0; }
            to { transform: translateX(0); opacity: 1; }
        }
        @keyframes slideOut {
            from { transform: translateX(0); opacity: 1; }
            to { transform: translateX(400px); opacity: 0; }
        }
        .skill-tag {
            display: inline-block;
            padding: 0.4rem 1rem;
            background: #eff6ff;
            color: #2563eb;
            border: 1px solid #bfdbfe;
            border-radius: 50px;
            font-size: 0.85rem;
            font-weight: 600;
            margin: 0.3rem;
            transition: all 0.2s;
        }
        .skill-tag:hover {
            background: #2563eb;
            color: white;
        }
    `;
    document.head.appendChild(style);
    // --- SAVE JOB FUNCTIONALITY ---
    const saveJobBtn = document.getElementById("saveJobBtn");
    if (saveJobBtn) {
        saveJobBtn.addEventListener("click", async () => {
            if (!user) {
                showMessage("Please login to save this job.\nJob prepare பண்ணுறதுக்கு login பண்ணுங்க.", "error");
                return;
            }

            if (!jobId || isNaN(parseInt(jobId)) || parseInt(jobId) <= 0) {
                showMessage("Static job listings cannot be saved to dashboard yet.\nஇந்த job-ஐ dashboard-ல் save பண்ண முடியாது.", "info");
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
                    body: JSON.stringify({
                        user_id: user.user_id,
                        job_id: parseInt(jobId)
                    })
                });

                if (res.ok) {
                    showMessage("Job saved successfully! ✓\nJob save ஆச்சு! ✓", "success");
                    saveJobBtn.innerHTML = '<i class="fas fa-bookmark"></i> Saved';
                    saveJobBtn.classList.add("saved");
                    if (icon) {
                        icon.classList.remove("far");
                        icon.classList.add("fas");
                    }
                } else {
                    const error = await res.json();
                    if (error.detail === "Job already saved") {
                        showMessage("This job is already in your saved list.\nஇந்த job ஏற்கனவே save பண்ணியாச்சு.", "info");
                        saveJobBtn.innerHTML = '<i class="fas fa-bookmark"></i> Saved';
                    } else {
                        showMessage("Failed to save job. Please try again.\nJob save பண்ண முடியல. மறுபடியும் try பண்ணுங்க.", "error");
                        saveJobBtn.innerHTML = originalText;
                        saveJobBtn.disabled = false;
                    }
                }
            } catch (err) {
                console.error("Save Job Error:", err);
                showMessage("Network error while saving job.", "error");
                saveJobBtn.innerHTML = originalText;
                saveJobBtn.disabled = false;
            }
        });
    }


    // Fetch and Display Job Details
    const fetchJobDetails = async () => {
        try {
            console.log(`📝 Fetching job details for ID: ${jobId}`);
            showMessage(`Loading job details...\nJob details load ஆகிறது...`, "info");

            const API_BASE_URL = getAPIURL();
            const response = await fetch(`${API_BASE_URL}/jobs/${jobId}`);

            if (response.ok) {
                const job = await response.json();
                console.log("✅ Job data loaded:", job);
                currentJobDetails = job;

                fillUI(job);

                showMessage(`Job details loaded successfully! ✓\nJob details load ஆச்சு! ✓`, "success");
                return job;
            } else {
                console.error("❌ Job fetch failed:", response.status);
                showMessage("Job not found! Redirecting...\nJob கிடைக்கல! Redirect ஆகுது...", "error");
                setTimeout(() => window.location.href = "/frontend/pages/jobs.html", 2000);
            }
        } catch (error) {
            console.error("❌ Error fetching job details:", error);
            showMessage("Could not load job details. Please check your connection.\nJob details load ஆகல. Connection check பண்ணுங்க.", "error");
        }
        return null;
    };

    if (currentJobDetails) {
        console.log("✅ Using existing job details from URL or Context");
        fillUI(currentJobDetails);
    } else if (jobId) {
        console.log("🔍 No URL details found, fetching from database...");
        currentJobDetails = await fetchJobDetails();
    }

    // Validate form before submission
    function validateForm() {
        const fullName = document.getElementById("full_name").value.trim();
        const email = document.getElementById("email").value.trim();
        const phone = document.getElementById("phone").value.trim();
        const location = document.getElementById("location").value.trim();
        const experience = document.getElementById("experience").value;
        const resumeFile = resumeInput.files[0];

        if (!fullName) {
            showMessage("Please enter your full name.\nஉங்க முழு பெயர் enter பண்ணுங்க.", "error");
            return false;
        }

        if (!email || !email.includes("@")) {
            showMessage("Please enter a valid email address.\nValid email address enter பண்ணுங்க.", "error");
            return false;
        }

        if (!phone || phone.length < 10) {
            showMessage("Please enter a valid 10-digit phone number.\n10-digit phone number enter பண்ணுங்க.", "error");
            return false;
        }

        if (!location) {
            showMessage("Please enter your current location.\nஉங்க location enter பண்ணுங்க.", "error");
            return false;
        }

        if (!experience) {
            showMessage("Please select your total experience.\nஉங்க experience select பண்ணுங்க.", "error");
            return false;
        }

        if (!resumeFile) {
            showMessage("Please upload your resume.\nஉங்க resume upload பண்ணுங்க.", "error");
            return false;
        }

        return true;
    }

    // Handle Form Submission
    if (applyForm) {
        applyForm.addEventListener("submit", async (e) => {
            e.preventDefault();

            // Check if user is logged in
            if (!user) {
                showMessage("Please login to apply for this job.\nJob apply பண்ண login பண்ணுங்க.", "error");
                setTimeout(() => window.location.href = "/frontend/pages/login.html", 2000);
                return;
            }

            // Validate form
            if (!validateForm()) {
                return;
            }

            const submitBtn = document.getElementById("submitBtn");
            const originalText = submitBtn.innerText;
            submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Submitting...';
            submitBtn.disabled = true;

            const resumeFile = resumeInput.files[0];
            const resumeName = resumeFile ? resumeFile.name : "resume.pdf";
            const portfolioLink = document.getElementById("portfolio_link") ? document.getElementById("portfolio_link").value.trim() : "";
            const coverLetter = document.getElementById("cover_letter") ? document.getElementById("cover_letter").value.trim() : "";
            // NEW: Check if user is logged in
            if (!user || !user.user_id) {
                showMessage("Please login before applying for a job.\nJob Apply பண்றதுக்கு முன்னாடி Login பண்ணுங்க!", "error");
                setTimeout(() => window.location.href = "/frontend/pages/login.html", 2000);
                return;
            }

            const payload = {
                user_id: user.user_id,
                job_id: (parseInt(jobId) && parseInt(jobId) > 0) ? parseInt(jobId) : null,
                company_name: currentJobDetails ? currentJobDetails.company_name : "Unknown",
                job_title: currentJobDetails ? currentJobDetails.job_title : "Unknown",
                status: "applied",
                name: document.getElementById("full_name").value.trim(),
                email: document.getElementById("email").value.trim(),
                phone_number: document.getElementById("phone").value.trim(),
                portfolio_link: portfolioLink || "",
                resume: resumeName,
                Current_Location: document.getElementById("location").value.trim(),
                Total_Experience: parseInt(document.getElementById("experience").value),
                Current_salary: parseInt(document.getElementById("salary").value) || 0,
                Notice_Period: parseInt(document.getElementById("notice_period").value),
                Cover_Letter: coverLetter || `Applied for ${currentJobDetails?.job_title || 'Position'} at ${currentJobDetails?.company_name || 'Company'} through EasyJobs Portal`,
                job_type: currentJobDetails ? (currentJobDetails.job_type || "Full Time") : "Full Time"
            };

            console.log("📤 Submitting application:", payload);

            try {
                const API_BASE_URL = getAPIURL();
                const response = await fetch(`${API_BASE_URL}/applications/`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(payload)
                });

                if (response.ok) {
                    const result = await response.json();
                    console.log("✅ Application submitted successfully:", result);

                    showMessage(`Application submitted successfully! ✓\nApplication success-ஆ submit ஆச்சு! ✓\nRedirecting...`, "success");

                    // Store application details in localStorage for confirmation page
                    localStorage.setItem("lastApplication", JSON.stringify({
                        jobTitle: currentJobDetails?.job_title,
                        companyName: currentJobDetails?.company_name,
                        applicationId: result.application_id,
                        submittedAt: new Date().toISOString()
                    }));

                    // --- Save to Dashboard Tracker ---
                    const myApps = JSON.parse(localStorage.getItem("easyjobs_applications") || "[]");
                    myApps.unshift({ // Add to beginning
                        id: parseInt(jobId),
                        title: currentJobDetails?.job_title,
                        company: currentJobDetails?.company_name,
                        status: 'Applied',
                        appliedAt: new Date().toISOString()
                    });
                    localStorage.setItem("easyjobs_applications", JSON.stringify(myApps));

                    setTimeout(() => window.location.href = "/frontend/pages/submit.html", 2000);
                } else {
                    let errorMessage = "Check all fields";
                    if (response.status === 401) {
                        errorMessage = "Session expired. Please login again.";
                        localStorage.removeItem("user");
                        setTimeout(() => window.location.href = "/frontend/pages/login.html", 2000);
                    } else {
                        try {
                            const error = await response.json();
                            errorMessage = error.detail || errorMessage;
                        } catch (e) {
                            errorMessage = `Server Error (${response.status})`;
                        }
                    }
                    console.error("❌ Submission error:", errorMessage);
                    showMessage(`Submission Failed: ${errorMessage}\nSubmission fail ஆச்சு: எல்லா fields-யும் check பண்ணுங்க`, "error");
                    submitBtn.innerText = originalText;
                    submitBtn.disabled = false;
                }
            } catch (err) {
                console.error("❌ Network Error:", err);
                showMessage(`Networkerror: ${err.message}\nServer running-னு check பண்ணுங்க.`, "error");
                submitBtn.innerText = originalText;
                submitBtn.disabled = false;
            }
        });
    }

    // Add helpful console message
    console.log(`
🎯 EasyJobs - Application Page Loaded
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📋 Job ID: ${jobId}
👤 User: ${user ? user.email : 'Not logged in'}
🏢 Company: ${currentJobDetails?.company_name || 'Loading...'}
💼 Position: ${currentJobDetails?.job_title || 'Loading...'}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
✅ All features loaded successfully!
    `);
});
