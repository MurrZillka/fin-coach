// src/stores/balanceStore.js
import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';
import { getBalance as fetchBalanceApi } from '../api/balance';
import { handleBalanceApiError } from '../utils/handleBalanceApiError';

const initialState = {
    balance: null,
    loading: false,
    error: null,
};

const useBalanceStore = create()(subscribeWithSelector((set, get) => ({
    // --- Состояние (State) ---
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

    // --- Действия (Actions) ---
    fetchBalance: async () => {
        set({ loading: true, error: null });
        try {
            const result = await fetchBalanceApi();
            console.log('balanceStore: API getBalance result:', result);

            // API возвращает { balance: 792502 }
            const { balance } = result.data || {};
            set({ balance: balance || null });
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
