// src/api/goals/index.ts
import apiClient from '../client';
import type {
    Goal,
    GoalRequest,
    GoalActionResponse,
    GoalsResponse,
    CurrentGoalResponse
} from './types';

// Получить все цели
export const getGoals = async (): Promise<Goal[]> => {
    const response = await apiClient.get<GoalsResponse>('/Goals');
    return response.data.Goals;
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
export const getCurrentGoal = async (): Promise<Goal | null> => {
    const response = await apiClient.get<CurrentGoalResponse>('/CurrentGoal');
    return response.data.Goal;
};

// Установить текущую цель по id
export const setCurrentGoal = async (id: number): Promise<GoalActionResponse> => {
    const response = await apiClient.put<GoalActionResponse>(`/CurrentGoal/${id}`, null);
    return response.data;
};
