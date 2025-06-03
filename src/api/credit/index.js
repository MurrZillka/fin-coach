// src/api/credit/index.js
import apiClient from '../client.js';

export const addCredit = async (data) => {
    return apiClient.post('/AddCredit', data)
};

export const getCredits = async () => {
    return apiClient.get('/Credits');
};

export const getCreditsPermanent = async () => {
    return apiClient.get('/Credits?permanent=true');
};

export const getCreditById = async (id) => {
    return apiClient.get(`/Credit/${id}`);
};

export const updateCreditById = async (id, data) => {
    return apiClient.put(`/Credit/${id}`, data);
};

export const deleteCreditById = async (id) => {
    return apiClient.delete(`/Credit/${id}`);
};