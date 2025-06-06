// src/02_stores/creditStore/creditStore.ts

import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';
import * as creditAPI from '../../01_api/credit/index';
import { handleCreditApiError } from '../../01_api/credit/utils/handleCreditApiError';
import type {CreditStore, CreditStoreActions} from './types';
import {CreditRequest} from "../../01_api/credit/types";

const initialState: Omit<CreditStore, keyof CreditStoreActions> = {
    credits: null,
    loading: false,
    error: null,
};

const useCreditStore = create<CreditStore>()(subscribeWithSelector((set, get) => ({
    ...initialState,

    setCredits: (credits) => set({ credits }),
    setLoading: (loading) => set({ loading }),
    setError: (error) => set({ error }),
    handleError: (error, actionName) => {
        const processedError = handleCreditApiError(error);
        set({ error: processedError, loading: false });
        console.error(`Ошибка ${actionName}:`, error);
        throw processedError;
    },

    fetchCredits: async () => {
        set({ loading: true, error: null });
        try {
            const data = await creditAPI.getCredits();
            set({ credits: data.Credits ?? [] });
        } catch (error) {
            get().handleError(error, 'fetchCredits');
        } finally {
            set({ loading: false });
        }
    },

    addCredit: async (creditData: CreditRequest) => {
        set({ loading: true, error: null });
        try {
            const data = await creditAPI.addCredit(creditData);
            await get().fetchCredits();
            return data;
        } catch (error) {
            get().handleError(error, 'addCredit');
        } finally {
            set({ loading: false });
        }
    },

    updateCredit: async (id: number, creditData: CreditRequest) => {
        set({ loading: true, error: null });
        try {
            const data = await creditAPI.updateCredit(id, creditData);
            await get().fetchCredits();
            return data;
        } catch (error) {
            get().handleError(error, 'updateCredit');
        } finally {
            set({ loading: false });
        }
    },

    deleteCredit: async (id: number) => {
        set({ loading: true, error: null });
        try {
            const data = await creditAPI.deleteCredit(id);
            await get().fetchCredits();
            return data;
        } catch (error) {
            get().handleError(error, 'deleteCredit');
        } finally {
            set({ loading: false });
        }
    },

    resetCredits: () => {
        set(initialState);
    },

    clearError: () => {
        set({ error: null });
    },
})));

export default useCreditStore;
