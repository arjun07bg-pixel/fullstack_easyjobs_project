/**
 * Saved Jobs Manager
 * Fetches and displays jobs saved by the user.
 */

document.addEventListener("DOMContentLoaded", () => {
    const getAPIURL = () => {
        if (window.getEasyJobsAPI) return window.getEasyJobsAPI();
        return "/api";
    };

    const API_BASE_URL = getAPIURL();
    const userString = localStorage.getItem("user");
    const user = userString ? JSON.parse(userString) : null;

    if (!user || !user.user_id) {
        console.warn("No user ID found, redirecting to login.");
        window.location.href = "./login.html";
        return;
    }

    const container = document.getElementById("saved-jobs-container");

    async function fetchSavedJobs() {
        if (!container) return;

        try {
            const res = await fetch(`${API_BASE_URL}/saved-jobs/${user.user_id}`);
            if (!res.ok) throw new Error("Failed to fetch saved jobs");

            const jobs = await res.json();

            if (jobs.length === 0) {
                container.innerHTML = `
                    <div class="empty-state">
                        <i class="far fa-bookmark"></i>
                        <p>You haven't saved any jobs yet.</p>
                        <a href="./jobs.html" class="btn btn-apply" style="display:inline-flex; width:auto; margin:20px auto;">Browse Jobs</a>
                    </div>
                `;
                return;
            }

            container.innerHTML = jobs.map(job => `
                <div class="job-card" id="job-${job.job_id}">
                    <div class="job-info">
                        <h3>${job.job_title}</h3>
                        <p><i class="fas fa-building"></i> ${job.company_name}</p>
                        <p><i class="fas fa-map-marker-alt"></i> ${job.location || 'Remote'}</p>
                        <div class="job-meta">
                            <span class="meta-tag">${job.job_type || 'Full Time'}</span>
                            <span class="meta-tag">${job.work_mode || 'Hybrid'}</span>
                            <span class="meta-tag">₹${job.salary || 0} LPA</span>
                        </div>
                    </div>
                    <div class="actions">
                        <a href="./apply_home.html?job_id=${job.job_id}&title=${encodeURIComponent(job.job_title)}&company=${encodeURIComponent(job.company_name)}&location=${encodeURIComponent(job.location || 'Remote')}&type=${encodeURIComponent(job.job_type || 'Full Time')}" class="btn btn-apply">Apply Now</a>
                        <button onclick="unsaveJob(${job.job_id})" class="btn btn-unsave"><i class="fas fa-trash"></i> Remove</button>
                    </div>
                </div>
            `).join("");

        } catch (err) {
            console.error("Saved Jobs Fetch Error:", err);
            container.innerHTML = `<div class="empty-state"><p>Error loading jobs. Please check your connection and refresh.</p></div>`;
        }
    }

    window.unsaveJob = async function (jobId) {
        if (!confirm("Remove this job from your saved list?\nஇந்த வேலையை சேமிக்கப்பட்ட பட்டியலில் இருந்து நீக்க வேண்டுமா?")) return;

        try {
            const res = await fetch(`${API_BASE_URL}/saved-jobs/${user.user_id}/${jobId}`, {
                method: "DELETE"
            });
            if (res.ok) {
                const element = document.getElementById(`job-${jobId}`);
                if (element) {
                    element.style.opacity = '0';
                    element.style.transform = 'translateX(20px)';
                    setTimeout(() => {
                        element.remove();
                        if (document.querySelectorAll(".job-card").length === 0) {
                            fetchSavedJobs();
                        }
                    }, 300);
                }
                if (typeof showMessage === 'function') {
                    showMessage("Job removed from saved list.\nவேலை பட்டியலிலிருந்து நீக்கப்பட்டது.", "info");
                }
            } else {
                alert("Failed to remove job.");
            }
        } catch (err) {
            console.error("Unsave Job Error:", err);
            alert("Network error. Could not remove job.");
        }
    };

    fetchSavedJobs();
});
