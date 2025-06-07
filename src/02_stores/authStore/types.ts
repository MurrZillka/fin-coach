//src/02_stores/authStore/types.ts

import { LoginResponse } from '../../01_api/auth/types';

export interface AuthStoreState {
    user: LoginResponse | null;
    isAuthenticated: boolean;
    status: 'idle' | 'initializing' | 'loading' | 'succeeded' | 'failed';
    error: { message: string; status: number } | null;
}

export interface AuthStoreActions {
    setToken: (token: string) => void;
    clearToken: () => void;
    setUserName: (userName: string) => void;
    clearUserName: () => void;
    resetAuthState: () => void;
    handleError: (error: any) => void;
    login: (credentials: { login: string; password: string }) => Promise<LoginResponse>;
    signup: (userData: { user_name: string; login: string; password: string }) => Promise<{ ok: boolean }>;
    logoutLocal: () => void;
    logout: () => Promise<void>;
    clearError: () => void;
    initAuth: () => Promise<void>;
}

export type AuthStore = AuthStoreState & AuthStoreActions;
