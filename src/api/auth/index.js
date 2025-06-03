// src/api/auth/index.js
import apiClient from '../client';

export const signup = async (data) => {
    return apiClient.post('/signup', data);
};

export const login = async (data) => {
    return apiClient.post('/login', data);
};

export const logout = async () => {
    return apiClient.get('/logout');
};

export const validateToken = async () => {
    try {
        const response = await apiClient.get('/Balance');
        return response.error === null;
    } catch (error) {
        console.error('api_auth, validateToken:', error);
        return false;
    }
};