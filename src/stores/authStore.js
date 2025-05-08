// src/stores/authStore.js
import { create } from 'zustand';
// Убедись, что путь к api/auth корректный
import { login as loginApi, signup as signupApi, logout as logoutApi } from '../api/auth';

// --- ИМПОРТЫ СТОРОВ ДЛЯ ПЕРВИЧНОЙ ЗАГРУЗКИ И СБРОСА ---
import useBalanceStore from './balanceStore';
import useCreditStore from './creditStore'; // Импортируем стор доходов
// --- Здесь в будущем будем добавлять импорты для других сторов ---
// import useCategoriesStore from './categoryStore'; // Возможно, уже импортировано, проверь
// import useGoalsStore from './goalsStore';
// --- ДОБАВЛЕНО: Импорт стора расходов ---
import useSpendingsStore from './spendingsStore'; // Импортируем стор расходов
// --- Конец ИМПОРТОВ ---


// Добавляем get во второй аргумент create для доступа к текущему состоянию стора
const useAuthStore = create((set, get) => ({
    // Состояние
    user: null,
    isAuthenticated: false,
    status: 'idle', // 'idle', 'loading', 'succeeded', 'failed'
    error: null,

    // Действия
    login: async (credentials) => {
        console.log('authStore: login started'); // Лог начала
        set({ status: 'loading', error: null });
        try {
            const result = await loginApi(credentials);
            console.log('authStore: API login result:', result); // Лог результата API

            if (result.error) {
                set({ status: 'failed', error: result.error });
                console.error('authStore: API login error:', result.error); // Лог ошибки API
                throw result.error; // Пробрасываем ошибку API дальше
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
            console.log('authStore: login successful, isAuthenticated set to true.'); // Лог успеха

            return data;

        } catch (error) {
            console.error('authStore: Unexpected error in login (from authStore):', error); // Лог непредвиденной ошибки
            const unexpectedError = { message: error.message || 'Произошла непредвиденная ошибка авторизации', status: error.status || 500 };
            set({ status: 'failed', error: unexpectedError });
            throw error;
        } finally {
            console.log('authStore: login finished.'); // Лог завершения
        }
    },

    signup: async (userData) => {
        console.log('authStore: signup started'); // Лог начала
        set({ status: 'loading', error: null });
        try {
            const result = await signupApi(userData);
            console.log('authStore: API signup result:', result); // Лог результата API


            if (result.error) {
                set({ status: 'failed', error: result.error });
                console.error('authStore: API signup error:', result.error); // Лог ошибки API
                throw result.error;
            }

            const { data } = result;

            set({ status: 'succeeded', error: null });
            console.log('authStore: signup successful.'); // Лог успеха
            return data;
        } catch (error) {
            console.error('authStore: Unexpected error in signup (from authStore):', error); // Лог непредвиденной ошибки
            const unexpectedError = { message: error.message || 'Произошла непредвиденная ошибка при регистрации', status: error.status || 500 };
            set({ status: 'failed', error: unexpectedError });
            throw error;
        } finally {
            console.log('authStore: signup finished.'); // Лог завершения
        }
    },

    logout: async () => {
        console.log('authStore: logout started'); // Лог начала
        set({ status: 'loading' });
        const token = localStorage.getItem('token');

        try {
            if (token) {
                console.log('authStore: Calling logoutApi...'); // Лог вызова API
                await logoutApi(token);
                console.log('authStore: logoutApi successful.'); // Лог успеха API
            }

            localStorage.removeItem('userName');
            localStorage.removeItem('token');
            console.log('authStore: Local storage cleared.'); // Лог очистки Local Storage

            set({
                user: null,
                isAuthenticated: false,
                status: 'idle',
                error: null
            });
            console.log('authStore: State reset after logout.'); // Лог сброса состояния стора


            // Сбрасываем состояние других сторов при выходе
            console.log('authStore: Resetting other stores...'); // Лог сброса других сторов
            useBalanceStore.getState().resetBalance();
            useCreditStore.getState().resetCredits();
            // --- ДОБАВЛЕНО: Сброс стора расходов при выходе ---
            useSpendingsStore.getState().resetSpendings();
            // --- Конец ДОБАВЛЕНИЯ ---
            console.log('authStore: Other stores reset.'); // Лог завершения сброса других сторов

        } catch (error) {
            console.error('authStore: Error during logout:', error); // Лог ошибки при выходе
            // Даже если API выхода с ошибкой, локальные данные нужно почистить и состояние стора сбросить
            localStorage.removeItem('userName');
            localStorage.removeItem('token');
            console.log('authStore: Local storage cleared (after error).'); // Лог очистки Local Storage при ошибке


            set({
                user: null,
                isAuthenticated: false,
                status: 'idle',
                error: null
            });
            console.log('authStore: State reset after logout (after error).'); // Лог сброса состояния стора при ошибке

            // Сброс состояния других сторов также нужно делать здесь в случае ошибки выхода
            console.log('authStore: Resetting other stores (after error)...'); // Лог сброса других сторов при ошибке
            useBalanceStore.getState().resetBalance();
            useCreditStore.getState().resetCredits();
            // --- ДОБАВЛЕНО: Сброс стора расходов при ошибке выхода ---
            useSpendingsStore.getState().resetSpendings();
            // --- Конец ДОБАВЛЕНИЯ ---
            console.log('authStore: Other stores reset (after error).'); // Лог завершения сброса других сторов при ошибке
        } finally {
            console.log('authStore: logout finished.'); // Лог завершения
        }
    },

    clearError: () => {
        console.log('authStore: clearError called.'); // Лог
        set({ error: null });
    },


    // --- Действие: Инициализация данных пользователя (вызывается в App.jsx после initAuth) ---
    fetchInitialUserData: async () => {
        console.log('authStore: fetchInitialUserData started'); // Лог начала
        const { isAuthenticated, user } = get();

        if (isAuthenticated && user && user.access_token) {
            const token = user.access_token;
            console.log("authStore: User is authenticated, fetching initial user data..."); // Лог

            // Вызываем действия загрузки данных из других сторов
            console.log('authStore: Triggering fetchBalance, fetchCredits...'); // Лог вызовов
            useBalanceStore.getState().fetchBalance(token);
            useCreditStore.getState().fetchCredits(token);

            // --- ДОБАВЛЕНО: Вызов fetchSpendings при инициализации данных ---
            // Убедись, что categoryStore импортирован и fetchCategories доступен, если нужен здесь
            // Расходы часто зависят от категорий, поэтому возможно, fetchCategories должен быть здесь или вызван перед fetchSpendings
            // Для простоты пока вызовем только fetchSpendings. fetchCategories будем вызывать на странице расходов.
            console.log('authStore: Triggering fetchSpendings...'); // Лог вызова
            useSpendingsStore.getState().fetchSpendings(token); // Передаем токен

            // Здесь в будущем будем добавлять вызовы для загрузки других данных

        } else {
            // Если пользователь не авторизован (или разлогинился), сбрасываем состояние других сторов
            console.log("authStore: User not authenticated or logged out, resetting other stores..."); // Лог сброса
            useBalanceStore.getState().resetBalance();
            useCreditStore.getState().resetCredits();
            // --- ДОБАВЛЕНО: Сброс стора расходов при неаутентифицированном пользователе ---
            useSpendingsStore.getState().resetSpendings();
            // --- Конец ДОБАВЛЕНИЯ ---
            console.log('authStore: Other stores reset.'); // Лог завершения сброса
        }
        console.log('authStore: fetchInitialUserData finished.'); // Лог завершения
    },
    // --- Конец Действия Инициализации данных ---


    // Действие для инициализации стора при запуске приложения (проверка localStorage)
    initAuth: () => {
        console.log('authStore: initAuth started'); // Лог начала
        const token = localStorage.getItem('token');
        const userName = localStorage.getItem('userName');

        if (token) {
            console.log("authStore: Found token in localStorage, setting isAuthenticated true..."); // Лог успеха
            set({
                isAuthenticated: true,
                user: {
                    access_token: token,
                    userName: userName || 'Пользователь'
                },
                status: 'succeeded',
                error: null
            });
            console.log('authStore: initAuth finished (authenticated).'); // Лог завершения
        } else {
            console.log("authStore: No token found in localStorage."); // Лог отсутствия токена
            set({
                isAuthenticated: false,
                user: null,
                status: 'idle',
                error: null
            });
            // Если нет токена при инициализации, сбрасываем состояние других сторов
            console.log('authStore: Resetting other stores due to no token on init.'); // Лог сброса
            useBalanceStore.getState().resetBalance();
            useCreditStore.getState().resetCredits();
            // --- ДОБАВЛЕНО: Сброс стора расходов при отсутствии токена ---
            useSpendingsStore.getState().resetSpendings();
            // --- Конец ДОБАВЛЕНИЯ ---
            console.log('authStore: Other stores reset (no token).'); // Лог завершения сброса
            console.log('authStore: initAuth finished (not authenticated).'); // Лог завершения
        }
    }
}));

export default useAuthStore;