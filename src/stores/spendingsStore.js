import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';
import * as spendingsAPI from '../api/spendings/index';
import { handleSpendingApiError } from '../utils/handleSpendingApiError';

const initialState = {
    spendings: null,
    loading: false,
    error: null,
};

const useSpendingsStore = create()(subscribeWithSelector((set, get) => ({
    // --- Состояние (State) ---
    ...initialState,
    setSpendings: (spendings) => set({ spendings }),
    setLoading: (loading) => set({ loading }),
    setError: (error) => set({ error }),
    handleError: (error, actionName) => {
        const processedError = handleSpendingApiError(error);
        set({ error: processedError, loading: false });
        console.error(`Ошибка ${actionName}:`, error);
        throw processedError;
    },

    // --- Действия (Actions) ---
    fetchSpendings: async () => {
        set({ loading: true, error: null });
        try {
            const result = await spendingsAPI.getSpendings();
            console.log('spendingsStore: API getSpendings result:', result);
            set({ spendings: result.data.Spendings || [] });
        } catch (error) {
            get().handleError(error, 'fetchSpendings');
        } finally {
            set({ loading: false });
        }
    },

    addSpending: async (spendingData) => {
        set({ loading: true, error: null });
        console.log('spendingsStore: addSpending started');
        try {
            const result = await spendingsAPI.addSpending(spendingData);
            await get().fetchSpendings();
            return result.data;
        } catch (error) {
            get().handleError(error, 'addSpending');
        } finally {
            set({ loading: false });
        }
    },

    updateSpending: async (id, spendingData) => {
        set({ loading: true, error: null });
        console.log('spendingsStore: updateSpending started');
        try {
            const result = await spendingsAPI.updateSpendingById(id, spendingData);
            console.log('spendingsStore: API updateSpending result:', result);
            await get().fetchSpendings();
            return result.data;
        } catch (error) {
            get().handleError(error, 'updateSpending');
        } finally {
            set({ loading: false });
        }
    },

    deleteSpending: async (id) => {
        set({ loading: true, error: null });
        console.log('spendingsStore: deleteSpending started');
        try {
            const result = await spendingsAPI.deleteSpendingById(id);
            console.log('spendingsStore: API deleteSpending result:', result);
            await get().fetchSpendings();
            return result.data;
        } catch (error) {
            get().handleError(error, 'deleteSpending');
        } finally {
            set({ loading: false });
        }
    },

    resetSpendings: () => {
        console.log('spendingsStore: resetSpendings called.');
        set(initialState);
    },

    clearError: () => {
        console.log('spendingsStore: clearError called.');
        set({ error: null });
    },
})));

export default useSpendingsStore;