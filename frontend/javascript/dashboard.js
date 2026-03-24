"use strict";

/* ─── CONFIG ────────────────────────────────── */
// Utility to get the correct API URL (Port 8000 for Python backend)
const getAPIURL = () => {
    if (window.getEasyJobsAPI) return window.getEasyJobsAPI();
    return "/api";
};

let allApps = [];
let allUsers = [];
let allJobs = []; // Added for My Jobs tab

/* ─── AVATAR GRADIENTS ──────────────────────── */
const GRADS = [
    "#1e40af,#3b82f6",
    "#7c3aed,#a78bfa",
    "#059669,#34d399",
    "#b45309,#fbbf24",
    "#be123c,#fb7185",
    "#0e7490,#67e8f9",
    "#4338ca,#818cf8",
];

function grad(name) {
    let h = 0;
    for (let i = 0; i < (name || "?").length; i++) h += name.charCodeAt(i);
    return GRADS[h % GRADS.length];
}

function initials(name) {
    if (!name) return "?";
    const parts = name.trim().split(" ");
    return parts.length >= 2
        ? (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
        : parts[0].substring(0, 2).toUpperCase();
}

/* ─── STATUS HELPERS ────────────────────────── */
function deriveStatus(app) {
    return (app.status || "applied").toLowerCase();
}

const STATUS_META = {
    applied: { label: "Under Review", cls: "status-pending", icon: "fa-clock" },
    shortlisted: { label: "Shortlisted", cls: "status-shortlisted", icon: "fa-check-circle" },
    rejected: { label: "Not Selected", cls: "status-rejected", icon: "fa-times-circle" },
    interview: { label: "Interview Scheduled", cls: "status-pending", icon: "fa-calendar-check" },
};

function getStatus(app) { return STATUS_META[deriveStatus(app)] || STATUS_META.applied; }

function statusBadge(app) {
    const s = getStatus(app);
    return `<span class="status-label ${s.cls}"><i class="fas ${s.icon}"></i> ${s.label}</span>`;
}

/* ─── DATE HELPER ───────────────────────────── */
function fmtDate(str) {
    if (!str) return "—";
    const d = new Date(str);
    return isNaN(d) ? "—" : d.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
}

/* ─── SAFE VALUE ────────────────────────────── */
function v(val, suffix = "") {
    return (val !== null && val !== undefined && val !== "") ? val + suffix : "—";
}

/* ─── SET TEXT HELPER ────────────────────────── */
function setText(id, val) {
    const el = document.getElementById(id);
    if (el) el.textContent = val;
}

/* ─── CLOCK ─────────────────────────────────── */
function startClock() {
    const el = document.getElementById("topbar-time");
    const tick = () => {
        if (el) el.textContent = new Date().toLocaleTimeString("en-IN",
            { hour: "2-digit", minute: "2-digit", second: "2-digit" });
    };
    tick();
    setInterval(tick, 1000);
}

/* ─── AUTH GUARD ────────────────────────────── */
function guardAdmin() {
    const userString = localStorage.getItem("user");
    if (!userString) {
        window.location.href = "frontend/pages/login.html";
        return null;
    }
    const user = JSON.parse(userString);

    if (user.role !== "admin" && user.role !== "employer") {
        alert("Access Denied: This area is for authorized accounts only.");
        window.location.href = "frontend/pages/login.html";
        return null;
    }

    const isAdmin = user.role === "admin";

    if (isAdmin) {
        const myJobsLink = document.querySelector('[onclick*="switchTab(\'my-jobs\')"]');
        if (myJobsLink) {
            myJobsLink.innerHTML = '<i class="fas fa-list-alt"></i> Manage All Jobs';
        }
    } else {
        // Hide Admin-only features from Employers
        const adminLinks = document.querySelectorAll('[onclick*="switchTab(\'users\')"], [onclick*="switchTab(\'analytics\')"]');
        adminLinks.forEach(link => link.style.display = "none");
    }

    const profileCard = document.getElementById("employer-profile-card");
    if (profileCard && !isAdmin) {
        profileCard.style.display = "block";
        setText("profile-card-name", user.company_name || "Account Profile");
        setText("profile-card-industry", user.industry || "General Industry");
        setText("profile-card-size", user.company_size || "Not Set");
        const webEl = document.getElementById("profile-card-web");
        if (webEl) webEl.textContent = user.company_website || "No Website Linked";
    }

    return user;
}

/* ─── SWITCHING TABS ────────────────────────── */
function switchTab(tabName) {

    document.querySelectorAll(".tab-content").forEach(s => s.style.display = "none");
    document.querySelectorAll(".nav-item").forEach(l => l.classList.remove("active"));

    const user = JSON.parse(localStorage.getItem("user") || "{}");
    const isAdmin = user.role === "admin";

    const section = document.getElementById("tab-" + tabName);
    const link = document.querySelector(`[onclick*="switchTab('${tabName}')"]`);

    if (section) section.style.display = "block";
    if (link) link.classList.add("active");

    const titles = {
        overview: ["Employer Dashboard", "Streamline your hiring process and manage talent."],
        applications: ["Candidate Applications", "Review every candidate who applied for your openings."],
        users: ["Talent Database", "Browse all registered candidates on the platform."],
        "post-job": ["Create Listing", "Add a new vacancy to attract top talent."],
        "my-jobs": ["Active Vacancies", "View, edit, or remove your existing job postings."],
        analytics: ["Analytics Center", "Track platform performance and company rankings."],
        interviews: ["Scheduled Interviews", "Manage and view all upcoming candidate meetings."],
    };

    const [t, s] = titles[tabName] || ["Dashboard", ""];
    const titleEl = document.getElementById("page-title");
    const subEl = document.getElementById("page-subtitle");
    if (titleEl) titleEl.textContent = t;
    if (subEl) subEl.textContent = s;

    // Special logic for tabs
    if (tabName === 'analytics') {
        loadAnalytics();
    }
    if (tabName === 'interviews') {
        fetchInterviews();
    }

    // On Mobile: Close sidebar after selection
    if (window.innerWidth <= 860) {
        document.querySelector('.is-sidebar')?.classList.remove('open');
    }
}

window.switchTab = switchTab;

/* ─── JOB POSTING ──────────────────────────── */
async function initJobPosting() {
    const form = document.getElementById("post-job-form");
    if (!form) return;

    form.addEventListener("submit", async (e) => {
        e.preventDefault();
        const submitBtn = document.getElementById("pj-submit");
        const originalText = submitBtn.innerText;
        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Posting...';
        submitBtn.disabled = true;

        const user = JSON.parse(localStorage.getItem("user") || "{}");

        const payload = {
            job_title: document.getElementById("pj-title").value.trim(),
            company_name: document.getElementById("pj-company").value.trim(),
            location: document.getElementById("pj-location").value.trim(),
            experience_level: parseInt(document.getElementById("pj-exp").value),
            job_type: document.getElementById("pj-type").value,
            salary: parseInt(document.getElementById("pj-salary").value),
            work_mode: document.getElementById("pj-mode").value,
            description: document.getElementById("pj-desc").value.trim(),
            employer_id: user.user_id || null
        };

        try {
            const API = getAPIURL();
            const res = await fetch(`${API}/jobs/`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload)
            });

            if (res.ok) {
                alert("Job posted successfully! ✓");
                form.reset();
                // Re-fetch jobs and apps if needed
                await fetchJobs();
                renderMyJobs(allJobs);
                renderStats();
                switchTab("my-jobs");
            } else {
                const err = await res.json();
                alert(`Error: ${err.detail || "Could not post job"}`);
            }
        } catch (err) {
            console.error(err);
            alert("Network Error: Make sure backend is running.");
        } finally {
            submitBtn.innerHTML = originalText;
            submitBtn.disabled = false;
        }
    });
}

