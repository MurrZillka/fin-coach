import axios from 'axios';
import { USE_MOCKS, API_BASE_URL } from '../config';
import { mockBalance } from './mocks';

const api = axios.create({
    baseURL: API_BASE_URL,
    headers: { 'Content-Type': 'application/json' },
});

export const getBalance = async (token) => {
    try {
        if (USE_MOCKS) return { data: await mockBalance.getBalance(), error: null };
        const response = await api.get('/Balance', {
            headers: { Authorization: `Bearer ${token}` },
        });
        return { data: response.data, error: null };
    } catch (error) {
        return {
            data: null,
            error: {
                message: error.response?.data?.error || 'Failed to fetch balance',
                status: error.response?.status || 500,
            },
        };
    }
};