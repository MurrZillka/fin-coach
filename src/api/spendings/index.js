import apiClient from '../client.js';

export const addSpending = async (data) => {
    return apiClient.post('/AddSpending', data);
};

export const getSpendings = async () => {
    return apiClient.get('/Spendings');
};

export const getSpendingsPermanent = async () => {
    return apiClient.get('/Spendings?permanent=true');
};

export const getSpendingById = async (id) => {
    return apiClient.get(`/Spending/${id}`);
};

export const updateSpendingById = async (id, data) => {
    return apiClient.put(`/Spending/${id}`, data);
};

export const deleteSpendingById = async (id) => {
    return apiClient.delete(`/Spending/${id}`);
};