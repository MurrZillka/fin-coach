import { create } from 'zustand';
import { login as loginApi, signup as signupApi, logout as logoutApi } from '../api/auth';

const useAuthStore = create((set) => ({
    // Состояние
    user: null,
    isAuthenticated: false,
    status: 'idle', // 'idle' | 'loading' | 'succeeded' | 'failed'
    error: null,

    // Действия
    login: async (credentials) => {
        set({ status: 'loading', error: null });
        try {
            const { data, error } = await loginApi(credentials);

            if (error) {
                set({ status: 'failed', error });
                throw error;
            }

            if (data.userName) {
                localStorage.setItem('userName', data.userName);
            }

            set({
                user: data,
                isAuthenticated: true,
                status: 'succeeded'
            });

            return data;
        } catch (error) {
            set({ status: 'failed', error });
            throw error;
        }
    },

    signup: async (userData) => {
        set({ status: 'loading', error: null });
        try {
            const { data, error } = await signupApi(userData);

            if (error) {
                set({ status: 'failed', error });
                throw error;
            }

            set({ status: 'succeeded' });
            return data;
        } catch (error) {
            set({ status: 'failed', error });
            throw error;
        }
    },

    logout: async () => {
        set({ status: 'loading' });
        try {
            await logoutApi();
            localStorage.removeItem('userName');
            set({
                user: null,
                isAuthenticated: false,
                status: 'idle',
                error: null
            });
        } catch (error) {
            set({ status: 'failed', error });
        }
    },

    clearError: () => set({ error: null }),

    // Инициализация состояния из localStorage
    initAuth: () => {
        const token = localStorage.getItem('token');
        const userName = localStorage.getItem('userName');

        if (token) {
            set({
                isAuthenticated: true,
                user: { userName }
            });
        }
    }
}));

export default useAuthStore;