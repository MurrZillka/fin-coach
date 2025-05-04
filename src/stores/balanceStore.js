// src/stores/balanceStore.js
import { create } from 'zustand';
import { getBalance as fetchBalanceApi } from '../api/balance'; // Импортируем функцию API, переименовывая ее

const useBalanceStore = create((set, get) => ({
    // --- Состояние (State) ---
    balance: null, // Здесь будет храниться значение баланса
    isLoading: false, // Индикатор загрузки
    error: null, // Информация об ошибке

    // --- Действия (Actions) ---

    // Действие для загрузки баланса
    // Принимает токен пользователя в качестве аргумента
    fetchBalance: async (token) => {
        if (get().isLoading) return; // Если загрузка уже идет, ничего не делаем

        set({ isLoading: true, error: null }); // Устанавливаем isLoading в true и сбрасываем ошибку

        const { data, error } = await fetchBalanceApi(token); // Вызываем функцию API

        if (data !== null) {
            // Если данные получены успешно
            set({ balance: data, isLoading: false, error: null });
        } else {
            // Если произошла ошибка
            // Можно решить, нужно ли сбрасывать balance в null при ошибке.
            // В этом варианте сбрасываем:
            set({ balance: null, isLoading: false, error: error });
        }
    },

    // Действие для сброса состояния баланса (например, при выходе пользователя)
    resetBalance: () => {
        set({ balance: null, isLoading: false, error: null });
    }
}));

export default useBalanceStore;