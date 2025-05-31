//src/api/balance/index.js
import apiClient from "../client.js";

export const getBalance = async (token) => {
    try {
        const response = await apiClient.get('/Balance', {
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