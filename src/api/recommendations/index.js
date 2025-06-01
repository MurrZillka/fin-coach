// src/api/recommendations/index.js
import apiClient from '../client.js';

export const getRecommendations = async () => {
    return apiClient.get('/Recommendations');
};
