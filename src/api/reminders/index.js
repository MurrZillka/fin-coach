// src/api/reminders/index.js
import axios from 'axios';
import { API_BASE_URL } from '../config'; // Убедись, что путь правильный

const api = axios.create({
    baseURL: API_BASE_URL,
    headers: { 'Content-Type': 'application/json' },
});

// Хелпер для обработки ответов
const handleResponse = (response) => {
    return { data: response.data, error: null };
};

// Хелпер для обработки ошибок
const handleError = (error) => {
    console.error('API Error (Reminders):', error);

    let userMessage = 'Операция не удалась, ошибка сервера или связи. Попробуйте, пожалуйста, позже.';
    let statusCode = error.response?.status || 500;

    const backendErrorMessage = error.response?.data?.error;

    if (backendErrorMessage) {
        userMessage = backendErrorMessage;
    } else if (axios.isAxiosError(error) && error.code === 'ERR_NETWORK') {
        userMessage = 'Не удалось соединиться с сервером. Проверьте подключение к интернету или попробуйте позже.';
    } else if (statusCode === 401 || statusCode === 403) {
        userMessage = backendErrorMessage || 'Доступ запрещен. Возможно, требуется повторный вход.';
    }

    return {
        data: null,
        error: {
            message: userMessage,
            status: statusCode,
            details: backendErrorMessage
        },
    };
};

/**
 * Получает информацию о необходимости напоминания на сегодня.
 * @param {string} token Токен авторизации пользователя.
 * @returns {Promise<{data: {need_remind: boolean}|null, error: object|null}>} Объект с данными о напоминании или ошибкой.
 */
export const getTodayReminder = async (token) => {
    try {
        const response = await api.get('/Reminder', {
            headers: { Authorization: `Bearer ${token}` },
        });
        // Ожидаем формат ответа: { "TodayRemind": { "need_remind": true/false } }
        return handleResponse(response.data.TodayRemind); // Возвращаем только содержимое TodayRemind
    } catch (error) {
        return handleError(error);
    }
};