/* ─── FETCH ALL APPLICATIONS ────────────────── */
async function fetchApplications() {
    try {
        const API = getAPIURL();
        const res = await fetch(`${API}/applications/`);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        allApps = await res.json();
    } catch (e) {
        console.error("Applications fetch error:", e);
        allApps = [];
    }
}

/* ─── FETCH ALL USERS ───────────────────────── */
async function fetchUsers() {
    try {
        const API = getAPIURL();
        const res = await fetch(`${API}/users/`);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        allUsers = await res.json();
    } catch (e) {
        console.error("Users fetch error:", e);
        allUsers = [];
    }
}

/* ─── FETCH ALL JOBS ────────────────────────── */
async function fetchJobs() {
    try {
        const API = getAPIURL();
        const res = await fetch(`${API}/jobs/`);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        allJobs = await res.json();
    } catch (e) {
        console.error("Jobs fetch error:", e);
        allJobs = [];
    }
}

/* ─── RENDER STAT CARDS ─────────────────────── */
function renderStats() {
    const user = JSON.parse(localStorage.getItem("user") || "{}");
    const isAdmin = user.role === "admin";

    // If employer, only show stats for THEIR applications (by company name or employer_id)
    const filteredApps = isAdmin ? allApps : allApps.filter(a => a.company_name === user.company_name);
    const filteredJobs = isAdmin ? allJobs : allJobs.filter(j => j.employer_id === user.user_id || j.company_name === user.company_name);

    const total = filteredApps.length;
    const shortlisted = filteredApps.filter(a => deriveStatus(a) === "shortlisted").length;
    const review = filteredApps.filter(a => !["shortlisted", "rejected"].includes(deriveStatus(a))).length;
    const rejected = filteredApps.filter(a => deriveStatus(a) === "rejected").length;

    setText("stat-total-apps", total);
    setText("stat-shortlisted", shortlisted);
    setText("stat-under-review", review);
    setText("stat-rejected", rejected);

    // Registered Users is admin only
    if (isAdmin) {
        setText("stat-total-users", allUsers.length);
    } else {
        // Employers see THEIR job count instead
        setText("stat-total-users", filteredJobs.length);
        const userStatLabel = document.querySelector("#tab-overview .stat-card:nth-child(4) .label");
        if (userStatLabel) userStatLabel.textContent = "My Active Jobs";
    }
}

