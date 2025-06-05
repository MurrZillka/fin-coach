// src/api/goals/apiTypes.ts
import apiClient from '../client';
import { Goal, GoalRequest, GoalActionResponse } from './types';

// Получить все цели
export const getGoals = async (): Promise<Goal[]> => {
    const response = await apiClient.get<Goal[]>('/Goals');
    return response.data;
};

// Добавить цель
export const addGoal = async (goalData: GoalRequest): Promise<GoalActionResponse> => {
    const response = await apiClient.post<GoalActionResponse>('/AddGoal', goalData);
    return response.data;
};

// Обновить цель по id
export const updateGoalById = async (id: number, goalData: GoalRequest): Promise<GoalActionResponse> => {
    const response = await apiClient.put<GoalActionResponse>(`/Goal/${id}`, goalData);
    return response.data;
};

// Удалить цель по id
export const deleteGoalById = async (id: number): Promise<GoalActionResponse> => {
    const response = await apiClient.delete<GoalActionResponse>(`/Goal/${id}`);
    return response.data;
};

// Получить текущую цель
export const getCurrentGoal = async (): Promise<Goal> => {
    const response = await apiClient.get<Goal>('/CurrentGoal');
    return response.data;
};

// Установить текущую цель по id
export const setCurrentGoal = async (id: number): Promise<GoalActionResponse> => {
    const response = await apiClient.put<GoalActionResponse>(`/CurrentGoal/${id}`, null);
    return response.data;
};
