export interface Recommendation {
    id: number;
    name: string;
    description: string;
}

export interface GetRecommendationsResponse {
    Recommendations: Recommendation[];
}