/* ─── RENDER RECENT TABLE (overview) ────────── */
function renderRecentTable() {
    const tbody = document.getElementById("recent-tbody");
    if (!tbody) return;

    const recent = [...allApps]
        .sort((a, b) => new Date(b.applied_at) - new Date(a.applied_at))
        .slice(0, 10);

    if (recent.length === 0) {
        tbody.innerHTML = `<tr><td colspan="5" style="text-align:center; padding:40px; color:#999;">No applications yet.</td></tr>`;
        return;
    }

    tbody.innerHTML = recent.map((app, i) => {
        const nm = app.name || "—";
        const st = getStatus(app);
        return `
<tr style="transition:0.3s;">
    <td>
        <div class="candidate-info">
            <div class="cand-avatar" style="background:linear-gradient(135deg, ${grad(nm)})">${nm[0]}</div>
            <div class="cand-details">
                <span class="name">${nm}</span>
                <span class="email">${app.email}</span>
            </div>
        </div>
    </td>
    <td><span style="font-weight:700; color:#334155;">${app.job_title || "Position"}</span></td>
    <td><i class="far fa-calendar-alt" style="color:var(--text-muted); margin-right:5px;"></i> ${fmtDate(app.applied_at)}</td>
    <td><i class="fas fa-briefcase" style="color:var(--text-muted); margin-right:5px;"></i> ${app.Total_Experience != null ? app.Total_Experience + " yr" : "Fresher"}</td>
    <td>${statusBadge(app)}</td>
</tr>`;
    }).join("");
}

/* ─── RENDER ALL APPLICATIONS TABLE ─────────── */
function renderAllApps(data) {
    const tbody = document.getElementById("all-apps-tbody");
    if (!tbody) return;

    if (data.length === 0) {
        tbody.innerHTML = `<tr><td colspan="6" style="text-align:center; padding:40px; color:#999;">No applications found.</td></tr>`;
        return;
    }

    tbody.innerHTML = data.map((app, i) => {
        const nm = app.name || "—";
        const st = getStatus(app);
        return `
<tr style="transition:0.3s;">
    <td>
        <div class="candidate-info">
            <div class="cand-avatar" style="background:linear-gradient(135deg, ${grad(nm)})">${nm[0]}</div>
            <div class="cand-details">
                <span class="name">${nm}</span>
                <span class="email">${app.email}</span>
            </div>
        </div>
    </td>
    <td><span style="font-weight:700; color:#334155;">${app.job_title || "Position"}</span><br><small style="color:var(--primary); font-weight:600;">${app.company_name || ""}</small></td>
    <td><i class="fas fa-phone-alt" style="color:var(--text-muted); font-size:12px; margin-right:5px;"></i> ${v(app.phone_number)}</td>
    <td><i class="fas fa-map-marker-alt" style="color:var(--text-muted); font-size:12px; margin-right:5px;"></i> ${v(app.Current_Location)}</td>
    <td>${statusBadge(app)}</td>
    <td><a href="javascript:void(0)" class="view-btn" onclick="openModal(${app.application_id})">REVIEW PROFILE <i class="fas fa-chevron-right"></i></a></td>
</tr>`;
    }).join("");
}

/* ─── RENDER USERS TABLE ────────────────────── */
function renderUsers(data) {
    const tbody = document.getElementById("users-tbody");
    if (!tbody) return;

    if (data.length === 0) {
        tbody.innerHTML = `<tr><td colspan="5" style="text-align:center; padding:40px; color:#999;">No users found.</td></tr>`;
        return;
    }

    tbody.innerHTML = data.map((u, i) => {
        const nm = `${u.first_name || ""} ${u.last_name || ""}`.trim() || "User";
        const email = u.email || "No Email";
        const location = u.location || "Online";
        return `
            <tr style="transition:0.3s; border-bottom: 1px solid #f1f5f9;">
                <td style="padding: 15px 20px;">
                    <div class="candidate-info">
                        <div class="cand-avatar" style="background:linear-gradient(135deg, ${grad(nm)}); width:38px; height:38px; font-size:14px;">${nm[0]}</div>
                        <div class="cand-details">
                            <span class="name" style="font-weight:700; color:#1e293b;">${nm}</span>
                        </div>
                    </div>
                </td>
                <td style="padding: 15px 20px; font-weight:500; color:#64748b;"><i class="far fa-envelope" style="margin-right:8px; opacity:0.7;"></i>${email}</td>
                <td style="padding: 15px 20px;">
                    <span class="status-label ${u.role === 'admin' ? 'status-shortlisted' : 'status-pending'}" style="font-size:11px; font-weight:700; padding:4px 10px;">${(u.role || "user").toUpperCase()}</span>
                </td>
                <td style="padding: 15px 20px; font-weight:500; color:#64748b;"><i class="fas fa-map-marker-alt" style="margin-right:8px; opacity:0.7;"></i>${location}</td>
                <td style="padding: 15px 20px;">
                    <div style="display:flex; flex-wrap:wrap; gap:6px;">
                        ${(u.skills || "").split(',').filter(s => s.trim()).map(s => `<span style="background:#eff6ff; padding:3px 10px; border-radius:100px; font-size:11px; font-weight:700; color:#2563eb; border:1px solid #dbeafe;">${s.trim()}</span>`).join('') || '<span style="color:#94a3b8; font-style:italic; font-size:12px;">No skills listed</span>'}
                    </div>
                </td>
            </tr>`;
    }).join("");
}

