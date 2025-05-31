//src/api/credit/index.js
import axios from 'axios';
import {API_BASE_URL } from '../config';

const api = axios.create({
    baseURL: API_BASE_URL,
    headers: { 'Content-Type': 'application/json' },
});

export const addCredit = async (data, token) => {
    try {
        const response = await api.post('/AddCredit', data, {
            headers: { Authorization: `Bearer ${token}` },
        });
        return { data: response.data, error: null };
    } catch (error) {
        return {
            data: null,
            error: {
                message: error.response?.data?.error || 'Failed to add credit',
                status: error.response?.status || 500,
            },
        };
    }
};

export const getCredits = async (token) => {
    try {
        const response = await api.get('/Credits', {
            headers: { Authorization: `Bearer ${token}` },
        });
        return { data: response.data, error: null };
    } catch (error) {
        return {
            data: null,
            error: {
                message: error.response?.data?.error || 'Failed to fetch credits',
                status: error.response?.status || 500,
            },
        };
    }
};

export const getCreditsPermanent = async (token) => {
    try {
        const response = await api.get('/Credits?permanent=true', {
            headers: { Authorization: `Bearer ${token}` },
        });
        return { data: response.data, error: null };
    } catch (error) {
        return {
            data: null,
            error: {
                message: error.response?.data?.error || 'Failed to fetch permanent credits',
                status: error.response?.status || 500,
            },
        };
    }
};

export const getCreditById = async (id, token) => {
    try {
        const response = await api.get(`/Credit/${id}`, {
            headers: { Authorization: `Bearer ${token}` },
        });
        return { data: response.data, error: null };
    } catch (error) {
        return {
            data: null,
            error: {
                message: error.response?.data?.error || 'Failed to fetch credit',
                status: error.response?.status || 500,
            },
        };
    }
};

export const updateCreditById = async (id, data, token) => {
    try {
        const response = await api.put(`/Credit/${id}`, data, {
            headers: { Authorization: `Bearer ${token}` },
        });
        return { data: response.data, error: null };
    } catch (error) {
        return {
            data: null,
            error: {
                message: error.response?.data?.error || 'Failed to update credit',
                status: error.response?.status || 500,
            },
        };
    }
};

export const deleteCreditById = async (id, token) => {
    try {
        const response = await api.delete(`/Credit/${id}`, {
            headers: { Authorization: `Bearer ${token}` },
        });
        return { data: response.data, error: null };
    } catch (error) {
        return {
            data: null,
            error: {
                message: error.response?.data?.error || 'Failed to delete credit',
                status: error.response?.status || 500,
            },
        };
    }
};