// Detect if we're running on the same host as the backend or via Live Server
const getBaseURL = () => {
    const isLocal = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
    // If we're on port 8000, we can use relative URLs, but for safety we use absolute
    return `http://127.0.0.1:8000/api`;
};
const API_BASE_URL = "http://127.0.0.1:8000/api";

document.addEventListener("DOMContentLoaded", () => {
    const createAccountBtn = document.getElementById("createAccountBtn");

    if (createAccountBtn) {
        createAccountBtn.addEventListener("click", async (e) => {
            e.preventDefault();

            const firstName = document.getElementById("firstname").value.trim();
            const lastName = document.getElementById("lastname").value.trim();
            const email = document.getElementById("email").value.trim();
            const phone = document.getElementById("phone").value.trim();
            const password = document.getElementById("password").value;
            const confirmPassword = document.getElementById("confirmpassword").value;
            const userType = document.getElementById("usertype").value;
            const termsChecked = document.getElementById("terms").checked;

            if (!firstName || !lastName || !email || !phone || !password || !confirmPassword || !userType) {
                alert("Please fill in all fields.");
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

            const userData = {
                first_name: firstName,
                last_name: lastName,
                email: email,
                phone_number: phone,
                password: password,
                confirm_password: confirmPassword,
                role: userType,
                image: ""
            };

            const originalText = createAccountBtn.innerText;
            createAccountBtn.innerText = "Creating...";
            createAccountBtn.disabled = true;

            try {
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
                    alert("Account created successfully! Redirecting to login...");
                    window.location.href = "/login.html";
                } else {
                    if (contentType && contentType.includes("application/json")) {
                        const error = await response.json();
                        console.error("Signup Error Details:", error);

                        let errorMsg = "Registration Failed: ";
                        if (typeof error.detail === 'string') {
                            errorMsg += error.detail;
                        } else if (Array.isArray(error.detail)) {
                            errorMsg += error.detail.map(err => `${err.loc.join('.')}: ${err.msg}`).join(", ");
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
