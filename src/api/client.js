// src/api/client.js
import axios from 'axios';
import { API_BASE_URL } from './config';

const apiClient = axios.create({
    baseURL: API_BASE_URL,
    headers: { 'Content-Type': 'application/json' },
    timeout: 10000, // Таймаут 10 секунд (10000 миллисекунд)
});

// Перехватчик запросов
apiClient.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Перехватчик ответов
apiClient.interceptors.response.use(
    (response) => {
        // Для успешных ответов возвращаем объект в формате { data, error }
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
        // Для ошибок формируем объект с полями error
        return Promise.resolve({
            data: null,
            error: {
                message: error.response?.data?.error || 'Request failed',
                status: error.response?.status || 500,
            },
        });
    }
);

export default apiClient;