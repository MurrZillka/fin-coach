import axios from 'axios';
import { getUseMocks, API_BASE_URL } from '../config';
import { mockAuth } from './mocks';

const api = axios.create({
    baseURL: API_BASE_URL,
    headers: { 'Content-Type': 'application/json' },
});

export const getUsers = async () => {
    try {
        if (getUseMocks()) return { data: await mockAuth.getUsers(), error: null };
        const response = await api.get('/users');
        return { data: response.data, error: null };
    } catch (error) {
        return {
            data: null,
            error: {
                message: error.response?.data?.error || 'Failed to fetch users',
                status: error.response?.status || 500,
            },
        };
    }
};

export const signup = async (data) => {
    try {
        if (getUseMocks()) return { data: await mockAuth.signup(), error: null };
        const response = await api.post('/signup', data);
        return { data: response.data, error: null };
    } catch (error) {
        return {
            data: null,
            error: {
                message: error.response?.data?.error || 'Failed to signup',
                status: error.response?.status || 500,
            },
        };
    }
};

export const login = async (data) => {
    try {
        if (getUseMocks()) return { data: await mockAuth.login(data), error: null };
        const response = await api.post('/login', data);
        return { data: response.data, error: null };
    } catch (error) {
        return {
            data: null,
            error: {
                message: error.response?.data?.error || 'Failed to login',
                status: error.response?.status || 500,
            },
        };
    }
};

export const logout = async (token) => {
    try {
        if (getUseMocks()) return { data: await mockAuth.logout(), error: null };
        const response = await api.get('/logout', {
            headers: { Authorization: `Bearer ${token}` },
        });
        return { data: response.data, error: null };
    } catch (error) {
        return {
            data: null,
            error: {
                message: error.response?.data?.error || 'Failed to logout',
                status: error.response?.status || 500,
            },
        };
    }
};