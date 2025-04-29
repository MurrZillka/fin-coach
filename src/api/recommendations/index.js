import axios from 'axios';
import { USE_MOCKS, API_BASE_URL } from '../config';
import { mockRecommendations } from './mocks';

const api = axios.create({
    baseURL: API_BASE_URL,
    headers: { 'Content-Type': 'application/json' },
});

export const getRecommendations = async (token) => {
    try {
        if (USE_MOCKS) return { data: await mockRecommendations.getRecommendations(), error: null };
        const response = await api.get('/Recommendations', {
            headers: { Authorization: `Bearer ${token}` },
        });
        return { data: response.data, error: null };
    } catch (error) {
        return {
            data: null,
            error: {
                message: error.response?.data?.error || 'Failed to fetch recommendations',
                status: error.response?.status || 500,
            },
        };
    }
};

export const getFinancialOverview = async (token) => {
    try {
        if (USE_MOCKS) return { data: await mockRecommendations.getFinancialOverview(), error: null };
        const response = await api.get('/FinancialOverview', {
            headers: { Authorization: `Bearer ${token}` },
        });
        return { data: response.data, error: null };
    } catch (error) {
        return {
            data: null,
            error: {
                message: error.response?.data?.error || 'Failed to fetch financial overview',
                status: error.response?.status || 500,
            },
        };
    }
};