import { create } from 'zustand';
import { getBalance as fetchBalanceApi } from '../api/balance';

// Начальное состояние
const initialState = {
    balance: null,
    isLoading: false,
    error: null,
};

const useBalanceStore = create((set, get) => ({
    ...initialState,

    // Загрузка баланса
    fetchBalance: async () => {
        if (get().isLoading) return; // Пропускаем, если загрузка уже идёт

        set({ isLoading: true, error: null });
        try {
            const result = await fetchBalanceApi();
            const { data } = result; // Перехватчик вернёт { data, error: null }
            set({ balance: data.balance, isLoading: false }); // Предполагаем, что data содержит { balance: number }
        } catch (error) {
            set({ balance: null, isLoading: false, error });
            console.error('balanceStore: Failed to fetch balance:', error); // Добавляем логирование
            throw error;
        }
    },

    // Сброс состояния
    resetBalance: () => {
        set(initialState);
    },
}));

export default useBalanceStore;