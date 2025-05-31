//src/api/balance/index.js
import apiClient from "../client.js";

export const getBalance = async () => {
    return apiClient.get('/Balance');
};