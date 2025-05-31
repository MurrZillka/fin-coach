// src/api/auth/index.js
import apiClient from '../client';

export const getUsers = async () => {
    return apiClient.get('/users');
};

export const signup = async (data) => {
    return apiClient.post('/signup', data);
};

export const login = async (data) => {
    return apiClient.post('/login', data);
};

export const logout = async () => {
    return apiClient.get('/logout');
};