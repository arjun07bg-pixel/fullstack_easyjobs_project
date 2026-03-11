"use strict";

// ── API Utility ──
const getAPIURL = () => window.getEasyJobsAPI?.() || "/api";

// ── Globals ──
let allApplications = [];
let currentFilter = "all";
let currentSearch = "";

// ── User Helpers ──
function getLoggedInUser() {
    const keys = ["user", "currentUser", "loggedInUser", "easyjobs_user"];
    for (const k of keys) {
        try {
            const raw = localStorage.getItem(k);
            if (raw) return JSON.parse(raw);
        } catch (_) {}
    }
    return null;
}

// ── Status Helpers ──
const STATUS_MAP = {
    applied: { label: "Under Review", icon: "fas fa-clock", cls: "applied", stripe: "blue" },
    shortlisted: { label: "Shortlisted", icon: "fas fa-check-circle", cls: "shortlisted", stripe: "green" },
    rejected: { label: "Not Selected", icon: "fas fa-times-circle", cls: "rejected", stripe: "red" },
    interview: { label: "Interview Scheduled", icon: "fas fa-calendar-check", cls: "interview", stripe: "orange" },
};

const deriveStatus = (app) => (app.status || "applied").toLowerCase();
const getStatus = (app) => STATUS_MAP[deriveStatus(app)] || STATUS_MAP.applied;

// ── Logo & Date Helpers ──
const GRADIENTS = [
    "linear-gradient(135deg,#1e40af,#3b82f6)",
    "linear-gradient(135deg,#7c3aed,#a78bfa)",
    "linear-gradient(135deg,#059669,#34d399)",
    "linear-gradient(135deg,#b45309,#fbbf24)",
    "linear-gradient(135deg,#be123c,#fb7185)",
    "linear-gradient(135deg,#0e7490,#67e8f9)",
    "linear-gradient(135deg,#4f46e5,#818cf8)",
];
const logoGrad = (name) => {
    let h = (name || "?").split("").reduce((acc, c) => acc + c.charCodeAt(0), 0);
    return GRADIENTS[h % GRADIENTS.length];
};
const logoChar = (name) => (name || "?").charAt(0).toUpperCase();

const fmtDate = (str) => {
    if (!str) return "Recently Applied";
    const d = new Date(str);
    return isNaN(d.getTime()) ? "Recently Applied" : d.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
};

// ── Build Table Row ──
function buildTableRow(app) {
    const st = getStatus(app);
    const exp = app.Total_Experience != null ? (app.Total_Experience === 0 ? "Fresher" : `${app.Total_Experience} yr${app.Total_Experience > 1 ? "s" : ""}`) : null;
    const loc = app.Current_Location || "Remote";

    return `
    <tr data-id="${app.application_id}">
        <td>
            <div class="td-job-info">
                <div class="td-avatar" style="background:${logoGrad(app.company_name)}">${logoChar(app.company_name)}</div>
                <div class="td-job-text">
                    <h4>${app.job_title || "Job Position"}</h4>
                    <p><i class="fas fa-building"></i> ${app.company_name || "Company"}</p>
                </div>
            </div>
        </td>
        <td>
            <div style="font-size:0.85rem;color:#475569;display:flex;flex-direction:column;gap:4px;">
                ${exp ? `<span><i class="fas fa-briefcase"></i> ${exp}</span>` : ""}
                ${loc ? `<span><i class="fas fa-map-marker-alt"></i> ${loc}</span>` : ""}
            </div>
        </td>
        <td><div class="status-badge ${st.cls}"><i class="${st.icon}"></i> ${st.label}</div></td>
        <td style="font-size:0.85rem;color:#64748b;white-space:nowrap;">${fmtDate(app.applied_at)}</td>
        <td>
            <div class="td-actions">
                <button class="tbl-btn view" data-action="view" data-id="${app.application_id}">
                    <i class="fas fa-eye"></i> View
                </button>
                <button class="tbl-btn withdraw" data-action="withdraw" data-id="${app.application_id}">
                    <i class="fas fa-times"></i> Withdraw
                </button>
            </div>
        </td>
    </tr>`;
}

// ── Modal ──
window.openAppModal = (id) => {
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
        ["Portfolio", app.portfolio_link ? `<a href="${app.portfolio_link}" target="_blank" style="color:var(--primary-blue);text-decoration:underline;">${app.portfolio_link}</a>` : "Not Provided"],
        ["Resume", app.resume ? `<a href="${app.resume.startsWith('http') ? app.resume : '/backend/uploads/resumes/' + app.resume}" class="resume-link" target="_blank"><i class="fas fa-file-pdf"></i> View Resume</a>` : "No File"],
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
    } else coverSection.style.display = "none";

    overlay.classList.add("open");
};

function closeAppModal() {
    document.getElementById("modal-overlay")?.classList.remove("open");
}

