import axios from 'axios';
import { API_BASE_URL } from '../config'; // Убрали getUseMocks

const api = axios.create({
    baseURL: API_BASE_URL,
    headers: { 'Content-Type': 'application/json' },
});

// Хелпер для обработки ответов
const handleResponse = (response) => {
    // Предполагаем, что успешные ответы всегда имеют status 2xx
    return { data: response.data, error: null };
};

// Хелпер для обработки ошибок
const handleError = (error) => {
    console.error('API Error:', error); // Логируем ошибку для дебага
    return {
        data: null,
        error: {
            message: error.response?.data?.error || error.message || 'An unexpected error occurred',
            status: error.response?.status || 500,
        },
    };
};

export const addCategory = async (data, token) => {
    try {
        const response = await api.post('/AddCategory', data, {
            headers: { Authorization: `Bearer ${token}` },
        });
        return handleResponse(response);
    } catch (error) {
        return handleError(error);
    }
};

export const getCategories = async (token) => {
    try {
        const response = await api.get('/Categories', {
            headers: { Authorization: `Bearer ${token}` },
        });
        // Извлекаем Categories из ответа, как в Postman
        return { data: { categories: response.data.Categories }, error: null };
    } catch (error) {
        return handleError(error);
    }
};

export const getCategoryById = async (id, token) => {
    try {
        const response = await api.get(`/Category/${id}`, {
            headers: { Authorization: `Bearer ${token}` },
        });
        // Извлекаем Category из ответа, как в Postman
        return { data: response.data.Category, error: null };
    } catch (error) {
        return handleError(error);
    }
};

export const updateCategoryById = async (id, data, token) => {
    try {
        const response = await api.put(`/Category/${id}`, data, {
            headers: { Authorization: `Bearer ${token}` },
        });
        return handleResponse(response);
    } catch (error) {
        return handleError(error);
    }
};

export const deleteCategoryById = async (id, token) => {
    try {
        const response = await api.delete(`/Category/${id}`, {
            headers: { Authorization: `Bearer ${token}` },
        });
        return handleResponse(response);
    } catch (error) {
        return handleError(error);
    }
};