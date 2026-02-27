const getBaseURL = () => {
    if (window.location.port !== '8000' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')) {
        return `http://127.0.0.1:8000/api`;
    }
    return "/api";
};
const API_BASE_URL = getBaseURL();

document.addEventListener("DOMContentLoaded", () => {
    const postJobForm = document.getElementById("post-job-form");
    const submitBtn = document.getElementById("submit-btn");

    if (postJobForm) {
        postJobForm.addEventListener("submit", async (e) => {
            e.preventDefault();

            // Collect data from the new IDs
            const jobTitle = document.getElementById("job-title").value;
            const companyName = document.getElementById("company-name").value;
            const category = document.getElementById("job-category").value;
            const vacancies = document.getElementById("vacancies").value;
            const location = document.getElementById("job-location").value;
            const jobType = document.getElementById("job-type").value;
            const workMode = document.getElementById("work-mode").value;
            const experience = document.getElementById("exp-level").value;
            const salary = document.getElementById("salary-range").value;
            const deadline = document.getElementById("deadline").value;
            const website = document.getElementById("company-website").value;
            const applyLink = document.getElementById("apply-link").value;
            const skills = document.getElementById("required-skills").value;
            const description = document.getElementById("job-desc").value;
            const benefits = document.getElementById("benefits").value;

            const formData = {
                job_title: jobTitle,
                company_name: companyName,
                category: category,
                vacancies: parseInt(vacancies) || 1,
                location: location,
                job_type: jobType,
                work_mode: workMode,
                experience_level: parseInt(experience) || 0,
                salary_lpa: parseInt(salary) || 0,
                deadline: deadline,
                company_website: website,
                apply_link: applyLink,
                required_skills: skills,
                description: description,
                benefits: benefits
            };

            // Loading state
            const originalBtnHtml = submitBtn.innerHTML;
            submitBtn.disabled = true;
            submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> <span>Posting...</span>';

            try {
                const response = await fetch(`${API_BASE_URL}/jobs/`, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify(formData)
                });

                if (response.ok) {
                    // Success!
                    alert("Success! Your job has been posted successfully.");
                    window.location.href = "/jobs.html";
                } else {
                    const errorData = await response.json();
                    alert(`Failed to post job: ${errorData.detail || "Server error occurred"}`);
                }
            } catch (error) {
                console.error("Post job error:", error);
                alert("A network error occurred. Please check if the server is running.");
            } finally {
                // Restore button
                submitBtn.disabled = false;
                submitBtn.innerHTML = originalBtnHtml;
            }
        });
    }
});

