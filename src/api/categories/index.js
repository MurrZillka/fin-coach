// src/api/categories/index.js
import axios from 'axios';
import { API_BASE_URL } from '../config'; // Убедись, что путь правильный

const api = axios.create({
    baseURL: API_BASE_URL,
    headers: { 'Content-Type': 'application/json' },
});

// Хелпер для обработки ответов
const handleResponse = (response) => {
    // Предполагаем, что успешные ответы всегда имеют status 2xx
    return { data: response.data, error: null };
};

// --- Хелпер для обработки ошибок (ДОРАБОТАНА ДЛЯ ДРУЖЕЛЮБНЫХ СООБЩЕНИЙ) ---
const handleError = (error) => {
    console.error('API Error (Categories):', error); // Логируем ошибку для дебага

    let userMessage = 'Операция не удалась, ошибка сервера или связи. Попробуйте, пожалуйста, позже.';
    let statusCode = error.response?.status || 500;

    // Пытаемся получить более специфичное сообщение от бэкенда
    const backendErrorMessage = error.response?.data?.error;

    if (backendErrorMessage) {
        // Если бэкенд вернул специфическое сообщение, используем его
        userMessage = backendErrorMessage;
    } else if (axios.isAxiosError(error) && error.code === 'ERR_NETWORK') {
        // Если это сетевая ошибка (нет связи с сервером)
        userMessage = 'Не удалось соединиться с сервером. Проверьте подключение к интернету или попробуйте позже.';
    } else if (statusCode === 401 || statusCode === 403) {
        // Ошибки авторизации/доступа (хотя это больше относится к логину)
        userMessage = backendErrorMessage || 'Доступ запрещен. Возможно, требуется повторный вход.';
    }
    // Для всех остальных ошибок без специфического сообщения от бэкенда
    // будет использовано дефолтное "Операция не удалась..." сообщение.

    return {
        data: null,
        error: {
            message: userMessage, // Пользовательское сообщение
            status: statusCode,
            details: backendErrorMessage // Опционально: сохраняем сырое сообщение бэкенда для отладки
        },
    };
};
// --- Конец Хелпера для обработки ошибок ---

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