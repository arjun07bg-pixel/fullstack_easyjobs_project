// API base URL
const CONFIG = {
    API_URL: "https://fullstack-easyjobs-project.vercel.app"
};

// function to get API URL
function getEasyJobsAPI() {
    return CONFIG.API_URL;
}

// make it global
window.getEasyJobsAPI = getEasyJobsAPI;