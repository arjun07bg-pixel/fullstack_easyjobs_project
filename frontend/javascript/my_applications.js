/**
 * my_applications.js
 * EasyJobs – My Applications Page
 * Updated to include "View Details" modal for full application visibility.
 */

"use strict";

const getAPIBase = () => {
    if (window.location.port !== '8000' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')) {
        return `http://127.0.0.1:8000/api`;
    }
    return "/api";
};
const API_BASE = getAPIBase();

let allApplications = [];
let currentFilter = "all";
let currentSearch = "";

/* ─── Get logged-in user ──────────────────────────────────────── */
function getLoggedInUser() {
    const keys = ["user", "currentUser", "loggedInUser", "easyjobs_user"];
    for (const k of keys) {
        try {
            const raw = localStorage.getItem(k);
            if (raw) return JSON.parse(raw);
        } catch (_) { /* ignore */ }
    }
    return null;
}

/* ─── Status helpers ──────────────────────────────────────────── */
function deriveStatus(app) {
    return (app.status || "applied").toLowerCase();
}

const STATUS_MAP = {
    applied: { label: "Under Review", icon: "fas fa-clock", cls: "applied", stripe: "blue" },
    shortlisted: { label: "Shortlisted", icon: "fas fa-check-circle", cls: "shortlisted", stripe: "green" },
    rejected: { label: "Not Selected", icon: "fas fa-times-circle", cls: "rejected", stripe: "red" },
    interview: { label: "Interview Scheduled", icon: "fas fa-calendar-check", cls: "interview", stripe: "orange" },
};

function getStatus(app) {
    return STATUS_MAP[deriveStatus(app)] || STATUS_MAP.applied;
}

/* ─── Logo avatar gradient ───────────────────────────────────── */
const GRADIENTS = [
    "linear-gradient(135deg,#1e40af,#3b82f6)",
    "linear-gradient(135deg,#7c3aed,#a78bfa)",
    "linear-gradient(135deg,#059669,#34d399)",
    "linear-gradient(135deg,#b45309,#fbbf24)",
    "linear-gradient(135deg,#be123c,#fb7185)",
    "linear-gradient(135deg,#0e7490,#67e8f9)",
    "linear-gradient(135deg,#4f46e5,#818cf8)",
];

function logoGrad(name) {
    let h = 0;
    for (let i = 0; i < (name || "?").length; i++) h += name.charCodeAt(i);
    return GRADIENTS[h % GRADIENTS.length];
}
function logoChar(name) { return (name || "?").charAt(0).toUpperCase(); }

/* ─── Date formatter ─────────────────────────────────────────── */
function fmtDate(str) {
    if (!str) return "Recently Applied";
    const d = new Date(str);
    return isNaN(d.getTime())
        ? "Recently Applied"
        : d.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
}

/* ─── Build one application card ─────────────────────────────── */
function buildCard(app, idx) {
    const st = getStatus(app);
    const exp = app.Total_Experience != null
        ? (app.Total_Experience === 0 ? "Fresher" : `${app.Total_Experience} yr${app.Total_Experience > 1 ? "s" : ""}`)
        : null;
    const loc = app.Current_Location || "Remote";

    const chips = [
        exp ? `<span class="app-meta-chip"><i class="fas fa-briefcase"></i>${exp}</span>` : "",
        loc ? `<span class="app-meta-chip"><i class="fas fa-map-marker-alt"></i>${loc}</span>` : "",
    ].filter(Boolean).join("");

    return `
<div class="app-card" data-id="${app.application_id}">
    <div class="app-card-inner">
        <div class="app-card-stripe ${st.stripe}"></div>
        <div class="app-card-body">
            <div class="app-logo-box" style="background:${logoGrad(app.company_name)}">${logoChar(app.company_name)}</div>
            <div class="app-info-wrap">
                <h3 class="app-job-title">${app.job_title || "Job Position"}</h3>
                <p class="app-company"><i class="fas fa-building"></i>${app.company_name || "Company"}</p>
                <div class="app-meta">${chips}</div>
            </div>
            <div class="app-card-right">
                <div class="status-badge ${st.cls}">
                    <i class="${st.icon}"></i>${st.label}
                </div>
                <div class="app-date"><i class="fas fa-calendar-alt"></i>${fmtDate(app.applied_at)}</div>
                <div class="app-card-actions">
                    <button class="aca-btn view" onclick="openAppModal(${app.application_id})">
                        <i class="fas fa-eye"></i> View Full Details
                    </button>
                    <button class="aca-btn withdraw" onclick="withdrawApp(${app.application_id}, this)">
                        <i class="fas fa-times"></i> Withdraw
                    </button>
                </div>
            </div>
        </div>
    </div>
    <div class="app-card-footer">
        Application ID: <span>#${app.application_id}</span> • Submitted through EasyJobs Portal
    </div>
</div>`;
}

