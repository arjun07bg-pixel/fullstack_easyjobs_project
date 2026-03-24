// Final Unified Login Logic with 2FA/OTP support
const getAPIURL = () => {
    if (window.getEasyJobsAPI) return window.getEasyJobsAPI();
    const hostname = window.location.hostname;
    if (hostname === "127.0.0.1" || hostname === "localhost" || hostname === "") return "http://127.0.0.1:8000/api";
    return "/api";
};

document.addEventListener("DOMContentLoaded", () => {
    const loginBtn = document.getElementById("loginBtn");
    const verifyOtpBtn = document.getElementById("verifyOtpBtn");
    const backToLogin = document.getElementById("backToLogin");
    
    const loginForm = document.getElementById("loginForm");
    const otpSection = document.getElementById("otpSection");
    const emailInput = document.getElementById("email");
    const passwordInput = document.getElementById("password");
    const otpInput = document.getElementById("otp");
    let timerInterval = null;

    if (!loginBtn) return;

    // --- STEP 1: INITIAL LOGIN ATTEMPT ---
    loginBtn.addEventListener("click", async (e) => {
        e.preventDefault();

        const email = emailInput.value.trim();
        const password = passwordInput.value;

        if (!email || !password) {
            alert("Please enter both email and password.");
            return;
        }

        loginBtn.innerText = "Processing...";
        loginBtn.disabled = true;

        try {
            const API = getAPIURL();
            const response = await fetch(`${API}/auth/login`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, password })
            });

            const data = await response.json();

            if (response.ok) {
                // Check if OTP is required (2FA flow)
                if (data.status === "otp_required") {
                    loginForm.style.display = "none";
                    otpSection.style.display = "block";
                    document.getElementById("otpMsg").innerText = `A 6-digit code was sent to ${data.email}`;
                    
                    if (data.debug_otp && window.showMessage) {
                        window.showMessage(`[DEV MODE] Verification Code for ${data.email}: ${data.debug_otp}`, "info", true);
                    }
                    startTimer();
                } else {
                    // Direct login (e.g. Admin or if 2FA disabled)
                    handleLoginSuccess(data);
                }
            } else {
                alert(data.detail || "Login Failed. Please check your credentials.");
                loginBtn.innerText = "Login";
                loginBtn.disabled = false;
            }
        } catch (err) {
            console.error(err);
            alert("Server connection error.");
            loginBtn.innerText = "Login";
            loginBtn.disabled = false;
        }
    });

    // --- STEP 2: OTP VERIFICATION ---
    verifyOtpBtn?.addEventListener("click", async () => {
        const email = emailInput.value.trim();
        const otp = otpInput.value.trim();

        if (otp.length !== 6) {
            alert("Please enter a valid 6-digit code.");
            return;
        }

        verifyOtpBtn.innerText = "Verifying...";
        verifyOtpBtn.disabled = true;

        try {
            const API = getAPIURL();
            const res = await fetch(`${API}/auth/verify-otp`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, otp })
            });

            const data = await res.json();

            if (res.ok) {
                handleLoginSuccess(data);
            } else {
                alert(data.detail || "Invalid or expired code.");
                verifyOtpBtn.innerText = "Verify & Login";
                verifyOtpBtn.disabled = false;
            }
        } catch (err) {
            alert("Verification failed.");
            verifyOtpBtn.innerText = "Verify & Login";
            verifyOtpBtn.disabled = false;
        }
    });

    // Back button
    backToLogin?.addEventListener("click", () => {
        clearInterval(timerInterval);
        otpSection.style.display = "none";
        loginForm.style.display = "block";
        loginBtn.innerText = "Login";
        loginBtn.disabled = false;
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
                alert("OTP Expired! Please try logging in again.");
                backToLogin?.click();
            }
        }, 1000);
    }

    function handleLoginSuccess(data) {
        localStorage.setItem("token", data.access_token);
        localStorage.setItem("user", JSON.stringify(data));

        // Global success message
        if (window.showMessage) {
            window.showMessage(`Welcome back, ${data.first_name}! Success.`, "success");
        }

        setTimeout(() => {
            if (data.role === "admin") window.location.href = "frontend/pages/dashboard.html";
            else if (data.role === "employer") window.location.href = "frontend/pages/postjob_home.html";
            else window.location.href = "/index.html";
        }, 300);
    }
});