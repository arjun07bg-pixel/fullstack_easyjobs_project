/**
 * EasyJobs - Bookmark / Save Job System
 * Requires login to save. Shows login modal if not logged in.
 * Saves to localStorage under 'easyjobs_saved' key.
 */

(function () {
    const STORAGE_KEY = 'easyjobs_saved';

    // ─── Helpers ────────────────────────────────────────────────────────────────

    function getLoggedInUser() {
        try {
            const u = JSON.parse(localStorage.getItem('user') || 'null');
            // Valid user must have a user_id (or id)
            if (u && (u.user_id || u.id)) return u;
            return null;
        } catch (e) { return null; }
    }

    function getSavedJobs() {
        try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]'); }
        catch (e) { return []; }
    }

    function saveJob(jobData) {
        const saved = getSavedJobs();
        const exists = saved.some(j => j.id === jobData.id);
        if (!exists) {
            saved.unshift(jobData);
            localStorage.setItem(STORAGE_KEY, JSON.stringify(saved));
        }
        return !exists;
    }

    function unsaveJob(jobId) {
        const saved = getSavedJobs().filter(j => j.id !== jobId);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(saved));
    }

    function isJobSaved(jobId) {
        return getSavedJobs().some(j => j.id === jobId);
    }

    // ─── Toast Notification ──────────────────────────────────────────────────────

    function showToast(message, type) {
        let toast = document.getElementById('ej-bookmark-toast');
        if (!toast) {
            toast = document.createElement('div');
            toast.id = 'ej-bookmark-toast';
            toast.style.cssText = [
                'position:fixed', 'bottom:30px', 'right:30px', 'z-index:99999',
                'padding:14px 22px', 'border-radius:12px', 'color:white',
                "font-family:'Poppins',sans-serif", 'font-size:14px', 'font-weight:500',
                'box-shadow:0 8px 32px rgba(0,0,0,0.18)',
                'display:flex', 'align-items:center', 'gap:10px',
                'transition:all 0.3s ease', 'transform:translateY(20px)', 'opacity:0',
                'min-width:220px'
            ].join(';');
            document.body.appendChild(toast);
        }

        const colors = {
            success: '#2563eb',
            remove: '#64748b',
            warning: '#f59e0b'
        };
        toast.style.background = colors[type] || colors.success;

        const icons = {
            success: 'fas fa-bookmark',
            remove: 'fas fa-bookmark',
            warning: 'fas fa-exclamation-circle'
        };
        toast.innerHTML = `<i class="${icons[type] || 'fas fa-bookmark'}"></i> ${message}`;
        toast.style.transform = 'translateY(0)';
        toast.style.opacity = '1';

        clearTimeout(toast._timer);
        toast._timer = setTimeout(() => {
            toast.style.transform = 'translateY(20px)';
            toast.style.opacity = '0';
        }, 2800);
    }

    // ─── Login Required Modal ────────────────────────────────────────────────────

    function showLoginModal() {
        // Remove any existing
        const existing = document.getElementById('ej-login-modal');
        if (existing) existing.remove();

        const overlay = document.createElement('div');
        overlay.id = 'ej-login-modal';
        overlay.style.cssText = [
            'position:fixed', 'inset:0', 'z-index:100000',
            'background:rgba(15,23,42,0.6)',
            'display:flex', 'align-items:center', 'justify-content:center',
            'backdrop-filter:blur(4px)',
            'animation:ejFadeIn 0.2s ease'
        ].join(';');

        overlay.innerHTML = `
            <style>
                @keyframes ejFadeIn { from { opacity:0; } to { opacity:1; } }
                @keyframes ejSlideUp { from { transform:translateY(30px); opacity:0; } to { transform:translateY(0); opacity:1; } }
                #ej-login-modal-box {
                    background: white;
                    border-radius: 20px;
                    padding: 40px 36px;
                    max-width: 400px;
                    width: 90%;
                    text-align: center;
                    box-shadow: 0 24px 64px rgba(0,0,0,0.18);
                    animation: ejSlideUp 0.3s ease;
                    font-family: 'Poppins', sans-serif;
                }
                #ej-login-modal-box .ej-modal-icon {
                    width: 68px; height: 68px;
                    background: #eff6ff; border-radius: 50%;
                    display: flex; align-items: center; justify-content: center;
                    margin: 0 auto 20px;
                    font-size: 28px; color: #2563eb;
                }
                #ej-login-modal-box h2 {
                    font-size: 20px; font-weight: 700; color: #0f172a;
                    margin: 0 0 8px;
                }
                #ej-login-modal-box p {
                    color: #64748b; font-size: 14px; margin: 0 0 28px; line-height: 1.6;
                }
                #ej-login-modal-box .ej-btn-login {
                    display: block; width: 100%;
                    background: linear-gradient(135deg, #2563eb, #1d4ed8);
                    color: white; font-weight: 700; font-size: 15px;
                    padding: 14px; border: none; border-radius: 12px;
                    cursor: pointer; text-decoration: none; margin-bottom: 12px;
                    transition: transform 0.15s ease;
                }
                #ej-login-modal-box .ej-btn-login:hover { transform: translateY(-1px); }
                #ej-login-modal-box .ej-btn-register {
                    display: block; width: 100%;
                    background: #f1f5f9; color: #0f172a;
                    font-weight: 600; font-size: 14px;
                    padding: 12px; border: none; border-radius: 12px;
                    cursor: pointer; text-decoration: none; margin-bottom: 14px;
                    transition: background 0.15s;
                }
                #ej-login-modal-box .ej-btn-register:hover { background: #e2e8f0; }
                #ej-login-modal-box .ej-modal-close {
                    color: #94a3b8; font-size: 13px; cursor: pointer; background: none;
                    border: none; font-family: 'Poppins', sans-serif;
                }
                #ej-login-modal-box .ej-modal-close:hover { color: #475569; }
            </style>
            <div id="ej-login-modal-box">
                <div class="ej-modal-icon">
                    <i class="fas fa-bookmark"></i>
                </div>
                <h2>Login to Save Jobs</h2>
                <p>Create a free account or login to save jobs and access them anytime from your profile.</p>
                <a href="../pages/login.html" class="ej-btn-login">
                    <i class="fas fa-sign-in-alt"></i>&nbsp; Login to Your Account
                </a>
                <a href="../pages/register.html" class="ej-btn-register">
                    <i class="fas fa-user-plus"></i>&nbsp; Create Free Account
                </a>
                <button class="ej-modal-close" id="ej-modal-close-btn">
                    Cancel &mdash; Continue Browsing
                </button>
            </div>
        `;

        document.body.appendChild(overlay);

        // Close on backdrop click or close button
        overlay.addEventListener('click', function (e) {
            if (e.target === overlay) overlay.remove();
        });
        document.getElementById('ej-modal-close-btn').addEventListener('click', function () {
            overlay.remove();
        });
    }

    // ─── Main: Init Bookmark Buttons ─────────────────────────────────────────────

    function initBookmarks() {
        document.querySelectorAll('.btn-save-naukri').forEach(btn => {
            const card = btn.closest('.job-card');
            if (!card) return;

            // Build unique job ID from title + company
            const titleEl = card.querySelector('.job-title');
            const companyEl = card.querySelector('.company-name');
            const title = titleEl ? titleEl.innerText.trim() : 'Unknown';
            const company = companyEl ? companyEl.innerText.replace(/[\d.★\s]+$/, '').trim() : 'Unknown';
            const jobId = (title + '-' + company)
                .toLowerCase()
                .replace(/\s+/g, '-')
                .replace(/[^a-z0-9-]/g, '');

            // Extract apply link
            const applyLink = card.querySelector('.btn-apply-naukri');
            const applyHref = applyLink ? applyLink.href : '#';

            // Extract description
            const descEl = card.querySelector('.job-desc-naukri');
            const desc = descEl ? descEl.innerText.trim() : '';

            // Set initial saved state (show if already saved)
            if (isJobSaved(jobId)) {
                btn.classList.replace('far', 'fas');
                btn.style.color = '#2563eb';
                btn.title = 'Saved — click to remove';
            }

            btn.style.cursor = 'pointer';
            btn.style.fontSize = '18px';
            btn.style.transition = 'color 0.2s ease, transform 0.15s ease';

            btn.addEventListener('click', function (e) {
                e.stopPropagation();
                e.preventDefault();

                // ── Check LOGIN ──────────────────────────────────────
                const user = getLoggedInUser();
                if (!user) {
                    showLoginModal();
                    return;
                }
                // ────────────────────────────────────────────────────

                if (isJobSaved(jobId)) {
                    // Already saved → unsave
                    unsaveJob(jobId);
                    btn.classList.replace('fas', 'far');
                    btn.style.color = '';
                    btn.title = 'Save Job';
                    btn.style.transform = 'scale(0.85)';
                    setTimeout(() => { btn.style.transform = ''; }, 200);
                    showToast('Job removed from saved list', 'remove');
                } else {
                    // Save it
                    const saved = saveJob({
                        id: jobId,
                        title: title,
                        company: company,
                        desc: desc,
                        applyLink: applyHref,
                        savedAt: new Date().toISOString(),
                        savedBy: user.user_id || user.id || 'user'
                    });
                    if (saved) {
                        btn.classList.replace('far', 'fas');
                        btn.style.color = '#2563eb';
                        btn.title = 'Saved — click to remove';
                        btn.style.transform = 'scale(1.2)';
                        setTimeout(() => { btn.style.transform = ''; }, 200);
                        showToast('Job saved successfully!', 'success');
                    }
                }
            });
        });
    }

    // Export for saved_jobs page
    window.EasyJobsBookmarks = { getSavedJobs, unsaveJob, isJobSaved };

    // Init
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initBookmarks);
    } else {
        initBookmarks();
    }

})();
