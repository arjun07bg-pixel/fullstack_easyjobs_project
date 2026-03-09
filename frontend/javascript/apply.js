// Utility to get the correct API URL (Port 8000 for Python backend)
const getAPIURL = () => {
    if (window.getEasyJobsAPI) return window.getEasyJobsAPI();
    return "/api";
};

document.addEventListener("DOMContentLoaded", async () => {

    const API_BASE_URL = getAPIURL(); // ✅ central API URL

    const applyForm = document.getElementById("applyForm");
    const resumeInput = document.getElementById("resume");
    const fileNameDisplay = document.getElementById("file-name-display");

    const urlParams = new URLSearchParams(window.location.search);
    let jobId = urlParams.get("job_id");

    const userString = localStorage.getItem("user");
    const user = userString ? JSON.parse(userString) : null;

    let currentJobDetails = null;

    // ───────────────── EMPLOYER BLOCK ─────────────────
    if (user && (user.role === "employer" || user.role === "admin")) {

        if (applyForm) applyForm.style.display = "none";

        const sidebar = document.querySelector(".sidebar");

        if (sidebar) {
            sidebar.innerHTML = `
                <div style="padding:2rem;text-align:center;">
                    <h3>Employers Cannot Apply for Jobs</h3>
                    <p>You are logged in as an Employer.</p>
                    <a href="./dashboard.html">Go to Dashboard</a>
                </div>
            `;
        }

        console.warn("Employer account blocked from applying.");
        return;
    }

    // ───────────────── PROFILE CHECK ─────────────────
    if (user) {

        const hasPhoto = user.image && user.image.length > 100;
        const hasExp = user.experience !== null && user.experience !== undefined;
        const hasLocation = user.location && user.location.trim() !== "";

        if (!hasPhoto || !hasExp || !hasLocation) {

            alert("Please complete your profile before applying.");

            setTimeout(() => {
                window.location.href = "./profile.html";
            }, 2000);

            return;
        }
    }

    // ───────────────── FETCH JOB DETAILS ─────────────────

    const fetchJobDetails = async () => {

        try {

            const response = await fetch(`${API_BASE_URL}/jobs/${jobId}`);

            if (response.ok) {

                const job = await response.json();
                currentJobDetails = job;

                console.log("Job Loaded:", job);

                return job;

            } else {

                console.error("Job not found");
                return null;

            }

        } catch (error) {

            console.error("Job fetch error:", error);
            return null;

        }
    };

    if (jobId) {
        await fetchJobDetails();
    }

    // ───────────────── FILE VALIDATION ─────────────────

    if (resumeInput) {

        resumeInput.addEventListener("change", (e) => {

            if (e.target.files.length > 0) {

                const file = e.target.files[0];
                const maxSize = 5 * 1024 * 1024;

                if (file.size > maxSize) {

                    alert("File too large. Max 5MB.");
                    resumeInput.value = "";
                    return;

                }

                fileNameDisplay.innerText = file.name;

            }

        });

    }

    // ───────────────── FORM VALIDATION ─────────────────

    function validateForm() {

        const fullName = document.getElementById("full_name").value.trim();
        const email = document.getElementById("email").value.trim();
        const phone = document.getElementById("phone").value.trim();

        if (!fullName) {
            alert("Enter your name");
            return false;
        }

        if (!email.includes("@")) {
            alert("Enter valid email");
            return false;
        }

        if (phone.length < 10) {
            alert("Enter valid phone");
            return false;
        }

        if (!resumeInput.files[0]) {
            alert("Upload resume");
            return false;
        }

        return true;
    }

    // ───────────────── FORM SUBMIT ─────────────────

    if (applyForm) {

        applyForm.addEventListener("submit", async (e) => {

            e.preventDefault();

            if (!user) {

                alert("Please login first");
                window.location.href = "./login.html";
                return;

            }

            if (!validateForm()) return;

            const resumeFile = resumeInput.files[0];

            const payload = {

                user_id: user.user_id,
                job_id: parseInt(jobId),

                name: document.getElementById("full_name").value.trim(),
                email: document.getElementById("email").value.trim(),

                phone_number: document.getElementById("phone").value.trim(),
                resume: resumeFile.name,

                company_name: currentJobDetails?.company_name || "",
                job_title: currentJobDetails?.job_title || "",

                status: "applied"

            };

            try {

                const response = await fetch(`${API_BASE_URL}/applications/`, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify(payload)
                });

                if (response.ok) {

                    const result = await response.json();

                    console.log("Application Success:", result);

                    alert("Application submitted successfully!");

                    window.location.href = "./submit.html";

                } else {

                    console.error("Submission failed");
                    alert("Submission failed");

                }

            } catch (err) {

                console.error("Network Error:", err);
                alert("Server connection error");

            }

        });

    }

    console.log("EasyJobs Application Page Loaded");

});