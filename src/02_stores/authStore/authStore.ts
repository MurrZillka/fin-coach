// src/stores/authStore.ts

import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';
import { login as loginApi, signup as signupApi, logout as logoutApi, validateToken } from '../../01_api/auth/index';
import { handleAuthApiError } from "../../01_api/auth/utils/handleAuthApiError";
import type { LoginResponse } from '../../01_api/auth/types';
import type { AuthStore } from './types.ts';

export const useAuthStore = create<AuthStore>()(
    subscribeWithSelector((set, get) => ({
        user: null,
        isAuthenticated: false,
        status: 'idle',
        error: null,

        setToken: (token: string) => localStorage.setItem('token', token),
        clearToken: () => localStorage.removeItem('token'),
        setUserName: (userName: string) => localStorage.setItem('userName', userName),
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

        handleError: (error: any) => {
            const processedError = handleAuthApiError(error);
            set({ status: 'failed', error: processedError });
            console.error('authStore: Error occurred:', error);
        },

        login: async (credentials: { login: string; password: string }) => {
            set({ status: 'loading', error: null });
            try {
                const data = await loginApi(credentials);
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

        signup: async (userData: { user_name: string; login: string; password: string }) => {
            set({ status: 'loading', error: null });
            try {
                const data = await signupApi(userData);
                set({ status: 'succeeded', error: null });
                return data;
            } catch (error) {
                get().handleError(error);
                throw error;
            }
        },

        logoutLocal: () => {
            set({
                user: null,
                isAuthenticated: false,
                status: 'idle',
                error: null
            });
            localStorage.removeItem('token');
            localStorage.removeItem('userName');
        },

        logout: async () => {
            set({ status: 'loading' });
            try {
                await logoutApi();
                localStorage.setItem('logout_event', Date.now().toString());
                localStorage.removeItem('logout_event');
            } catch (error) {
                get().handleError(error);
            } finally {
                get().resetAuthState();
            }
        },

        clearError: () => set({ error: null }),

        initAuth: async () => {
            set({ status: 'initializing' });
            const token = localStorage.getItem('token');
            const userName = localStorage.getItem('userName');

            if (!token) {
                set({ status: 'succeeded' });
                get().resetAuthState();
                return;
            }

            try {
                const isValid = await validateToken();

                if (isValid) {
                    set({
                        isAuthenticated: true,
                        user: { access_token: token, userName: userName || 'Пользователь' } as LoginResponse,
                        status: 'succeeded',
                        error: null,
                    });
                } else {
                    set({ status: 'succeeded' });
                    get().resetAuthState();
                }
            } catch (error) {
                console.error('authStore: Token validation failed:', {
                    message: error.message,
                    status: error.status,
                    url: error.config?.url
                });
                set({ status: 'succeeded' });
                get().resetAuthState();
            }
        },
    }))
);

export default useAuthStore;
