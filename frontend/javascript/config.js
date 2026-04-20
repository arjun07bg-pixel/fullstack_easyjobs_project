// Auto-detect API URL: local dev uses http://127.0.0.1:8000/api, production uses Vercel URL
const API_URL = typeof window.getEasyJobsAPI === 'function' 
    ? window.getEasyJobsAPI() 
    : "https://fullstack-easyjobs-project.vercel.app/api";

export default API_URL;