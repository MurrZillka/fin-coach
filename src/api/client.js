import axios from 'axios';
import { API_BASE_URL } from './config';

const apiClient = axios.create({
    baseURL: API_BASE_URL,
    headers: { 'Content-Type': 'application/json' },
    timeout: 10000,
});

const publicEndpoints = ['/signup', '/login']; // Список не защищённых эндпоинтов

apiClient.interceptors.request.use(
    (config) => {
        const isPublicEndpoint = publicEndpoints.some(endpoint => config.url.startsWith(endpoint));
        if (!isPublicEndpoint) {
            const token = localStorage.getItem('token');
            if (!token) {
                return Promise.reject({
                    message: 'Пользователь не аутентифицирован. Пожалуйста, войдите.',
                    status: 401,
                });
            }
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

apiClient.interceptors.response.use(
    (response) => {
        console.log(`[API Success] ${response.config.method.toUpperCase()} ${response.config.url}`, {
            data: response.data,
        });
        return { data: response.data, error: null };
    },
    (error) => {
        const method = error.config?.method?.toUpperCase() || 'UNKNOWN';
        const url = error.config?.url || 'UNKNOWN';
        let errorMessage = error.response?.data?.error || 'Request failed';
        const status = error.response?.status || 500;

        if (error.code === 'ECONNABORTED') {
            errorMessage = 'Request timed out';
        }

        console.error(`[API Error] ${method} ${url}`, {
            message: errorMessage,
            status,
            response: error.response?.data,
        });
        return Promise.reject({
            message: errorMessage,
            status: status,
        });
    }
);

export default apiClient;