/* ─── Modal Operations ───────────────────────────────────────── */
window.openAppModal = function (id) {
    const app = allApplications.find(a => a.application_id === id);
    if (!app) return;

    const overlay = document.getElementById("modal-overlay");
    const grid = document.getElementById("modal-grid");
    const st = getStatus(app);

    document.getElementById("modal-job-title").textContent = app.job_title || "Position";
    document.getElementById("modal-company-name").innerHTML = `<i class="fas fa-building"></i> ${app.company_name || "Company"}`;

    const avatar = document.getElementById("modal-avatar");
    avatar.textContent = logoChar(app.company_name);
    avatar.style.background = logoGrad(app.company_name);

    const badge = document.getElementById("modal-status-badge");
    badge.className = `status-badge ${st.cls}`;
    badge.innerHTML = `<i class="${st.icon}"></i> ${st.label}`;

    const fields = [
        ["Full Name", app.name],
        ["Email", app.email],
        ["Phone Number", app.phone_number],
        ["Location", app.Current_Location || "Remote"],
        ["Total Experience", app.Total_Experience != null ? app.Total_Experience + " Year(s)" : "Fresher"],
        ["Current Salary (LPA)", app.Current_salary != null ? "₹" + app.Current_salary : "N/A"],
        ["Notice Period", app.Notice_Period != null ? (app.Notice_Period === 0 ? "Immediate" : app.Notice_Period + " Days") : "N/A"],
        ["Portfolio", app.portfolio_link || "Not Provided"],
        ["Resume", app.resume || "No File"],
        ["Submitted At", fmtDate(app.applied_at)]
    ];

    grid.innerHTML = fields.map(([label, val]) => `
        <div class="modal-field">
            <div class="mf-label">${label}</div>
            <div class="mf-value">${val || "—"}</div>
        </div>
    `).join("");

    const coverSection = document.getElementById("modal-cover-section");
    const coverText = document.getElementById("modal-cover-text");
    if (app.Cover_Letter) {
        coverSection.style.display = "block";
        coverText.textContent = app.Cover_Letter;
    } else {
        coverSection.style.display = "none";
    }

    overlay.classList.add("open");
};

function closeAppModal() {
    document.getElementById("modal-overlay").classList.remove("open");
}

/* ─── Update summary ─────────────────────────────────────────── */
function updateSummary(apps) {
    const total = apps.length;
    const short = apps.filter(a => deriveStatus(a) === "shortlisted").length;
    const reject = apps.filter(a => deriveStatus(a) === "rejected").length;
    const review = apps.filter(a => !["shortlisted", "rejected"].includes(deriveStatus(a))).length;

    const setE = (id, v) => { const e = document.getElementById(id); if (e) e.textContent = v; };
    setE("total-count", total);
    setE("applied-count", review);
    setE("shortlisted-count", short);
    setE("rejected-count", reject);
    setE("result-count", `${total} application${total !== 1 ? "s" : ""}`);
}

/* ─── Render ─────────────────────────────────────────────────── */
function renderCards() {
    const list = document.getElementById("applications-list");
    const emptyEl = document.getElementById("empty-state");
    const noResults = document.getElementById("no-results");
    const countEl = document.getElementById("result-count");
    if (!list) return;

    const filtered = allApplications.filter(app => {
        const q = currentSearch.toLowerCase();
        const matchF = currentFilter === "all" || deriveStatus(app) === currentFilter;
        const matchQ = !q || (app.company_name || "").toLowerCase().includes(q) || (app.job_title || "").toLowerCase().includes(q);
        return matchF && matchQ;
    });

    if (countEl) countEl.textContent = `${filtered.length} result${filtered.length !== 1 ? "s" : ""}`;

    if (allApplications.length === 0) {
        list.style.display = "none";
        emptyEl.style.display = "flex";
        noResults.style.display = "none";
    } else if (filtered.length === 0) {
        list.style.display = "none";
        emptyEl.style.display = "none";
        noResults.style.display = "flex";
    } else {
        emptyEl.style.display = "none";
        noResults.style.display = "none";
        list.style.display = "flex";
        list.innerHTML = filtered.map((app, i) => buildCard(app, i)).join("");
    }
}

/* ─── Actions ────────────────────────────────────────────────── */
async function withdrawApp(id, btn) {
    if (!confirm("Are you sure you want to withdraw this application?")) return;
    btn.disabled = true;
    btn.innerHTML = `<i class="fas fa-spinner fa-spin"></i> ...`;
    try {
        const res = await fetch(`${API_BASE}/applications/${id}`, { method: "DELETE" });
        if (res.ok) {
            allApplications = allApplications.filter(a => a.application_id !== id);
            updateSummary(allApplications);
            renderCards();
        }
    } catch (e) { console.error(e); }
}

/* ─── Load ───────────────────────────────────────────────────── */
async function loadApplications() {
    const user = getLoggedInUser();
    if (!user) {
        ["loading-state", "login-required"].forEach(id => {
            const el = document.getElementById(id);
            if (el) el.style.display = (id === "login-required") ? "flex" : "none";
        });
        return;
    }

    const userId = user.user_id || user.id;
    try {
        const res = await fetch(`${API_BASE}/applications/user/${userId}`);
        if (!res.ok) throw new Error("Fetch error");
        allApplications = await res.json();

        const loader = document.getElementById("loading-state");
        if (loader) loader.style.display = "none";

        updateSummary(allApplications);
        renderCards();
    } catch (err) {
        console.error(err);
        const loader = document.getElementById("loading-state");
        if (loader) loader.innerHTML = `<p style="color:#ef4444;">Failed to load applications. Check if server is running.</p>`;
    }
}

/* ─── Init ────────────────────────────────────────────────────── */
document.addEventListener("DOMContentLoaded", () => {
    // Sidebar filters
    document.querySelectorAll(".side-filter-btn").forEach(btn => {
        btn.addEventListener("click", () => {
            document.querySelectorAll(".side-filter-btn").forEach(b => b.classList.remove("active"));
            btn.classList.add("active");
            currentFilter = btn.dataset.filter;
            renderCards();
        });
    });

    // Search
    const searchInp = document.getElementById("app-search");
    if (searchInp) {
        searchInp.addEventListener("input", () => {
            currentSearch = searchInp.value.trim();
            renderCards();
        });
    }

    // Modal close
    document.getElementById("modal-close")?.addEventListener("click", closeAppModal);
    document.getElementById("modal-close-btn")?.addEventListener("click", closeAppModal);
    document.getElementById("modal-overlay")?.addEventListener("click", (e) => {
        if (e.target.id === "modal-overlay") closeAppModal();
    });

    loadApplications();
});
