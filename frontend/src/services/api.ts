import axios from 'axios';
import Cookies from 'js-cookie';

// Ensure the VITE_API_URL ends with /api to match backend routing
let envUrl = import.meta.env.VITE_API_URL;
if (envUrl && !envUrl.endsWith('/api')) {
    envUrl += '/api';
}
const API_URL = envUrl || 'http://localhost:5000/api';

// Base URL is used for things like image loading
export const BASE_URL = API_URL.replace('/api', '');

// Returns a usable URL for a stored resume path.
// Handles both full Cloudinary URLs (new uploads) and legacy /uploads/... paths.
export const getResumeUrl = (path: string | null | undefined): string | null => {
    if (!path) return null;
    if (path.startsWith('http://') || path.startsWith('https://')) return path;
    return `${BASE_URL}${path}`;
};


const api = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

api.interceptors.request.use(
    (config) => {
        const token = Cookies.get('token');
        if (token && config.headers) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

export default api;
