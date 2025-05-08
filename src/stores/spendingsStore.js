// src/stores/spendingStore.js
import { create } from 'zustand';
// Убедись, что путь к файлу spendings/index.js корректен
import * as spendingsAPI from '../api/spendings/index';
// Импортируем authStore для получения токена
import useAuthStore from './authStore';
// Импортируем balanceStore, чтобы обновить баланс после операций с расходами
import useBalanceStore from './balanceStore';


// --- Переименовано: useSpendingStore -> useSpendingsStore ---
const useSpendingsStore = create((set, get) => ({
// --- Конец переименования ---

    // --- Состояние (State) ---
    // spendings: Массив объектов расходов.
    // null - начальное состояние (данные еще не загружены).
    // [] - данные загружены, но список пуст.
    // [...] - данные загружены, список не пуст.
    spendings: null, // Инициализируем как null
    loading: false, // Индикатор загрузки
    error: null, // Информация об ошибке

    // --- Вспомогательная функция ---
    // Для получения токена и обработки ошибок аутентификации внутри действий стора
    getToken: () => {
        const token = useAuthStore.getState().user?.access_token;
        console.log('useSpendingsStore: getToken called. Token found:', !!token); // Лог наличия токена
        if (!token) {
            const authError = { message: 'Аутентификация не пройдена. Пожалуйста, войдите снова.' };
            set({ error: authError, loading: false });
            console.error('useSpendingsStore: Authentication error in getToken.', authError); // Лог ошибки
            return null;
        }
        return token;
    },


    // --- Действия (Actions) ---

    // Действие для загрузки списка расходов
    fetchSpendings: async () => {
        console.log('useSpendingsStore: fetchSpendings started'); // Лог начала действия

        if (!get().loading) {
            set({ loading: true, error: null });
        } else {
            set({ error: null });
        }

        const token = get().getToken();
        if (!token) {
            console.log('useSpendingsStore: fetchSpendings - No token, stopping fetch.'); // Лог остановки
            if (!get().loading) set({loading: false});
            return;
        }
        console.log('useSpendingsStore: fetchSpendings - Token found, proceeding with API call.'); // Лог вызова API

        try {
            const result = await spendingsAPI.getSpendings(token);
            console.log('useSpendingsStore: API getSpendings result:', result); // Лог результата API

            if (result.error) {
                set({ error: result.error, loading: false });
                console.error('useSpendingsStore: Error fetching spendings from API:', result.error); // Лог ошибки
            } else {
                const spendingsArray = result.data?.Spendings || []; // Берем массив под ключом "Spendings"
                set({ spendings: spendingsArray, loading: false, error: null });
                console.log('useSpendingsStore: Spendings updated successfully.', spendingsArray.length, 'items.'); // Лог успеха
            }

        } catch (error) {
            const unexpectedError = { message: error.message || 'Произошла непредвиденная ошибка при загрузке расходов.' };
            set({
                error: unexpectedError,
                loading: false
            });
            console.error('useSpendingsStore: Unexpected error in fetchSpendings:', error); // Лог непредвиденной ошибки
        }
        console.log('useSpendingsStore: fetchSpendings finished.'); // Лог завершения
    },


    // Действие для добавления нового расхода
    addSpending: async (spendingData) => {
        console.log('useSpendingsStore: addSpending started with data:', spendingData); // Лог начала действия с данными

        set({ loading: true, error: null });

        const token = get().getToken();
        if (!token) {
            set({ loading: false });
            throw new Error('Пользователь не аутентифицирован');
        }
        console.log('useSpendingsStore: addSpending - Token found, proceeding with API call.'); // Лог вызова API

        try {
            const dataToSend = {
                ...spendingData,
                date: spendingData.date ? new Date(spendingData.date).toISOString() : undefined,
            };
            console.log('useSpendingsStore: addSpending - Data sent to API:', dataToSend); // Лог данных для отправки

            const result = await spendingsAPI.addSpending(dataToSend, token);
            console.log('useSpendingsStore: API addSpending result:', result); // Лог результата API

            if (result.error) {
                set({ error: result.error, loading: false });
                console.error('useSpendingsStore: Error adding spending from API:', result.error); // Лог ошибки
                throw result.error;
            } else {
                console.log('useSpendingsStore: Spending added successfully. Triggering fetchSpendings...'); // Лог успеха
                await get().fetchSpendings();
                useBalanceStore.getState().fetchBalance(token); // Обновляем баланс
                console.log('useSpendingsStore: Balance fetch triggered after adding spending.'); // Лог триггера баланса

                return result.data;
            }

        } catch (error) {
            const unexpectedError = { message: error.message || 'Произошла непредвиденная ошибка при добавлении расхода.' };
            set({
                error: unexpectedError,
                loading: false
            });
            console.error('useSpendingsStore: Unexpected error in addSpending:', error); // Лог непредвиденной ошибки
            throw error;
        } finally {
            console.log('useSpendingsStore: addSpending finished.'); // Лог завершения
        }
    },

    // Действие для обновления расхода по ID
    updateSpending: async (id, spendingData) => {
        console.log(`useSpendingsStore: updateSpending started for ID: ${id} with data:`, spendingData); // Лог начала действия с ID и данными

        set({ loading: true, error: null });

        const token = get().getToken();
        if (!token) {
            set({ loading: false });
            throw new Error('Пользователь не аутентифицирован');
        }
        console.log('useSpendingsStore: updateSpending - Token found, proceeding with API call.'); // Лог вызова API

        try {
            const dataToSend = {
                ...spendingData,
                date: spendingData.date ? new Date(spendingData.date).toISOString() : undefined,
            };
            console.log(`useSpendingsStore: updateSpending - Data sent to API for ID ${id}:`, dataToSend); // Лог данных для отправки

            const result = await spendingsAPI.updateSpendingById(id, dataToSend, token);
            console.log(`useSpendingsStore: API updateSpendingById result for ID ${id}:`, result); // Лог результата API

            if (result.error) {
                set({ error: result.error, loading: false });
                console.error(`useSpendingsStore: Error updating spending ID ${id} from API:`, result.error); // Лог ошибки
                throw result.error;
            } else {
                console.log(`useSpendingsStore: Spending ID ${id} updated successfully. Triggering fetchSpendings...`); // Лог успеха
                await get().fetchSpendings();
                useBalanceStore.getState().fetchBalance(token); // Обновляем баланс
                console.log('useSpendingsStore: Balance fetch triggered after updating spending.'); // Лог триггера баланса


                return result.data;
            }

        } catch (error) {
            const unexpectedError = { message: error.message || 'Произошла непредвиденная ошибка при обновлении расхода.' };
            set({
                error: unexpectedError,
                loading: false
            });
            console.error(`useSpendingsStore: Unexpected error in updateSpending ID ${id}:`, error); // Лог непредвиденной ошибки
            throw error;
        } finally {
            console.log(`useSpendingsStore: updateSpending finished for ID: ${id}.`); // Лог завершения
        }
    },

    // Действие для удаления расхода по ID
    deleteSpending: async (id) => {
        console.log(`useSpendingsStore: deleteSpending started for ID: ${id}`); // Лог начала действия с ID

        set({ loading: true, error: null });

        const token = get().getToken();
        if (!token) {
            set({ loading: false });
            throw new Error('Пользователь не аутентифицирован');
        }
        console.log('useSpendingsStore: deleteSpending - Token found, proceeding with API call.'); // Лог вызова API

        try {
            const result = await spendingsAPI.deleteSpendingById(id, token);
            console.log(`useSpendingsStore: API deleteSpendingById result for ID ${id}:`, result); // Лог результата API

            if (result.error) {
                set({ error: result.error, loading: false });
                console.error(`useSpendingsStore: Error deleting spending ID ${id} from API:`, result.error); // Лог ошибки
                throw result.error;
            } else {
                console.log(`useSpendingsStore: Spending ID ${id} deleted successfully. Triggering fetchSpendings...`); // Лог успеха
                await get().fetchSpendings();
                useBalanceStore.getState().fetchBalance(token); // Обновляем баланс
                console.log('useSpendingsStore: Balance fetch triggered after deleting spending.'); // Лог триггера баланса


                return result.data;
            }

        } catch (error) {
            const unexpectedError = { message: error.message || 'Произошла непредвиденная ошибка при удалении расхода.' };
            set({
                error: unexpectedError,
                loading: false
            });
            console.error(`useSpendingsStore: Unexpected error in deleteSpending ID ${id}:`, error); // Лог непредвиденной ошибки
            throw error;
        } finally {
            console.log(`useSpendingsStore: deleteSpending finished for ID: ${id}.`); // Лог завершения
        }
    },


    // Действие для сброса состояния стора расходов (например, при выходе пользователя)
    resetSpendings: () => {
        console.log('useSpendingsStore: resetSpendings called.'); // Лог вызова сброса
        set({ spendings: null, loading: false, error: null }); // Сбрасываем к начальному состоянию (null)
    },

    // Действие для сброса ошибки
    clearError: () => {
        console.log('useSpendingsStore: clearError called.'); // Лог вызова сброса ошибки
        set({ error: null });
    },
}));

// --- Переименовано: export default useSpendingStore -> export default useSpendingsStore ---
export default useSpendingsStore;
// --- Конец переименования ---