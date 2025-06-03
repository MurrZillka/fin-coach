//src/api/balance/index.js
import apiClient from "../client.ts";

export const getBalance = async () => {
    return apiClient.get('/Balance');
};