import { create } from 'zustand';
import * as spendingsAPI from '../api/spendings/index';
import useAuthStore from './authStore';
import useBalanceStore from './balanceStore';

const useSpendingsStore = create((set, get) => ({
    // --- Состояние (State) ---
    spendings: null,
    loading: false,
    error: null,

    // --- Вспомогательная функция ---
    getToken: () => {
        const token = useAuthStore.getState().user?.access_token;
        console.log('useSpendingsStore: getToken called. Token found:', !!token);
        if (!token) {
            const authError = { message: 'Аутентификация не пройдена. Пожалуйста, войдите снова.' };
            set({ error: authError, loading: false });
            console.error('useSpendingsStore: Authentication error in getToken.', authError);
            return null;
        }
        return token;
    },

    // --- Действия (Actions) ---

    fetchSpendings: async () => {
        console.log('useSpendingsStore: fetchSpendings started');
        if (!get().loading) {
            set({ loading: true, error: null });
        } else {
            set({ error: null });
        }

        const token = get().getToken();
        if (!token) {
            console.log('useSpendingsStore: fetchSpendings - No token, stopping fetch.');
            if (!get().loading) set({ loading: false });
            return;
        }
        console.log('useSpendingsStore: fetchSpendings - Token found, proceeding with API call.');

        try {
            const result = await spendingsAPI.getSpendings(token);
            console.log('useSpendingsStore: API getSpendings result:', result);

            if (result.error) {
                set({ error: result.error, loading: false });
                console.error('useSpendingsStore: Error fetching spendings from API:', result.error);
            } else {
                const spendingsArray = result.data?.Spendings || [];
                set({ spendings: spendingsArray, loading: false, error: null });
                console.log('useSpendingsStore: Spendings updated successfully.', spendingsArray.length, 'items.');
            }
        } catch (error) {
            const unexpectedError = {
                message: error.message || 'Произошла непредвиденная ошибка при загрузке расходов.',
                status: error.status,
            };
            if (error.response && error.response.data && error.response.data.message) {
                unexpectedError.message = error.response.data.message;
            } else if (error.message === "Failed to fetch") {
                unexpectedError.message = "Не удалось подключиться к серверу. Проверьте ваше интернет-соединение.";
            }
            set({
                error: unexpectedError,
                loading: false
            });
        } finally {
            console.log('useSpendingsStore: fetchSpendings finished.');
        }
    },

    addSpending: async (spendingData) => {
        console.log('useSpendingsStore: addSpending started with data:', spendingData);
        set({ loading: true, error: null });

        const token = get().getToken();
        if (!token) {
            set({ loading: false });
            return;
        }
        console.log('useSpendingsStore: addSpending - Token found, proceeding with API call.');

        try {
            const dataToSend = {
                amount: spendingData.amount,
                description: spendingData.description,
                is_permanent: spendingData.is_permanent,
                category_id: spendingData.category_id,
                date: spendingData.date ? spendingData.date : null,
                end_date: spendingData.end_date ? spendingData.end_date : '0001-01-01',
            };
            console.log('useSpendingsStore: addSpending - Data sent to API:', dataToSend);

            const result = await spendingsAPI.addSpending(dataToSend, token);
            console.log('useSpendingsStore: API addSpending result:', result);

            if (result.error) {
                set({ error: result.error, loading: false });
                console.error('useSpendingsStore: Error adding spending from API:', result.error);
                throw result.error;
            } else {
                console.log('useSpendingsStore: Spending added successfully. Triggering fetchSpendings...');
                await get().fetchSpendings();
                useBalanceStore.getState().fetchBalance(token);
                console.log('useSpendingsStore: Balance fetch triggered after adding spending.');
                return result.data;
            }
        } catch (error) {
            const unexpectedError = {
                message: error.message || 'Произошла непредвиденная ошибка при добавлении расхода.',
                status: error.status,
            };
            if (error.response && error.response.data && error.response.data.message) {
                unexpectedError.message = error.response.data.message;
            } else if (error.message === "Failed to fetch") {
                unexpectedError.message = "Не удалось подключиться к серверу. Проверьте ваше интернет-соединение.";
            }
            console.error('useSpendingsStore: Error in addSpending:', error);
            set({
                error: unexpectedError,
                loading: false
            });
            throw error;
        } finally {
            console.log('useSpendingsStore: addSpending finished.');
        }
    },

    updateSpending: async (id, spendingData) => {
        console.log(`useSpendingsStore: updateSpending started for ID: ${id} with data:`, spendingData);
        set({ loading: true, error: null });

        const token = get().getToken();
        if (!token) {
            set({ loading: false });
            return;
        }
        console.log('useSpendingsStore: updateSpending - Token found, proceeding with API call.');

        try {
            const dataToSend = {
                amount: spendingData.amount,
                description: spendingData.description,
                is_permanent: spendingData.is_permanent,
                category_id: spendingData.category_id,
                date: spendingData.date ? spendingData.date : null,
                end_date: spendingData.end_date ? spendingData.end_date : '0001-01-01',
            };
            console.log(`useSpendingsStore: updateSpending - Data sent to API for ID ${id}:`, dataToSend);

            const result = await spendingsAPI.updateSpendingById(id, dataToSend, token);
            console.log(`useSpendingsStore: API updateSpendingById result for ID ${id}:`, result);

            if (result.error) {
                set({ error: result.error, loading: false });
                console.error(`useSpendingsStore: Error updating spending ID ${id} from API:`, result.error);
                throw result.error;
            } else {
                console.log(`useSpendingsStore: Spending ID ${id} updated successfully. Triggering fetchSpendings...`);
                await get().fetchSpendings();
                useBalanceStore.getState().fetchBalance(token);
                console.log('useSpendingsStore: Balance fetch triggered after updating spending.');
                return result.data;
            }
        } catch (error) {
            const unexpectedError = {
                message: error.message || 'Произошла непредвиденная ошибка при обновлении расхода.',
                status: error.status,
            };
            if (error.response && error.response.data && error.response.data.message) {
                unexpectedError.message = error.response.data.message;
            } else if (error.message === "Failed to fetch") {
                unexpectedError.message = "Не удалось подключиться к серверу. Проверьте ваше интернет-соединение.";
            }
            set({
                error: unexpectedError,
                loading: false
            });
            console.error(`useSpendingsStore: Error in updateSpending ID ${id}:`, error);
            throw error;
        } finally {
            console.log(`useSpendingsStore: updateSpending finished for ID: ${id}.`);
        }
    },

    deleteSpending: async (id) => {
        console.log(`useSpendingsStore: deleteSpending started for ID: ${id}`);
        set({ loading: true, error: null });

        const token = get().getToken();
        if (!token) {
            set({ loading: false });
            return;
        }
        console.log('useSpendingsStore: deleteSpending - Token found, proceeding with API call.');

        try {
            const result = await spendingsAPI.deleteSpendingById(id, token);
            console.log(`useSpendingsStore: API deleteSpendingById result for ID ${id}:`, result);

            if (result.error) {
                set({ error: result.error, loading: false });
                console.error(`useSpendingsStore: Error deleting spending ID ${id} from API:`, result.error);
                throw result.error;
            } else {
                console.log(`useSpendingsStore: Spending ID ${id} deleted successfully. Triggering fetchSpendings...`);
                await get().fetchSpendings();
                useBalanceStore.getState().fetchBalance(token);
                console.log('useSpendingsStore: Balance fetch triggered after deleting spending.');
                return result.data;
            }
        } catch (error) {
            const unexpectedError = {
                message: error.message || 'Произошла непредвиденная ошибка при удалении расхода.',
                status: error.status,
            };
            if (error.response && error.response.data && error.response.data.message) {
                unexpectedError.message = error.response.data.message;
            } else if (error.message === "Failed to fetch") {
                unexpectedError.message = "Не удалось подключиться к серверу. Проверьте ваше интернет-соединение.";
            }
            set({
                error: unexpectedError,
                loading: false
            });
            console.error(`useSpendingsStore: Error in deleteSpending ID ${id}:`, error);
            throw error;
        } finally {
            console.log(`useSpendingsStore: deleteSpending finished for ID: ${id}.`);
        }
    },

    resetSpendings: () => {
        console.log('useSpendingsStore: resetSpendings called.');
        set({ spendings: null, loading: false, error: null });
    },

    clearError: () => {
        console.log('useSpendingsStore: clearError called.');
        set({ error: null });
    },
}));

export default useSpendingsStore;