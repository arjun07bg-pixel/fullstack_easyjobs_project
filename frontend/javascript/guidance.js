const API_BASE_URL = "http://127.0.0.1:8000/api";

document.addEventListener("DOMContentLoaded", () => {
    // Guidance page is mostly static content, but we can add interactive features
    const resourceLinks = document.querySelectorAll(".resource-link");

    resourceLinks.forEach(link => {
        link.addEventListener("click", (e) => {
            const text = link.parentElement.querySelector("h3").textContent;
            console.log(`Resource clicked: ${text}`);
            // Future: could fetch specific resource details or trigger a download
        });
    });

    console.log("Guidance page initialized. Resources are ready.");
});
