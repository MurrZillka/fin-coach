// src/stores/authStore.js
import { create } from 'zustand';
// Убедись, что путь к api/auth корректный
import { login as loginApi, signup as signupApi, logout as logoutApi } from '../api/auth';

// --- ИМПОРТЫ СТОРОВ ДЛЯ ПЕРВИЧНОЙ ЗАГРУЗКИ И СБРОСА ---
import useBalanceStore from './balanceStore';
import useCreditStore from './creditStore'; // Импортируем стор доходов
// --- Здесь в будущем будем добавлять импорты для других сторов ---
// import useCategoriesStore from './categoryStore';
// import useSpendingsStore from './spendingsStore';
// import useGoalsStore from './goalsStore';
// --- Конец ИМПОРТОВ ---


// Добавляем get во второй аргумент create для доступа к текущему состоянию стора
const useAuthStore = create((set, get) => ({
    // Состояние
    user: null,
    isAuthenticated: false,
    status: 'idle',
    error: null,

    // Действия
    login: async (credentials) => {
        set({ status: 'loading', error: null });
        try {
            const result = await loginApi(credentials);

            if (result.error) {
                set({ status: 'failed', error: result.error });
                throw result.error;
            }

            const { data } = result;

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
                error: null
            });

            return data;

        } catch (error) {
            console.error('Непредвиденная ошибка входа в API (из authStore):', error);
            const unexpectedError = { message: error.message || 'Произошла непредвиденная ошибка авторизации', status: error.status || 500 };
            set({ status: 'failed', error: unexpectedError });
            throw error;
        }
    },

    signup: async (userData) => {
        set({ status: 'loading', error: null });
        try {
            const result = await signupApi(userData);

            if (result.error) {
                set({ status: 'failed', error: result.error });
                throw result.error;
            }

            const { data } = result;

            set({ status: 'succeeded', error: null });
            return data;
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

            // Сбрасываем состояние других сторов при выходе
            useBalanceStore.getState().resetBalance();
            useCreditStore.getState().resetCredits();
            // Здесь в будущем будем добавлять сброс для других сторов
        } catch (error) {
            console.error('Ошибка при выходе:', error);
            // Даже если API выхода с ошибкой, локальные данные нужно почистить
            localStorage.removeItem('userName');
            localStorage.removeItem('token');

            set({
                user: null,
                isAuthenticated: false,
                status: 'idle',
                error: null
            });
            // Сброс состояния других сторов также нужно делать здесь в случае ошибки выхода
            useBalanceStore.getState().resetBalance();
            useCreditStore.getState().resetCredits();
            // Сброс для других сторов при ошибке
        }
    },

    clearError: () => set({ error: null }),

    // --- Действие: Инициализация данных пользователя ---
    fetchInitialUserData: async () => {
        const { isAuthenticated, user } = get();

        if (isAuthenticated && user && user.access_token) {
            const token = user.access_token;
            // ИСПРАВЛЕНО: убраны лишние экранированные кавычки
            console.log("Fetching initial user data (balance, credits, etc.)...");

            // Вызываем действия загрузки данных из других сторов
            useBalanceStore.getState().fetchBalance(token);
            useCreditStore.getState().fetchCredits(token);

            // Здесь в будущем будем добавлять вызовы для загрузки других данных

        } else {
            // Если пользователь не авторизован (или разлогинился), сбрасываем состояние других сторов
            // ИСПРАВЛЕНО: убраны лишние экранированные кавычки
            console.log("User not authenticated or logged out, resetting other stores...");
            useBalanceStore.getState().resetBalance();
            useCreditStore.getState().resetCredits();
            // Сброс для других сторов
        }
    },
    // --- Конец Действия Инициализации данных ---


    // Действие для инициализации стора при запуске приложения (проверка localStorage)
    initAuth: () => {
        const token = localStorage.getItem('token');
        const userName = localStorage.getItem('userName');

        if (token) {
            // ИСПРАВЛЕНО: убраны лишние экранированные кавычки
            console.log("authStore: Found token in localStorage, setting isAuthenticated true...");
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
            // ИСПРАВЛЕНО: убраны лишние экранированные кавычки
            console.log("authStore: No token found in localStorage.");
            set({
                isAuthenticated: false,
                user: null,
                status: 'idle',
                error: null
            });
            // Если нет токена при инициализации, сбрасываем состояние других сторов
            useBalanceStore.getState().resetBalance();
            useCreditStore.getState().resetCredits();
            // Сброс для других сторов
        }
    }
}));

export default useAuthStore;