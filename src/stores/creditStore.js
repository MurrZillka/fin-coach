// src/stores/creditStore.js
import {create} from 'zustand';
import * as creditAPI from '../api/credit/index';
import {subscribeWithSelector} from "zustand/middleware";
import {handleCreditApiError} from "../utils/handleCreditApiError.js";

const initialState = {
    credits: null,
    loading: false,
    error: null,
}

const useCreditStore = create()(subscribeWithSelector((set, get) => ({
    // --- Состояние (State) ---
    ...initialState,
    setCredits: (credits) => set({credits}),
    setLoading: (loading) => set({loading}),
    setError: (error) => set({error}),
    handleError: (error, actionName) => {
        const processedError = handleCreditApiError(error);
        set({ error: processedError, loading: false });
        console.error(`Ошибка ${actionName}:`, error);
        throw processedError;
    },

    // --- Действия (Actions) ---
    // Действие для загрузки списка доходов
    fetchCredits: async () => {
        set({loading: true, error: null});
        try {
            const result = await creditAPI.getCredits();
            console.log('creditStore: API getCredits result:', result);
            set({credits: result.data.Credits || []});
        } catch (error) {
            get().handleError(error, 'fetchCredits');
        } finally {
            set({loading: false}); // Гарантированно сбросится
        }
    },

    // Действие для добавления нового дохода
    addCredit: async (creditData) => {
        set({loading: true, error: null});
        console.log('creditStore: addCredit started');
        try {
            const result = await creditAPI.addCredit(creditData);
            await get().fetchCredits();
            return result.data;
        } catch (error) {
            get().handleError(error, 'addCredit')
        } finally {
            set({loading: false}); // Гарантированно сбросится
        }
    },

    // Действие для обновления дохода по ID
    updateCredit: async (id, creditData) => {
        set({loading: true, error: null});
        console.log('creditStore: updateCredit started');
        try {
            const result = await creditAPI.updateCreditById(id, creditData);
            console.log('creditStore: API updateCredit result:', result);
            await get().fetchCredits();
            return result.data;
        } catch (error) {
            get().handleError(error, 'updateCredit')
        } finally {
            set({loading: false}); // Гарантированно сбросится
        }
    },

    // Действие для удаления дохода по ID
    deleteCredit: async (id) => {
        set({loading: true, error: null});
        console.log('creditStore: deleteCredit started');
        try {
            const result = await creditAPI.deleteCreditById(id);
            console.log('creditStore: API deleteCredit result:', result);
            await get().fetchCredits();
            return result.data;
        } catch (error) {
            get().handleError(error, 'deleteCredit')
        } finally {
            set({loading: false}); // Гарантированно сбросится
        }
    },
    // Действие для сброса состояния стора доходов (используется при выходе пользователя)
    resetCredits:
        () => {
            console.log('creditStore: resetCredits called.');
            set(initialState);
        },

    // Действие для сброса только ошибки
    clearError:
        () => {
            console.log('creditStore: clearError called.');
            set({error: null});
        }
})));

export default useCreditStore;

//todo - разобраться с появлением в модалке подписей к ошибкам в датах.