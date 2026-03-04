"use strict";

/* ─── CONFIG ────────────────────────────────── */
// Utility to get the correct API URL (Port 8000 for Python backend)
const getAPIURL = () => { if (window.getEasyJobsAPI) return window.getEasyJobsAPI(); return "/api"; };

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
    applied: { label: "Under Review", cls: "applied", icon: "fa-clock" },
    shortlisted: { label: "Shortlisted", cls: "shortlisted", icon: "fa-check-circle" },
    rejected: { label: "Not Selected", cls: "rejected", icon: "fa-times-circle" },
    interview: { label: "Interview Scheduled", cls: "interview", icon: "fa-calendar-check" },
};

function getStatus(app) { return STATUS_META[deriveStatus(app)] || STATUS_META.applied; }

function statusBadge(app) {
    const s = getStatus(app);
    return `<span class="sb ${s.cls}"><i class="fas ${s.icon}"></i>${s.label}</span>`;
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
// This was missing and caused a ReferenceError crash in renderStats()
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
        window.location.href = "/frontend/pages/login.html";
        return null;
    }
    const user = JSON.parse(userString);

    // Allow BOTH admin and employer to access the general dashboard area
    if (user.role !== "admin" && user.role !== "employer") {
        alert("Access Denied: This area is for authorized accounts only.");
        window.location.href = "/frontend/pages/login.html";
        return null;
    }

    // ROLE-BASED UI ADJUSTMENTS
    const isAdmin = user.role === "admin";

    // 1. Hide Admin-only sidebar items from Employers
    const usersNavItem = document.querySelector('aside .nav-item[onclick*="switchTab(\'users\')"]');
    if (usersNavItem && !isAdmin) {
        usersNavItem.style.display = "none";
    }

    // 2. Hide Registered Users stat card from Employers
    const usersStatCard = document.getElementById("stat-total-users")?.parentElement;
    if (usersStatCard && !isAdmin) {
        usersStatCard.style.display = "none";
    }

    // 3. Show Company Profile Card for Employers
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
    // New structure uses .tab-content and .nav-item
    document.querySelectorAll(".tab-content").forEach(s => s.style.display = "none");
    document.querySelectorAll(".nav-item").forEach(l => l.classList.remove("active"));

    const user = JSON.parse(localStorage.getItem("user") || "{}");
    const isAdmin = user.role === "admin";

    // BLOCK ADMIN TABS FOR EMPLOYERS
    if (tabName === 'users' && !isAdmin) {
        alert("Permission Denied: Only Super Admins can access the User Database.");
        return;
    }

    const section = document.getElementById("tab-" + tabName);
    const link = document.querySelector(`[onclick*="switchTab('${tabName}')"]`);

    if (section) section.style.display = "block";
    if (link) link.classList.add("active");

    const titles = {
        overview: ["Recruiter Dashboard", "Manage your hires and internship listings."],
        applications: ["All Applicants", "Review every candidate who applied for your openings."],
        users: ["User Database", "Browse all registered candidates on the platform."],
        "post-job": ["Post Opening", "Add a new internship or job vacancy."],
        "my-jobs": ["Manage My Jobs", "View, edit, or remove your existing job postings."],
    };
    const [t, s] = titles[tabName] || ["Dashboard", ""];
    const titleEl = document.getElementById("page-title");
    const subEl = document.getElementById("page-subtitle");
    if (titleEl) titleEl.textContent = t;
    if (subEl) subEl.textContent = s;
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
<tr>
    <td>
        <div class="candidate-info">
            <div class="cand-avatar">${nm[0]}</div>
            <div class="cand-details">
                <span class="name">${nm}</span>
                <span class="email">${app.email}</span>
            </div>
        </div>
    </td>
    <td><span style="font-weight:600; color:#444;">${app.job_title || "Position"}</span></td>
    <td>${fmtDate(app.applied_at)}</td>
    <td>${app.Total_Experience != null ? app.Total_Experience + " yr" : "Fresher"}</td>
    <td><span class="status-label ${st.cls === 'shortlisted' ? 'status-shortlisted' : st.cls === 'rejected' ? 'status-rejected' : 'status-pending'}"><i class="fas ${st.icon}"></i> ${st.label}</span></td>
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
<tr>
    <td>
        <div class="candidate-info">
            <div class="cand-avatar">${nm[0]}</div>
            <div class="cand-details">
                <span class="name">${nm}</span>
                <span class="email">${app.email}</span>
            </div>
        </div>
    </td>
    <td>${app.job_title || "Position"} at <strong>${app.company_name || ""}</strong></td>
    <td>${v(app.phone_number)}</td>
    <td>${v(app.Current_Location)}</td>
    <td><span class="status-label ${st.cls === 'shortlisted' ? 'status-shortlisted' : st.cls === 'rejected' ? 'status-rejected' : 'status-pending'}">${st.label}</span></td>
    <td><a href="javascript:void(0)" class="view-btn" onclick="openModal(${app.application_id})">VIEW DETAIL <i class="fas fa-arrow-right"></i></a></td>
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
        return `
<tr>
    <td>
        <div class="candidate-info">
            <div class="cand-avatar">${nm[0]}</div>
            <div class="cand-details">
                <span class="name">${nm}</span>
            </div>
        </div>
    </td>
    <td>${v(u.email)}</td>
    <td><span class="status-label ${u.role === 'admin' ? 'status-shortlisted' : 'status-pending'}">${u.role || "user"}</span></td>
    <td>${v(u.location)}</td>
    <td>${v(u.skills)}</td>
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
<tr>
    <td><span style="font-weight:700; color:#334155;">${job.job_title}</span></td>
    <td><i class="fas fa-map-marker-alt"></i> ${job.location}</td>
    <td><span class="status-label status-pending">${job.job_type}</span></td>
    <td>₹${job.salary} LPA</td>
    <td>
        <div style="display:flex; gap:10px;">
            <button class="view-btn" onclick="deleteJob(${job.job_id})" style="background:#fee2e2; color:#b91c1c; border-radius:4px;"><i class="fas fa-trash"></i> DELETE</button>
        </div>
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
    const app = allApps.find(a => a.application_id === appId);
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
        ["Portfolio", (app.portfolio_link && app.portfolio_link !== "null" && app.portfolio_link.trim() !== "") ? `<a href="${app.portfolio_link.startsWith('http') ? app.portfolio_link : 'http://' + app.portfolio_link}" target="_blank" style="color:#008BDC; text-decoration:underline; display:flex; gap:5px; align-items:center; font-weight: 500;">View Portfolio <i class="fas fa-external-link-alt" style="font-size:10px;"></i></a>` : "Not Provided"],
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
        window.location.href = "/frontend/pages/login.html";
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
