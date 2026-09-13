import axios from 'axios';

const api = axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL,
});

api.interceptors.request.use((config) => {
    const userString = localStorage.getItem('user');
    if (userString) {
        try {
            const user = JSON.parse(userString);
            if (user && user.token) {
                config.headers.Authorization = `Bearer ${user.token}`;
            }
        } catch (e) {
            console.error('Failed to parse user from local storage');
        }
    }
    return config;
});

api.interceptors.response.use(
    (response) => response,
    (error) => {
        // Handle 401 Unauthorized errors globally
        if (error.response && error.response.status === 401) {
            console.warn('Unauthorized request. Clearing auth token and redirecting to login.');
            localStorage.removeItem('user');
            // Redirect to login page if we aren't already there
            if (window.location.pathname !== '/login') {
                window.location.href = '/login';
            }
        }
        return Promise.reject(error);
    }
);

export default api;
