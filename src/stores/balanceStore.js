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
        console.log('balanceStore: fetchBalance started'); // Лог начала действия
        if (get().isLoading) {
            console.log('balanceStore: fetchBalance skipped, loading already in progress'); // Лог пропуска
            return; // Если загрузка уже идет, ничего не делаем
        }

        set({ isLoading: true, error: null }); // Устанавливаем isLoading в true и сбрасываем ошибку
        console.log('balanceStore: Calling fetchBalanceApi...'); // Лог вызова API

        const { data, error } = await fetchBalanceApi(token); // Вызываем функцию API

        // --- ДОБАВЛЕН ЛОГ ДЛЯ ОТЛАДКИ API ОТВЕТА ---
        console.log('balanceStore: fetchBalanceApi returned:', { data, error });
        // --- КОНЕЦ ЛОГА ---


        if (data !== null) {
            // Если данные получены успешно
            // ИСПРАВЛЕНИЕ: API возвращает { balance: число }, нужно взять data.balance
            console.log('balanceStore: API data received, setting balance state...'); // Лог перед установкой состояния
            set({ balance: data.balance, isLoading: false, error: null }); // <-- ИСПРАВЛЕНО ЗДЕСЬ
            console.log('balanceStore: Balance updated successfully'); // Лог успеха
        } else {
            // Если произошла ошибка
            // Можно решить, нужно ли сбрасывать balance в null при ошибке.
            // В этом варианте сбрасываем:
            set({ balance: null, isLoading: false, error: error });
            console.error('balanceStore: Failed to update balance', error); // Лог ошибки
        }
        console.log('balanceStore: fetchBalance finished. Current balance state:', get().balance); // Лог завершения (этот лог теперь покажет число)
    },
}));

export default useBalanceStore;