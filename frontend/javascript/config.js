// Auto-detect API URL: local dev uses http://127.0.0.1:8000/api, production uses /api
export const API_URL = (window.location.hostname === "127.0.0.1" || window.location.hostname === "localhost")
    ? "http://127.0.0.1:8000/api"
    : "/api"; 