//src/api/balance/index.ts
import apiClient from "../client";
import {BalanceResponse} from "./types";

// GET http://217.12.38.196:8888/Balance
// Получить баланс пользователя
export const getBalance = async (): Promise<BalanceResponse> => {
    const response = await apiClient.get<BalanceResponse>('/Balance');
    return response.data;
};
