const API_BASE_URL = "http://127.0.0.1:8000/api";

document.addEventListener("DOMContentLoaded", () => {
    const contactForm = document.querySelector(".contact-form");

    if (contactForm) {
        contactForm.addEventListener("submit", async (e) => {
            e.preventDefault();

            const formData = {
                first_name: document.getElementById("firstName").value,
                last_name: document.getElementById("lastName").value,
                email: document.getElementById("email").value,
                phone: document.getElementById("phone").value,
                subject: document.getElementById("subject").value,
                message: document.getElementById("message").value
            };

            console.log("Contact form submitted:", formData);

            try {
                const response = await fetch(`${API_BASE_URL}/contact/`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(formData)
                });

                if (response.ok) {
                    const submitBtn = contactForm.querySelector(".btn-submit");
                    const originalText = submitBtn.innerHTML;
                    submitBtn.innerHTML = "Sending...";
                    submitBtn.disabled = true;

                    setTimeout(() => {
                        alert("Thank you! Your message has been sent successfully. We'll get back to you soon.");
                        contactForm.reset();
                        submitBtn.innerHTML = originalText;
                        submitBtn.disabled = false;
                    }, 500);
                } else {
                    alert("Failed to send message. Please try again.");
                }

            } catch (error) {
                console.error("Contact error:", error);
                alert("Sorry, something went wrong. Please try again later.");
            }
        });
    }
});
