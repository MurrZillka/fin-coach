// src/api/recommendations/apiTypes.ts
import apiClient from '../client.ts';

export const getRecommendations = async () => {
    return apiClient.get('/Recommendations');
};
