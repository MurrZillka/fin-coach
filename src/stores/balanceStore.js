// src/stores/balanceStore.js
import { create } from 'zustand';
import { getBalance as fetchBalanceApi } from '../api/balance'; // Импортируем функцию API, переименовывая ее
// --- ОСТАВЛЯЕМ ИМПОРТ authStore, ОН МОЖЕТ ПОТРЕБОВАТЬСЯ ДЛЯ fetchBalance (если getToken там используется) ---
//import useAuthStore from './authStore'; // Этот импорт может быть нужен для getToken внутри actions
// --- Конец ИМПОРТОВ ---


// --- ОПРЕДЕЛЯЕМ НАЧАЛЬНОЕ СОСТОЯНИЕ ---
const initialState = {
    balance: null, // Здесь будет храниться значение баланса (null при сбросе/до загрузки)
    isLoading: false, // Индикатор загрузки
    error: null, // Информация об ошибке
    // Если есть другие свойства состояния, добавь их сюда с их начальными значениями
};
// --- Конец ОПРЕДЕЛЕНИЯ ---


// --- ИСПРАВЛЕНО: УДАЛЕНА Подписка на изменения в authStore изнутри create ---
const useBalanceStore = create((set, get) => {

    // --- УДАЛЕНА Подписка на изменения в authStore (была здесь) ---
    // const unsubscribeAuth = useAuthStore.subscribe(...);
    // --- Конец УДАЛЕНИЯ ---


    // --- Возвращаем объект состояния и действий стора ---
    return {
        // --- Состояние (State) ---
        ...initialState, // Распределяем начальное состояние


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

            // Если getToken используется внутри fetchBalance, то useAuthStore нужен
            // const token = get().getToken(); // Пример, если бы getToken был в этом сторе
            // В твоем коде fetchBalance принимает token как аргумент, так что прямой вызов getToken здесь не нужен.
            // Но импорт useAuthStore может быть нужен для других целей в будущем, оставим его.

            const { data, error } = await fetchBalanceApi(token); // Вызываем функцию API


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

        // --- Действие для сброса состояния баланса ---
        // Эта функция будет вызываться подпиской из storeInitializer.js
        // ИСПОЛЬЗУЕМ initialState для полного сброса
        resetBalance: () => {
            console.log('balanceStore: resetBalance called.'); // Лог вызова сброса
            set(initialState); // <--- ИЗМЕНЕНИЕ ЗДЕСЬ: используем initialState
            console.log('balanceStore: State reset to initialState.'); // Лог сброса
        },
        // --- Конец ДОБАВЛЕНИЯ ---

        // Optional: Действие для сброса ошибки (если нужно)
        // clearError: () => { set({ error: null }); }
    };
});
// --- Конец ИСПРАВЛЕНИЯ ---


export default useBalanceStore;