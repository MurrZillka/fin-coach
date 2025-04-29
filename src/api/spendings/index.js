import axios from 'axios';
import { USE_MOCKS, API_BASE_URL } from '../config';
import { mockSpendings } from './mocks';

const api = axios.create({
    baseURL: API_BASE_URL,
    headers: { 'Content-Type': 'application/json' },
});

export const addSpending = async (data, token) => {
    try {
        if (USE_MOCKS) return { data: await mockSpendings.addSpending(), error: null };
        const response = await api.post('/AddSpending', data, {
            headers: { Authorization: `Bearer ${token}` },
        });
        return { data: response.data, error: null };
    } catch (error) {
        return {
            data: null,
            error: {
                message: error.response?.data?.error || 'Failed to add spending',
                status: error.response?.status || 500,
            },
        };
    }
};

export const getSpendings = async (token) => {
    try {
        if (USE_MOCKS) return { data: await mockSpendings.getSpendings(), error: null };
        const response = await api.get('/Spendings', {
            headers: { Authorization: `Bearer ${token}` },
        });
        return { data: response.data, error: null };
    } catch (error) {
        return {
            data: null,
            error: {
                message: error.response?.data?.error || 'Failed to fetch spendings',
                status: error.response?.status || 500,
            },
        };
    }
};

export const getSpendingsPermanent = async (token) => {
    try {
        if (USE_MOCKS) return { data: await mockSpendings.getSpendingsPermanent(), error: null };
        const response = await api.get('/Spendings?permanent=true', {
            headers: { Authorization: `Bearer ${token}` },
        });
        return { data: response.data, error: null };
    } catch (error) {
        return {
            data: null,
            error: {
                message: error.response?.data?.error || 'Failed to fetch permanent spendings',
                status: error.response?.status || 500,
            },
        };
    }
};

export const getSpendingById = async (id, token) => {
    try {
        if (USE_MOCKS) return { data: await mockSpendings.getSpendingById(id), error: null };
        const response = await api.get(`/Spending/${id}`, {
            headers: { Authorization: `Bearer ${token}` },
        });
        return { data: response.data, error: null };
    } catch (error) {
        return {
            data: null,
            error: {
                message: error.response?.data?.error || 'Failed to fetch spending',
                status: error.response?.status || 500,
            },
        };
    }
};

export const updateSpendingById = async (id, data, token) => {
    try {
        if (USE_MOCKS) return { data: await mockSpendings.updateSpendingById(), error: null };
        const response = await api.put(`/Spending/${id}`, data, {
            headers: { Authorization: `Bearer ${token}` },
        });
        return { data: response.data, error: null };
    } catch (error) {
        return {
            data: null,
            error: {
                message: error.response?.data?.error || 'Failed to update spending',
                status: error.response?.status || 500,
            },
        };
    }
};

export const deleteSpendingById = async (id, token) => {
    try {
        if (USE_MOCKS) return { data: await mockSpendings.deleteSpendingById(), error: null };
        const response = await api.delete(`/Spending/${id}`, {
            headers: { Authorization: `Bearer ${token}` },
        });
        return { data: response.data, error: null };
    } catch (error) {
        return {
            data: null,
            error: {
                message: error.response?.data?.error || 'Failed to delete spending',
                status: error.response?.status || 500,
            },
        };
    }
};