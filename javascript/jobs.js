const API_BASE_URL = "http://127.0.0.1:8000/api";

document.addEventListener("DOMContentLoaded", async () => {
    const urlParams = new URLSearchParams(window.location.search);
    const jobsContainer = document.getElementById("jobs-container");
    const countText = document.getElementById("jobs-count-text");
    const applyBtn = document.getElementById("applyFiltersBtn");
    const clearBtn = document.getElementById("clearAllBtn");
    const paginationContainer = document.getElementById("pagination-container");

    let currentPage = 1;
    const jobsPerPage = 6;

    // Initialize filters from URL parameters
    const initialKeyword = urlParams.get("keyword") || "";
    const initialLocation = urlParams.get("location") || "";

    if (initialKeyword) document.getElementById("keyword-search").value = initialKeyword;
    if (initialLocation) document.getElementById("location-search").value = initialLocation;

    let currentFilters = {
        keyword: initialKeyword,
        location: initialLocation
    };

    // Extra 10 Static Jobs to ensure content is always present
    const extraJobs = [
        { job_id: 1001, job_title: "Senior Software Engineer", company_name: "TCS", location: "Chennai", experience_level: 3, salary: 12, job_type: "Full Time", work_mode: "Hybrid", description: "Design and develop scalable web applications using modern frameworks. Collaborate with cross-functional teams to deliver high-quality software solutions." },
        { job_id: 1002, job_title: "Data Analyst", company_name: "Infosys", location: "Bangalore", experience_level: 2, salary: 8, job_type: "Full Time", work_mode: "Office", description: "Analyze complex datasets to provide actionable insights. Skills in SQL, Python, and Tableau required for this high-impact role." },
        { job_id: 1003, job_title: "UX Designer", company_name: "Wipro", location: "Hyderabad", experience_level: 4, salary: 15, job_type: "Full Time", work_mode: "Remote", description: "Create intuitive user experiences for global clients. Proficiency in Figma and Adobe Creative Suite is essential." },
        { job_id: 1004, job_title: "Backend Developer", company_name: "HCL Tech", location: "Noida", experience_level: 3, salary: 10, job_type: "Full Time", work_mode: "Hybrid", description: "Build robust server-side logic and database schemas. Experience with Node.js and PostgreSQL is preferred." },
        { job_id: 1005, job_title: "Full Stack Developer", company_name: "Zoho", location: "Chennai", experience_level: 1, salary: 7, job_type: "Full Time", work_mode: "Office", description: "Join our core product team to build world-class SaaS applications. Must be comfortable with both frontend and backend technologies." },
        { job_id: 1006, job_title: "Mobile App Developer", company_name: "Freshworks", location: "Chennai", experience_level: 2, salary: 9, job_type: "Full Time", work_mode: "Remote", description: "Develop high-performance iOS and Android applications. Knowledge of Flutter or React Native is a plus." },
        { job_id: 1007, job_title: "Cloud Architect", company_name: "LTIMindtree", location: "Mumbai", experience_level: 5, salary: 22, job_type: "Full Time", work_mode: "Hybrid", description: "Architect and manage AWS/Azure infrastructure for enterprise clients. Strong focus on security and cost-optimization." },
        { job_id: 1008, job_title: "DevOps Engineer", company_name: "Tech Mahindra", location: "Pune", experience_level: 3, salary: 14, job_type: "Full Time", work_mode: "Hybrid", description: "Implement CI/CD pipelines and manage containerized applications using Kubernetes and Docker." },
        { job_id: 1009, job_title: "Cybersecurity Analyst", company_name: "Cognizant", location: "Bangalore", experience_level: 2, salary: 11, job_type: "Full Time", work_mode: "Office", description: "Protect our clients' digital assets from high-level threats. Experience in network security and ethical hacking is required." },
        { job_id: 1010, job_title: "Product Manager", company_name: "Reliance Jio", location: "Mumbai", experience_level: 5, salary: 25, job_type: "Full Time", work_mode: "Office", description: "Lead product strategy for next-gen consumer applications. Strong analytical and communication skills are mandatory." }
    ];

    const fetchJobs = async (page = 1, filters = {}) => {
        try {
            currentPage = page;
            currentFilters = filters;
            const skip = (page - 1) * jobsPerPage;

            let jobs = [];
            let totalJobs = extraJobs.length;

            try {
                let url = `${API_BASE_URL}/jobs/?skip=${skip}&limit=${jobsPerPage}`;
                const hasFilters = filters.keyword || filters.location || filters.experience_level || filters.job_type || filters.work_mode;

                if (hasFilters) {
                    const params = new URLSearchParams();
                    if (filters.keyword) params.append("keyword", filters.keyword);
                    if (filters.location) params.append("location", filters.location);
                    if (filters.experience_level) params.append("experience_level", filters.experience_level);
                    if (filters.job_type) params.append("job_type", filters.job_type);
                    if (filters.work_mode) params.append("work_mode", filters.work_mode);
                    params.append("skip", skip);
                    params.append("limit", jobsPerPage);
                    url = `${API_BASE_URL}/filters/jobs?${params.toString()}`;
                }

                const response = await fetch(url);
                if (response.ok) {
                    const apiJobs = await response.json();

                    // Fetch total count
                    const totalRes = await fetch(`${API_BASE_URL}/jobs/`);
                    if (totalRes.ok) {
                        const allJobs = await totalRes.json();
                        totalJobs = allJobs.length + extraJobs.length;
                    }

                    // Merge with static jobs that match filters
                    const filteredExtra = extraJobs.filter(j => {
                        const matchesKey = !filters.keyword || j.job_title.toLowerCase().includes(filters.keyword.toLowerCase()) || j.company_name.toLowerCase().includes(filters.keyword.toLowerCase());
                        const matchesLoc = !filters.location || j.location.toLowerCase().includes(filters.location.toLowerCase());
                        const matchesExp = !filters.experience_level || j.experience_level >= parseInt(filters.experience_level);
                        const matchesType = !filters.job_type || j.job_type === filters.job_type;
                        const matchesMode = !filters.work_mode || j.work_mode === filters.work_mode;
                        return matchesKey && matchesLoc && matchesExp && matchesType && matchesMode;
                    });

                    // Combine them
                    const combined = [...apiJobs, ...filteredExtra];
                    const start = (page - 1) * jobsPerPage;
                    jobs = combined.slice(0, jobsPerPage); // Simplified paging for combined list
                } else {
                    throw new Error("API Failure");
                }
            } catch (e) {
                console.log("Serving static jobs only due to API error/empty state");
                const filteredExtra = extraJobs.filter(j => {
                    const matchesKey = !filters.keyword || j.job_title.toLowerCase().includes(filters.keyword.toLowerCase()) || j.company_name.toLowerCase().includes(filters.keyword.toLowerCase());
                    const matchesLoc = !filters.location || j.location.toLowerCase().includes(filters.location.toLowerCase());
                    const matchesExp = !filters.experience_level || j.experience_level >= parseInt(filters.experience_level);
                    const matchesType = !filters.job_type || j.job_type === filters.job_type;
                    const matchesMode = !filters.work_mode || j.work_mode === filters.work_mode;
                    return matchesKey && matchesLoc && matchesExp && matchesType && matchesMode;
                });
                totalJobs = filteredExtra.length;
                jobs = filteredExtra.slice((page - 1) * jobsPerPage, page * jobsPerPage);
            }

            renderJobs(jobs);
            renderPagination(totalJobs);
        } catch (error) {
            console.error("Fetch Error:", error);
            jobsContainer.innerHTML = `<div class="no-jobs">Error loading jobs. Please try again.</div>`;
        }
    };

    const renderJobs = (jobs) => {
        jobsContainer.innerHTML = "";
        countText.innerText = `Showing page ${currentPage}`;

        if (jobs.length === 0) {
            jobsContainer.innerHTML = `<div class="no-jobs">No jobs found matching your criteria.</div>`;
            return;
        }

        jobs.forEach(job => {
            const card = document.createElement("div");
            card.className = "job-card";

            const getSkillsByTitle = (title) => {
                const t = title.toLowerCase();
                if (t.includes("engineer") || t.includes("developer")) return ["React", "JavaScript", "TypeScript", "Node.js", "Docker"];
                if (t.includes("data")) return ["Python", "SQL", "Pandas", "Scikit-Learn", "Tableau"];
                if (t.includes("designer") || t.includes("ux")) return ["Figma", "Adobe XD", "Sketch", "UI Design", "UX Research"];
                if (t.includes("hr") || t.includes("recruitment")) return ["Hiring", "Interviews", "Payroll", "Policy"];
                if (t.includes("manager") || t.includes("lead")) return ["Leadership", "Strategy", "Management", "Operations"];
                if (t.includes("cyber") || t.includes("security")) return ["Ethical Hacking", "Networks", "Firewalls", "SOC"];
                return ["Teamwork", "Problem Solving", "Adaptability"];
            };

            const tags = getSkillsByTitle(job.job_title);
            const tagHtml = tags.map(t => `<span class="tag">${t}</span>`).join("");

            card.innerHTML = `
                <div class="job-card-header">
                    <div style="display: flex; gap: 15px; flex: 1;">
                        <div class="company-logo">${job.company_name ? job.company_name.charAt(0).toUpperCase() : '?'}</div>
                        <div class="job-info">
                            <h3 class="job-title">${job.job_title}</h3>
                            <p class="company-name">${job.company_name}</p>
                            <p class="job-location">📍 ${job.location || 'Remote'}</p>
                        </div>
                    </div>
                    <button class="save-btn">💾 Save</button>
                </div>

                <div class="job-details">
                    <div class="job-detail-item">
                        <span class="detail-icon">💼</span>
                        <span>${job.experience_level !== null ? job.experience_level + '+ years' : '0 years'}</span>
                    </div>
                    <div class="job-detail-item">
                        <span class="detail-icon">💰</span>
                        <span>₹${job.salary || 0} LPA</span>
                    </div>
                    <div class="job-detail-item">
                        <span class="detail-icon">🏢</span>
                        <span>${job.job_type || 'Full Time'}</span>
                    </div>
                    <div class="job-detail-item">
                        <span class="detail-icon">🏠</span>
                        <span>${job.work_mode || 'Hybrid'}</span>
                    </div>
                </div>

                <div class="job-tags">${tagHtml}</div>

                <p class="job-description">
                    ${job.description ? job.description.replace(/<[^>]*>/g, '').substring(0, 160) + '...' : "Join our team to work on exciting projects and grow your professional career with us."}
                </p>

                <div class="job-footer">
                    <span class="posted-time">Posted Recently</span>
                    <a href="/apply_home.html?job_id=${job.job_id}&title=${encodeURIComponent(job.job_title)}&company=${encodeURIComponent(job.company_name)}&location=${encodeURIComponent(job.location)}&type=${encodeURIComponent(job.job_type)}&experience=${encodeURIComponent(job.experience_level)}&desc=${encodeURIComponent(job.description || '')}" class="apply-btn">Apply Now</a>
                </div>
            `;
            jobsContainer.appendChild(card);
        });
    };

    const renderPagination = (totalJobsCount) => {
        paginationContainer.innerHTML = "";
        const totalPages = Math.ceil(totalJobsCount / jobsPerPage);

        for (let i = 1; i <= totalPages; i++) {
            const pageBox = document.createElement("a");
            pageBox.href = "#";
            pageBox.className = `page-btn ${i === currentPage ? 'active' : ''}`;
            pageBox.innerText = i;

            pageBox.addEventListener("click", (e) => {
                e.preventDefault();
                if (i !== currentPage) {
                    fetchJobs(i, currentFilters);
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                }
            });

            paginationContainer.appendChild(pageBox);
        }
    };

    // Filter Trigger
    if (applyBtn) {
        applyBtn.addEventListener("click", () => {
            const filters = {
                keyword: document.getElementById("keyword-search").value,
                location: document.getElementById("location-search").value,
                experience_level: document.getElementById("exp-select").value,
                job_type: Array.from(document.querySelectorAll(".type-check:checked")).map(c => c.value)[0] || "",
                work_mode: Array.from(document.querySelectorAll(".mode-check:checked")).map(c => c.value)[0] || ""
            };
            fetchJobs(1, filters);
        });
    }

    if (clearBtn) {
        clearBtn.addEventListener("click", () => {
            document.getElementById("keyword-search").value = "";
            document.getElementById("location-search").value = "";
            document.getElementById("exp-select").selectedIndex = 0;
            document.querySelectorAll("input[type='checkbox']").forEach(c => c.checked = false);
            fetchJobs(1, {});
        });
    }

    // Initial Load
    fetchJobs(1, currentFilters);
});
