// src/stores/authStore.js
import { create } from 'zustand';
// Убедись, что путь к api/auth корректный
import { login as loginApi, signup as signupApi, logout as logoutApi } from '../api/auth'; // logoutApi теперь используется

// --- ИМПОРТ: стор баланса ---
// Убедись, что путь к stores/balanceStore корректный
import useBalanceStore from './balanceStore';
// --- Конец ИМПОРТА ---


// Добавляем get во второй аргумент create для доступа к текущему состоянию стора
const useAuthStore = create((set, get) => ({
    // Состояние
    user: null, // Теперь user будет содержать { userName, access_token, ...другие_данные }
    isAuthenticated: false,
    status: 'idle', // 'idle' | 'loading' | 'succeeded' | 'failed'
    error: null, // Общая ошибка стора (для общих уведомлений)

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
                // --- РАСКОММЕНТИРОВАН ВЫЗОВ logoutApi ---
                await logoutApi(token); // Теперь вызывается API разлогинивания
                // --- Конец РАСКОММЕНТИРОВАННОГО ВЫЗОВА ---
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
            // Здесь будем добавлять сброс для других сторов (категории, расходы и т.д.)

        } catch (error) {
            console.error('Ошибка при выходе:', error); // Убрана фраза про "нормально" т.к. теперь вызываем API
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
        }
    },

    clearError: () => set({ error: null }),

    // --- НОВОЕ ДЕЙСТВИЕ: Инициализация данных пользователя ---
    fetchInitialUserData: async () => {
        const { isAuthenticated, user } = get();

        if (isAuthenticated && user && user.access_token) {
            const token = user.access_token;
            console.log("Fetching initial user data (balance, etc.)...");

            // --- Вызываем действия загрузки данных из других сторов ---
            // 1. Загрузка баланса
            useBalanceStore.getState().fetchBalance(token);

            // --- Здесь в будущем будем добавлять вызовы для загрузки других данных ---
            // useCategoriesStore.getState().fetchCategories(token);
            // useSpendingsStore.getState().fetchSpendings(token);
            // и т.д.
            // --- Конец вызовов загрузки ---

        } else {
            // Если пользователь не авторизован (или разлогинился), сбрасываем состояние других сторов
            useBalanceStore.getState().resetBalance();
            // Сброс для других сторов
        }
    },
    // --- Конец НОВОГО ДЕЙСТВИЯ ---


    // Действие для инициализации стора при запуске приложения (проверка localStorage)
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
            // fetchInitialUserData будет вызван из useEffect в App.jsx после этого.

        } else {
            set({
                isAuthenticated: false,
                user: null,
                status: 'idle',
                error: null
            });
            // Если нет токена при инициализации, сбрасываем состояние других сторов
            useBalanceStore.getState().resetBalance();
            // Сброс для других сторов
        }
    }
}));

export default useAuthStore;