// src/api/recommendations/index.js
import apiClient from '../client.ts';

export const getRecommendations = async () => {
    return apiClient.get('/Recommendations');
};
