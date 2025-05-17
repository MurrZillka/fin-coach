import { create } from 'zustand';
import * as mainPageAPI from '../api/recommendations/index'; // Путь к API-слою
import useAuthStore from './authStore';

const useMainPageStore = create((set, get) => ({
    // Состояние
    recommendations: null,
    loading: false,
    error: null,

    // Вспомогательная функция: Получение токена
    getToken: () => {
        const token = useAuthStore.getState().user?.access_token;
        if (!token) {
            const authError = { message: 'Пользователь не аутентифицирован. Пожалуйста, войдите.' };
            set({ error: authError, loading: false });
            console.error('Ошибка аутентификации в mainPageStore:', authError);
            return null;
        }
        return token;
    },

    // Действие: Загрузка рекомендаций
    fetchRecommendations: async () => {
        console.log('mainPageStore: fetchRecommendations started');
        if (!get().loading) {
            set({ loading: true, error: null });
        } else {
            set({ error: null });
        }

        const token = get().getToken();
        if (!token) {
            console.log('mainPageStore: fetchRecommendations - No token, stopping fetch.');
            if (!get().loading) set({ loading: false });
            return;
        }
        console.log('mainPageStore: fetchRecommendations - Token found, proceeding with API call.');

        try {
            const result = await mainPageAPI.getRecommendations(token);
            console.log('mainPageStore: API getRecommendations result:', result);

            if (result.error) {
                set({ error: result.error, loading: false });
                console.error('Ошибка загрузки рекомендаций от API:', result.error);
            } else {
                set({ recommendations: result.data.Recommendations || [], loading: false });
            }
        } catch (error) {
            const unexpectedError = { message: error.message || 'Произошла непредвиденная ошибка при загрузке рекомендаций.' };
            set({ error: unexpectedError, loading: false });
            console.error('Непредвиденная ошибка fetchRecommendations:', error);
        } finally {
            console.log('mainPageStore: fetchRecommendations finished.');
        }
    },

    // Действие: Загрузка финансового обзора

    // Действие: Сброс состояния стора
    resetMainPage: () => {
        console.log('mainPageStore: resetMainPage called.');
        set({ recommendations: null, loading: false, error: null });
    },

    // Действие: Сброс ошибки
    clearError: () => {
        console.log('mainPageStore: clearError called.');
        set({ error: null });
    },
}));

export default useMainPageStore;