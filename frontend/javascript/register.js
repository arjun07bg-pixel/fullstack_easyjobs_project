"use strict";

const getAPIURL = () => {
    return window.getEasyJobsAPI ? window.getEasyJobsAPI() : "http://127.0.0.1:8000/api";
};

document.addEventListener("DOMContentLoaded", () => {
    const userTypeSelect = document.getElementById("usertype");
    const employerFields = document.getElementById("employerFields");
    const createAccountBtn = document.getElementById("createAccountBtn");
    const verifySignupOtpBtn = document.getElementById("verifySignupOtpBtn");
    const registerForm = document.getElementById("registerForm");
    const otpSection = document.getElementById("otpSection");
    const otpInput = document.getElementById("signup-otp");
    const emailInput = document.getElementById("email");
    let timerInterval = null;

    /* ─── Show/Hide Employer Fields ────────────────────────── */
    const toggleEmployerFields = (selectedType) => {
        if (!employerFields) return;
        if (selectedType === "employer") {
            employerFields.style.display = "block";
            const employerInputs = ['company_name', 'industry', 'company_size', 'designation'];
            employerInputs.forEach(id => {
                const el = document.getElementById(id);
                if (el) el.required = true;
            });
        } else {
            employerFields.style.display = "none";
            const employerInputs = ['company_name', 'industry', 'company_size', 'designation'];
            employerInputs.forEach(id => {
                const el = document.getElementById(id);
                if (el) el.required = false;
            });
        }
    };

    if (userTypeSelect) {
        userTypeSelect.addEventListener("change", () => toggleEmployerFields(userTypeSelect.value));
    }

    /* ─── STEP 1: Form Submission (Sign Up) ───────────────── */
    registerForm?.addEventListener("submit", async (e) => {
        e.preventDefault();

        const firstName = document.getElementById("firstname").value.trim();
        const lastName = document.getElementById("lastname").value.trim();
        const email = emailInput.value.trim();
        const phone = document.getElementById("phone").value.trim();
        const password = document.getElementById("password").value;
        const confirmPassword = document.getElementById("confirmpassword").value;
        const userType = userTypeSelect.value;

        const payload = {
            first_name: firstName,
            last_name: lastName,
            email,
            phone_number: phone,
            password,
            confirm_password: confirmPassword,
            role: userType,
            designation: document.getElementById("designation")?.value.trim() || null,
            company_name: document.getElementById("company_name")?.value.trim() || null,
            company_size: document.getElementById("company_size")?.value || null,
            industry: document.getElementById("industry")?.value || null,
            company_website: document.getElementById("company_website")?.value.trim() || null
        };

        createAccountBtn.innerText = "Creating Account...";
        createAccountBtn.disabled = true;

        try {
            const response = await fetch(`${getAPIURL()}/auth/signup`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload)
            });

            const data = await response.json();

            if (response.ok && data.status === "otp_required") {
                // Show OTP Section
                registerForm.style.display = "none";
                otpSection.style.display = "block";
                document.getElementById("otpMsg").innerText = `A 6-digit verification code was sent to ${data.email}`;

                if (data.debug_otp && window.showMessage) {
                    window.showMessage(`[DEV MODE] Verification Code for ${data.email}: ${data.debug_otp}`, "info", true);
                }
                startTimer();
            } else {
                let errorMsg = "Registration Failed.";
                if (data.detail) {
                    if (typeof data.detail === "string") {
                        errorMsg = data.detail;
                    } else if (Array.isArray(data.detail)) {
                        errorMsg = data.detail.map(err => `${err.loc.join('.')}: ${err.msg}`).join('\n');
                    } else if (typeof data.detail === "object") {
                        errorMsg = JSON.stringify(data.detail);
                    }
                }
                alert(errorMsg);
                createAccountBtn.innerText = "Create Account";
                createAccountBtn.disabled = false;
            }
        } catch (err) {
            console.error(err);
            alert("Could not connect to the Backend. Please ensure you have run 'python main.py' in your terminal and it is running on port 8000.");
            createAccountBtn.innerText = "Create Account";
            createAccountBtn.disabled = false;
        }
    });

    /* ─── STEP 2: OTP Verification ────────────────────────── */
    verifySignupOtpBtn?.addEventListener("click", async () => {
        const email = emailInput.value.trim();
        const otp = otpInput.value.trim();

        if (otp.length !== 6) {
            alert("Please enter exactly 6 digits.");
            return;
        }

        verifySignupOtpBtn.innerText = "Verifying...";
        verifySignupOtpBtn.disabled = true;

        try {
            const res = await fetch(`${getAPIURL()}/auth/verify-otp`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, otp })
            });

            const data = await res.json();

            if (res.ok) {
                // Auto-login or redirect
                localStorage.setItem("token", data.access_token);
                localStorage.setItem("user", JSON.stringify(data));
                alert("Email verified! Welcome to EasyJobs.");

                if (data.role === "employer") window.location.href = "postjob_home.html";
                else window.location.href = "../../index.html";
            } else {
                alert(data.detail || "Invalid code.");
                verifySignupOtpBtn.innerText = "Verify & Complete Registration";
                verifySignupOtpBtn.disabled = false;
            }
        } catch (err) {
            alert("Verification failed.");
            verifySignupOtpBtn.innerText = "Verify & Complete Registration";
            verifySignupOtpBtn.disabled = false;
        }
    });

    function startTimer() {
        let timeLeft = 50;
        const timerEl = document.getElementById("timerCount");
        if (!timerEl) return;

        timerEl.innerText = timeLeft;
        if (timerInterval) clearInterval(timerInterval);

        timerInterval = setInterval(() => {
            timeLeft--;
            timerEl.innerText = timeLeft;
            if (timeLeft <= 0) {
                clearInterval(timerInterval);
                alert("OTP Expired! Please try registering again.");
                location.reload();
            }
        }, 1000);
    }
});