// // Utility to get the correct API URL (Port 8000 for Python backend)
// const getAPIURL = () => { if (window.getEasyJobsAPI) return window.getEasyJobsAPI(); return "/api"; };

// document.addEventListener("DOMContentLoaded", () => {
//     // Guidance page is mostly static content, but we can add interactive features
//     const resourceLinks = document.querySelectorAll(".resource-link");

//     resourceLinks.forEach(link => {
//         link.addEventListener("click", (e) => {
//             const text = link.parentElement.querySelector("h3").textContent;
//             console.log(`Resource clicked: ${text}`);
//             // Future: could fetch specific resource details or trigger a download
//         });
//     });

//     console.log("Guidance page initialized. Resources are ready.");
// });



"use strict";

// ─── API UTILITY ─────────────────────────────
// Get the correct API URL (Python backend default port 8000)
const getAPIURL = () => {
    if (window.getEasyJobsAPI) return window.getEasyJobsAPI();
    return "/api";
};

// ─── DOM READY ───────────────────────────────
document.addEventListener("DOMContentLoaded", () => {

    console.log("Guidance page initialized.");

    // Select all resource links
    const resourceLinks = document.querySelectorAll(".resource-link");

    if (resourceLinks.length === 0) {
        console.warn("No resources found on this page.");
        return;
    }

    // Add click listener to each resource link
    resourceLinks.forEach(link => {
        link.addEventListener("click", (e) => {
            e.preventDefault(); // Prevent default link behavior if it's an <a> tag

            const parent = link.parentElement;
            if (!parent) return;

            const titleEl = parent.querySelector("h3");
            const resourceTitle = titleEl ? titleEl.textContent.trim() : "Unknown Resource";

            console.log(`Resource clicked: ${resourceTitle}`);

            // Optional: Future - fetch resource details from API
            // Example:
            // fetch(`${getAPIURL()}/resources?title=${encodeURIComponent(resourceTitle)}`)
            //   .then(res => res.json())
            //   .then(data => console.log(data))
            //   .catch(err => console.error(err));
        });
    });

    console.log(`${resourceLinks.length} resources are ready for interaction.`);
});