const getBaseURL = () => {
    if (window.location.port !== '8000' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')) {
        return `http://127.0.0.1:8000/api`;
    }
    return "/api";
};
const API_BASE_URL = getBaseURL();

document.addEventListener("DOMContentLoaded", () => {
    console.log("Application status confirmed.");
});

