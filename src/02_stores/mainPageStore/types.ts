import {ApiErrorWithMessage} from "../../01_api/apiTypes";

export interface MainPageStoreState {
    recommendations: any[] | null; // Если есть Recommendation, замени any[]
    loading: boolean;
    error: ApiErrorWithMessage | null;
}

export interface MainPageStoreActions {
    setRecommendations: (recommendations: any[] | null) => void;
    setLoading: (loading: boolean) => void;
    setError: (error: ApiErrorWithMessage | null) => void;
    handleError: (error: unknown, actionName: string) => never;
    fetchRecommendations: () => Promise<void>;
    resetRecommendations: () => void;
    clearError: () => void;
}

export type MainPageStore = MainPageStoreState & MainPageStoreActions;
