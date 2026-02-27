/**
 * Job Interactions - Handles Saving Jobs & Application Tracking Helpers
 * Uses LocalStorage for persistence without backend dependency.
 */

const STORAGE_KEYS = {
    SAVED_JOBS: 'easyjobs_saved_jobs',
    APPLICATIONS: 'easyjobs_applications'
};

// --- Saved Jobs Logic ---

function toggleSaveJob(jobId, jobData) {
    let savedJobs = JSON.parse(localStorage.getItem(STORAGE_KEYS.SAVED_JOBS) || "[]");
    const index = savedJobs.findIndex(j => j.id === jobId);

    if (index === -1) {
        // Not saved, so save it
        savedJobs.push({
            id: jobId,
            ...jobData,
            savedAt: new Date().toISOString()
        });
        showToast("Job Saved!", "success");
    } else {
        // Already saved, remove it
        savedJobs.splice(index, 1);
        showToast("Job Removed from Saved List", "info");
    }

    localStorage.setItem(STORAGE_KEYS.SAVED_JOBS, JSON.stringify(savedJobs));
    updateSaveButtonUI(jobId);
}

function isJobSaved(jobId) {
    const savedJobs = JSON.parse(localStorage.getItem(STORAGE_KEYS.SAVED_JOBS) || "[]");
    return savedJobs.some(j => j.id === jobId);
}

function updateSaveButtonUI(jobId) {
    // Find all buttons for this job
    const buttons = document.querySelectorAll(`.save-job-btn[data-id="${jobId}"]`);
    const isSaved = isJobSaved(jobId);

    buttons.forEach(btn => {
        if (isSaved) {
            btn.innerHTML = '<i class="fas fa-bookmark"></i> Saved';
            btn.classList.add('saved');
            btn.style.background = '#e0e7ff';
            btn.style.color = '#2563eb';
        } else {
            btn.innerHTML = '<i class="far fa-bookmark"></i> Save';
            btn.classList.remove('saved');
            btn.style.background = '#fff';
            btn.style.color = '#333';
        }
    });
}

// --- Application Logic ---

function saveApplicationLOCALLY(jobData) {
    let apps = JSON.parse(localStorage.getItem(STORAGE_KEYS.APPLICATIONS) || "[]");

    // Check if already applied
    if (!apps.some(a => a.id === jobData.id)) {
        apps.push({
            ...jobData,
            status: 'Applied',
            appliedAt: new Date().toISOString()
        });
        localStorage.setItem(STORAGE_KEYS.APPLICATIONS, JSON.stringify(apps));
    }
}


// --- Helper: Toast Notification ---
function showToast(msg, type = 'info') {
    const div = document.createElement('div');
    div.textContent = msg;
    div.style.position = 'fixed';
    div.style.bottom = '20px';
    div.style.right = '20px';
    div.style.padding = '12px 24px';
    div.style.borderRadius = '8px';
    div.style.color = '#fff';
    div.style.background = type === 'success' ? '#10b981' : '#3b82f6';
    div.style.boxShadow = '0 4px 12px rgba(0,0,0,0.15)';
    div.style.zIndex = '9999';
    div.style.animation = 'fadeIn 0.3s ease';

    document.body.appendChild(div);
    setTimeout(() => {
        div.style.opacity = '0';
        setTimeout(() => div.remove(), 300);
    }, 3000);
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
    // Delegate click for dynamic buttons
    document.body.addEventListener('click', (e) => {
        const btn = e.target.closest('.save-job-btn');
        if (btn) {
            e.preventDefault();
            e.stopPropagation();
            const jobId = btn.dataset.id;
            const jobData = JSON.parse(decodeURIComponent(btn.dataset.job));
            toggleSaveJob(jobId, jobData);
        }
    });
});
