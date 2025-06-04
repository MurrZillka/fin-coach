import axios, { AxiosInstance, InternalAxiosRequestConfig, AxiosResponse, AxiosError, AxiosRequestHeaders } from 'axios';
import { API_BASE_URL } from './config';
import {ApiError, BackendError} from "./apiTypes";

// Создаем экземпляр Axios
const apiClient: AxiosInstance = axios.create({
    baseURL: API_BASE_URL,
    headers: { 'Content-Type': 'application/json' },
    timeout: 10000,
});

// Список публичных эндпоинтов
const publicEndpoints: string[] = ['/signup', '/login'];

// Перехватчик запросов
apiClient.interceptors.request.use(
    (config: InternalAxiosRequestConfig) => {
        const isPublicEndpoint = publicEndpoints.some(endpoint => config.url?.startsWith(endpoint));
        if (!isPublicEndpoint) {
            const token = localStorage.getItem('token');
            if (!token) {
                return Promise.reject({
                    message: 'Пользователь не аутентифицирован. Пожалуйста, войдите.',
                    status: 401,
                } as ApiError);
            }
            config.headers = {
                ...config.headers,
                Authorization: `Bearer ${token}`,
            } as AxiosRequestHeaders;
        }
        return config;
    },
    (error: AxiosError) => Promise.reject(error)
);

// Перехватчик ответов
apiClient.interceptors.response.use(
    (response: AxiosResponse) => {
        console.log(`[API Success] ${response.config.method?.toUpperCase()} ${response.config.url}`, {
            data: response.data,
        });
        return response;
    },
    (error: AxiosError) => {
        const method = error.config?.method?.toUpperCase() || 'UNKNOWN';
        const url = error.config?.url || 'UNKNOWN';
        let errorMessage = (error.response?.data as BackendError)?.error || 'Request failed';
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
            status,
        } as ApiError);
    }
);

export default apiClient;