/* ─── RENDER MY JOBS ────────────────────────── */
function renderMyJobs(data) {
    const tbody = document.getElementById("my-jobs-tbody");
    if (!tbody) return;

    const user = JSON.parse(localStorage.getItem("user") || "{}");
    const isAdmin = user.role === "admin";

    // Filter jobs for the specific employer
    const myJobs = isAdmin ? data : data.filter(j => j.employer_id === user.user_id || j.company_name === user.company_name);

    if (myJobs.length === 0) {
        tbody.innerHTML = `<tr><td colspan="5" style="text-align:center; padding:40px; color:#999;">You haven't posted any jobs yet.</td></tr>`;
        return;
    }

    tbody.innerHTML = myJobs.map(job => `
<tr style="transition:0.3s;">
    <td><span style="font-weight:700; color:#0f172a; font-size:16px;">${job.job_title}</span></td>
    <td><i class="fas fa-map-marker-alt" style="color:var(--text-muted); margin-right:8px;"></i>${job.location}</td>
    <td><span class="status-label status-pending"><i class="fas fa-briefcase"></i> ${job.job_type}</span></td>
    <td><span style="font-weight:700; color:#16a34a;">₹${job.salary} LPA</span></td>
    <td>
        <button class="btn-primary" onclick="deleteJob(${job.job_id})" 
            style="background:#fef2f2; color:#dc2626; border:1px solid #fee2e2; padding:8px 16px; font-size:12px; border-radius:10px; box-shadow:none;">
            <i class="fas fa-trash-alt"></i> REMOVE
        </button>
    </td>
</tr>`).join("");
}

window.deleteJob = async function (jobId) {
    if (!confirm("Are you sure you want to delete this job posting? This cannot be undone.")) return;
    try {
        const API = getAPIURL();
        const res = await fetch(`${API}/jobs/${jobId}`, { method: "DELETE" });
        if (res.ok) {
            alert("Job deleted successfully.");
            await fetchJobs();
            renderMyJobs(allJobs);
            renderStats();
        } else {
            alert("Failed to delete job.");
        }
    } catch (e) { console.error(e); }
};

/* ─── SEARCH & FILTER APPS ──────────────────── */
function filterAndRenderApps() {
    const q = (document.getElementById("app-search")?.value || "").toLowerCase();
    const status = document.getElementById("status-filter")?.value || "all";

    const filtered = allApps.filter(app => {
        const matchQ = !q
            || (app.name || "").toLowerCase().includes(q)
            || (app.email || "").toLowerCase().includes(q)
            || (app.company_name || "").toLowerCase().includes(q)
            || (app.job_title || "").toLowerCase().includes(q)
            || (app.Current_Location || "").toLowerCase().includes(q);
        const matchS = status === "all" || deriveStatus(app) === status;
        return matchQ && matchS;
    });

    renderAllApps(filtered);
}

/* ─── SEARCH USERS ──────────────────────────── */
function filterUsers() {
    const q = (document.getElementById("user-search")?.value || "").toLowerCase();
    const filtered = allUsers.filter(u => {
        const nm = `${u.first_name || ""} ${u.last_name || ""}`.toLowerCase();
        return !q || nm.includes(q) || (u.email || "").toLowerCase().includes(q);
    });
    renderUsers(filtered);
}

