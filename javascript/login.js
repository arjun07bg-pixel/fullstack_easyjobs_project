const getBaseURL = () => {
    // Smart detection: Use port 8000 if we are on a different port (like Live Server 5500/5509)
    if (window.location.port !== '8000' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')) {
        return `http://127.0.0.1:8000/api`;
    }
    return "/api";
};
const API_BASE_URL = getBaseURL();

document.addEventListener("DOMContentLoaded", () => {
    const loginBtn = document.getElementById("loginBtn");

    if (loginBtn) {
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

            // UI Feedback
            const originalText = loginBtn.innerText;
            loginBtn.innerText = "Logging in...";
            loginBtn.disabled = true;

            try {
                console.log("Attempting login to:", `${API_BASE_URL}/auth/login`);
                const response = await fetch(`${API_BASE_URL}/auth/login`, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        "Accept": "application/json"
                    },
                    body: JSON.stringify(loginData)
                });

                const contentType = response.headers.get("content-type");

                if (response.ok) {
                    const data = await response.json();
                    localStorage.setItem("token", data.access_token);
                    localStorage.setItem("user", JSON.stringify(data));

                    // Admin → dashboard, others → home
                    if (data.role === "admin") {
                        window.location.href = "/dashboard.html";
                    } else {
                        window.location.href = "/";
                    }
                } else {
                    if (contentType && contentType.includes("application/json")) {
                        const error = await response.json();
                        console.error("Login Error Details:", error);

                        let errorMsg = "Login Failed: ";
                        if (typeof error.detail === 'string') {
                            errorMsg += error.detail;
                        } else if (Array.isArray(error.detail)) {
                            errorMsg += error.detail.map(err => `${err.loc.join('.')}: ${err.msg}`).join(", ");
                        } else {
                            errorMsg += "Invalid credentials or data.";
                        }
                        alert(errorMsg);
                    } else {
                        const textError = await response.text();
                        console.error("Server Error:", textError);
                        alert("Server Error: The backend encountered an unexpected issue (500). Please check server logs.");
                    }
                    loginBtn.innerText = originalText;
                    loginBtn.disabled = false;
                }
            } catch (err) {
                console.error("Fetch Error:", err);
                alert(`Network Error: ${err.message}\n\nTo fix this:\n1. Open your terminal\n2. Run: python -m uvicorn main:app --reload\n3. Keep the terminal open while using the site.`);
                loginBtn.innerText = originalText;
                loginBtn.disabled = false;
            }
        });
    }
});
