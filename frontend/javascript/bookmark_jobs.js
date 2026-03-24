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

        const existing = document.getElementById('ej-login-modal');
        if (existing) existing.remove();

        const overlay = document.createElement('div');
        overlay.id = 'ej-login-modal';

        overlay.style.cssText = [
            'position:fixed', 'inset:0', 'z-index:100000',
            'background:rgba(15,23,42,0.6)',
            'display:flex', 'align-items:center', 'justify-content:center',
            'backdrop-filter:blur(4px)'
        ].join(';');

        overlay.innerHTML = `
            <div style="background:white;padding:30px;border-radius:16px;text-align:center;max-width:380px;width:90%;">
                <h2>Login to Save Jobs</h2>
                <p>Please login or register to save jobs.</p>
                <a href="frontend/pages/login.html">Login</a>
                <br><br>
                <a href="frontend/pages/register.html">Create Account</a>
            </div>
        `;

        document.body.appendChild(overlay);

        overlay.addEventListener('click', function (e) {
            if (e.target === overlay) overlay.remove();
        });
    }

    // ─── Main: Init Bookmark Buttons ─────────────────────────────────────────────

    function initBookmarks() {

        document.querySelectorAll('.btn-save-naukri').forEach(btn => {

            const card = btn.closest('.job-card');
            if (!card) return;

            const titleEl = card.querySelector('.job-title');
            const companyEl = card.querySelector('.company-name');

            const title = titleEl ? titleEl.innerText.trim() : 'Unknown';
            const company = companyEl ? companyEl.innerText.trim() : 'Unknown';

            const jobId = (title + '-' + company)
                .toLowerCase()
                .replace(/\s+/g, '-')
                .replace(/[^a-z0-9-]/g, '');

            if (isJobSaved(jobId)) {
                btn.classList.replace('far', 'fas');
                btn.style.color = '#2563eb';
            }

            btn.addEventListener('click', function (e) {

                e.stopPropagation();
                e.preventDefault();

                const user = getLoggedInUser();

                if (!user) {
                    showLoginModal();
                    return;
                }

                if (isJobSaved(jobId)) {

                    unsaveJob(jobId);

                    btn.classList.replace('fas', 'far');
                    btn.style.color = '';

                    showToast('Job removed from saved list', 'remove');

                } else {

                    const saved = saveJob({
                        id: jobId,
                        title: title,
                        company: company,
                        savedAt: new Date().toISOString()
                    });

                    if (saved) {
                        btn.classList.replace('far', 'fas');
                        btn.style.color = '#2563eb';
                        showToast('Job saved successfully!', 'success');
                    }

                }

            });

        });

    }

    window.EasyJobsBookmarks = { getSavedJobs, unsaveJob, isJobSaved };

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initBookmarks);
    } else {
        initBookmarks();
    }

})();