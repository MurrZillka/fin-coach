// src/stores/authStore.js
import { create } from 'zustand';
// Убедись, что путь к api/auth корректный
import { login as loginApi, signup as signupApi, logout as logoutApi } from '../api/auth';

const useAuthStore = create((set) => ({
    // Состояние
    user: null, // Теперь user будет содержать { userName, access_token, ...другие_данные }
    isAuthenticated: false,
    status: 'idle', // 'idle' | 'loading' | 'succeeded' | 'failed'
    error: null, // Общая ошибка стора (для общих уведомлений)

    // Действия
    login: async (credentials) => {
        set({ status: 'loading', error: null }); // Сбрасываем ошибку стора в начале
        try {
            // --- ВОССТАНОВЛЕННЫЙ КОД: ВЫЗОВ API И ПОЛУЧЕНИЕ РЕЗУЛЬТАТА ---
            // Предполагаем, что loginApi возвращает { data: { access_token, userName, ... }, error: null }
            // или { data: null, error: { message: ..., status: ... } }
            const result = await loginApi(credentials); // Получаем результат в виде { data, error }
            // --- КОНЕЦ ВОССТАНОВЛЕННОГО КОДА ---

            if (result.error) {
                // Если API вернуло ошибку в формате { data: null, error: {...} }
                set({ status: 'failed', error: result.error }); // Устанавливаем ошибку стора
                // Пробрасываем ошибку дальше, чтобы компонент мог ее перехватить
                throw result.error; // Выбрасываем структурированную ошибку из API слоя
            }

            // Если успех (result.error === null), обрабатываем data
            const { data } = result; // Деструктурируем data из result

            // --- ЛОГИКА: СОХРАНЕНИЕ ТОКЕНА И USERNAME В LOCALSTORAGE ---
            if (data && data.access_token) {
                localStorage.setItem('token', data.access_token);
            }
            if (data && data.userName) {
                localStorage.setItem('userName', data.userName);
            }
            // --- КОНЕЦ ЛОГИКИ ---


            // Обновляем состояние стора с полученными данными
            set({
                user: data, // data теперь содержит access_token
                isAuthenticated: true,
                status: 'succeeded',
                error: null // Успех, ошибки нет
            });

            return data; // Возвращаем данные, если нужно компоненту
        } catch (error) { // Этот catch ловит ошибки, которые НЕ являются результатом { data, error } от API
            console.error('Непредвиденная ошибка входа в API (из authStore):', error); // Логируем непредвиденную ошибку

            // Устанавливаем более общую ошибку в сторе для непредвиденных ситуаций
            const unexpectedError = { message: error.message || 'Произошла непредвиденная ошибка авторизации', status: error.status || 500 };
            set({ status: 'failed', error: unexpectedError });

            // Пробрасываем оригинальную ошибку дальше
            throw error;
        }
    },

    signup: async (userData) => {
        set({ status: 'loading', error: null });
        try {
            const result = await signupApi(userData); // Получаем результат в виде { data, error }

            if (result.error) {
                set({ status: 'failed', error: result.error });
                throw result.error;
            }

            // Для регистрации обычно не требуется сохранять токен сразу,
            // пользователь должен войти после регистрации

            set({ status: 'succeeded', error: null }); // Успех, ошибки нет
            return result.data;
        } catch (error) {
            console.error('Непредвиденная ошибка регистрации в API (из authStore):', error);
            const unexpectedError = { message: error.message || 'Произошла непредвиденная ошибка при регистрации', status: error.status || 500 };
            set({ status: 'failed', error: unexpectedError });
            throw error;
        }
    },

    logout: async () => {
        set({ status: 'loading' });
        const token = localStorage.getItem('token');

        try {
            if (token) {
                await logoutApi(token);
            }

            localStorage.removeItem('userName');
            localStorage.removeItem('token');

            set({
                user: null,
                isAuthenticated: false,
                status: 'idle',
                error: null
            });
        } catch (error) {
            console.error('Ошибка при выходе (API logout может и не отработать, это нормально):', error);
            localStorage.removeItem('userName');
            localStorage.removeItem('token');

            set({
                user: null,
                isAuthenticated: false,
                status: 'idle',
                error: null
            });
        }
    },

    clearError: () => set({ error: null }),

    // ИНИЦИАЛИЗАЦИЯ ИЗ LOCALSTORAGE
    initAuth: () => {
        const token = localStorage.getItem('token');
        const userName = localStorage.getItem('userName');

        if (token) {
            set({
                isAuthenticated: true,
                user: {
                    access_token: token,
                    userName: userName || 'Пользователь'
                },
                status: 'succeeded',
                error: null
            });
        } else {
            set({
                isAuthenticated: false,
                user: null,
                status: 'idle',
                error: null
            });
        }
    }
}));

export default useAuthStore;