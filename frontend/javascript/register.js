"use strict";

/* ─── Utility ─────────────────────────────────────────────── */
const getAPIURL = () => window.getEasyJobsAPI ? window.getEasyJobsAPI() : "/api";

/* ─── DOM Ready ──────────────────────────────────────────── */
document.addEventListener("DOMContentLoaded", () => {
    const userTypeSelect = document.getElementById("usertype");
    const employerFields = document.getElementById("employerFields");
    const createAccountBtn = document.getElementById("createAccountBtn");
    const formSubtitle = document.getElementById("formSubtitle");
    const imageSubtitle = document.getElementById("imageSubtitle");

    /* ─── Show/Hide Employer Fields ────────────────────────── */
    const toggleEmployerFields = (selectedType) => {
        if (!employerFields) return;
        if (selectedType === "employer") {
            employerFields.style.display = "block";
            setTimeout(() => {
                employerFields.style.opacity = "1";
                employerFields.style.transform = "translateY(0)";
            }, 10);

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
            employerFields.style.opacity = "0";
            employerFields.style.transform = "translateY(-10px)";
            setTimeout(() => employerFields.style.display = "none", 300);

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
    };

    // Initial hide
    if (employerFields) {
        employerFields.style.display = "none";
        employerFields.style.opacity = "0";
    }

    // Event listener for user type select
    if (userTypeSelect) {
        userTypeSelect.addEventListener("change", () => toggleEmployerFields(userTypeSelect.value));
    }

    // Handle URL param ?role=employer
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('role') === 'employer') {
        if (userTypeSelect) userTypeSelect.value = 'employer';
        toggleEmployerFields('employer');
    }

    /* ─── Form Submission ─────────────────────────────────── */
    const registerForm = document.getElementById("registerForm");
    if (!registerForm) return;

    registerForm.addEventListener("submit", async (e) => {
        e.preventDefault();

        const firstName = document.getElementById("firstname").value.trim();
        const lastName = document.getElementById("lastname").value.trim();
        const email = document.getElementById("email").value.trim();
        const phone = document.getElementById("phone").value.trim();
        const password = document.getElementById("password").value;
        const confirmPassword = document.getElementById("confirmpassword").value;
        const userType = userTypeSelect ? userTypeSelect.value : "";
        const termsChecked = document.getElementById("terms").checked;

        // Basic validation
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

        // Employer-specific validation
        let companyName="", industry="", companySize="", designation="", companyWebsite="";
        if (userType === "employer") {
            companyName = document.getElementById("company_name")?.value.trim() || "";
            industry = document.getElementById("industry")?.value || "";
            companySize = document.getElementById("company_size")?.value || "";
            designation = document.getElementById("designation")?.value.trim() || "";
            companyWebsite = document.getElementById("company_website")?.value.trim() || "";

            if (!companyName) { alert("Please enter your Company Name."); return; }
            if (!industry) { alert("Please select your Industry."); return; }
            if (!companySize) { alert("Please select your Company Size."); return; }
            if (!designation) { alert("Please enter your Designation."); return; }
        }

        // Payload
        const payload = {
            first_name: firstName,
            last_name: lastName,
            email,
            phone_number: phone,
            password,
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
            const response = await fetch(`${getAPIURL()}/auth/signup`, {
                method: "POST",
                headers: { "Content-Type": "application/json", "Accept": "application/json" },
                body: JSON.stringify(payload)
            });

            const contentType = response.headers.get("content-type");

            if (response.ok) {
                if (userType === "employer") {
                    localStorage.setItem("employer_company_info", JSON.stringify({
                        company_name: companyName,
                        industry,
                        company_size: companySize,
                        designation,
                        company_website: companyWebsite
                    }));
                    alert(`Employer account created! Welcome, ${firstName}. You can now post jobs.`);
                } else {
                    alert("Account created successfully! Redirecting to login...");
                }
                window.location.href="/frontend/pages/login.html";

            } else {
                if (contentType && contentType.includes("application/json")) {
                    const error = await response.json();
                    let msg = "Registration Failed: ";
                    if (typeof error.detail === "string") msg += error.detail;
                    else if (Array.isArray(error.detail)) msg += error.detail.map(err => `${err.loc.join(".")}: ${err.msg}`).join(", ");
                    else msg += "Check your inputs.";
                    alert(msg);
                } else {
                    const textError = await response.text();
                    console.error("Server Error:", textError);
                    alert("Server Error: 500. Please check backend logs.");
                }
                createAccountBtn.innerText = originalText;
                createAccountBtn.disabled = false;
            }
        } catch (err) {
            console.error("Fetch Error:", err);
            alert(`Network Error: ${err.message}\nMake sure backend is running (uvicorn).`);
            createAccountBtn.innerText = originalText;
            createAccountBtn.disabled = false;
        }
    });
});