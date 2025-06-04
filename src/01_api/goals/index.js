// src/api/goals/apiTypes.ts
import apiClient from '../client.ts';

export const getGoals = async () => {
    return apiClient.get('/Goals');
};

export const addGoal = async (goalData) => {
    return apiClient.post('/AddGoal', goalData);
};

export const getGoalById = async (id) => {
    return apiClient.get(`/Goal/${id}`);
};

export const updateGoalById = async (id, goalData) => {
    return apiClient.put(`/Goal/${id}`, goalData);
};

export const deleteGoalById = async (id) => {
    return apiClient.delete(`/Goal/${id}`);
};

export const getCurrentGoal = async () => {
    return apiClient.get('/CurrentGoal');
};

export const setCurrentGoal = async (id) => {
    return apiClient.put(`/CurrentGoal/${id}`, null);
};
