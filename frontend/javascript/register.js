// Utility to get the correct API URL
const getAPIURL = () => {
    if (window.getEasyJobsAPI) return window.getEasyJobsAPI();
    return "/api";
};

document.addEventListener("DOMContentLoaded", () => {
    const userTypeSelect = document.getElementById("usertype");
    const employerFields = document.getElementById("employerFields");
    const createAccountBtn = document.getElementById("createAccountBtn");
    const formSubtitle = document.getElementById("formSubtitle");
    const imageSubtitle = document.getElementById("imageSubtitle");

    // ─── Show/Hide Employer Fields based on user type ───────────────────────
    if (userTypeSelect && employerFields) {
        // Initially hide employer section
        employerFields.style.display = "none";
        employerFields.style.opacity = "0";

        userTypeSelect.addEventListener("change", () => {
            const selectedType = userTypeSelect.value;
            toggleEmployerFields(selectedType);
        });

        // Handle URL Params (e.g. ?role=employer)
        const urlParams = new URLSearchParams(window.location.search);
        const roleParam = urlParams.get('role');
        if (roleParam === 'employer') {
            userTypeSelect.value = 'employer';
            toggleEmployerFields('employer');
        }
    }

    function toggleEmployerFields(selectedType) {
        if (selectedType === "employer") {
            // Show employer fields with animation
            employerFields.style.display = "block";
            setTimeout(() => {
                employerFields.style.opacity = "1";
                employerFields.style.transform = "translateY(0)";
            }, 10);

            // Update page text for employer context
            if (formSubtitle) formSubtitle.textContent = "Set up your employer account to start hiring";
            if (imageSubtitle) imageSubtitle.textContent = "Post jobs and connect with thousands of talented candidates";
            if (createAccountBtn) createAccountBtn.textContent = "Create Employer Account";

            // Employer inputs dynamic required toggle
            const employerInputs = ['company_name', 'industry', 'company_size', 'designation'];
            employerInputs.forEach(id => {
                const el = document.getElementById(id);
                if (el) el.required = true;
            });

        } else {
            // Hide employer fields
            employerFields.style.opacity = "0";
            employerFields.style.transform = "translateY(-10px)";
            setTimeout(() => {
                employerFields.style.display = "none";
            }, 300);

            // Reset page text for job seeker context
            if (formSubtitle) formSubtitle.textContent = "Start your journey to find the perfect job";
            if (imageSubtitle) imageSubtitle.textContent = "Connect with thousands of employers and discover your perfect career opportunity";
            if (createAccountBtn) createAccountBtn.textContent = "Create Account";

            // Remove required property
            const employerInputs = ['company_name', 'industry', 'company_size', 'designation'];
            employerInputs.forEach(id => {
                const el = document.getElementById(id);
                if (el) el.required = false;
            });
        }
    }

    // ─── Form Submission ─────────────────────────────────────────────────────
    const registerForm = document.getElementById("registerForm");
    if (registerForm) {
        registerForm.addEventListener("submit", async (e) => {
            e.preventDefault();

            const firstName = document.getElementById("firstname").value.trim();
            const lastName = document.getElementById("lastname").value.trim();
            const email = document.getElementById("email").value.trim();
            const phone = document.getElementById("phone").value.trim();
            const password = document.getElementById("password").value;
            const confirmPassword = document.getElementById("confirmpassword").value;
            const userType = document.getElementById("usertype").value;
            const termsChecked = document.getElementById("terms").checked;

            // ── Basic validation ──
            if (!firstName || !lastName || !email || !phone || !password || !confirmPassword || !userType) {
                alert("Please fill in all required fields.");
                return;
            }

            // Phone length check to prevent HTTP 422 error
            if (phone.length < 10 || phone.length > 15) {
                alert("Phone number must be between 10 and 15 digits.");
                document.getElementById("phone").focus();
                return;
            }

            if (password.length < 6) {
                alert("Password must be at least 6 characters long.");
                return;
            }

            if (password !== confirmPassword) {
                alert("Passwords do not match!");
                return;
            }

            if (!termsChecked) {
                alert("Please agree to the Terms & Conditions.");
                return;
            }

            // ── Employer-specific validation ──
            if (userType === "employer") {
                const companyName = document.getElementById("company_name") ? document.getElementById("company_name").value.trim() : "";
                const industry = document.getElementById("industry") ? document.getElementById("industry").value : "";
                const companySize = document.getElementById("company_size") ? document.getElementById("company_size").value : "";
                const designation = document.getElementById("designation") ? document.getElementById("designation").value.trim() : "";

                if (!companyName) {
                    alert("Please enter your Company Name.");
                    document.getElementById("company_name").focus();
                    return;
                }
                if (!industry) {
                    alert("Please select your Industry.");
                    document.getElementById("industry").focus();
                    return;
                }
                if (!companySize) {
                    alert("Please select your Company Size.");
                    document.getElementById("company_size").focus();
                    return;
                }
                if (!designation) {
                    alert("Please enter your Designation (e.g. HR Manager, CEO).");
                    document.getElementById("designation").focus();
                    return;
                }
            }

            // ── Build payload ──
            const companyName = userType === "employer" && document.getElementById("company_name") ? document.getElementById("company_name").value.trim() : "";
            const industry = userType === "employer" && document.getElementById("industry") ? document.getElementById("industry").value : "";
            const companySize = userType === "employer" && document.getElementById("company_size") ? document.getElementById("company_size").value : "";
            const designation = userType === "employer" && document.getElementById("designation") ? document.getElementById("designation").value.trim() : "";
            const companyWebsite = userType === "employer" && document.getElementById("company_website") ? document.getElementById("company_website").value.trim() : "";

            const userData = {
                first_name: firstName,
                last_name: lastName,
                email: email,
                phone_number: phone,
                password: password,
                confirm_password: confirmPassword,
                role: userType,
                image: "",
                designation: designation || null,
                bio: userType === "employer" ? `Hiring for ${companyName}` : "",
                company_name: companyName || null,
                company_size: companySize || null,
                industry: industry || null,
                company_website: companyWebsite || null
            };

            const originalText = createAccountBtn.innerText;
            createAccountBtn.innerText = "Creating...";
            createAccountBtn.disabled = true;

            try {
                const API_BASE_URL = getAPIURL();
                const response = await fetch(`${API_BASE_URL}/auth/signup`, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        "Accept": "application/json"
                    },
                    body: JSON.stringify(userData)
                });

                const contentType = response.headers.get("content-type");

                if (response.ok) {
                    const newUser = await response.json();

                    // If employer, also save extra details to localStorage for dashboard use
                    if (userType === "employer") {
                        localStorage.setItem("employer_company_info", JSON.stringify({
                            company_name: companyName,
                            industry: industry,
                            company_size: companySize,
                            designation: designation,
                            company_website: companyWebsite
                        }));
                    }

                    alert(
                        userType === "employer"
                            ? `Employer account created successfully!\nWelcome, ${firstName}!\nYou can now post jobs from your Dashboard.`
                            : "Account created successfully! Redirecting to login..."
                    );
                    window.location.href = "../pages/login.html";

                } else {
                    if (contentType && contentType.includes("application/json")) {
                        const error = await response.json();
                        console.error("Signup Error Details:", error);

                        let errorMsg = "Registration Failed: ";
                        if (typeof error.detail === "string") {
                            errorMsg += error.detail;
                        } else if (Array.isArray(error.detail)) {
                            errorMsg += error.detail.map(err => `${err.loc.join(".")}: ${err.msg}`).join(", ");
                        } else {
                            errorMsg += "Check your inputs.";
                        }
                        alert(errorMsg);
                    } else {
                        const textError = await response.text();
                        console.error("Server Error:", textError);
                        alert("Server Error: The backend encountered an unexpected issue (500). Please check server logs.");
                    }
                    createAccountBtn.innerText = originalText;
                    createAccountBtn.disabled = false;
                }
            } catch (err) {
                console.error("Fetch Error:", err);
                alert(`Network Error: ${err.message}\n\nTo fix this:\n1. Open your terminal\n2. Run: python -m uvicorn main:app --reload\n3. Keep the terminal open while using the site.`);
                createAccountBtn.innerText = originalText;
                createAccountBtn.disabled = false;
            }
        });
    }
});