/* ─── MODAL ─────────────────────────────────── */
window.openModal = function (appId) {
    const app = allApps.find(a => a.application_id == appId);
    if (!app) return;

    const nm = app.name || "Unknown";
    const st = getStatus(app);
    const g = grad(nm);

    const nameEl = document.getElementById("modal-name");
    if (nameEl) nameEl.textContent = nm;
    const cmpEl = document.getElementById("modal-company");
    if (cmpEl) cmpEl.textContent = app.company_name || "Company Details";

    const avatarEl = document.getElementById("modal-avatar");
    if (avatarEl) {
        avatarEl.textContent = initials(nm);
        avatarEl.style.background = `linear-gradient(135deg,${g})`;
    }

    const badgeEl = document.getElementById("modal-status-badge");
    if (badgeEl) {
        badgeEl.className = `status-badge sb ${st.cls}`;
        badgeEl.innerHTML = `<i class="fas ${st.icon}"></i>${st.label}`;
    }

    const fields = [
        ["Email", app.email],
        ["Phone", app.phone_number],
        ["Job Title", app.job_title],
        ["Company", app.company_name],
        ["Current Location", app.Current_Location],
        ["Total Experience", app.Total_Experience != null ? app.Total_Experience + " year(s)" : "Fresher"],
        ["Current Salary", app.Current_salary != null ? "₹" + app.Current_salary + " LPA" : "Not Disclosed"],
        ["Notice Period", app.Notice_Period != null ? (app.Notice_Period === 0 ? "Immediate Joiner" : app.Notice_Period + " days") : "Not Specified"],
        ["Portfolio", (app.portfolio_link && app.portfolio_link !== "null" && app.portfolio_link.trim() !== "") ? `<a href="${app.portfolio_link.startsWith("http") ? app.portfolio_link : 'http://' + app.portfolio_link}" target="_blank" style="color:#008BDC; text-decoration:underline; display:flex; gap:5px; align-items:center; font-weight: 500;">View Portfolio <i class="fas fa-external-link-alt" style="font-size:10px;"></i></a>` : "Not Provided"],
        ["Applied On", fmtDate(app.applied_at)],
    ];

    const gridEl = document.getElementById("modal-grid");
    if (gridEl) {
        gridEl.innerHTML = fields.map(([l, val]) => `
<div class="detail-item">
    <div class="label">${l}</div>
    <div class="value">${val || "—"}</div>
</div>`).join("");
    }

    const coverSection = document.getElementById("modal-cover-section");
    const coverText = document.getElementById("modal-cover-text");
    if (coverSection && coverText) {
        if (app.Cover_Letter && app.Cover_Letter !== "null") {
            coverSection.style.display = "block";
            coverText.textContent = app.Cover_Letter;
        } else {
            coverSection.style.display = "none";
        }
    }

    // Set Resume Link
    const resumeLink = document.getElementById("modal-resume-link");
    if (resumeLink) {
        if (app.resume && app.resume !== "null") {
            resumeLink.style.display = "flex";

            // Create a downloadable fake file using Data URI since files aren't physically on the backend
            const fileContent = `RESUME DOCUMENT\n------------------------\n\nCandidate Name: ${nm}\nEmail: ${app.email}\nPhone: ${app.phone_number}\n\nOriginal Uploaded File: ${app.resume}\n\n* Note: This is a generated document serving as a placeholder for the applicant's resume.`;
            const encodedUri = encodeURI(`data:text/plain;charset=utf-8,${fileContent}`);

            resumeLink.href = encodedUri;
            resumeLink.download = app.resume; // Prompts to download with their original filename
            resumeLink.removeAttribute("target"); // Downloads typically don't need _blank
            resumeLink.innerHTML = `<i class="fas fa-file-download"></i> Download Resume (${app.resume})`;
        } else {
            resumeLink.style.display = "none";
        }
    }

    // Event Listeners for Actions
    const updateAppStatus = async (newStatus) => {
        try {
            const API = getAPIURL();
            const res = await fetch(`${API}/applications/${appId}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ status: newStatus })
            });

            if (res.ok) {
                alert(`Candidate status updated to: ${newStatus}`);
                closeModal();
                await fetchApplications();
                renderStats();
                renderRecentTable();
                filterAndRenderApps();
            } else {
                alert("Failed to update status.");
            }
        } catch (e) { console.error(e); }
    };

    const deleteApplication = async () => {
        if (!confirm("Are you sure you want to delete this application? This cannot be undone.")) return;
        try {
            const API = getAPIURL();
            const res = await fetch(`${API}/applications/${appId}`, { method: "DELETE" });
            if (res.ok) {
                alert("Application deleted successfully.");
                closeModal();
                await fetchApplications();
                renderStats();
                renderRecentTable();
                filterAndRenderApps();
            } else {
                alert("Failed to delete application.");
            }
        } catch (e) { console.error(e); }
    };

    // Attach listeners (safely - handle missing buttons)
    const btnShort = document.getElementById("btn-shortlist");
    const btnReject = document.getElementById("btn-reject");
    const btnDel = document.getElementById("btn-delete-app");

    // Clone to remove old listeners
    if (btnShort) {
        const newBtn = btnShort.cloneNode(true);
        btnShort.parentNode.replaceChild(newBtn, btnShort);
        newBtn.addEventListener("click", () => updateAppStatus("shortlisted"));
    }
    if (btnReject) {
        const newBtn = btnReject.cloneNode(true);
        btnReject.parentNode.replaceChild(newBtn, btnReject);
        newBtn.addEventListener("click", () => updateAppStatus("rejected"));
    }

    /** 📅 INTERVIEW SCHEDULER LOGIC **/
    const intBtn = document.getElementById("btn-interview-modal");
    const intOverlay = document.getElementById("interview-modal-overlay");
    const intClose = document.getElementById("close-interview-modal");
    const intForm = document.getElementById("schedule-interview-form");

    if (intBtn && intOverlay && intClose && intForm) {
        // 1. Reset overlays (hide interview modal initially)
        intOverlay.style.display = "none";

        // 2. Open Scheduler
        const newIntBtn = intBtn.cloneNode(true);
        intBtn.parentNode.replaceChild(newIntBtn, intBtn);
        newIntBtn.addEventListener("click", () => {
            document.getElementById("int-application-id").value = appId;
            if (intOverlay) {
                intOverlay.style.display = "flex";
                document.body.style.overflow = "hidden";
            }
        });

        // 3. Close Scheduler
        intClose.onclick = () => {
            if (intOverlay) intOverlay.style.display = "none";
            document.body.style.overflow = "auto";
        };
        intOverlay.onclick = (e) => {
            if (e.target === intOverlay) {
                intOverlay.style.display = "none";
                document.body.style.overflow = "auto";
            }
        };

        // 4. Submit Form
        intForm.onsubmit = async (e) => {
            e.preventDefault();
            const submitBtn = intForm.querySelector('button[type="submit"]');
            submitBtn.disabled = true;
            submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Scheduling...';

            const payload = {
                application_id: parseInt(document.getElementById("int-application-id").value),
                interview_date: document.getElementById("int-datetime").value,
                location: document.getElementById("int-location").value,
                notes: document.getElementById("int-notes").value
            };

            try {
                const API = getAPIURL();
                const res = await fetch(`${API}/interviews/`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(payload)
                });

                if (res.ok) {
                    alert("✅ Interview scheduled and candidate notified!");
                    intOverlay.style.display = "none";
                    closeModal();
                    await fetchApplications();
                } else {
                    const err = await res.json();
                    alert("Error: " + (err.detail || "Failed to schedule interview"));
                }
            } catch (err) {
                console.error(err);
                alert("Server error connecting to interview API.");
            } finally {
                submitBtn.disabled = false;
                submitBtn.innerText = "Confirm & Notify Candidate";
            }
        };
    }
    if (btnDel) {
        const newBtn = btnDel.cloneNode(true);
        btnDel.parentNode.replaceChild(newBtn, btnDel);
        newBtn.addEventListener("click", deleteApplication);
    }

    const overlay = document.getElementById("modal-overlay");
    if (overlay) overlay.classList.add("open");
};

function closeModal() {
    const overlay = document.getElementById("modal-overlay");
    if (overlay) overlay.classList.remove("open");
}



/* ─── INIT ──────────────────────────────────── */
document.addEventListener("DOMContentLoaded", async () => {

    // Auth guard
    const user = guardAdmin();
    if (!user) return;

    const isAdmin = user.role === "admin";

    // Set titles based on role
    if (isAdmin) {
        setText("page-title", "Super Admin Panel");
        setText("page-subtitle", "Full access to platform metrics and user database.");
        setText("tb-admin-name", "Super Admin");
    } else {
        setText("page-title", "Employer Dashboard");
        setText("page-subtitle", "Manage your company's hires and job listings.");
        setText("tb-admin-name", "Employer");
    }

    // Show page content
    document.body.classList.add("admin-confirmed");

    // Clock
    startClock();

    // Tab nav
    document.querySelectorAll(".sn-link[data-tab]").forEach(link => {
        link.addEventListener("click", e => {
            e.preventDefault();
            switchTab(link.dataset.tab);
        });
    });

    // Logout
    document.getElementById("logoutBtn")?.addEventListener("click", () => {
        localStorage.removeItem("user");
        localStorage.removeItem("token");
        window.location.href = "frontend/pages/login.html";
    });

    // Mobile sidebar toggle
    document.getElementById("sidebarToggle")?.addEventListener("click", () => {
        document.getElementById("sidebar")?.classList.toggle("open");
    });

    // Close sidebar on outside click (mobile)
    document.addEventListener("click", e => {
        const sb = document.getElementById("sidebar");
        const tb = document.getElementById("sidebarToggle");
        if (sb && window.innerWidth <= 860 &&
            !sb.contains(e.target) && !tb?.contains(e.target)) {
            sb.classList.remove("open");
        }
    });

    // Modal close
    document.getElementById("modal-close")?.addEventListener("click", closeModal);
    document.getElementById("modal-overlay")?.addEventListener("click", e => {
        if (e.target === document.getElementById("modal-overlay")) closeModal();
    });

    // Search + filter listeners
    let searchTimer;
    document.getElementById("app-search")?.addEventListener("input", () => {
        clearTimeout(searchTimer);
        searchTimer = setTimeout(filterAndRenderApps, 250);
    });

    document.getElementById("status-filter")?.addEventListener("change", filterAndRenderApps);

    let userTimer;
    document.getElementById("user-search")?.addEventListener("input", () => {
        clearTimeout(userTimer);
        userTimer = setTimeout(filterUsers, 250);
    });

    // Initialize Job Posting
    initJobPosting();

    // Auto-fill company name if employer
    const companyInput = document.getElementById("pj-company");
    if (companyInput && user.role === "employer" && user.company_name) {
        companyInput.value = user.company_name;
        companyInput.readOnly = true;
        companyInput.style.background = "#f1f5f9";
        companyInput.title = "Company name is fixed to your account profile.";
    }

    // Fetch data
    await Promise.all([fetchApplications(), fetchUsers(), fetchJobs()]);

    // Render everything
    renderStats();
    renderRecentTable();
    renderAllApps(allApps);
    renderUsers(allUsers);
    renderMyJobs(allJobs);
});

/* ── ANALYTICS CORE FUNCTIONS ───────────────── */

async function loadAnalytics() {
    const listEl = document.getElementById('company-rankings-list');
    if (!listEl) return;

    listEl.innerHTML = `<div style="text-align:center; padding:30px;"><i class="fas fa-spinner fa-spin"></i> Loading...</div>`;

    try {
        // 1. Fetch Admin Stats for Summary
        const resStats = await fetch(`${getAPIURL()}/admin/stats/`);
        if (resStats.ok) {
            const stats = await resStats.json();
            renderAdminStatsInAnalytics(stats);
            renderStatusBreakdown({
               pending: stats.applied || 0,
               shortlisted: stats.shortlisted || 0,
               rejected: stats.rejected || 0,
               interview: stats.interview || 0
            });
        }

        // 2. Fetch Company Rankings
        const resRank = await fetch(`${getAPIURL()}/admin/stats/companies/ranking`);
        if (resRank.ok) {
            const rankings = await resRank.json();
            renderCompanyRankings(rankings);
        }
    } catch (e) {
        console.error("Analytics load failed", e);
    }
}

function renderAdminStatsInAnalytics(stats) {
    const row = document.getElementById('admin-stats-row');
    if (!row) return;

    // Fallback counts if status_counts not available directly
    const s = stats.application_status_counts || {
        shortlisted: stats.shortlisted || 0
    };

    row.innerHTML = `
        <div class="stat-card admin-stats-card" style="border-left: 4px solid #2563eb;">
            <div class="stat-icon" style="background:#2563eb15; color:#2563eb;"><i class="fas fa-file-alt"></i></div>
            <div class="stat-info"><h3>${stats.total_applications || 0}</h3><p>Total Apps</p></div>
        </div>
        <div class="stat-card admin-stats-card" style="border-left: 4px solid #16a34a;">
            <div class="stat-icon" style="background:#16a34a15; color:#16a34a;"><i class="fas fa-check-circle"></i></div>
            <div class="stat-info"><h3>${stats.shortlisted || 0}</h3><p>Shortlisted</p></div>
        </div>
        <div class="stat-card admin-stats-card" style="border-left: 4px solid #f59e0b;">
            <div class="stat-icon" style="background:#f59e0b15; color:#f59e0b;"><i class="fas fa-chart-line"></i></div>
            <div class="stat-info"><h3>${stats.total_views || 0}</h3><p>Total Views</p></div>
        </div>
        <div class="stat-card admin-stats-card" style="border-left: 4px solid #6366f1;">
            <div class="stat-icon" style="background:#6366f115; color:#6366f1;"><i class="fas fa-users"></i></div>
            <div class="stat-info"><h3>${stats.total_users || 0}</h3><p>Active Users</p></div>
        </div>
    `;
}

function renderCompanyRankings(rankings) {
    const listEl = document.getElementById('company-rankings-list');
    if (!listEl) return;
    if (rankings.length === 0) {
        listEl.innerHTML = `<p style="text-align:center; color:#94a3b8; padding:20px;">No application data yet.</p>`;
        return;
    }

    const maxApps = rankings[0].total_applied || 1;

    listEl.innerHTML = rankings.map((c, i) => {
        const percentage = (c.total_applied / maxApps) * 100;
        const colors = ['#f59e0b', '#94a3b8', '#b45309', '#cbd5e1'];
        const medalColor = colors[i] || '#f8fafc';

        return `
            <div class="company-rank-row" style="padding: 15px 0;">
                <div class="company-rank-num" style="background:${medalColor}; color:${i < 3 ? 'white' : '#64748b'}; width: 32px; height: 32px; font-size: 14px; box-shadow: ${i < 3 ? '0 4px 10px ' + medalColor + '40' : 'none'}">${i + 1}</div>
                <div style="flex:1; margin-left: 12px; display: flex; align-items: flex-start; gap: 12px;">
                    <img src="${c.logo || `https://ui-avatars.com/api/?name=${encodeURIComponent(c.company_name)}&background=f1f5f9&color=2563eb&bold=true&rounded=true`}" 
                         style="width: 40px; height: 40px; border-radius: 8px; object-fit: cover; border: 1px solid #e2e8f0; background: #fff;"
                         onerror="this.src='https://ui-avatars.com/api/?name=${encodeURIComponent(c.company_name)}&background=f1f5f9&color=2563eb&bold=true&rounded=true'">
                    <div style="flex:1;">
                        <div style="display:flex; justify-content:space-between; align-items: center; margin-bottom:10px;">
                            <span style="font-weight:700; color:#1e293b; font-size: 15px;">${c.company_name}</span>
                            <span style="font-weight:700; color:#2563eb; background: #eff6ff; padding: 4px 12px; border-radius: 8px; font-size: 13px;">${c.total_applied} Apps</span>
                        </div>
                        <div style="background:#f1f5f9; height:8px; border-radius:10px; overflow:hidden;">
                            <div class="analytics-bar" style="width:${percentage}%; background: linear-gradient(90deg, #2563eb, #3b82f6); height:100%; border-radius: 10px;"></div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }).join('');
}

function renderStatusBreakdown(counts) {
    const el = document.getElementById('status-breakdown-chart');
    if (!el) return;
    const total = Object.values(counts).reduce((a, b) => a + b, 0) || 1;

    const items = [
        { label: 'Pending', val: counts.pending || 0, color: '#f59e0b' },
        { label: 'Shortlisted', val: counts.shortlisted || 0, color: '#16a34a' },
        { label: 'Interview', val: counts.interview || 0, color: '#2563eb' },
        { label: 'Rejected', val: counts.rejected || 0, color: '#ef4444' }
    ];

    el.innerHTML = items.map(item => {
        const pct = ((item.val / total) * 100).toFixed(0);
        return `
            <div style="margin-bottom:25px;">
                <div style="display:flex; justify-content:space-between; font-size:14px; margin-bottom:8px; align-items: center;">
                    <span style="font-weight:700; color:#475569; display:flex; align-items:center; gap:8px;">
                        <span style="width:10px; height:10px; border-radius:2px; background:${item.color};"></span>
                        ${item.label}
                    </span>
                    <span style="font-weight:700; color:#1e293b; background: #f8fafc; padding: 2px 10px; border-radius: 6px; border: 1px solid #e2e8f0;">${item.val} <small style="color:#64748b; margin-left:4px; font-weight:600;">(${pct}%)</small></span>
                </div>
                <div style="background:#f1f5f9; height:12px; border-radius:100px; overflow:hidden; border: 1px solid #f1f5f9;">
                    <div style="width:${pct}%; background:${item.color}; height:100%; border-radius:100px; transition: width 1s cubic-bezier(0.4, 0, 0.2, 1);"></div>
                </div>
            </div>
        `;
    }).join('');
}

window.lookupCompany = async function () {
    const nameInput = document.getElementById('company-lookup-input');
    const resultEl = document.getElementById('company-detail-result');
    if (!nameInput || !resultEl) return;
    const name = nameInput.value.trim();
    if (!name) return;

    resultEl.innerHTML = `<div style="text-align:center; padding:20px;"><i class="fas fa-spinner fa-spin"></i> Searching...</div>`;

    try {
        const res = await fetch(`${getAPIURL()}/admin/stats/company/${encodeURIComponent(name)}`);
        if (!res.ok) throw new Error("Not found");
        const data = await res.json();

        resultEl.innerHTML = `
            <div style="background:#f8fafc; padding:20px; border-radius:12px; border:1px solid #e2e8f0; animation: fadeIn 0.3s ease;">
                <h3 style="margin-bottom:15px; display:flex; align-items:center; gap: 12px;">
                    <img src="${data.logo || `https://ui-avatars.com/api/?name=${encodeURIComponent(data.company_name)}&background=2563eb&color=fff&bold=true&rounded=true`}" 
                         style="width: 32px; height: 32px; border-radius: 6px; object-fit: cover;">
                    ${data.company_name} Analytics
                </h3>
                <div style="display:grid; grid-template-columns: 1fr 1fr 1fr; gap:15px;" class="lookup-grid">
                    <div style="background:white; padding:15px; border-radius:10px; border:1px solid #f1f5f9;">
                        <p style="font-size:11px; color:#64748b; margin-bottom:4px; text-transform:uppercase;">Applications</p>
                        <p style="font-size:20px; font-weight:800; color:#0f172a;">${data.total_applied}</p>
                    </div>
                    <div style="background:white; padding:15px; border-radius:10px; border:1px solid #f1f5f9;">
                        <p style="font-size:11px; color:#64748b; margin-bottom:4px; text-transform:uppercase;">Job Page Views</p>
                        <p style="font-size:20px; font-weight:800; color:#2563eb;">${data.total_views || 0}</p>
                    </div>
                    <div style="background:white; padding:15px; border-radius:10px; border:1px solid #f1f5f9;">
                        <p style="font-size:11px; color:#64748b; margin-bottom:4px; text-transform:uppercase;">Top Job</p>
                        <p style="font-size:14px; font-weight:700; color:#0f172a;">${data.top_job_titles[0]?.job_title || 'N/A'}</p>
                    </div>
                </div>
            </div>
        `;
    } catch (e) {
        resultEl.innerHTML = `<p style="color:#ef4444; padding:10px;"><i class="fas fa-times-circle"></i> No detailed data found for "${name}".</p>`;
    }
};

/* ─── INTERVIEW TAB LOGIC ──────────────────── */
async function fetchInterviews() {
    const tbody = document.getElementById("interviews-tbody");
    if (!tbody) return;

    tbody.innerHTML = '<tr><td colspan="6" style="text-align:center; padding:40px;"><i class="fas fa-spinner fa-spin"></i> Loading schedule...</td></tr>';

    try {
        const API = getAPIURL();
        const res = await fetch(`${API}/interviews/`);
        if (!res.ok) throw new Error("Fetch failed");
        const interviews = await res.json();

        if (interviews.length === 0) {
            tbody.innerHTML = '<tr><td colspan="6" style="text-align:center; padding:40px; color:#94a3b8;">No interviews scheduled yet.</td></tr>';
            return;
        }

        tbody.innerHTML = interviews.map(it => {
            const app = allApps.find(a => a.application_id === it.application_id) || {};
            const dateStr = new Date(it.interview_date).toLocaleString('en-IN', {
                day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit'
            });

            return `
                <tr>
                    <td>
                        <div style="display:flex; align-items:center; gap:10px;">
                            <div style="width:32px; height:32px; border-radius:8px; background:linear-gradient(135deg, ${grad(app.name)}); color:white; display:flex; align-items:center; justify-content:center; font-weight:700; font-size:12px;">${initials(app.name)}</div>
                            <span style="font-weight:600; color:#1e293b;">${app.name || 'Candidate'}</span>
                        </div>
                    </td>
                    <td style="color:#475569; font-weight:500;">${app.job_title || 'Unknown Job'}</td>
                    <td><span style="background:#eff6ff; color:#2563eb; padding:5px 10px; border-radius:6px; font-weight:600; font-size:13px;">${dateStr}</span></td>
                    <td><div style="max-width:200px; overflow:hidden; text-overflow:ellipsis; white-space:nowrap; color:#64748b; font-size:13px;">${it.location || 'Online'}</div></td>
                    <td><span class="status-label status-pending"><i class="fas fa-calendar-check"></i> Scheduled</span></td>
                    <td>
                        <button onclick="cancelInterview(${it.id})" style="background:#fee2e2; color:#ef4444; border:none; padding:6px 12px; border-radius:6px; font-weight:600; cursor:pointer; font-size:12px;"><i class="fas fa-trash"></i> Cancel</button>
                    </td>
                </tr>
            `;
        }).join('');

    } catch (e) {
        tbody.innerHTML = '<tr><td colspan="6" style="text-align:center; padding:40px; color:#ef4444;">Error loading interviews.</td></tr>';
    }
}

window.cancelInterview = async (id) => {
    if (!confirm("Cancel this interview?")) return;
    try {
        const res = await fetch(`${getAPIURL()}/interviews/${id}`, { method: "DELETE" });
        if (res.ok) {
            alert("Interview cancelled successfully.");
            fetchInterviews();
        }
    } catch (e) { alert("Failed to cancel."); }
}
