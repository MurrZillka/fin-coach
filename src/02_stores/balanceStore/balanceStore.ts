// src/02_stores/balanceStore.ts

import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';
import { getBalance as fetchBalanceApi } from '../../01_api/balance/index';
import { handleBalanceApiError } from '../../01_api/balance/utils/handleBalanceApiError';
import type {BalanceStore, BalanceStoreActions} from './types';

const initialState: Omit<BalanceStore, keyof BalanceStoreActions> = {
    balance: null,
    loading: false,
    error: null,
};

const useBalanceStore = create<BalanceStore>()(subscribeWithSelector((set, get) => ({
    ...initialState,

    setBalance: (balance) => set({ balance }),
    setLoading: (loading) => set({ loading }),
    setError: (error) => set({ error }),
    handleError: (error, actionName) => {
        const processedError = handleBalanceApiError(error);
        set({ error: processedError, loading: false });
        console.error(`Ошибка ${actionName}:`, error);
        throw processedError;
    },

    fetchBalance: async () => {
        set({ loading: true, error: null });
        try {
            const result = await fetchBalanceApi();
            console.log('balanceStore: API getBalance result:', result);
            set({ balance: result.balance ?? null });
        } catch (error) {
            get().handleError(error, 'fetchBalance');
        } finally {
            set({ loading: false });
        }
    },

    resetBalance: () => {
        console.log('balanceStore: resetBalance called.');
        set(initialState);
    },

    clearError: () => {
        console.log('balanceStore: clearError called.');
        set({ error: null });
    },
})));

export default useBalanceStore;
