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
            const result = await loginApi(credentials); // Получаем результат в виде { data, error }

            if (result.error) {
                set({ status: 'failed', error: result.error });
                throw result.error; // Выбрасываем структурированную ошибку из API слоя
            }

            const { data } = result; // Деструктурируем data из result

            if (data && data.access_token) {
                localStorage.setItem('token', data.access_token);
            }
            if (data && data.userName) {
                localStorage.setItem('userName', data.userName);
            }

            set({
                user: data,
                isAuthenticated: true,
                status: 'succeeded',
                error: null // Успех, ошибки нет
            });

            return data;
        } catch (error) { // Этот catch ловит ошибки, которые НЕ являются результатом { data, error } от API
            console.error('Непредвиденная ошибка входа в API (из authStore):', error);

            const unexpectedError = { message: error.message || 'Произошла непредвиденная ошибка авторизации', status: error.status || 500 };
            set({ status: 'failed', error: unexpectedError });

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

            const { data } = result; // Деструктурируем data из result

            // Для регистрации обычно не требуется сохранять токен сразу,
            // пользователь должен войти после регистрации.

            set({ status: 'succeeded', error: null }); // Успех, ошибки нет
            return data; // Возвращаем данные, если нужно компоненту
        } catch (error) { // Этот catch ловит ошибки, которые НЕ являются результатом { data, error } от API
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