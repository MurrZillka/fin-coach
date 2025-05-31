import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';
import { login as loginApi, signup as signupApi, logout as logoutApi } from '../api/auth';

const useAuthStore = create(
    subscribeWithSelector((set, get) => ({
        user: null,
        isAuthenticated: false,
        status: 'idle',
        error: null,

        setToken: (token) => localStorage.setItem('token', token),
        clearToken: () => localStorage.removeItem('token'),
        setUserName: (userName) => localStorage.setItem('userName', userName),
        clearUserName: () => localStorage.removeItem('userName'),

        resetAuthState: () => {
            set({
                user: null,
                isAuthenticated: false,
                status: 'idle',
                error: null,
            });
            get().clearToken();
            get().clearUserName();
        },

        handleError: (error) => {
            console.error('authStore: Error occurred:', error);
            const errorObj = error.message ? { message: error.message, status: error.status || 500 } : error;
            set({ status: 'failed', error: errorObj });
        },

        login: async (credentials) => {
            set({ status: 'loading', error: null });
            try {
                const result = await loginApi(credentials);
                if (result.error) {
                    get().handleError(result.error);
                    throw result.error;
                }
                const { data } = result;
                if (data && data.access_token) get().setToken(data.access_token);
                if (data && data.userName) get().setUserName(data.userName);
                set({ user: data, isAuthenticated: true, status: 'succeeded', error: null });
                return data;
            } catch (error) {
                get().resetAuthState();
                get().handleError(error);
                throw error;
            }
        },

        signup: async (userData) => {
            set({ status: 'loading', error: null });
            try {
                const result = await signupApi(userData);
                if (result.error) {
                    get().handleError(result.error);
                    throw result.error;
                }
                set({ status: 'succeeded', error: null });
                return result.data;
            } catch (error) {
                get().handleError(error);
                throw error;
            }
        },

        logout: async () => {
            set({ status: 'loading' });
            try {
                await logoutApi();
            } catch (error) {
                get().handleError(error);
            } finally {
                get().resetAuthState();
            }
        },

        clearError: () => set({ error: null }),

        initAuth: () => {
            set({ status: 'initializing' });
            const token = localStorage.getItem('token');
            const userName = localStorage.getItem('userName');
            if (token) {
                set({
                    isAuthenticated: true,
                    user: { access_token: token, userName: userName || 'Пользователь' },
                    status: 'succeeded',
                    error: null,
                });
            } else {
                get().resetAuthState();
            }
        },
    }))
);

export default useAuthStore;