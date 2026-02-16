const API_BASE_URL = "http://127.0.0.1:8000/api";

document.addEventListener("DOMContentLoaded", () => {
    const postJobForm = document.querySelector("form");

    if (postJobForm) {
        postJobForm.addEventListener("submit", async (e) => {
            e.preventDefault();

            const formData = {
                job_title: postJobForm.querySelectorAll("input")[0].value,
                company_name: postJobForm.querySelectorAll("input")[1].value,
                location: postJobForm.querySelectorAll("input")[2].value,
                job_type: postJobForm.querySelectorAll("select")[0].value,
                // Parse experience (e.g. "0-2 years" -> 0)
                experience_level: parseInt(postJobForm.querySelectorAll("select")[1].value) || 0,
                // Parse salary (e.g. "5 LPA" -> 5)
                salary: parseInt(postJobForm.querySelectorAll("input")[3].value.replace(/\D/g, '')) || 0,
                description: postJobForm.querySelector("textarea").value,
                work_mode: "Office" // Default
            };

            try {
                const response = await fetch(`${API_BASE_URL}/jobs/`, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify(formData)
                });

                if (response.ok) {
                    alert("Job posted successfully!");
                    window.location.href = "/jobs.html";
                } else {
                    const errorData = await response.json();
                    alert(`Failed to post job: ${errorData.detail || "Error occurred"}`);
                }
            } catch (error) {
                console.error("Post job error:", error);
                alert("An error occurred while posting the job.");
            }
        });
    }
});
