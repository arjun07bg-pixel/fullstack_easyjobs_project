const API_BASE_URL = "http://127.0.0.1:8000/api";

document.addEventListener("DOMContentLoaded", async () => {
    const userString = localStorage.getItem("user");
    if (!userString) {
        alert("Please login to view your profile.");
        window.location.href = "/login.html";
        return;
    }

    const userData = JSON.parse(userString);
    const userId = userData.user_id;

    // Elements
    const pref = {
        form: document.getElementById("profileForm"),
        firstName: document.getElementById("firstName"),
        lastName: document.getElementById("lastName"),
        email: document.getElementById("email"),
        phone: document.getElementById("phone"),
        location: document.getElementById("location"),
        bio: document.getElementById("bio"),
        experience: document.getElementById("experience"),
        salary: document.getElementById("salary"),
        skills: document.getElementById("skills"),
        photoInput: document.getElementById("photoInput"),
        resumeInput: document.getElementById("resumeInput"),
        photoPreview: document.getElementById("profileImagePreview"),
        resumeName: document.getElementById("resume-name"),
        saveBtn: document.getElementById("saveProfileBtn"),
        strengthBar: document.getElementById("profile-strength-bar"),
        strengthLabel: document.getElementById("strength-label"),
        strengthPercent: document.getElementById("strength-percent")
    };

    // Calculate and update profile strength
    const updateStrength = () => {
        const fields = [
            pref.firstName, pref.lastName, pref.phone, pref.location,
            pref.bio, pref.experience, pref.salary, pref.skills
        ];

        let filled = 0;
        fields.forEach(f => {
            if (f && f.value && f.value.trim() !== "" && f.value !== "0") {
                filled++;
            }
        });

        // Add 1 for the existing user (email) and maybe photo/resume
        filled += 1; // Email is always there
        const user = JSON.parse(localStorage.getItem("user") || "{}");
        if (user.image || tempPhotoData) filled++;
        if (user.resume_url || tempResumeName) filled++;

        const totalFields = fields.length + 3; // + email, photo, resume
        const percent = Math.round((filled / totalFields) * 100);

        if (pref.strengthBar) pref.strengthBar.style.width = percent + "%";
        if (pref.strengthPercent) pref.strengthPercent.innerText = percent + "%";

        if (pref.strengthLabel) {
            if (percent < 40) pref.strengthLabel.innerText = "Weak Profile";
            else if (percent < 70) pref.strengthLabel.innerText = "Good Start";
            else if (percent < 90) pref.strengthLabel.innerText = "Strong Profile";
            else pref.strengthLabel.innerText = "Excellent!";
        }
    };

    // 1. Fetch Latest User Data
    const fetchUser = async () => {
        try {
            const response = await fetch(`${API_BASE_URL}/users/${userId}`);
            if (response.ok) {
                const user = await response.json();
                populateForm(user);
                updateStrength();
            }
        } catch (e) {
            console.error("Error fetching user data:", e);
        }
    };

    const populateForm = (user) => {
        if (pref.firstName) pref.firstName.value = user.first_name || "";
        if (pref.lastName) pref.lastName.value = user.last_name || "";
        if (pref.email) pref.email.value = user.email || "";
        if (pref.phone) pref.phone.value = user.phone_number || "";
        if (pref.location) pref.location.value = user.location || "";
        if (pref.bio) pref.bio.value = user.bio || "";
        if (pref.experience) pref.experience.value = user.experience || "";
        if (pref.salary) pref.salary.value = user.salary || "";
        if (pref.skills) pref.skills.value = user.skills || "";

        if (user.image && pref.photoPreview && user.image.trim() !== "") {
            pref.photoPreview.innerHTML = `<img src="${user.image}" alt="Profile">`;
        }

        if (user.resume_url && pref.resumeName) {
            pref.resumeName.innerText = user.resume_url;
        }
    };

    // 2. Initial Data Load
    fetchUser();

    // 3. Handle File Uploads
    let tempPhotoData = null;
    let tempResumeName = null;

    if (pref.photoInput) {
        pref.photoInput.addEventListener("change", (e) => {
            const file = e.target.files[0];
            if (!file) return;

            // Size check (2MB)
            if (file.size > 2 * 1024 * 1024) {
                alert("Image size should be less than 2MB");
                return;
            }

            const reader = new FileReader();
            reader.onload = (event) => {
                tempPhotoData = event.target.result;
                pref.photoPreview.innerHTML = `<img src="${tempPhotoData}" alt="Preview">`;
                updateStrength();
            };
            reader.readAsDataURL(file);
        });
    }

    if (pref.resumeInput) {
        pref.resumeInput.addEventListener("change", (e) => {
            const file = e.target.files[0];
            if (!file) return;
            tempResumeName = file.name;
            pref.resumeName.innerText = "New Upload: " + file.name;
            updateStrength();
        });
    }

    // Add event listeners to input fields to update strength bar in real-time
    const inputs = [pref.firstName, pref.lastName, pref.phone, pref.location, pref.bio, pref.experience, pref.salary, pref.skills];
    inputs.forEach(input => {
        if (input) {
            input.addEventListener("input", updateStrength);
            input.addEventListener("change", updateStrength);
        }
    });

    // 4. Handle Save Profile
    if (pref.form) {
        pref.form.addEventListener("submit", async (e) => {
            e.preventDefault();

            const currentUserData = JSON.parse(localStorage.getItem("user") || "{}");

            const payload = {
                first_name: pref.firstName.value.trim(),
                last_name: pref.lastName.value.trim(),
                phone_number: pref.phone.value.trim(),
                location: pref.location.value.trim(),
                bio: pref.bio.value.trim(),
                experience: parseInt(pref.experience.value) || 0,
                salary: parseInt(pref.salary.value) || 0,
                skills: pref.skills.value.trim(),
                image: tempPhotoData || (currentUserData.image || ""),
                resume_url: tempResumeName || (currentUserData.resume_url || "")
            };

            try {
                pref.saveBtn.disabled = true;
                pref.saveBtn.innerHTML = `<i class="fas fa-circle-notch fa-spin"></i> Saving Profile...`;

                const response = await fetch(`${API_BASE_URL}/users/${userId}`, {
                    method: "PUT",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify(payload)
                });

                if (response.ok) {
                    const updatedUser = await response.json();

                    // Update Local Storage
                    localStorage.setItem("user", JSON.stringify(updatedUser));

                    // Show premium success feedback
                    pref.saveBtn.innerHTML = `<i class="fas fa-check-circle"></i> Profile Updated!`;
                    pref.saveBtn.style.background = "#22c55e";

                    setTimeout(() => {
                        window.location.reload();
                    }, 1000);
                } else {
                    const error = await response.json();
                    alert("Error: " + (error.detail || "Failed to update profile"));
                    pref.saveBtn.disabled = false;
                    pref.saveBtn.innerHTML = "Update Professional Profile";
                }
            } catch (err) {
                console.error("Save Error:", err);
                alert("Network error. Please check if the backend is running.");
                pref.saveBtn.disabled = false;
                pref.saveBtn.innerHTML = "Update Professional Profile";
            }
        });
    }
});
