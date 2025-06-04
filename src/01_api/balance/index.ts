//src/api/balance/apiTypes.ts
import apiClient from "../client";

export const getBalance = async () => {
    return apiClient.get('/Balance');
};