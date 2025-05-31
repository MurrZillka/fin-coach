import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware'; // Добавляем middleware
import { login as loginApi, signup as signupApi, logout as logoutApi } from '../api/auth';

const useAuthStore = create(
    subscribeWithSelector((set, get) => ({
        user: null,
        isAuthenticated: false,
        status: 'idle',
        error: null,
        isInitializing: true,

        login: async (credentials) => {
            set({ status: 'loading', error: null });
            try {
                const result = await loginApi(credentials);
                if (result.error) {
                    set({ status: 'failed', error: result.error });
                    throw result.error;
                }
                const { data } = result;
                if (data && data.access_token) localStorage.setItem('token', data.access_token);
                if (data && data.userName) localStorage.setItem('userName', data.userName);
                set({ user: data, isAuthenticated: true, status: 'succeeded', error: null });
                get().fetchInitialUserData();
                return data;
            } catch (error) {
                const unexpectedError = { message: error.message || 'Произошла ошибка', status: error.status || 500 };
                set({ status: 'failed', error: unexpectedError });
                localStorage.removeItem('token');
                localStorage.removeItem('userName');
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
                set({ status: 'succeeded', error: null });
                return result.data;
            } catch (error) {
                set({ status: 'failed', error: { message: error.message || 'Произошла ошибка', status: error.status || 500 } });
                throw error;
            }
        },

        logout: async () => {
            set({ status: 'loading' });
            try {
                await logoutApi();
            } catch (error) {
                console.error('authStore: Error during logout API call:', error);
            } finally {
                localStorage.removeItem('userName');
                localStorage.removeItem('token');
                set({ user: null, isAuthenticated: false, status: 'idle', error: null });
            }
        },

        clearError: () => set({ error: null }),

        fetchInitialUserData: () => {
            const { isAuthenticated, user } = get();
            if (isAuthenticated && user && user.access_token) {
                // Теперь это обрабатывает storeCoordinator.js
            } else {
                set({ user: null, loading: false, error: null });
            }
        },

        initAuth: () => {
            set({ isInitializing: true });
            const token = localStorage.getItem('token');
            const userName = localStorage.getItem('userName');
            if (token) {
                set({
                    isAuthenticated: true,
                    user: { access_token: token, userName: userName || 'Пользователь' },
                    status: 'succeeded',
                    error: null,
                    isInitializing: false,
                });
            } else {
                set({
                    isAuthenticated: false,
                    user: null,
                    status: 'idle',
                    error: null,
                    isInitializing: false,
                });
            }
        },
    }))
);

export default useAuthStore;