"use strict";

// ── API Utility ──
const getAPIURL = () => window.getEasyJobsAPI?.() || "/api";

// ── Globals ──
let allApplications = [];
let currentFilter = "all";
let currentSearch = "";
let allInterviews = [];  // New global for interviews
const setE = (id, val) => { const el = document.getElementById(id); if (el) el.textContent = val; };

// ── User Helpers ──
function getLoggedInUser() {
    const keys = ["user", "currentUser", "loggedInUser", "easyjobs_user"];
    for (const k of keys) {
        try {
            const raw = localStorage.getItem(k);
            if (raw && raw !== "{}") {
                const parsed = JSON.parse(raw);
                if (parsed && (parsed.user_id != null || parsed.role === 'admin')) return parsed;
            }
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

function buildTableRow(app) {
    const st = getStatus(app);
    const exp = app.Total_Experience != null ? (app.Total_Experience === 0 ? "Fresher" : `${app.Total_Experience} yr${app.Total_Experience > 1 ? "s" : ""}`) : null;
    const loc = app.Current_Location || "Remote";
    
    const user = getLoggedInUser();
    const isAdmin = user?.role === "admin";
    const isEmployer = user?.role === "employer";
    const showApplicant = isAdmin || isEmployer;

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
        ${showApplicant ? `
        <td>
            <div style="font-weight:600; color:#1e293b;">${app.name || "Unknown Applicant"}</div>
            <div style="font-size:0.75rem; color:#64748b;">${app.email || ""}</div>
        </td>
        ` : `
        <td>
            <div style="font-size:0.85rem;color:#475569;display:flex;flex-direction:column;gap:4px;">
                ${exp ? `<span><i class="fas fa-briefcase"></i> ${exp}</span>` : ""}
                ${loc ? `<span><i class="fas fa-map-marker-alt"></i> ${loc}</span>` : ""}
            </div>
        </td>
        `}
        <td><div class="status-badge ${st.cls}"><i class="${st.icon}"></i> ${st.label}</div></td>
        <td style="font-size:0.85rem;color:#64748b;white-space:nowrap;">${fmtDate(app.applied_at)}</td>
        <td>
            <div class="td-actions">
                <button class="tbl-btn view" data-action="view" data-id="${app.application_id}">
                    <i class="fas fa-eye"></i> View
                </button>
                ${(isAdmin || isEmployer) ? `
                <button class="tbl-btn schedule-link" data-action="schedule" data-id="${app.application_id}" style="color:#0369a1;background:#f0f9ff;border:1px solid #bae6fd;padding:6px 12px;border-radius:6px;font-size:0.85rem;font-weight:600;cursor:pointer;">
                    <i class="fas fa-calendar-plus"></i> Schedule
                </button>
                ` : ''}
                <button class="tbl-btn withdraw" data-action="withdraw" data-id="${app.application_id}">
                    <i class="fas fa-times"></i> ${isAdmin ? 'Delete' : 'Withdraw'}
                </button>
            </div>
        </td>
    </tr>`;
}

// ── Modal ──
window.openAppModal = (id) => {
    const app = allApplications.find(a => a.application_id == id);
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
        ["Portfolio", (app.portfolio_link && app.portfolio_link !== "null") ? `<a href="${app.portfolio_link.startsWith("http") ? app.portfolio_link : 'http://' + app.portfolio_link}" target="_blank" style="color:var(--primary-blue);text-decoration:underline;">${app.portfolio_link}</a>` : "Not Provided"],
        ["Resume", (app.resume && app.resume !== "null") ? `<a href="${app.resume.startsWith("http") ? app.resume : '/backend/uploads/resumes/' + app.resume}" class="resume-link" target="_blank"><i class="fas fa-file-pdf"></i> View Resume</a>` : "No File"],
        ["Submitted At", fmtDate(app.applied_at)]
    ];

    // Check for interview data
    const interview = allInterviews.find(i => i.application_id == app.application_id);
    if (interview) {
        fields.push(["📅 Interview Date", new Date(interview.interview_date).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })]);
        fields.push(["📍 Location/Link", `<span style="color:#2563eb;font-weight:600;">${interview.location}</span>`]);
        if (interview.notes) fields.push(["📝 Interview Notes", interview.notes]);
    }

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

// ── Schedule Modal Logic ──
function openScheduleModal(appId) {
    const app = allApplications.find(a => a.application_id == appId);
    if (!app) return;
    
    const modal = document.getElementById("schedule-modal-overlay");
    const appIdInput = document.getElementById("schedule-app-id");
    const sub = document.getElementById("schedule-subtitle");
    
    if (appIdInput) appIdInput.value = appId;
    if (sub) sub.textContent = `Schedule interview for ${app.name} (${app.job_title})`;
    
    modal?.classList.add("open");
}

function closeScheduleModal() {
    document.getElementById("schedule-modal-overlay")?.classList.remove("open");
}

async function handleScheduleSubmit(e) {
    e.preventDefault();
    const appId = document.getElementById("schedule-app-id").value;
    const date = document.getElementById("interview-date").value;
    const loc = document.getElementById("interview-location").value;
    const notes = document.getElementById("interview-notes").value;
    
    if (!appId || !date || !loc) return alert("Please fill required fields");

    const btn = e.target.querySelector('button[type="submit"]');
    const originalText = btn.textContent;
    btn.disabled = true;
    btn.textContent = "Scheduling...";

    try {
        const res = await fetch(`${getAPIURL()}/interviews/`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                application_id: parseInt(appId),
                interview_date: new Date(date).toISOString(),
                location: loc,
                notes: notes
            })
        });

        if (res.ok) {
            alert("Interview scheduled successfully!");
            closeScheduleModal();
            // Refresh applications to see status change
            loadApplications();
        } else {
            const err = await res.json();
            alert("Error: " + (err.detail || "Could not schedule interview"));
        }
    } catch (err) {
        console.error(err);
        alert("Network error. Please try again.");
    } finally {
        btn.disabled = false;
        btn.textContent = originalText;
    }
}

// ── Render & Summary ──
function updateSummary(apps) {
    const total = apps.length;
    const short = apps.filter(a => deriveStatus(a) === "shortlisted").length;
    const reject = apps.filter(a => deriveStatus(a) === "rejected").length;
    const review = apps.filter(a => !["shortlisted", "rejected"].includes(deriveStatus(a))).length;

    const user = getLoggedInUser();
    const isAdmin = user?.role === "admin";
    const isEmployer = user?.role === "employer";

    setE("total-count", total);
    setE("applied-count", review);
    setE("shortlisted-count", short);
    setE("rejected-count", reject);
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
        const matchQ = !q || 
            (app.company_name || "").toLowerCase().includes(q) || 
            (app.job_title || "").toLowerCase().includes(q) ||
            (app.name || "").toLowerCase().includes(q) ||
            (app.email || "").toLowerCase().includes(q);
        return matchF && matchQ;
    });

    const user = getLoggedInUser();
    const isAdmin = user?.role === "admin";
    const isEmployer = user?.role === "employer";
    const label = isAdmin ? "Platform Applicants" : isEmployer ? "Received Applications" : "My Applications";
    
    if (countEl) countEl.textContent = `${filtered.length} ${label} Found`;

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
    const user = getLoggedInUser();
    const isAdmin = user?.role === "admin";
    const msg = isAdmin ? "Are you sure you want to delete this application record?" : "Are you sure you want to withdraw this application?";
    
    if (!confirm(msg)) return;
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
        document.getElementById("loading-state").style.display = 'none';
        document.getElementById("login-required").style.display = "flex";
        return;
    }

    const isAdmin = user.role === "admin";
    const isEmployer = user.role === "employer";
    const userId = user.user_id || user.id;

    try {
        const API_BASE = getAPIURL();
        let endpoint = (isAdmin || isEmployer) ? `${API_BASE}/applications/` : `${API_BASE}/applications/user/${userId}`;
        
        if (isAdmin || isEmployer) {
            const banner = document.getElementById("user-banner");
            const bannerText = banner?.querySelector(".ucb-text");
            const bannerIcon = banner?.querySelector(".ucb-icon i");
            if (banner) {
                banner.style.display = "flex";
                if (bannerIcon) bannerIcon.className = "fas fa-info-circle";
                banner.style.background = "#eff6ff";
                banner.style.borderColor = "#bfdbfe";
                banner.style.color = "#1e40af";
            }
            const tableHeader = document.querySelector(".app-table thead tr th:nth-child(2)");
            if (tableHeader) tableHeader.textContent = "Applicant Details";
            if (bannerText) {
                bannerText.innerHTML = isAdmin 
                    ? `<strong>Admin Privilege Active</strong> You are viewing all job applications across the entire platform.`
                    : `<strong>Employer Access</strong> You are viewing applications received for <strong>${user.company_name || 'your company'}</strong>.`;
            }
        } else {
            const banner = document.getElementById("user-banner");
            const bannerText = banner?.querySelector(".ucb-text");
            const bannerIcon = banner?.querySelector(".ucb-icon i");
            if (banner) {
                banner.style.display = "flex";
                if (bannerIcon) bannerIcon.className = "fas fa-shield-alt";
                banner.style.background = "#f8fafc";
                banner.style.borderColor = "#e2e8f0";
                banner.style.color = "#475569";
            }
            if (bannerText) {
                bannerText.innerHTML = `<strong>Your Data is Private</strong> As an applicant, you can only see the jobs you have personally applied for.`;
            }
        }

        console.log(`📡 Fetching applications from: ${endpoint}`);
        
        // Timeout logic - 7 seconds is plenty for a healthy backend
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 7000); 

        const res = await fetch(endpoint, { 
            signal: controller.signal,
            headers: { 'Accept': 'application/json' }
        });
        clearTimeout(timeoutId);

        if (!res.ok) throw new Error(`Server returned error ${res.status}.`);
        
        allApplications = await res.json();

        // Also fetch interviews
        try {
            const intRes = await fetch(`${API_BASE}/interviews/`);
            if (intRes.ok) allInterviews = await intRes.json();
        } catch(e) { console.warn("Could not fetch interviews", e); }

        // Strict role-based filtering
        if (!isAdmin) {
            if (isEmployer) {
                const empComp = (user.company_name || "").toLowerCase().trim();
                allApplications = allApplications.filter(a => (a.company_name || "").toLowerCase().trim() === empComp);
            } else {
                const userEmail = (user.email || "").toLowerCase().trim();
                if (userEmail) {
                    allApplications = allApplications.filter(a => (a.email || "").toLowerCase().trim() === userEmail);
                }
            }
        }

        document.getElementById("loading-state").style.display = "none";
        updateSummary(allApplications);
        renderCards();

    } catch (err) {
        console.error("Load Apps Error:", err);
        const loadingBox = document.getElementById("loading-state");
        if (loadingBox) {
            const isTimeout = err.name === 'AbortError';
            loadingBox.innerHTML = `
                <div style="text-align:center; padding: 20px;">
                    <div style="font-size:2.5rem;color:#ef4444;margin-bottom:12px;"><i class="fas fa-exclamation-triangle"></i></div>
                    <h3 style="color:#1e293b;margin-bottom:8px;">${isTimeout ? 'Connection Timeout' : 'Connection Failed'}</h3>
                    <p style="color:#64748b;font-size:0.88rem;margin-bottom:18px;">
                        ${isTimeout ? 'The server took too long to respond. Please ensure the backend is running.' : err.message}
                    </p>
                    <div style="font-family:monospace; font-size:0.75rem; color:#94a3b8; background:#f1f5f9; padding:8px; border-radius:4px; margin-bottom:18px;">
                        Endpoint: ${getAPIURL()}
                    </div>
                    <button onclick="window.location.reload()" style="background:#2563eb;color:#fff;border:none;padding:12px 24px;border-radius:50px;cursor:pointer;font-weight:700;box-shadow: 0 4px 10px rgba(37,99,235,0.2);">
                        <i class="fas fa-sync-alt"></i> Try Again
                    </button>
                </div>`;
        }
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
        else if (btn.dataset.action === "schedule") openScheduleModal(id);
    });

    document.getElementById("schedule-form")?.addEventListener("submit", handleScheduleSubmit);
    ["schedule-modal-close"].forEach(id => {
        document.getElementById(id)?.addEventListener("click", closeScheduleModal);
    });

    loadApplications();
});