// ── Render & Summary ──
function updateSummary(apps) {
    const total = apps.length;
    const short = apps.filter(a => deriveStatus(a) === "shortlisted").length;
    const reject = apps.filter(a => deriveStatus(a) === "rejected").length;
    const review = apps.filter(a => !["shortlisted", "rejected"].includes(deriveStatus(a))).length;

    const setE = (id, v) => document.getElementById(id)?.textContent = v;
    setE("total-count", total);
    setE("applied-count", review);
    setE("shortlisted-count", short);
    setE("rejected-count", reject);
    setE("result-count", `${total} application${total !== 1 ? "s" : ""}`);
}

function renderCards() {
    const listWrapper = document.getElementById("applications-list");
    const tbody = document.getElementById("app-table-body");
    const emptyEl = document.getElementById("empty-state");
    const noResults = document.getElementById("no-results");
    const countEl = document.getElementById("result-count");

    if (!listWrapper || !tbody) return;

    const filtered = allApplications.filter(app => {
        const q = currentSearch.toLowerCase();
        const matchF = currentFilter === "all" || deriveStatus(app) === currentFilter;
        const matchQ = !q || (app.company_name || "").toLowerCase().includes(q) || (app.job_title || "").toLowerCase().includes(q);
        return matchF && matchQ;
    });

    if (countEl) countEl.textContent = `${filtered.length} result${filtered.length !== 1 ? "s" : ""}`;

    const show = (el, val) => el && (el.style.display = val);

    if (allApplications.length === 0) {
        show(listWrapper, "none");
        show(emptyEl, "flex");
        show(noResults, "none");
    } else if (filtered.length === 0) {
        show(listWrapper, "none");
        show(emptyEl, "none");
        show(noResults, "flex");
    } else {
        show(emptyEl, "none");
        show(noResults, "none");
        show(listWrapper, "block");
        tbody.innerHTML = filtered.map(buildTableRow).join("");
    }
}

// ── Actions ──
async function withdrawApp(id) {
    if (!confirm("Are you sure you want to withdraw this application?")) return;
    const btn = document.querySelector(`button.withdraw[data-id="${id}"]`);
    if (btn) {
        btn.disabled = true;
        btn.innerHTML = `<i class="fas fa-spinner fa-spin"></i> ...`;
    }

    try {
        const API_BASE = getAPIURL();
        const res = await fetch(`${API_BASE}/applications/${id}`, { method: "DELETE" });
        if (res.ok) {
            allApplications = allApplications.filter(a => a.application_id !== id);
            updateSummary(allApplications);
            renderCards();
        }
    } catch (e) { console.error(e); }
}

// ── Load Applications ──
async function loadApplications() {
    const user = getLoggedInUser();
    if (!user) {
        document.getElementById("loading-state")?.style.display = "none";
        document.getElementById("login-required")?.style.display = "flex";
        return;
    }

    const userId = user.user_id || user.id;
    try {
        const API_BASE = getAPIURL();
        const res = await fetch(`${API_BASE}/applications/user/${userId}`);
        if (!res.ok) throw new Error(`Server error: ${res.status}`);
        allApplications = await res.json();

        document.getElementById("loading-state")?.style.display = "none";
        updateSummary(allApplications);
        renderCards();
    } catch (err) {
        console.error(err);
        document.getElementById("loading-state")?.innerHTML = `
            <div style="text-align:center;">
                <div style="font-size:2.5rem;color:#ef4444;margin-bottom:12px;"><i class="fas fa-exclamation-circle"></i></div>
                <h3 style="color:#1e293b;margin-bottom:8px;">Could Not Load Applications</h3>
                <p style="color:#64748b;font-size:0.88rem;margin-bottom:18px;">Make sure the server is running.<br><code>${err.message}</code></p>
                <button onclick="loadApplications()" style="background:#2563eb;color:#fff;border:none;padding:10px 24px;border-radius:8px;cursor:pointer;font-weight:600;font-size:0.88rem;">
                    <i class="fas fa-redo"></i> Retry
                </button>
            </div>`;
    }
}

// ── Init ──
document.addEventListener("DOMContentLoaded", () => {
    document.querySelectorAll(".side-filter-btn").forEach(btn => {
        btn.addEventListener("click", () => {
            document.querySelectorAll(".side-filter-btn").forEach(b => b.classList.remove("active"));
            btn.classList.add("active");
            currentFilter = btn.dataset.filter;
            renderCards();
        });
    });

    const searchInp = document.getElementById("app-search");
    if (searchInp) {
        searchInp.addEventListener("input", () => {
            currentSearch = searchInp.value.trim();
            renderCards();
        });
    }

    ["modal-close", "modal-close-btn"].forEach(id => {
        document.getElementById(id)?.addEventListener("click", closeAppModal);
    });

    document.getElementById("modal-overlay")?.addEventListener("click", (e) => {
        if (e.target.id === "modal-overlay") closeAppModal();
    });

    // Delegate buttons
    document.getElementById("app-table-body")?.addEventListener("click", (e) => {
        const btn = e.target.closest("button");
        if (!btn) return;
        const id = parseInt(btn.dataset.id);
        if (btn.dataset.action === "view") openAppModal(id);
        else if (btn.dataset.action === "withdraw") withdrawApp(id);
    });

    loadApplications();
});