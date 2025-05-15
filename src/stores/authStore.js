// src/stores/authStore.js
import { create } from 'zustand';
// Убедись, что путь к api/auth корректный
import { login as loginApi, signup as signupApi, logout as logoutApi } from '../api/auth';

// --- ИМПОРТЫ СТОРОВ ---
// Убедись, что пути к другим сторам корректны
import useBalanceStore from './balanceStore';
import useCreditStore from './creditStore';
import useCategoryStore from './categoryStore';
import useSpendingsStore from './spendingsStore';
// --- ДОБАВЛЕНО: Импортируем стор Целей ---
import useGoalsStore from './goalsStore'; // Импортируем useGoalsStore
import useMainPageStore from './mainPageStore';
// --- Конец ИМПОРТОВ ---

// Добавляем get во второй аргумент create для доступа к текущему состоянию стора
const useAuthStore = create((set, get) => ({
    user: null,
    isAuthenticated: false,
    status: 'idle', // 'idle', 'loading', 'succeeded', 'failed'
    error: null,
    isInitializing: true,
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

            // --- ВЫЗЫВАЕМ fetchInitialUserData после успешного входа ---
            // Это гарантирует загрузку данных (включая теперь и цели) для только что вошедшего пользователя
            console.log('authStore: Triggering fetchInitialUserData after successful login.'); // Лог триггера
            get().fetchInitialUserData(); // Вызываем действие через get()
            // --- Конец ВЫЗОВА ---

            return data;

        } catch (error) {
            console.error('authStore: Unexpected error in login (from authStore):', error); // Лог непредвиденной ошибки
            const unexpectedError = { message: error.message || 'Произошла непредвиденная ошибка авторизации', status: error.status || 500 };
            set({ status: 'failed', error: unexpectedError });
            // При ошибке входа также важно сбросить состояние, т.к. аутентификация не удалась
            localStorage.removeItem('token'); // Убедимся, что токен удален
            localStorage.removeItem('userName');
            // Здесь не вызываем полный logout, т.к. это может быть ошибка API до установки auth state
            // Сброс других сторов при ошибке входа не требуется, они должны сбрасываться при логауте или инициализации без токена
            throw error; // Пробрасываем ошибку
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
        set({ status: 'loading' }); // Опционально, индикатор выхода

        const token = localStorage.getItem('token'); // Берем токен перед очисткой

        try {
            if (token) { // Вызываем API выхода только если токен был
                console.log('authStore: Calling logoutApi...'); // Лог вызова API
                await logoutApi(token);
                console.log('authStore: logoutApi successful.'); // Лог успеха API
            }
        } catch (error) {
            console.error('authStore: Error during logout API call:', error); // Лог ошибки при вызове API выхода
            // Даже если API выхода с ошибкой, локальные данные и состояние стора нужно почистить
        } finally {
            // --- ОЧИСТКА ЛОКАЛЬНЫХ ДАННЫХ И СОСТОЯНИЯ ---
            // Этот блок выполняется независимо от успеха или ошибки API вызова
            console.log('authStore: Clearing local storage and state...');
            localStorage.removeItem('userName');
            localStorage.removeItem('token');

            set({
                user: null,
                isAuthenticated: false, // --- ЭТО ИЗМЕНЕНИЕ ВЫЗЫВАЕТ СБРОС В ДРУГИХ СТОРАХ ЧЕРЕЗ ПОДПИСКУ ---
                status: 'idle', // Возвращаемся в исходное состояние
                error: null // Сбрасываем любые ошибки
            });
            console.log('authStore: Local storage cleared and state reset.');

            // --- СБРОС ДРУГИХ СТОРОВ ЧЕРЕЗ ПОДПИСКИ ---
            // Подписки в storeInitializer.js слушают изменение isAuthenticated на false
            // и вызывают reset в соответствующих сторах.
            console.log('authStore: Resetting other stores handled by subscriptions.');
            // Не вызываем reset() здесь явно, подписки сделают это.
            // --- Конец СБРОСА ДРУГИХ СТОРОВ ---

            console.log('authStore: logout finished.'); // Лог завершения
        }
    },

    clearError: () => {
        console.log('authStore: clearError called.'); // Лог
        set({ error: null });
    },


    // --- Действие: Инициализация данных пользователя (вызывается в App.jsx после initAuth) ---
    // Это действие вызывается при монтировании App, если initAuth нашел токен, ИЛИ после успешного login.
    // Оно должно инициировать загрузку данных для текущего пользователя.
    fetchInitialUserData: async () => {
        console.log('authStore: fetchInitialUserData started'); // Лог начала
        const { isAuthenticated, user } = get(); // Получаем текущее состояние authStore

        if (isAuthenticated && user && user.access_token) {
            const token = user.access_token; // Берем токен из текущего состояния user объекта
            console.log("authStore: User is authenticated, fetching initial user data..."); // Лог

            // --- ВЫЗЫВАЕМ ДЕЙСТВИЯ ЗАГРУЗКИ ДАННЫХ ИЗ ДРУГИХ СТОРОВ ---
            // Вызываем эти действия, передавая токен
            console.log('authStore: Triggering fetchBalance, fetchCredits, fetchSpendings, fetchCategories, fetchGoals, getCurrentGoal...'); // Лог вызовов

            // Используем getState() для доступа к действиям загрузки других сторов
            useBalanceStore.getState().fetchBalance(token); // <-- Здесь передача токена сохранена
            useCreditStore.getState().fetchCredits(token); // <-- Здесь передача токена сохранена
            useSpendingsStore.getState().fetchSpendings(token); // <-- Здесь передача токена сохранена
            useCategoryStore.getState().fetchCategories(token); // <-- Здесь передача токена сохранена

            // --- ДОБАВЛЕНО: Вызываем загрузку целей и текущей цели ---
            // Убедитесь, что useGoalsStore импортирован в начале файла
            useGoalsStore.getState().fetchGoals(); // Вызываем загрузку списка целей
            useGoalsStore.getState().getCurrentGoal(); // Вызываем загрузку текущей цели
            useMainPageStore.getState().fetchRecommendations(token); // ДОБАВЛЕНО
            useMainPageStore.getState().fetchFinancialOverview(token); // ДОБАВЛЕНО
            // --- Конец ДОБАВЛЕННОГО ---


            // Здесь не устанавливаем loading в authStore, т.к. loading уже обрабатывается в каждом сторе данных.
            // Здесь не сбрасываем сторы, т.к. пользователь аутентифицирован, и мы будем фетчить его данные.

        } else {
            // Если пользователь не авторизован (или разлогинился до этого), состояние isAuthenticated становится false.
            // ЭТО ИЗМЕНЕНИЕ (ЕСЛИ ПРОИЗОШЛО) ВЫЗЫВАЕТ СБРОС В ДРУГИХ СТОРАХ ЧЕРЕЗ ПОДПИСКУ.
            // Здесь нам не нужно явно вызывать reset, подписки сделают это при смене isAuthenticated.
            console.log("authStore: User not authenticated or logged out. Resetting other stores handled by subscriptions..."); // Лог сброса

            // Убедимся, что состояние authStore корректно сброшено, хотя logout это делает.
            // Этот блок может сработать при initAuth, если токена нет.
            set({ user: null, loading: false, error: null }); // Убедимся, что user null если нет аутентификации
        }
        console.log('authStore: fetchInitialUserData finished.'); // Лог завершения
    },
    // --- Конец Действия Инициализации данных ---
    // Действие для инициализации стора при запуске приложения (проверка localStorage)
    // Это первое действие, которое вызывается при монтировании App.
    initAuth: () => {
        console.log('authStore: initAuth started');
        set({ isInitializing: true });
        const token = localStorage.getItem('token');
        const userName = localStorage.getItem('userName');

        if (token) {
            console.log("authStore: Found token in localStorage, setting isAuthenticated true...");
            set({
                isAuthenticated: true,
                user: {
                    access_token: token,
                    userName: userName || 'Пользователь'
                },
                status: 'succeeded',
                error: null,
                isInitializing: false
            });
            console.log('authStore: initAuth finished (authenticated). State set based on token.');
        } else {
            console.log("authStore: No token found in localStorage.");
            set({
                isAuthenticated: false,
                user: null,
                status: 'idle',
                error: null,
                isInitializing: false // Исправлено
            });
            console.log('authStore: No token on init. Resetting other stores handled by subscriptions.');
            console.log('authStore: Finished attempting to reset other stores (not authenticated).');
            console.log('authStore: initAuth finished (not authenticated).');
        }
    },
}));

export default useAuthStore;