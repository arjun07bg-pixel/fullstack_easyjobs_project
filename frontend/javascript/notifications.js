/**
 * EasyJobs - Notification System
 * Bell icon + dropdown panel for all pages
 * Status update ஆகும்போது auto-notification வரும்
 */

(function () {
    "use strict";

    const API = () => {
        return window.getEasyJobsAPI ? window.getEasyJobsAPI() : "http://127.0.0.1:8000/api";
    };

    /* ── Inject Notification Bell into Navbar ────────────────── */
    function injectNotificationBell() {
        const user = JSON.parse(localStorage.getItem("user") || "{}");
        if (!user?.user_id) return; // Only for logged-in users

        // Don't inject twice
        if (document.getElementById("notif-bell-wrapper")) return;

        // Try to find a place to put the bell
        let insertionPoint = document.querySelector(".auth-buttons") || 
                         document.querySelector(".header-content") ||
                         document.querySelector(".page-header > div:last-child") || // Dashboard
                         document.querySelector(".main-header .container");
                         
        if (!insertionPoint) {
            console.warn("Notification system: No insertion point found for bell.");
            return;
        }

        // Create bell wrapper
        const wrapper = document.createElement("div");
        wrapper.id = "notif-bell-wrapper";
        wrapper.style.cssText = "position:relative; display:inline-flex; align-items:center; margin-right: 15px;";

        wrapper.innerHTML = `
            <button id="notif-bell-btn" title="Notifications" style="
                background: rgba(37, 99, 235, 0.1);
                border: 1px solid rgba(37, 99, 235, 0.2);
                color: #2563eb;
                width: 40px;
                height: 40px;
                border-radius: 12px;
                cursor: pointer;
                font-size: 18px;
                display: flex;
                align-items: center;
                justify-content: center;
                position: relative;
                transition: all 0.3s;
            ">
                <i class="fas fa-bell"></i>
                <span id="notif-badge" style="
                    position: absolute;
                    top: -5px;
                    right: -5px;
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
                    box-shadow: 0 0 0 2px white;
                ">0</span>
            </button>

            <!-- Notification Dropdown Panel -->
            <div id="notif-panel" style="
                display: none;
                position: absolute;
                top: 50px;
                right: 0;
                width: 360px;
                max-height: 520px;
                background: white;
                border-radius: 20px;
                box-shadow: 0 20px 50px rgba(0,0,0,0.15);
                z-index: 999999;
                overflow: hidden;
                animation: notifSlideIn 0.25s cubic-bezier(0.16, 1, 0.3, 1);
                border: 1px solid #e2e8f0;
            ">
                <div style="
                    background: white;
                    padding: 20px;
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    border-bottom: 1px solid #f1f5f9;
                ">
                    <span style="color:#1e293b; font-weight:800; font-size:16px;">
                        Notifications
                    </span>
                    <button id="notif-mark-all" style="
                        background: #f1f5f9;
                        border: none;
                        color: #475569;
                        font-size: 11px;
                        font-weight: 700;
                        padding: 6px 12px;
                        border-radius: 8px;
                        cursor: pointer;
                        transition: 0.2s;
                    ">Mark All Read</button>
                </div>
                <div id="notif-list" style="
                    overflow-y: auto;
                    max-height: 380px;
                    background: #fff;
                "></div>
                <div style="padding: 12px; text-align: center; border-top: 1px solid #f1f5f9; background: #f8fafc;">
                    <a href="/frontend/pages/notifications.html" style="color: #2563eb; font-weight: 700; font-size: 13px; text-decoration: none; display: block; padding: 8px;">
                        View All Notifications <i class="fas fa-arrow-right" style="margin-left:5px; font-size:10px;"></i>
                    </a>
                </div>
            </div>
        `;

        // Style tweak for dark backgrounds
        const isDarkHeader = !!document.querySelector(".main-header.sticky");
        if (isDarkHeader) {
            const btn = wrapper.querySelector("#notif-bell-btn");
            btn.style.color = "white";
            btn.style.background = "rgba(255,255,255,0.1)";
            btn.style.border = "none";
        }

        // Insert before insertion point children
        if (insertionPoint.classList.contains("auth-buttons")) {
             insertionPoint.insertAdjacentElement("beforebegin", wrapper);
        } else {
             insertionPoint.appendChild(wrapper);
        }

        // Bell click - toggle panel
        document.getElementById("notif-bell-btn").addEventListener("click", (e) => {
            e.stopPropagation();
            const panel = document.getElementById("notif-panel");
            const isOpen = panel.style.display === "block";
            
            // Close other dropdowns if any
            document.querySelectorAll("#notif-panel").forEach(p => p.style.display = "none");
            
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
                    padding: 16px 20px;
                    border-bottom: 1px solid #f1f5f9;
                    cursor: pointer;
                    transition: all 0.2s ease;
                    display: flex;
                    gap: 14px;
                    align-items: flex-start;
                    position: relative;
                }
                .notif-item:hover { background: #f8fafc; transform: translateX(2px); }
                .notif-item.unread { background: #f0f7ff; }
                .notif-item.unread:hover { background: #e0efff; }
                .notif-icon {
                    width: 40px;
                    height: 40px;
                    border-radius: 12px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 16px;
                    flex-shrink: 0;
                    box-shadow: 0 4px 10px rgba(0,0,0,0.05);
                }
                .notif-title { font-weight: 700; font-size: 14px; color: #1e293b; margin-bottom: 4px; }
                .notif-msg   { font-size: 12.5px; color: #475569; line-height: 1.6; }
                .notif-time  { font-size: 10.5px; color: #94a3b8; margin-top: 6px; display: flex; align-items: center; gap: 4px; }
                .notif-empty { padding: 60px 40px; text-align: center; }
                .notif-empty i { font-size: 50px; margin-bottom: 15px; display: block; color: #e2e8f0; }
                .notif-unread-dot {
                    width: 8px;
                    height: 8px;
                    background: #2563eb;
                    border-radius: 50%;
                    flex-shrink: 0;
                    margin-top: 6px;
                    box-shadow: 0 0 8px rgba(37,99,235,0.4);
                }
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
    // Expose to window for standalone page to use
    window.fetchUnreadCount = fetchUnreadCount;

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
                            <div class="notif-time"><i class="far fa-clock"></i>${timeStr}</div>
                        </div>
                        ${!n.is_read ? '<div class="notif-unread-dot"></div>' : ''}
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
