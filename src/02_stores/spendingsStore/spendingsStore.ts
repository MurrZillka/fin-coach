// src/02_stores/spendingsStore/spendingsStore.ts
import {create} from 'zustand';
import {subscribeWithSelector} from 'zustand/middleware';
import * as spendingsAPI from '../../01_api/spendings/index';
import {handleSpendingApiError} from '../../01_api/spendings/utils/handleSpendingApiError';
import type {SpendingsStore, SpendingsStoreState} from './types';
import type {SpendingRequest} from '../../01_api/spendings/types';
import {ApiError} from "../../01_api/apiTypes";

const initialState: SpendingsStoreState = {
    spendings: null,
    loading: false,
    error: null,
};


const useSpendingsStore = create<SpendingsStore>()(subscribeWithSelector((set, get) => ({
    ...initialState,

    setSpendings: (spendings) => set({ spendings }),
    setLoading: (loading) => set({ loading }),
    setError: (error) => set({ error }),

    handleError: (error, actionName) => {
        const processedError = handleSpendingApiError(error as ApiError);
        set({ error: processedError, loading: false });
        console.error(`Ошибка ${actionName}:`, error);
        throw processedError;
    },

    fetchSpendings: async () => {
        set({ loading: true, error: null });
        try {
            const data = await spendingsAPI.getSpendings();
            set({ spendings: data.Spendings ?? [] });
        } catch (error) {
            get().handleError(error, 'fetchSpendings');
        } finally {
            set({ loading: false });
        }
    },

    addSpending: async (spendingData: SpendingRequest) => {
        set({ loading: true, error: null });
        try {
            const data = await spendingsAPI.addSpending(spendingData);
            await get().fetchSpendings();
            return data;
        } catch (error) {
            get().handleError(error, 'addSpending');
        } finally {
            set({ loading: false });
        }
    },

    updateSpending: async (id: number, spendingData: SpendingRequest) => {
        set({ loading: true, error: null });
        try {
            const data = await spendingsAPI.updateSpendingById(id, spendingData);
            await get().fetchSpendings();
            return data;
        } catch (error) {
            get().handleError(error, 'updateSpending');
        } finally {
            set({ loading: false });
        }
    },

    deleteSpending: async (id: number) => {
        set({ loading: true, error: null });
        try {
            const data = await spendingsAPI.deleteSpendingById(id);
            await get().fetchSpendings();
            return data;
        } catch (error) {
            get().handleError(error, 'deleteSpending');
        } finally {
            set({ loading: false });
        }
    },

    resetSpendings: () => {
        set(initialState);
    },

    clearError: () => {
        set({ error: null });
    },
})));

export default useSpendingsStore;
