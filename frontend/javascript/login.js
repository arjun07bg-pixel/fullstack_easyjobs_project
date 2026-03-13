// Utility to get the correct API URL (Port 8000 for Python backend)
const getAPIURL = () => {
    if (window.getEasyJobsAPI) return window.getEasyJobsAPI();
    const hostname = window.location.hostname;
    if (hostname === "127.0.0.1" || hostname === "localhost") return "http://127.0.0.1:8000/api";
    return "/api";
};

document.addEventListener("DOMContentLoaded", () => {
    const loginBtn = document.getElementById("loginBtn");
    if (!loginBtn) return;

    loginBtn.addEventListener("click", async (e) => {
        e.preventDefault();

        const emailInput = document.getElementById("email");
        const passwordInput = document.getElementById("password");

        if (!emailInput || !passwordInput) {
            console.error("Email or Password input not found!");
            return;
        }

        const email = emailInput.value.trim();
        const password = passwordInput.value;

        if (!email || !password) {
            alert("Please enter both email and password.");
            return;
        }

        if (password.length < 6) {
            alert("Password must be at least 6 characters long.");
            return;
        }

        const loginData = { email, password };

        // UI feedback
        const originalText = loginBtn.innerText;
        loginBtn.innerText = "Logging in...";
        loginBtn.disabled = true;

        try {
            const API_BASE_URL = getAPIURL();
            console.log("Attempting login to:", `${API_BASE_URL}/auth/login`);

            const response = await fetch(`${API_BASE_URL}/auth/login`, {
                method: "POST",
                headers: { "Content-Type": "application/json", "Accept": "application/json" },
                body: JSON.stringify(loginData)
            });

            const contentType = response.headers.get("content-type");

            if (response.ok && contentType?.includes("application/json")) {
                const data = await response.json();
                localStorage.setItem("token", data.access_token);
                localStorage.setItem("user", JSON.stringify(data));

                // Role-based redirect
                switch (data.role) {
                    case "admin":
                        window.location.href="/frontend/pages/dashboard.html";
                        break;
                    case "employer":
                        window.location.href="/frontend/pages/postjob_home.html";
                        break;
                    default:
                        window.location.href="/index.html";
                }
            } else {
                // Handle JSON error response or fallback text error
                let errorMsg = "Login Failed: ";
                if (contentType?.includes("application/json")) {
                    const error = await response.json();
                    if (typeof error.detail === "string") errorMsg += error.detail;
                    else if (Array.isArray(error.detail))
                        errorMsg += error.detail.map(err => `${err.loc.join('.')}: ${err.msg}`).join(", ");
                    else errorMsg += "Invalid credentials or data.";
                } else {
                    const textError = await response.text();
                    console.error("Server Error:", textError);
                    errorMsg += "The backend encountered an unexpected issue (500).";
                }
                alert(errorMsg);
                loginBtn.innerText = originalText;
                loginBtn.disabled = false;
            }
        } catch (err) {
            console.error("Fetch Error:", err);

            // Helpful error message that differentiates between deployed and local logic
            let errorAlert = `Network Error: ${err.message}\nPlease check your internet connection or try again later.`;

            alert(errorAlert);
            loginBtn.innerText = originalText;
            loginBtn.disabled = false;
        }
    });
});