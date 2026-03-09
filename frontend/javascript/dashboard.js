"use strict";

import { API_URL } from "./config.js";

/* ─── CONFIG ────────────────────────────────── */
// Utility to get the correct API URL (Port 8000 for Python backend)
const getAPIURL = () => { return API_URL || "/api"; };

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
        window.location.href = "./login.html";
        return null;
    }
    const user = JSON.parse(userString);

    if (user.role !== "admin" && user.role !== "employer") {
        alert("Access Denied: This area is for authorized accounts only.");
        window.location.href = "./login.html";
        return null;
    }

    const isAdmin = user.role === "admin";

    if (isAdmin) {
        const myJobsLink = document.querySelector('[onclick*="switchTab(\'my-jobs\')"]');
        if (myJobsLink) {
            myJobsLink.innerHTML = '<i class="fas fa-list-alt"></i> Manage All Jobs';
        }
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

    const titles = isAdmin ? {
        overview: ["Super Admin Panel", "Full access to platform metrics and user database."],
        applications: ["All Applications", "Review every candidate who applied across the platform."],
        "post-job": ["Post Global Opening", "Add a new internship or job vacancy as Admin."],
        "my-jobs": ["All Platform Jobs", "View, edit, or remove any job posting on the system."],
    } : {
        overview: ["Employer Dashboard", "Manage your company's hires and job listings."],
        applications: ["Recent Applicants", "Review Every candidate who applied for your openings."],
        "post-job": ["Post New Opening", "Add a new internship or job vacancy for your company."],
        "my-jobs": ["Manage My Jobs", "View, edit, or remove your existing job postings."],
    };

    const [t, s] = titles[tabName] || ["Dashboard", ""];
    const titleEl = document.getElementById("page-title");
    const subEl = document.getElementById("page-subtitle");
    if (titleEl) titleEl.textContent = t;
    if (subEl) subEl.textContent = s;
}

window.switchTab = switchTab;