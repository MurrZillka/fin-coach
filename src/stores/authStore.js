// src/stores/authStore.js
import { create } from 'zustand';
// Убедись, что путь к api/auth корректный
import { login as loginApi, signup as signupApi, logout as logoutApi } from '../api/auth';

// --- ИМПОРТЫ СТОРОВ (БОЛЬШЕ НЕ НУЖНЫ ДЛЯ ПРЯМОГО ВЫЗОВА СБРОСА, НО НУЖНЫ ДЛЯ fetchInitialUserData) ---
// Убедись, что пути к другим сторам корректны
import useBalanceStore from './balanceStore';
import useCreditStore from './creditStore';
import useCategoryStore from './categoryStore';
import useSpendingsStore from './spendingsStore';
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

            // --- ОСТАВЛЕНО: Вызываем fetchInitialUserData после успешного входа ---
            // Это гарантирует загрузку данных (включая категории) для только что вошедшего пользователя
            console.log('authStore: Triggering fetchInitialUserData after successful login.'); // Лог триггера
            get().fetchInitialUserData(); // Вызываем действие через get()
            // --- Конец ОСТАВЛЕННОГО ---

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
                isAuthenticated: false, // --- ЭТО ИЗМЕНЕНИЕ ВЫЗЫВАЕТ СБРОС В ДРУГИХ СТОРАХ ЧЕРЕЗ ПОДПИСКУ ---
                status: 'idle',
                error: null
            });
            console.log('authStore: State reset after logout. Other stores reset by subscription.'); // Лог сброса состояния стора


            // --- УДАЛЕНО: Вызовы сброса других сторов теперь обрабатываются подписками ---
            // console.log('authStore: Resetting other stores...');
            // useBalanceStore.getState().resetBalance();
            // useCreditStore.getState().resetCredits();
            // useSpendingsStore.getState().resetSpendings();
            // useCategoryStore.getState().resetCategories();
            // console.log('authStore: Other stores reset.');
            // --- Конец УДАЛЕНИЯ ---

        } catch (error) {
            console.error('authStore: Error during logout:', error); // Лог ошибки при выходе
            // Даже если API выхода с ошибкой, локальные данные нужно почистить и состояние стора сбросить
            localStorage.removeItem('userName');
            localStorage.removeItem('token');
            console.log('authStore: Local storage cleared (after error).'); // Лог очистки Local Storage при ошибке


            set({
                user: null,
                isAuthenticated: false, // --- ЭТО ИЗМЕНЕНИЕ ТАКЖЕ ВЫЗЫВАЕТ СБРОС ЧЕРЕЗ ПОДПИСКУ ---
                status: 'idle',
                error: null
            });
            console.log('authStore: State reset after logout (after error). Other stores reset by subscription.'); // Лог сброса состояния стора при ошибке

            // --- УДАЛЕНО: Вызовы сброса других сторов теперь обрабатываются подписками ---
            // console.log('authStore: Resetting other stores (after error)...');
            // useBalanceStore.getState().resetBalance();
            // useCreditStore.getState().resetCredits();
            // useSpendingsStore.getState().resetSpendings();
            // useCategoryStore.getState().resetCategories();
            // console.log('authStore: Other stores reset (after error).');
            // --- Конец УДАЛЕНИЯ ---

        } finally {
            console.log('authStore: logout finished.'); // Лог завершения
        }
    },

    clearError: () => {
        console.log('authStore: clearError called.'); // Лог
        set({ error: null });
    },


    // --- Действие: Инициализация данных пользователя (вызывается в App.jsx после initAuth) ---
    // Это действие вызывается при монтировании App, если initAuth нашел токен.
    // Оно должно инициировать загрузку данных для текущего пользователя ИЛИ сбросить старые данные,
    // если по какой-то причине токен есть, но пользователь невалидный (хотя это обрабатывается в fetch).
    fetchInitialUserData: async () => {
        console.log('authStore: fetchInitialUserData started'); // Лог начала
        const { isAuthenticated, user } = get(); // Получаем текущее состояние authStore

        if (isAuthenticated && user && user.access_token) {
            const token = user.access_token; // Берем токен из текущего состояния
            console.log("authStore: User is authenticated, fetching initial user data..."); // Лог

            // Вызываем действия загрузки данных из других сторов
            console.log('authStore: Triggering fetchBalance, fetchCredits, fetchSpendings, fetchCategories...'); // Лог вызовов
            // Здесь не сбрасываем сторы, т.к. пользователь аутентифицирован, и мы будем фетчить его данные.
            // Используем getState() для доступа к действиям загрузки других сторов
            useBalanceStore.getState().fetchBalance(token);
            useCreditStore.getState().fetchCredits(token);
            useSpendingsStore.getState().fetchSpendings(token);
            useCategoryStore.getState().fetchCategories(token);


        } else {
            // Если пользователь не авторизован (или разлогинился), состояние isAuthenticated становится false.
            // ЭТО ИЗМЕНЕНИЕ (ЕСЛИ ПРОИЗОШЛО) ВЫЗЫВАЕТ СБРОС В ДРУГИХ СТОРАХ ЧЕРЕЗ ПОДПИСКУ.
            // Здесь нам не нужно явно вызывать reset, подписки сделают это.
            console.log("authStore: User not authenticated or logged out. Resetting other stores handled by subscriptions..."); // Лог сброса

            // --- УДАЛЕНО: Вызовы сброса других сторов теперь обрабатываются подписками ---
            // useBalanceStore.getState().resetBalance();
            // useCreditStore.getState().resetCredits();
            // useSpendingsStore.getState().resetSpendings();
            // useCategoryStore.getState().resetCategories();
            // --- Конец УДАЛЕНИЯ ---

            console.log('authStore: Finished attempting to reset other stores (not authenticated).'); // Лог завершения сброса
        }
        console.log('authStore: fetchInitialUserData finished.'); // Лог завершения
    },
    // --- Конец Действия Инициализации данных ---


    // Действие для инициализации стора при запуске приложения (проверка localStorage)
    // Это первое действие, которое вызывается при монтировании App.
    initAuth: () => {
        console.log('authStore: initAuth started'); // Лог начала
        const token = localStorage.getItem('token');
        const userName = localStorage.getItem('userName');

        if (token) {
            console.log("authStore: Found token in localStorage, setting isAuthenticated true..."); // Лог успеха
            // Устанавливаем начальное состояние аутентификации на основе localStorage
            set({
                isAuthenticated: true,
                user: {
                    access_token: token,
                    userName: userName || 'Пользователь'
                },
                status: 'succeeded',
                error: null
            });
            console.log('authStore: initAuth finished (authenticated). State set based on token.'); // Лог завершения
            // fetchInitialUserData будет вызван в App.jsx после initAuth,
            // и он инициирует загрузку данных для этого пользователя.

        } else {
            console.log("authStore: No token found in localStorage."); // Лог отсутствия токена
            set({
                isAuthenticated: false, // --- ЭТО ИЗМЕНЕНИЕ ВЫЗЫВАЕТ СБРОС В ДРУГИХ СТОРАХ ЧЕРЕЗ ПОДПИСКУ ---
                user: null,
                status: 'idle',
                error: null
            });
            // Если нет токена при инициализации, состояние isAuthenticated становится false.
            // ЭТО ИЗМЕНЕНИЕ ВЫЗЫВАЕТ СБРОС В ДРУГИХ СТОРАХ ЧЕРЕЗ ПОДПИСКУ.
            // Здесь нам не нужно явно вызывать reset, подписки сделают это.
            console.log('authStore: No token on init. Resetting other stores handled by subscriptions.'); // Лог сброса

            // --- УДАЛЕНО: Вызовы сброса других сторов теперь обрабатываются подписками ---
            // useBalanceStore.getState().resetBalance();
            // useCreditStore.getState().resetCredits();
            // useSpendingsStore.getState().resetSpendings();
            // useCategoryStore.getState().resetCategories();
            // --- Конец УДАЛЕНИЯ ---

            console.log('authStore: Finished attempting to reset other stores (no token).'); // Лог завершения сброса
            console.log('authStore: initAuth finished (not authenticated).'); // Лог завершения
        }
    }
}));

export default useAuthStore;