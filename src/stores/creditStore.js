// src/stores/creditStore.js
import {create} from 'zustand';
import * as creditAPI from '../api/credit/index';
import {subscribeWithSelector} from "zustand/middleware";

export const handleCreditApiError = (error) => {
    const translations = {
        'credit end_date must be greater than credit date': 'Дата окончания дохода должна быть больше или равна дате начала.',
        'credit date must be less than current date': 'Дата дохода должна быть не больше текущей',
        'spending end_date must be less than current date': 'Дата окончания дохода должна быть не больше текущей даты.',
    };
    const userMessage = translations[error.message] || (error.status >= 400 && error.status < 500 ? 'Ошибка в данных формы. Проверьте введенные значения.' : 'Ошибка связи или сервера. Попробуйте позже.');
    console.error('handleCreditApiError: Processed error -', {
        original: error.message,
        translated: userMessage,
        status: error.status || 500
    });
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

        // --- Действия (Actions) ---

        // Действие для загрузки списка доходов
        fetchCredits: async () => {
            try {
                const result = await creditAPI.getCredits();
                console.log('creditStore: API getCredits result:', result);
                set({credits: result.data.Credits || [], loading: false});
            } catch (error) {
                const processedError = handleCreditApiError(error)
                set({
                    error: processedError,
                    loading: false
                });
                throw processedError;
            }
        },

        // Действие для добавления нового дохода
        addCredit: async (creditData) => {
            console.log('creditStore: addCredit started');
            try {
                const result = await creditAPI.addCredit(creditData);
                await get().fetchCredits();
                return result.data;
            } catch (error) {
                const processedError = handleCreditApiError(error)
                set({
                    error: processedError,
                    loading: false
                });
                console.error('Непредвиденная ошибка addCredit:', error);
                throw processedError;
            }
        },

        // Действие для обновления дохода по ID
        updateCredit: async (id, creditData) => {
            console.log('creditStore: updateCredit started');
            try {
                const result = await creditAPI.updateCreditById(id, creditData);
                console.log('creditStore: API updateCredit result:', result);
                await get().fetchCredits();
                return result.data;
            } catch (error) {
                const processedError = handleCreditApiError(error)
                set({
                    error: processedError,
                    loading: false
                });
                throw processedError;
            }
        },

        // Действие для удаления дохода по ID
        deleteCredit: async (id) => {
            console.log('creditStore: deleteCredit started');
            try {
                const result = await creditAPI.deleteCreditById(id);
                console.log('creditStore: API deleteCredit result:', result);
                await get().fetchCredits();
                return result.data;
            } catch (error) {
                console.error('Непредвиденная ошибка deleteCredit:', error);
                const processedError = handleCreditApiError(error)
                set({
                    error: processedError,
                    loading: false
                });
                throw processedError;
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

//todo - разобраться с появлением в модалке подписей к ошибкам в датах.