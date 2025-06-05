// src/api/auth/index.ts
import apiClient from '../client';
import {
    SignupRequest,
    SignupResponse,
    LoginRequest,
    LoginResponse,
} from './types';
import {BalanceResponse} from "../balance/types";

// Регистрация
export const signup = async (data: SignupRequest) => {
    const response = await apiClient.post<SignupResponse>('/signup', data);
    return response.data;
};

// Логин
export const login = async (data: LoginRequest) => {
    const response = await apiClient.post<LoginResponse>('/login', data);
    return response.data;
};

// Логаут
export const logout = async (): Promise<void> => {
    await apiClient.get('/logout');
    // Сервер не возвращает тело, поэтому просто ждём завершения запроса
}

// Проверка токена (валидности сессии)
export const validateToken = async (): Promise<boolean> => {
    try {
        const response = await apiClient.get<BalanceResponse>('/Balance');
        // Если запрос успешен и приходит баланс — токен валиден
        return typeof response.data.balance === 'number';
    } catch (error) {
        console.error('api_auth, validateToken:', error);
        return false;
    }
}