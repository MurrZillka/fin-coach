// src/api/credit/index.ts
import apiClient from '../client';
import {
    GetCreditsResponse,
    CreditRequest,
    CreditActionResponse,
} from './types';

// Получить все кредиты
export const getCredits = async (): Promise<GetCreditsResponse> => {
    const response = await apiClient.get<GetCreditsResponse>('/GetCredits');
    return response.data;
};

// Добавить кредит
export const addCredit = async (creditData: CreditRequest): Promise<CreditActionResponse> => {
    const response = await apiClient.post<CreditActionResponse>('/AddCredit', creditData);
    return response.data;
};

// Обновить кредит по id
export const updateCredit = async (id: number, creditData: CreditRequest): Promise<CreditActionResponse> => {
    const response = await apiClient.put<CreditActionResponse>(`/Credit/${id}`, creditData);
    return response.data;
};

// Удалить кредит по id
export const deleteCredit = async (id: number): Promise<CreditActionResponse> => {
    const response = await apiClient.delete<CreditActionResponse>(`/Credit/${id}`);
    return response.data;
};
