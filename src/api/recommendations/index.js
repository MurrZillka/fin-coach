import axios from 'axios';
import {API_BASE_URL } from '../config';

const api = axios.create({
    baseURL: API_BASE_URL,
    headers: { 'Content-Type': 'application/json' },
});

export const getRecommendations = async (token) => {
    try {
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