//src/api/goals/index.js

import axios from 'axios';
import { getUseMocks, API_BASE_URL } from '../config';
import { mockGoals } from './mocks';

const api = axios.create({
    baseURL: API_BASE_URL,
    headers: { 'Content-Type': 'application/json' },
});

export const addGoal = async (data, token) => {
    try {
        if (getUseMocks()) return { data: await mockGoals.addGoal(), error: null };
        const response = await api.post('/AddGoal', data, {
            headers: { Authorization: `Bearer ${token}` },
        });
        return { data: response.data, error: null };
    } catch (error) {
        return {
            data: null,
            error: {
                message: error.response?.data?.error || 'Failed to add goal',
                status: error.response?.status || 500,
            },
        };
    }
};

export const getGoals = async (token) => {
    try {
        if (getUseMocks()) return { data: await mockGoals.getGoals(), error: null };
        const response = await api.get('/Goals', {
            headers: { Authorization: `Bearer ${token}` },
        });
        return { data: response.data, error: null };
    } catch (error) {
        return {
            data: null,
            error: {
                message: error.response?.data?.error || 'Failed to fetch goals',
                status: error.response?.status || 500,
            },
        };
    }
};

export const getGoalById = async (id, token) => {
    try {
        if (getUseMocks()) return { data: await mockGoals.getGoalById(id), error: null };
        const response = await api.get(`/Goal/${id}`, {
            headers: { Authorization: `Bearer ${token}` },
        });
        return { data: response.data, error: null };
    } catch (error) {
        return {
            data: null,
            error: {
                message: error.response?.data?.error || 'Failed to fetch goal',
                status: error.response?.status || 500,
            },
        };
    }
};

export const updateGoalById = async (id, data, token) => {
    try {
        if (getUseMocks()) return { data: await mockGoals.updateGoalById(), error: null };
        const response = await api.put(`/Goal/${id}`, data, {
            headers: { Authorization: `Bearer ${token}` },
        });
        return { data: response.data, error: null };
    } catch (error) {
        return {
            data: null,
            error: {
                message: error.response?.data?.error || 'Failed to update goal',
                status: error.response?.status || 500,
            },
        };
    }
};

// --- Путь запроса для setCurrentGoal исправлен согласно описанию API: /CurrentGoal/{id} ---
export const setCurrentGoal = async (id, token) => {
    try {
        if (getUseMocks()) return { data: await mockGoals.setCurrentGoal(id), error: null };
        const response = await api.put(`/CurrentGoal/${id}`, null, { // Используем null в теле, так как API не показывает явного тела
            headers: { Authorization: `Bearer ${token}` },
        });
        return { data: response.data, error: null };
    } catch (error) {
        return {
            data: null,
            error: {
                message: error.response?.data?.error || 'Failed to set current goal',
                status: error.response?.status || 500,
            },
        };
    }
};
// --- Конец исправления ---


export const getCurrentGoal = async (token) => {
    try {
        if (getUseMocks()) return { data: await mockGoals.getCurrentGoal(), error: null };
        const response = await api.get('/CurrentGoal', {
            headers: { Authorization: `Bearer ${token}` },
        });
        return { data: response.data, error: null };
    } catch (error) {
        return {
            data: null,
            error: {
                message: error.response?.data?.error || 'Failed to fetch current goal',
                status: error.response?.status || 500,
            },
        };
    }
};

export const deleteGoalById = async (id, token) => {
    try {
        if (getUseMocks()) return { data: await mockGoals.deleteGoalById(), error: null };
        const response = await api.delete(`/Goal/${id}`, {
            headers: { Authorization: `Bearer ${token}` },
        });
        return { data: response.data, error: null };
    } catch (error) {
        return {
            data: null,
            error: {
                message: error.response?.data?.error || 'Failed to delete goal',
                status: error.response?.status || 500,
            },
        };
    }
};