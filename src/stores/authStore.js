// src/stores/authStore.js
import { create } from 'zustand';
import { login as loginApi, signup as signupApi, logout as logoutApi } from '../api/auth';

import useBalanceStore from './balanceStore';
import useCreditStore from './creditStore';
import useCategoryStore from './categoryStore';
import useSpendingsStore from './spendingsStore';
import useGoalsStore from './goalsStore';

const useAuthStore = create((set, get) => ({
    user: null,
    isAuthenticated: false,
    status: 'idle',
    error: null,

    login: async (credentials) => {
        console.log('authStore: login started');
        set({ status: 'loading', error: null });
        try {
            const result = await loginApi(credentials);
            console.log('authStore: API login result:', result);

            if (result.error) {
                set({ status: 'failed', error: result.error });
                console.error('authStore: API login error:', result.error);
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
            console.log('authStore: login successful, isAuthenticated set to true.');

            return data;

        } catch (error) {
            console.error('authStore: Unexpected error in login (from authStore):', error);
            const unexpectedError = { message: error.message || 'Произошла непредвиденная ошибка авторизации', status: error.status || 500 };
            set({ status: 'failed', error: unexpectedError });
            localStorage.removeItem('token');
            localStorage.removeItem('userName');
            throw error;
        } finally {
            console.log('authStore: login finished.');
        }
    },

    signup: async (userData) => {
        console.log('authStore: signup started');
        set({ status: 'loading', error: null });
        try {
            const result = await signupApi(userData);
            console.log('authStore: API signup result:', result);

            if (result.error) {
                set({ status: 'failed', error: result.error });
                console.error('authStore: API signup error:', result.error);
                throw result.error;
            }

            const { data } = result;

            set({ status: 'succeeded', error: null });
            console.log('authStore: signup successful.');
            return data;
        } catch (error) {
            console.error('authStore: Unexpected error in signup (from authStore):', error);
            const unexpectedError = { message: error.message || 'Произошла непредвиденная ошибка при регистрации', status: error.status || 500 };
            set({ status: 'failed', error: unexpectedError });
            throw error;
        } finally {
            console.log('authStore: signup finished.');
        }
    },

    logout: async () => {
        console.log('authStore: logout started');
        set({ status: 'loading' });

        const token = localStorage.getItem('token');

        try {
            if (token) {
                console.log('authStore: Calling logoutApi...');
                await logoutApi(token);
                console.log('authStore: logoutApi successful.');
            }
        } catch (error) {
            console.error('authStore: Error during logout API call:', error);
        } finally {
            console.log('authStore: Clearing local storage and state...');
            localStorage.removeItem('userName');
            localStorage.removeItem('token');

            set({
                user: null,
                isAuthenticated: false,
                status: 'idle',
                error: null
            });
            console.log('authStore: Local storage cleared and state reset.');

            console.log('authStore: Resetting other stores handled by subscriptions.');
            console.log('authStore: logout finished.');
        }
    },

    clearError: () => {
        console.log('authStore: clearError called.');
        set({ error: null });
    },

    fetchInitialUserData: async () => {
        console.log('authStore: fetchInitialUserData started');
        const { isAuthenticated, user } = get();

        if (isAuthenticated && user && user.access_token) {
            const token = user.access_token;
            console.log("authStore: User is authenticated, fetching initial user data...");
            console.log('authStore: Triggering fetchBalance, fetchCredits, fetchSpendings, fetchCategories, fetchGoals, getCurrentGoal...');

            useBalanceStore.getState().fetchBalance(token);
            useCreditStore.getState().fetchCredits(token);
            useSpendingsStore.getState().fetchSpendings(token);
            useCategoryStore.getState().fetchCategories(token);
            useGoalsStore.getState().fetchGoals();
            useGoalsStore.getState().getCurrentGoal();
        } else {
            console.log("authStore: User not authenticated or logged out. Resetting other stores handled by subscriptions...");
            set({ user: null, loading: false, error: null });
        }
        console.log('authStore: fetchInitialUserData finished.');
    },

    initAuth: () => {
        console.log('authStore: initAuth started');
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
                error: null
            });
            console.log('authStore: initAuth finished (authenticated). State set based on token.');
        } else {
            console.log("authStore: No token found in localStorage.");
            set({
                isAuthenticated: false,
                user: null,
                status: 'idle',
                error: null
            });
            console.log('authStore: No token on init. Resetting other stores handled by subscriptions.');
            console.log('authStore: Finished attempting to reset other stores (not authenticated).');
            console.log('authStore: initAuth finished (not authenticated).');
        }
    }
}));

export default useAuthStore;