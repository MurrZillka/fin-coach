// src/api/spendings/index.ts

import apiClient from '../client';
import {
    Spending,
    GetSpendingsResponse,
    SpendingRequest,
    SpendingActionResponse
} from './types';

export const addSpending = async (data: SpendingRequest): Promise<SpendingActionResponse> => {
    const response = await apiClient.post<SpendingActionResponse>('/AddSpending', data);
    return response.data;
};

export const getSpendings = async (): Promise<GetSpendingsResponse> => {
    const response = await apiClient.get<GetSpendingsResponse>('/Spendings');
    return response.data;
};

export const getSpendingsPermanent = async (): Promise<GetSpendingsResponse> => {
    const response = await apiClient.get<GetSpendingsResponse>('/Spendings?permanent=true');
    return response.data;
};

export const getSpendingById = async (id: number): Promise<Spending> => {
    const response = await apiClient.get<Spending>(`/Spending/${id}`);
    return response.data;
};

export const updateSpendingById = async (id: number, data: SpendingRequest): Promise<SpendingActionResponse> => {
    const response = await apiClient.put<SpendingActionResponse>(`/Spending/${id}`, data);
    return response.data;
};

export const deleteSpendingById = async (id: number): Promise<SpendingActionResponse> => {
    const response = await apiClient.delete<SpendingActionResponse>(`/Spending/${id}`);
    return response.data;
};
