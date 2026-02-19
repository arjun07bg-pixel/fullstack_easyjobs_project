"use strict";

/* ─── CONFIG ────────────────────────────────── */
const getAPI = () => {
    if (window.location.port !== '8000' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')) {
        return `http://127.0.0.1:8000/api`;
    }
    return "/api";
};
const API = getAPI();

let allApps = [];
let allUsers = [];

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
    const user = JSON.parse(localStorage.getItem("user") || "{}");
    if (!user || !user.role) {
        window.location.href = "/login.html";
        return null;
    }
    if (user.role !== "admin") {
        alert("Access Denied: Admin only.");
        window.location.href = "/";
        return null;
    }
    return user;
}

/* ─── SWITCHING TABS ────────────────────────── */
function switchTab(tabName) {
    document.querySelectorAll(".tab-section").forEach(s => s.classList.remove("active"));
    document.querySelectorAll(".sn-link").forEach(l => l.classList.remove("active"));

    const section = document.getElementById("tab-" + tabName);
    const link = document.querySelector(`[data-tab="${tabName}"]`);
    if (section) section.classList.add("active");
    if (link) link.classList.add("active");

    const titles = {
        overview: ["Admin Dashboard", "Welcome back, Admin! Here's today's overview."],
        applications: ["All Applications", "Full list of every application submitted."],
        users: ["Registered Users", "All users who have signed up on EasyJobs."],
        "post-job": ["Post a Job", "Add a new job vacancy to the portal."],
    };
    const [t, s] = titles[tabName] || ["Dashboard", ""];
    setText("page-title", t);
    setText("page-subtitle", s);
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

        const payload = {
            job_title: document.getElementById("pj-title").value.trim(),
            company_name: document.getElementById("pj-company").value.trim(),
            location: document.getElementById("pj-location").value.trim(),
            experience_level: parseInt(document.getElementById("pj-exp").value),
            job_type: document.getElementById("pj-type").value,
            salary: parseInt(document.getElementById("pj-salary").value),
            work_mode: document.getElementById("pj-mode").value,
            description: document.getElementById("pj-desc").value.trim()
        };

        try {
            const res = await fetch(`${API}/jobs/`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload)
            });

            if (res.ok) {
                alert("Job posted successfully! ✓");
                form.reset();
                switchTab("overview");
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
        const res = await fetch(`${API}/users/`);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        allUsers = await res.json();
    } catch (e) {
        console.error("Users fetch error:", e);
        allUsers = [];
    }
}

/* ─── RENDER STAT CARDS ─────────────────────── */
function renderStats() {
    const total = allApps.length;
    const shortlisted = allApps.filter(a => deriveStatus(a) === "shortlisted").length;
    const review = allApps.filter(a => !["shortlisted", "rejected"].includes(deriveStatus(a))).length;
    const rejected = allApps.filter(a => deriveStatus(a) === "rejected").length;
    const companies = new Set(allApps.map(a => a.company_name)).size;

    setText("stat-total-apps", total);
    setText("stat-shortlisted", shortlisted);
    setText("stat-under-review", review);
    setText("stat-rejected", rejected);
    setText("stat-total-users", allUsers.length);
    setText("stat-companies", companies);

    setText("sb-app-count", total);
    setText("sb-user-count", allUsers.length);
}

/* ─── RENDER RECENT TABLE (overview) ────────── */
function renderRecentTable() {
    const tbody = document.getElementById("recent-tbody");
    if (!tbody) return;

    const recent = [...allApps]
        .sort((a, b) => new Date(b.applied_at) - new Date(a.applied_at))
        .slice(0, 10);

    if (recent.length === 0) {
        tbody.innerHTML = `<tr><td colspan="8" class="table-loading"><div class="table-loading-content">No applications yet.</div></td></tr>`;
        return;
    }

    tbody.innerHTML = recent.map((app, i) => {
        const nm = app.name || "—";
        const st = getStatus(app);
        const g = grad(nm);
        return `
<tr>
    <td>${i + 1}</td>
    <td>
        <div class="cand-cell">
            <div class="cand-avatar" style="background:linear-gradient(135deg,${g})">${initials(nm)}</div>
            <span class="cand-name">${nm}</span>
        </div>
    </td>
    <td>${v(app.email)}</td>
    <td>${v(app.company_name)}</td>
    <td>${v(app.job_title)}</td>
    <td>${app.Total_Experience != null ? app.Total_Experience + " yr" : "—"}</td>
    <td>${statusBadge(app)}</td>
    <td>${fmtDate(app.applied_at)}</td>
</tr>`;
    }).join("");
}

