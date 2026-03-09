"use strict";

/* ─── Utility ─────────────────────────────────────────────── */
const getAPIURL = () => window.getEasyJobsAPI ? window.getEasyJobsAPI() : "/api";

/* ─── DOM Ready ──────────────────────────────────────────── */
document.addEventListener("DOMContentLoaded", async () => {
    const userString = localStorage.getItem("user");
    if (!userString) {
        alert("Please login to view your profile.");
        window.location.href = "./login.html";
        return;
    }

    const userData = JSON.parse(userString);
    const userId = userData.user_id;

    /* ─── Elements ───────────────────────────────────────── */
    const pref = {
        form: document.getElementById("profileForm"),
        firstName: document.getElementById("firstName"),
        lastName: document.getElementById("lastName"),
        email: document.getElementById("email"),
        phone: document.getElementById("phone"),
        location: document.getElementById("location"),
        bio: document.getElementById("bio"),
        designation: document.getElementById("designation"),
        experience: document.getElementById("experience"),
        salary: document.getElementById("salary"),
        skills: document.getElementById("skills"),
        education: document.getElementById("education"),
        projects: document.getElementById("projects"),
        linkedinUrl: document.getElementById("linkedinUrl"),
        githubUrl: document.getElementById("githubUrl"),
        gender: document.getElementById("gender"),
        dob: document.getElementById("dob"),
        photoInput: document.getElementById("photoInput"),
        resumeInput: document.getElementById("resumeInput"),
        photoPreview: document.getElementById("profileImagePreview"),
        resumeName: document.getElementById("resume-name"),
        strengthBar: document.getElementById("profile-strength-bar"),
        strengthPercent: document.getElementById("strength-percent"),
        strengthLabel: document.getElementById("strength-label"),
        saveBtn: document.getElementById("saveProfileBtn"),
        // Employer
        companyCard: document.getElementById("company-card"),
        companyName: document.getElementById("companyName"),
        industry: document.getElementById("industry"),
        companySize: document.getElementById("companySize"),
        companyWebsite: document.getElementById("companyWebsite")
    };

    const headerName = document.getElementById("header-profile-name");
    const headerSub = document.getElementById("header-profile-sub");

    let tempPhotoData = null;
    let tempResumeName = null;

    /* ─── Role-Based UI ───────────────────────────────────── */
    if (userData.role === "employer") {
        document.querySelectorAll(".seeker-only").forEach(el => el.style.display = "none");
        if (pref.companyCard) pref.companyCard.style.display = "block";
        const bioLabel = document.getElementById("bio-label");
        if (bioLabel) bioLabel.innerText = "Company Overview / Mission";
    }

    /* ─── Profile Strength ─────────────────────────────────── */
    const updateStrength = () => {
        const fields = [
            pref.firstName, pref.lastName, pref.phone, pref.location,
            pref.bio, pref.designation, pref.experience, pref.salary,
            pref.skills, pref.education, pref.projects, pref.linkedinUrl,
            pref.githubUrl, pref.gender, pref.dob
        ];

        let filled = fields.reduce((acc, f) => (f && f.value.trim() !== "" && f.value !== "0" ? acc + 1 : acc), 0);
        filled += 1; // email always counted
        const user = JSON.parse(localStorage.getItem("user") || "{}");
        if ((user.image && user.image.trim() !== "") || tempPhotoData) filled++;
        if ((user.resume_url && user.resume_url.trim() !== "") || tempResumeName) filled++;

        const totalFields = fields.length + 3;
        const percent = Math.round((filled / totalFields) * 100);

        if (pref.strengthBar) pref.strengthBar.style.width = percent + "%";
        if (pref.strengthPercent) pref.strengthPercent.innerText = percent + "%";

        if (headerName && headerSub) {
            headerName.innerText = user.role === 'employer' ? (user.company_name || "Company Profile") : `${user.first_name} ${user.last_name || ""}`;
            headerSub.innerHTML = user.role === 'employer'
                ? `<i class="fas fa-building"></i> ${user.industry || "Industry Not Set"} | <i class="fas fa-users"></i> ${user.company_size || "Size Not Set"}`
                : `<i class="fas fa-briefcase"></i> ${user.designation || "Job Seeker"} | <i class="fas fa-map-marker-alt"></i> ${user.location || "Location Not Set"}`;
        }

        if (pref.strengthLabel) {
            pref.strengthLabel.innerText = percent < 30 ? "Needs Attention" :
                percent < 60 ? "Getting There" :
                percent < 85 ? "Strong Profile" :
                percent < 100 ? "Almost Complete!" :
                "100% Complete! 🏆";
        }
    };

    /* ─── Fetch User Data ─────────────────────────────────── */
    const populateForm = (user) => {
        if (!user) return;
        if (pref.firstName) pref.firstName.value = user.first_name || "";
        if (pref.lastName) pref.lastName.value = user.last_name || "";
        if (pref.email) pref.email.value = user.email || "";
        if (pref.phone) pref.phone.value = user.phone_number || "";
        if (pref.location) pref.location.value = user.location || "";
        if (pref.bio) pref.bio.value = user.bio || "";
        if (pref.designation) pref.designation.value = user.designation || "";
        if (pref.experience) pref.experience.value = user.experience || "";
        if (pref.salary) pref.salary.value = user.salary || "";
        if (pref.skills) pref.skills.value = user.skills || "";
        if (pref.education) pref.education.value = user.education || "";
        if (pref.projects) pref.projects.value = user.projects || "";
        if (pref.linkedinUrl) pref.linkedinUrl.value = user.linkedin_url || "";
        if (pref.githubUrl) pref.githubUrl.value = user.github_url || "";
        if (pref.dob) pref.dob.value = user.dob || "";
        if (pref.gender) pref.gender.value = user.gender || "";

        // Employer Fields
        if (pref.companyName) pref.companyName.value = user.company_name || "";
        if (pref.industry) pref.industry.value = user.industry || "";
        if (pref.companySize) pref.companySize.value = user.company_size || "";
        if (pref.companyWebsite) pref.companyWebsite.value = user.company_website || "";

        // Profile preview
        const avatarSrc = tempPhotoData || user.image || `https://ui-avatars.com/api/?name=${user.first_name}`;
        if (pref.photoPreview) pref.photoPreview.innerHTML = `<img src="${avatarSrc}" alt="Profile">`;
        if (pref.resumeName && user.resume_url) pref.resumeName.innerText = user.resume_url;

        updateStrength();
    };

    const fetchUser = async () => {
        try {
            const res = await fetch(`${getAPIURL()}/users/${userId}`);
            if (res.ok) {
                const user = await res.json();
                populateForm(user);
            }
        } catch (e) {
            console.error("Error fetching user data:", e);
        }
    };
    fetchUser();

    /* ─── File Uploads ───────────────────────────────────── */
    if (pref.photoInput) {
        pref.photoInput.addEventListener("change", e => {
            const file = e.target.files[0];
            if (!file) return;
            if (file.size > 2 * 1024 * 1024) return alert("Image size should be < 2MB");
            const reader = new FileReader();
            reader.onload = ev => {
                tempPhotoData = ev.target.result;
                pref.photoPreview.innerHTML = `<img src="${tempPhotoData}" alt="Preview">`;
                updateStrength();
            };
            reader.readAsDataURL(file);
        });
    }

    if (pref.resumeInput) {
        pref.resumeInput.addEventListener("change", e => {
            const file = e.target.files[0];
            if (!file) return;
            tempResumeName = file.name;
            pref.resumeName.innerText = "New Upload: " + file.name;
            updateStrength();
        });
    }

    /* ─── Auto Update Strength ───────────────────────────── */
    Object.values(pref).forEach(el => {
        if (el && ["INPUT", "TEXTAREA", "SELECT"].includes(el.tagName)) {
            el.addEventListener("input", updateStrength);
            el.addEventListener("change", updateStrength);
        }
    });

    /* ─── Save Profile ────────────────────────────────────── */
    if (pref.form) {
        pref.form.addEventListener("submit", async e => {
            e.preventDefault();
            pref.saveBtn.disabled = true;
            pref.saveBtn.innerHTML = `<i class="fas fa-circle-notch fa-spin"></i> Saving Profile...`;

            const payload = {
                first_name: pref.firstName.value.trim(),
                last_name: pref.lastName.value.trim(),
                phone_number: pref.phone.value.trim(),
                location: pref.location.value.trim(),
                bio: pref.bio.value.trim(),
                designation: pref.designation.value.trim(),
                experience: parseInt(pref.experience.value) || 0,
                salary: parseInt(pref.salary.value) || 0,
                skills: pref.skills.value.trim(),
                education: pref.education.value.trim(),
                projects: pref.projects.value.trim(),
                linkedin_url: pref.linkedinUrl.value.trim(),
                github_url: pref.githubUrl.value.trim(),
                gender: pref.gender.value,
                dob: pref.dob.value,
                image: tempPhotoData || userData.image || "",
                resume_url: tempResumeName || userData.resume_url || "",
                company_name: pref.companyName ? pref.companyName.value.trim() : null,
                industry: pref.industry ? pref.industry.value.trim() : null,
                company_size: pref.companySize ? pref.companySize.value : null,
                company_website: pref.companyWebsite ? pref.companyWebsite.value.trim() : null
            };

            try {
                const res = await fetch(`${getAPIURL()}/users/${userId}`, {
                    method: "PUT",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(payload)
                });

                if (res.ok) {
                    const updatedUser = await res.json();
                    localStorage.setItem("user", JSON.stringify(updatedUser));
                    pref.saveBtn.innerHTML = `<i class="fas fa-check-circle"></i> Profile Updated!`;
                    pref.saveBtn.style.background = "#22c55e";
                    setTimeout(() => window.location.reload(), 1000);
                } else {
                    const error = await res.json();
                    alert("Error: " + (error.detail || "Failed to update profile"));
                    pref.saveBtn.disabled = false;
                    pref.saveBtn.innerHTML = "Update Professional Profile";
                }
            } catch (err) {
                console.error("Save Error:", err);
                alert("Network error. Ensure backend is running.");
                pref.saveBtn.disabled = false;
                pref.saveBtn.innerHTML = "Update Professional Profile";
            }
        });
    }
});