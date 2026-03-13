"use strict";

/* ─── Utility ─────────────────────────────────────────────── */
const getAPIURL = () => window.getEasyJobsAPI ? window.getEasyJobsAPI() : "/api";

/* ─── DOM Ready ──────────────────────────────────────────── */
document.addEventListener("DOMContentLoaded", async () => {
    const userString = localStorage.getItem("user");
    if (!userString) {
        alert("Please login to view your profile.");
        window.location.href="/frontend/pages/login.html";
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
        // Header Elements
        headerName: document.getElementById("header-full-name"),
        headerSub: document.getElementById("header-designation-location"),
        headerPercent: document.getElementById("header-strength-percent"),
        // Employer Specific
        companyCard: document.getElementById("company-card"),
        companyName: document.getElementById("companyName"),
        industry: document.getElementById("industry"),
        companySize: document.getElementById("companySize"),
        companyWebsite: document.getElementById("companyWebsite")
    };

    let tempPhotoData = null;
    let tempResumeName = null;

    /* ─── Role-Based UI ───────────────────────────────────── */
    if (userData.role === "employer" || userData.role === "admin") {
        document.querySelectorAll(".seeker-only").forEach(el => el.style.display = "none");
        if (userData.role === "employer") {
            if (pref.companyCard) pref.companyCard.style.display = "block";
            const bioLabel = document.getElementById("bio-label");
            if (bioLabel) bioLabel.innerText = "Company Overview / Mission";
        }
    }

    /* ─── Profile Strength ─────────────────────────────────── */
    const updateStrength = () => {
        // 1. Define fields based on role
        const commonFields = [
            pref.firstName, pref.lastName, pref.phone, pref.location,
            pref.bio, pref.linkedinUrl, pref.githubUrl, pref.gender, pref.dob
        ];

        const roleFields = userData.role === 'employer'
            ? [pref.companyName, pref.industry, pref.companySize, pref.companyWebsite]
            : [pref.designation, pref.experience, pref.salary, pref.skills, pref.education, pref.projects];

        const allCheckFields = [...commonFields, ...roleFields];

        let filled = 0;
        allCheckFields.forEach(f => {
            if (f && f.value && f.value.trim() !== "") {
                filled++;
            }
        });

        // 2. Add for email (always), photo, and resume (seeker only)
        filled += 1; // Email is always there if logged in

        const user = JSON.parse(localStorage.getItem("user") || "{}");
        if ((user.image && user.image.length > 100) || tempPhotoData) filled++;

        let totalBonus = 2; // Email + Photo
        if (userData.role !== 'employer') {
            totalBonus += 1; // Resume for seekers
            if ((user.resume_url && user.resume_url.trim() !== "") || tempResumeName) filled++;
        }

        const totalFields = allCheckFields.length + totalBonus;
        const percent = Math.min(100, Math.round((filled / totalFields) * 100));

        // 3. Update UI Elements
        if (pref.strengthBar) pref.strengthBar.style.width = percent + "%";
        if (pref.strengthPercent) pref.strengthPercent.innerText = percent + "%";
        if (pref.headerPercent) pref.headerPercent.innerText = percent + "%";

        if (pref.strengthLabel) {
            if (percent < 30) pref.strengthLabel.innerText = "Needs Attention";
            else if (percent < 60) pref.strengthLabel.innerText = "Getting There";
            else if (percent < 85) pref.strengthLabel.innerText = "Strong Profile";
            else if (percent < 100) pref.strengthLabel.innerText = "Almost Complete!";
            else pref.strengthLabel.innerText = "100% Complete! \u{1F3C6}";
        }

        // 4. ALSO update Header Text dynamically while typing
        if (pref.headerName) {
            const fname = pref.firstName.value.trim() || "User";
            const lname = pref.lastName.value.trim() || "Name";
            if (userData.role === 'employer') {
                pref.headerName.innerText = pref.companyName.value || "Company Profile";
            } else if (userData.role === 'admin') {
                pref.headerName.innerText = "Super Administrator";
            } else {
                pref.headerName.innerText = `${fname} ${lname}`;
            }
        }
        if (pref.headerSub) {
            if (userData.role === 'employer') {
                pref.headerSub.innerHTML = `<i class="fas fa-building"></i> ${pref.industry.value || "Industry"} | <i class="fas fa-users"></i> ${pref.companySize.value || "Size"}`;
            } else if (userData.role === 'admin') {
                pref.headerSub.innerHTML = `<i class="fas fa-shield-alt"></i> Platform Management | <i class="fas fa-check-circle"></i> Verified Admin`;
            } else {
                pref.headerSub.innerHTML = `<i class="fas fa-briefcase"></i> ${pref.designation.value || "Professional Title"} | <i class="fas fa-map-marker-alt"></i> ${pref.location.value || "Location"}`;
            }
        }
    };

    // Role-based visibility
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

        if (user.image && pref.photoPreview) {
            const imgSrc = user.image;
            pref.photoPreview.innerHTML = `<img src="${imgSrc}" alt="Profile">`;
        }

        if (user.resume_url && pref.resumeName) {
            pref.resumeName.innerText = user.resume_url;
        }
    };

    // 1. Fetch Latest User Data
    const fetchUser = async () => {
        try {
            const response = await fetch(`${getAPIURL()}/users/${userId}`);
            if (response.ok) {
                const user = await response.json();
                populateForm(user);
                updateStrength();
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