import apiClient from '../client';
import { GetRecommendationsResponse } from './types';

export const getRecommendations = async (): Promise<GetRecommendationsResponse> => {
    const response = await apiClient.get<GetRecommendationsResponse>('/Recommendations');
    return response.data;
};
