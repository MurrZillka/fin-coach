// src/02_stores/mainPageStore.js
import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';
import * as mainPageAPI from '../01_api/recommendations/index';
import { handleMainPageApiError } from '../01_api/recommendations/utils/handleMainPageApiError.js';

const initialState = {
    recommendations: null,
    loading: false,
    error: null,
};

const useMainPageStore = create()(subscribeWithSelector((set, get) => ({
    // --- Состояние (State) ---
    ...initialState,
    setRecommendations: (recommendations) => set({ recommendations }),
    setLoading: (loading) => set({ loading }),
    setError: (error) => set({ error }),
    handleError: (error, actionName) => {
        const processedError = handleMainPageApiError(error);
        set({ error: processedError, loading: false });
        console.error(`Ошибка ${actionName}:`, error);
        throw processedError;
    },

    // --- Действия (Actions) ---
    fetchRecommendations: async () => {
        set({ loading: true, error: null });
        try {
            const result = await mainPageAPI.getRecommendations();
            console.log('mainPageStore: API getRecommendations result:', result);

            // API возвращает { Recommendations: [...] }
            const { Recommendations: recommendations = [] } = result.data || {};
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
})));

export default useMainPageStore;