/* ─── RENDER ALL APPLICATIONS TABLE ─────────── */
function renderAllApps(data) {
    const tbody = document.getElementById("all-apps-tbody");
    if (!tbody) return;

    if (data.length === 0) {
        tbody.innerHTML = `<tr><td colspan="13" class="table-loading"><div class="table-loading-content">No applications found.</div></td></tr>`;
        return;
    }

    tbody.innerHTML = data.map((app, i) => {
        const nm = app.name || "—";
        const g = grad(nm);
        return `
<tr>
    <td>${i + 1}</td>
    <td>
        <div class="cand-cell">
            <div class="cand-avatar" style="background:linear-gradient(135deg,${g})">${initials(nm)}</div>
            <span class="cand-name">${nm}</span>
        </div>
    </td>
    <td>${v(app.email)}</td>
    <td>${v(app.phone_number)}</td>
    <td><strong>${v(app.company_name)}</strong></td>
    <td>${v(app.job_title)}</td>
    <td>${v(app.Current_Location)}</td>
    <td>${app.Total_Experience != null ? app.Total_Experience + " yr" : "—"}</td>
    <td>${app.Current_salary != null ? "₹" + app.Current_salary : "—"}</td>
    <td>${app.Notice_Period != null ? (app.Notice_Period === 0 ? "Immediate" : app.Notice_Period + "d") : "—"}</td>
    <td>${statusBadge(app)}</td>
    <td>${fmtDate(app.applied_at)}</td>
    <td><button class="det-btn" onclick="openModal(${app.application_id})"><i class="fas fa-eye"></i> View</button></td>
</tr>`;
    }).join("");
}

/* ─── RENDER USERS TABLE ────────────────────── */
function renderUsers(data) {
    const tbody = document.getElementById("users-tbody");
    if (!tbody) return;

    if (data.length === 0) {
        tbody.innerHTML = `<tr><td colspan="8" class="table-loading"><div class="table-loading-content">No users found.</div></td></tr>`;
        return;
    }

    tbody.innerHTML = data.map((u, i) => {
        const nm = `${u.first_name || ""} ${u.last_name || ""}`.trim() || "—";
        const g = grad(nm);
        const roleCls = u.role === "admin" ? "sb shortlisted" : u.role === "employer" ? "sb interview" : "sb applied";
        return `
<tr>
    <td>${i + 1}</td>
    <td>
        <div class="cand-cell">
            <div class="cand-avatar" style="background:linear-gradient(135deg,${g})">${initials(nm)}</div>
            <span class="cand-name">${nm}</span>
        </div>
    </td>
    <td>${v(u.email)}</td>
    <td>${v(u.phone_number)}</td>
    <td><span class="${roleCls}">${u.role || "user"}</span></td>
    <td>${v(u.location)}</td>
    <td>${u.experience != null ? u.experience + " yr" : "—"}</td>
    <td>${v(u.skills)}</td>
</tr>`;
    }).join("");
}

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

    setText("modal-name", nm);
    setText("modal-company", app.company_name || "");

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
        ["Portfolio", app.portfolio_link || "Not Provided"],
        ["Applied On", fmtDate(app.applied_at)],
    ];

    const gridEl = document.getElementById("modal-grid");
    if (gridEl) {
        gridEl.innerHTML = fields.map(([l, val]) => `
<div class="modal-field">
    <div class="mf-label">${l}</div>
    <div class="mf-value">${val || "—"}</div>
</div>`).join("");
    }

    const coverSection = document.getElementById("modal-cover-section");
    const coverText = document.getElementById("modal-cover-text");
    if (coverSection && coverText) {
        if (app.Cover_Letter) {
            coverSection.style.display = "block";
            coverText.textContent = app.Cover_Letter;
        } else {
            coverSection.style.display = "none";
        }
    }

    // Set Resume Link
    const resumeLink = document.getElementById("modal-resume-link");
    if (resumeLink) {
        if (app.resume) {
            resumeLink.style.display = "flex";
            resumeLink.href = `${API}/applications/download/${app.resume}`; // Assumes simple static serving or redirect
            resumeLink.innerText = `📄 Download Resume`;
        } else {
            resumeLink.style.display = "none";
        }
    }

    // Event Listeners for Actions
    const updateAppStatus = async (newStatus) => {
        try {
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

    // Attach listeners
    const btnShort = document.getElementById("btn-shortlist");
    const btnReject = document.getElementById("btn-reject");
    const btnDel = document.getElementById("btn-delete-app");

    // Clean up old listeners (simple way)
    const newBtnShort = btnShort.cloneNode(true);
    const newBtnReject = btnReject.cloneNode(true);
    const newBtnDel = btnDel.cloneNode(true);

    btnShort.parentNode.replaceChild(newBtnShort, btnShort);
    btnReject.parentNode.replaceChild(newBtnReject, btnReject);
    btnDel.parentNode.replaceChild(newBtnDel, btnDel);

    newBtnShort.addEventListener("click", () => updateAppStatus("shortlisted"));
    newBtnReject.addEventListener("click", () => updateAppStatus("rejected"));
    newBtnDel.addEventListener("click", deleteApplication);

    const overlay = document.getElementById("modal-overlay");
    if (overlay) overlay.classList.add("open");
};

function closeModal() {
    const overlay = document.getElementById("modal-overlay");
    if (overlay) overlay.classList.remove("open");
}

/* ─── HELPERS ───────────────────────────────── */
function setText(id, val) {
    const el = document.getElementById(id);
    if (el) el.textContent = val;
}

/* ─── INIT ──────────────────────────────────── */
document.addEventListener("DOMContentLoaded", async () => {

    // Auth guard
    const user = guardAdmin();
    if (!user) return;

    // Set admin name
    const adminName = user.first_name || "Admin";
    setText("sb-admin-name", adminName);
    setText("tb-admin-name", adminName);

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
        window.location.href = "/login.html";
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

    // Fetch data
    await Promise.all([fetchApplications(), fetchUsers()]);

    // Render everything
    renderStats();
    renderRecentTable();
    renderAllApps(allApps);
    renderUsers(allUsers);
});
