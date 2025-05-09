//src/api/credit/index.js
import axios from 'axios';
import { getUseMocks, API_BASE_URL } from '../config';
import { mockCredit } from './mocks';

const api = axios.create({
    baseURL: API_BASE_URL,
    headers: { 'Content-Type': 'application/json' },
});

export const addCredit = async (data, token) => {
    try {
        if (getUseMocks()) return { data: await mockCredit.addCredit(), error: null };
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
        if (getUseMocks()) return { data: await mockCredit.getCredits(), error: null };
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
        if (getUseMocks()) return { data: await mockCredit.getCreditsPermanent(), error: null };
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
        if (getUseMocks()) return { data: await mockCredit.getCreditById(id), error: null };
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
        if (getUseMocks()) return { data: await mockCredit.updateCreditById(), error: null };
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
        if (getUseMocks()) return { data: await mockCredit.deleteCreditById(), error: null };
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