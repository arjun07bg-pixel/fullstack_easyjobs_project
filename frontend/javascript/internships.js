"use strict";

const getAPIURL = () => {
    if (window.getEasyJobsAPI) return window.getEasyJobsAPI();
    return "/api";
};

document.addEventListener("DOMContentLoaded", async () => {
    const internshipsContainer = document.getElementById("internships-container");
    const internshipsCount = document.getElementById("internships-count-text");
    const clearFiltersBtn = document.getElementById("clear-filters");
    const filterProfile = document.getElementById("filter-profile");
    const filterLocation = document.getElementById("filter-location");
    const filterWfh = document.getElementById("filter-wfh");
    const filterPartTime = document.getElementById("filter-part-time");
    const filterStipend = document.getElementById("filter-stipend");

    if (!internshipsContainer) return;

    let savedJobIds = [];
    const userString = localStorage.getItem("user");
    const user = userString ? JSON.parse(userString) : {};
    let allInternships = [];

    // Fetch saved jobs
    if (user.user_id) {
        try {
            const sjRes = await fetch(`${getAPIURL()}/saved-jobs/${user.user_id}`);
            if (sjRes.ok) {
                const savedData = await sjRes.json();
                savedJobIds = savedData.map(j => j.job_id);
            }
        } catch (err) {
            console.error("Failed to fetch saved jobs:", err);
        }
    }

    const fetchInternships = async () => {
        try {
            internshipsContainer.innerHTML = `
                <div style="text-align: center; padding: 60px 20px;">
                    <i class="fas fa-spinner fa-spin" style="font-size: 3rem; color: #008BDC; margin-bottom: 20px;"></i>
                    <h3 style="color: #333;">Loading Internships...</h3>
                </div>`;
                
            const response = await fetch(`${getAPIURL()}/jobs/`);
            if (response.ok) {
                const allJobs = await response.json();
                allInternships = allJobs.filter(job => job.job_type === "Internship" || (job.job_title && job.job_title.toLowerCase().includes("intern")));
                
                renderInternships();
            } else {
                internshipsContainer.innerHTML = `<div style="text-align:center; padding: 40px; color: #ef4444;">Failed to load internships</div>`;
            }
        } catch (err) {
            internshipsContainer.innerHTML = `<div style="text-align:center; padding: 40px; color: #ef4444;">Error connecting to server. Please try again.</div>`;
        }
    };

    const renderInternships = () => {
        internshipsContainer.innerHTML = "";
        
        let filtered = allInternships.filter(intern => {
            let match = true;
            if (filterProfile && filterProfile.value.trim() && !intern.job_title.toLowerCase().includes(filterProfile.value.trim().toLowerCase())) match = false;
            if (filterLocation && filterLocation.value.trim() && !intern.location.toLowerCase().includes(filterLocation.value.trim().toLowerCase())) match = false;
            
            if (filterWfh && filterWfh.checked && !intern.location.toLowerCase().includes("home") && !intern.location.toLowerCase().includes("remote") && intern.work_mode !== "Remote") match = false;
            if (filterPartTime && filterPartTime.checked && intern.job_type && !intern.job_type.toLowerCase().includes("part time")) match = false;
            
            const minStipend = filterStipend ? parseInt(filterStipend.value) : 0;
            if (minStipend > 0) {
                if (!intern.salary || intern.salary < minStipend) match = false;
            }
            return match;
        });

        if (internshipsCount) {
            internshipsCount.innerText = `${filtered.length} internships matching your choice`;
        }

        if (filtered.length === 0) {
            internshipsContainer.innerHTML = `<div style="text-align:center; padding: 40px; color: #666; font-size: 1.1rem;">No internships match your filters.</div>`;
            return;
        }

        let html = "";
        filtered.forEach(intern => {
            const isSaved = savedJobIds.includes(intern.job_id);
            const applyLink = `/frontend/pages/apply_home.html?job_id=${intern.job_id}&title=${encodeURIComponent(intern.job_title)}&company=${encodeURIComponent(intern.company_name)}&location=${encodeURIComponent(intern.location)}&stipend=${intern.salary || 0}&type=Internship`;

            const cardHtml = `
            <div class="is-card">
                <div class="is-card-header">
                        <div>
                                <div class="is-title">${intern.job_title}</div>
                                <div class="is-company">${intern.company_name}</div>
                        </div>
                        <div style="background: #f1f5f9; border: 1px solid #e2e8f0; width: 45px; height: 45px; border-radius: 8px; display: flex; align-items: center; justify-content: center; font-weight: bold; color: #334155; font-size: 18px;">
                                ${intern.company_name ? intern.company_name.charAt(0).toUpperCase() : '?'}
                        </div>
                </div>
                <div class="is-location"><i class="fas fa-map-marker-alt"></i> ${intern.location || 'Remote'}</div>

                <div class="is-details-row">
                        <div class="detail-item">
                                <span class="detail-label">START DATE</span>
                                <span class="detail-value">Immediately</span>
                        </div>
                        <div class="detail-item">
                                <span class="detail-label">DURATION</span>
                                <span class="detail-value">6 Months</span>
                        </div>
                        <div class="detail-item">
                                <span class="detail-label">STIPEND</span>
                                <span class="detail-value">₹ ${intern.salary || 'Not Disclosed'} ${intern.salary ? '/month' : ''}</span>
                        </div>
                </div>

                <div class="is-tags">
                        <span class="is-tag">${intern.job_type || 'Internship'}</span>
                </div>

                <div class="is-card-footer" style="display: flex; justify-content: flex-end; align-items: center; gap: 15px;">
                        <button class="save-intern-btn" data-id="${intern.job_id}" style="background: none; border: none; font-size: 15px; cursor: pointer; display: flex; align-items: center; gap: 6px; font-weight: 500; transition: 0.2s; color: ${isSaved ? '#16a34a' : '#64748b'};">
                            <i class="${isSaved ? 'fas' : 'far'} fa-bookmark"></i> <span class="save-text">${isSaved ? 'Saved' : 'Save'}</span>
                        </button>
                        <a href="${applyLink}" class="is-view-btn" style="background:#008BDC; color:white; padding:8px 18px; border-radius:4px; text-decoration:none; font-weight: 600;">View details <i class="fas fa-chevron-right" style="font-size: 12px; margin-left: 4px;"></i></a>
                </div>
            </div>`;
            internshipsContainer.insertAdjacentHTML('beforeend', cardHtml);
        });

        // Add event listeners to newly created save buttons
        const saveBtns = internshipsContainer.querySelectorAll('.save-intern-btn');
        saveBtns.forEach(btn => {
            btn.addEventListener('click', async (e) => {
                e.preventDefault();
                if (!user.user_id) {
                    alert("Please login to save this internship.");
                    window.location.href="/frontend/pages/login.html";
                    return;
                }
                
                const jobId = parseInt(btn.getAttribute('data-id'));
                if (savedJobIds.includes(jobId)) return;

                btn.disabled = true;
                btn.style.opacity = "0.7";

                try {
                    const res = await fetch(`${getAPIURL()}/saved-jobs/`, {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ user_id: user.user_id, job_id: jobId })
                    });
                    
                    if (res.ok) {
                        savedJobIds.push(jobId);
                        btn.innerHTML = '<i class="fas fa-bookmark"></i> <span class="save-text">Saved</span>';
                        btn.style.color = "#16a34a";
                        // Toaster notification logic 
                        if (typeof window.showMessage === "function") {
                             window.showMessage("Internship saved successfully!", "success");
                        } else {
                             // Fallback
                             alert("Internship saved successfully!");
                        }
                    } else {
                        const err = await res.json();
                        alert(err.detail || "Error saving internship");
                        btn.disabled = false;
                        btn.style.opacity = "1";
                    }
                } catch (e) {
                    alert("Network error");
                    btn.disabled = false;
                    btn.style.opacity = "1";
                }
            });
        });

    };

    fetchInternships();

    // Event Listeners for Filters
    if (filterProfile) filterProfile.addEventListener("input", renderInternships);
    if (filterLocation) filterLocation.addEventListener("input", renderInternships);
    if (filterWfh) filterWfh.addEventListener("change", renderInternships);
    if (filterPartTime) filterPartTime.addEventListener("change", renderInternships);
    if (filterStipend) filterStipend.addEventListener("change", renderInternships);

    if (clearFiltersBtn) {
        clearFiltersBtn.addEventListener("click", () => {
            if (filterProfile) filterProfile.value = "";
            if (filterLocation) filterLocation.value = "";
            if (filterWfh) filterWfh.checked = false;
            if (filterPartTime) filterPartTime.checked = false;
            if (filterStipend) filterStipend.value = "0";
            renderInternships();
        });
    }
});
