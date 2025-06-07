// src/02_stores/mainPageStore/mainPageStore.ts
import {create} from 'zustand';
import {subscribeWithSelector} from 'zustand/middleware';
import * as mainPageAPI from '../../01_api/recommendations';
import {handleMainPageApiError} from '../../01_api/recommendations/utils/handleMainPageApiError';
import {ApiError} from '../../01_api/apiTypes';
import {MainPageStore, MainPageStoreState} from "./types";

const initialState: MainPageStoreState = {
    recommendations: null,
    loading: false,
    error: null,
};

const useMainPageStore = create<MainPageStore>()(
    subscribeWithSelector((set, get) => ({
        ...initialState,
        setRecommendations: (recommendations) => set({ recommendations }),
        setLoading: (loading) => set({ loading }),
        setError: (error) => set({ error }),
        handleError: (error, actionName) => {
            let apiError: ApiError;
            if (
                typeof error === 'object' && error !== null &&
                'message' in error && typeof error.message === 'string' &&
                'status' in error && (typeof error.status === 'number' || error.status === null)
            ) {
                apiError = error as ApiError;
            } else {
                apiError = {
                    message: 'Неизвестная ошибка',
                    status: null
                };
            }
            const processedError = handleMainPageApiError(apiError);
            set({ error: processedError, loading: false });
            console.error(`Ошибка ${actionName}:`, error);
            throw processedError;
        },
        fetchRecommendations: async () => {
            set({ loading: true, error: null });
            try {
                const data = await mainPageAPI.getRecommendations();
                console.log('mainPageStore: API getRecommendations result:', data);
                const { Recommendations: recommendations = [] } = data || {};
                set({ recommendations });
            } catch (error) {
                get().handleError(error, 'fetchRecommendations');
            } finally {
                set({ loading: false });
            }
        },
        resetRecommendations: () => {
            console.log('mainPageStore: resetMainPage called.');
            set(initialState);
        },
        clearError: () => {
            console.log('mainPageStore: clearError called.');
            set({ error: null });
        },
    }))
);

export default useMainPageStore;
