/**
 * EasyJobs - Notification System
 * Bell icon + dropdown panel for all pages
 * Status update ஆகும்போது auto-notification வரும்
 */

(function () {
    "use strict";

    const API = () => window.getEasyJobsAPI ? window.getEasyJobsAPI() : "/api";

    /* ── Inject Notification Bell into Navbar ────────────────── */
    function injectNotificationBell() {
        const user = JSON.parse(localStorage.getItem("user") || "{}");
        if (!user?.user_id) return; // Only for logged-in users

        // Don't inject twice
        if (document.getElementById("notif-bell-wrapper")) return;

        const authButtons = document.querySelector(".auth-buttons");
        if (!authButtons) return;

        // Create bell wrapper
        const wrapper = document.createElement("div");
        wrapper.id = "notif-bell-wrapper";
        wrapper.style.cssText = "position:relative; display:inline-flex; align-items:center;";

        wrapper.innerHTML = `
            <button id="notif-bell-btn" title="Notifications" style="
                background: rgba(255,255,255,0.1);
                border: none;
                color: white;
                width: 42px;
                height: 42px;
                border-radius: 50%;
                cursor: pointer;
                font-size: 18px;
                display: flex;
                align-items: center;
                justify-content: center;
                position: relative;
                transition: background 0.3s;
            ">
                <i class="fas fa-bell"></i>
                <span id="notif-badge" style="
                    position: absolute;
                    top: -2px;
                    right: -2px;
                    background: #ef4444;
                    color: white;
                    font-size: 10px;
                    font-weight: 700;
                    min-width: 18px;
                    height: 18px;
                    border-radius: 9px;
                    display: none;
                    align-items: center;
                    justify-content: center;
                    padding: 0 4px;
                    border: 2px solid transparent;
                ">0</span>
            </button>

            <!-- Notification Dropdown Panel -->
            <div id="notif-panel" style="
                display: none;
                position: absolute;
                top: 52px;
                right: -10px;
                width: 360px;
                max-height: 480px;
                background: white;
                border-radius: 16px;
                box-shadow: 0 20px 60px rgba(0,0,0,0.18);
                z-index: 99999;
                overflow: hidden;
                animation: notifSlideIn 0.25s ease;
                border: 1px solid #e2e8f0;
            ">
                <div style="
                    background: linear-gradient(135deg, #2563eb, #1d4ed8);
                    padding: 16px 20px;
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                ">
                    <span style="color:white; font-weight:700; font-size:15px;">
                        <i class="fas fa-bell" style="margin-right:8px;"></i>Notifications
                    </span>
                    <button id="notif-mark-all" style="
                        background: rgba(255,255,255,0.15);
                        border: none;
                        color: white;
                        font-size: 11px;
                        font-weight: 600;
                        padding: 4px 10px;
                        border-radius: 6px;
                        cursor: pointer;
                    ">Mark All Read</button>
                </div>
                <div id="notif-list" style="
                    overflow-y: auto;
                    max-height: 380px;
                "></div>
            </div>
        `;

        // Insert before auth buttons
        authButtons.insertAdjacentElement("beforebegin", wrapper);

        // Bell click - toggle panel
        document.getElementById("notif-bell-btn").addEventListener("click", (e) => {
            e.stopPropagation();
            const panel = document.getElementById("notif-panel");
            const isOpen = panel.style.display === "block";
            panel.style.display = isOpen ? "none" : "block";
            if (!isOpen) loadNotifications();
        });

        // Mark all read
        document.getElementById("notif-mark-all").addEventListener("click", async () => {
            await fetch(`${API()}/notifications/user/${user.user_id}/read-all`, { method: "PATCH" });
            updateBadge(0);
            loadNotifications();
        });

        // Close on outside click
        document.addEventListener("click", (e) => {
            const panel = document.getElementById("notif-panel");
            const wrapper = document.getElementById("notif-bell-wrapper");
            if (panel && wrapper && !wrapper.contains(e.target)) {
                panel.style.display = "none";
            }
        });

        // Add animation style
        if (!document.getElementById("notif-styles")) {
            const style = document.createElement("style");
            style.id = "notif-styles";
            style.textContent = `
                @keyframes notifSlideIn {
                    from { opacity: 0; transform: translateY(-10px); }
                    to   { opacity: 1; transform: translateY(0); }
                }
                .notif-item {
                    padding: 14px 18px;
                    border-bottom: 1px solid #f1f5f9;
                    cursor: pointer;
                    transition: background 0.2s;
                    display: flex;
                    gap: 12px;
                    align-items: flex-start;
                }
                .notif-item:hover { background: #f8fafc; }
                .notif-item.unread { background: #eff6ff; }
                .notif-item.unread:hover { background: #dbeafe; }
                .notif-icon {
                    width: 36px;
                    height: 36px;
                    border-radius: 10px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 15px;
                    flex-shrink: 0;
                }
                .notif-title { font-weight: 700; font-size: 13px; color: #0f172a; margin-bottom: 3px; }
                .notif-msg   { font-size: 12px; color: #64748b; line-height: 1.5; }
                .notif-time  { font-size: 10px; color: #94a3b8; margin-top: 4px; }
                .notif-empty { padding: 40px; text-align: center; color: #94a3b8; }
                .notif-empty i { font-size: 40px; margin-bottom: 10px; display: block; color: #cbd5e1; }
            `;
            document.head.appendChild(style);
        }

        // Start polling for new notifications every 30 seconds
        fetchUnreadCount();
        setInterval(fetchUnreadCount, 30000);
    }

    /* ── Fetch Unread Count ──────────────────────────────────── */
    async function fetchUnreadCount() {
        const user = JSON.parse(localStorage.getItem("user") || "{}");
        if (!user?.user_id) return;
        try {
            const res = await fetch(`${API()}/notifications/user/${user.user_id}/unread-count`);
            if (res.ok) {
                const data = await res.json();
                updateBadge(data.unread_count || 0);
            }
        } catch (e) { /* silent */ }
    }

    /* ── Update Badge Number ─────────────────────────────────── */
    function updateBadge(count) {
        const badge = document.getElementById("notif-badge");
        if (!badge) return;
        if (count > 0) {
            badge.textContent = count > 99 ? "99+" : count;
            badge.style.display = "flex";
        } else {
            badge.style.display = "none";
        }
    }

    /* ── Load Notifications into Panel ──────────────────────── */
    async function loadNotifications() {
        const user = JSON.parse(localStorage.getItem("user") || "{}");
        if (!user?.user_id) return;

        const listEl = document.getElementById("notif-list");
        if (!listEl) return;
        listEl.innerHTML = `<div class="notif-empty"><i class="fas fa-spinner fa-spin"></i>Loading...</div>`;

        try {
            const res = await fetch(`${API()}/notifications/user/${user.user_id}`);
            if (!res.ok) throw new Error("fetch failed");
            const notifications = await res.json();

            if (notifications.length === 0) {
                listEl.innerHTML = `
                    <div class="notif-empty">
                        <i class="fas fa-bell-slash"></i>
                        <p style="font-weight:600; color:#64748b; margin:0;">No notifications yet</p>
                        <p style="font-size:12px; color:#94a3b8; margin-top:5px;">Job apply பண்ணும்போது இங்க வரும்!</p>
                    </div>
                `;
                return;
            }

            listEl.innerHTML = notifications.map(n => {
                const iconMap = {
                    success: { bg: "#dcfce7", color: "#16a34a", icon: "fa-check-circle" },
                    info:    { bg: "#eff6ff", color: "#2563eb", icon: "fa-info-circle" },
                    warning: { bg: "#fef3c7", color: "#d97706", icon: "fa-exclamation-triangle" },
                    error:   { bg: "#fef2f2", color: "#dc2626", icon: "fa-times-circle" }
                };
                const style = iconMap[n.type] || iconMap.info;
                const timeStr = new Date(n.created_at).toLocaleString("en-IN", {
                    day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit"
                });

                return `
                    <div class="notif-item ${!n.is_read ? 'unread' : ''}" 
                         onclick="window._markNotifRead(${n.id})" 
                         data-id="${n.id}">
                        <div class="notif-icon" style="background:${style.bg}; color:${style.color};">
                            <i class="fas ${style.icon}"></i>
                        </div>
                        <div style="flex:1; min-width:0;">
                            <div class="notif-title">${n.title}</div>
                            <div class="notif-msg">${n.message}</div>
                            <div class="notif-time"><i class="far fa-clock" style="margin-right:4px;"></i>${timeStr}</div>
                        </div>
                        ${!n.is_read ? '<div style="width:8px;height:8px;background:#2563eb;border-radius:50%;flex-shrink:0;margin-top:4px;"></div>' : ''}
                    </div>
                `;
            }).join("");

            // Update badge with unread count
            const unread = notifications.filter(n => !n.is_read).length;
            updateBadge(unread);

        } catch (e) {
            listEl.innerHTML = `<div class="notif-empty"><i class="fas fa-exclamation-circle"></i>Failed to load</div>`;
        }
    }

    /* ── Mark Single Notification Read ──────────────────────── */
    window._markNotifRead = async function (notifId) {
        try {
            await fetch(`${API()}/notifications/${notifId}/read`, { method: "PATCH" });
            const item = document.querySelector(`.notif-item[data-id="${notifId}"]`);
            if (item) {
                item.classList.remove("unread");
                const dot = item.querySelector('div[style*="background:#2563eb"]');
                if (dot) dot.remove();
            }
            fetchUnreadCount();
        } catch (e) { /* silent */ }
    };

    /* ── Init on DOM Ready ───────────────────────────────────── */
    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", injectNotificationBell);
    } else {
        // DOM already ready - wait a tiny bit for navbar_manager to render
        setTimeout(injectNotificationBell, 200);
    }

})();
