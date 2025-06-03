import {create} from 'zustand';
import {subscribeWithSelector} from 'zustand/middleware';
import {login as loginApi, signup as signupApi, logout as logoutApi, validateToken} from '../api/auth';
import {handleAuthApiError} from "../api/auth/utils/handleAuthApiError.js";

const useAuthStore = create()(
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
            const processedError = handleAuthApiError(error); // Преобразование
            set({status: 'failed', error: processedError}); // Управление состоянием
            console.error('authStore: Error occurred:', error); // Логирование
        },

        login: async (credentials) => {
            set({status: 'loading', error: null});
            try {
                const result = await loginApi(credentials);
                const {data} = result;
                if (data && data.access_token) get().setToken(data.access_token);
                if (data && data.userName) get().setUserName(data.userName);
                set({user: data, isAuthenticated: true, status: 'succeeded', error: null});
                return data;
            } catch (error) {
                get().resetAuthState();
                get().handleError(error);
                throw error;
            }
        },
        signup: async (userData) => {
            set({status: 'loading', error: null});
            try {
                const result = await signupApi(userData);
                set({status: 'succeeded', error: null});
                return result.data;
            } catch (error) {
                get().handleError(error);
                throw error;
            }
        },
        logoutLocal: () => {
            // Только сброс состояния, без API-запроса
            set({
                user: null,
                isAuthenticated: false,
                status: 'idle',
                error: null
            });
            localStorage.removeItem('token');
            localStorage.removeItem('name');
        },
        logout: async () => {
            set({status: 'loading'});
            try {
                await logoutApi();
                localStorage.setItem('logout_event', Date.now());
                localStorage.removeItem('logout_event');
            } catch (error) {
                get().handleError(error);
            } finally {
                get().resetAuthState(); // Только один set() в конце
            }
        },

        clearError: () => set({error: null}),

        initAuth: async () => {
            set({status: 'initializing'});
            const token = localStorage.getItem('token');
            const userName = localStorage.getItem('userName');

            if (!token) {
                set({status: 'succeeded'});
                get().resetAuthState();
                return;
            }

            try {
                const isValid = await validateToken();

                if (isValid) {
                    set({
                        isAuthenticated: true,
                        user: {access_token: token, userName: userName || 'Пользователь'},
                        status: 'succeeded',
                        error: null,
                    });
                } else {
                    set({status: 'succeeded'});
                    get().resetAuthState();
                }
            } catch (error) {
                console.error('authStore: Token validation failed:', {
                    message: error.message,
                    status: error.status,
                    url: error.config?.url
                });
                set({status: 'succeeded'});
                get().resetAuthState();
            }
        },
    }))
);

export default useAuthStore;