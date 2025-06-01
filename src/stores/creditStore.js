// src/stores/creditStore.js
import {create} from 'zustand';
import * as creditAPI from '../api/credit/index';
import useAuthStore from './authStore';
import {subscribeWithSelector} from "zustand/middleware";

export const handleCreditApiError = (error) => {
    const translations = {
        'credit end_date must be greater than credit date': 'Дата окончания дохода должна быть больше или равна дате начала.',
        'credit date must be less than current date': 'Дата дохода должна быть не больше текущей',
        'spending end_date must be less than current date': 'Дата окончания дохода должна быть не больше текущей даты.',
    };
    const userMessage = translations[error.message] || (error.status >= 400 && error.status < 500 ? 'Ошибка в данных формы. Проверьте введенные значения.' : 'Ошибка связи или сервера. Попробуйте позже.');
    return {message: userMessage, status: error.status || 500};
};

const useCreditStore = create()(subscribeWithSelector((set, get) => ({
        // --- Состояние (State) ---
        credits: null,
        loading: false,
        error: null,
        setCredits: (credits) => set({credits}),
        setLoading: (loading) => set({loading}),
        setError: (error) => set({error}),

        // --- Вспомогательная функция: Получение токена ---
        getToken: () => {
            const token = useAuthStore.getState().user?.access_token;
            if (!token) {
                const authError = {message: 'Пользователь не аутентифицирован. Пожалуйста, войдите.'};
                set({error: authError, loading: false});
                console.error('Ошибка аутентификации в creditStore:', authError);
                return null;
            }
            return token;
        },

        checkToken: () => {
            console.log('creditStore: action started');
            if (!get().loading) {
                set({loading: true, error: null});
            } else {
                set({error: null});
            }
            const token = get().getToken();
            if (!token) {
                console.log('creditStore: action - No token, stopping fetch.');
                set({loading: false});
                throw new Error('Пользователь не аутентифицирован');
            }
            console.log('creditStore: actions - Token found, proceeding with API call.');
        },


        // --- Действия (Actions) ---

        // Действие для загрузки списка доходов
        fetchCredits: async () => {
            get().checkToken()

            try {
                const result = await creditAPI.getCredits();
                console.log('creditStore: API getCredits result:', result);
                set({credits: result.data.Credits || [], loading: false});
            } catch (error) {
                handleCreditApiError()
                set({
                    error: error,
                    loading: false
                });
            }
        },

        // Действие для добавления нового дохода
        addCredit: async (creditData) => {
            console.log('creditStore: addCredit started');
            get().checkToken()

            try {
                const result = await creditAPI.addCredit(creditData);
                await get().fetchCredits();
                return result.data;
            } catch (error) {
                handleCreditApiError(error)
                set({
                    error: error,
                    loading: false
                });
                console.error('Непредвиденная ошибка addCredit:', error);
                throw error;
            }
        },

        // Действие для обновления дохода по ID
        updateCredit: async (id, creditData) => {
            console.log('creditStore: updateCredit started');
            get().checkToken()

            try {
                const result = await creditAPI.updateCreditById(id, creditData);
                console.log('creditStore: API updateCredit result:', result);
                await get().fetchCredits();
                return result.data;
            } catch (error) {
                handleCreditApiError(error)
                set({
                    error: error,
                    loading: false
                });
                throw error;
            }
        },

        // Действие для удаления дохода по ID
        deleteCredit: async (id) => {
            console.log('creditStore: deleteCredit started');
           get().checkToken()

            try {
                const result = await creditAPI.deleteCreditById(id);
                console.log('creditStore: API deleteCredit result:', result);
                await get().fetchCredits();
                return result.data;
            } catch (error) {
                console.error('Непредвиденная ошибка deleteCredit:', error);
                handleCreditApiError()
                throw error;
            }
        },
        // Действие для сброса состояния стора доходов (используется при выходе пользователя)
        resetCredits:
            () => {
                console.log('creditStore: resetCredits called.');
                set({credits: null, loading: false, error: null});
            },

        // Действие для сброса только ошибки
        clearError:
            () => {
                console.log('creditStore: clearError called.');
                set({error: null});
            }
    })))
;

export default useCreditStore;