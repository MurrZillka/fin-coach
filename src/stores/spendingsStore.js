// src/stores/spendingsStore.js
import { create } from 'zustand';
// Убедись, что путь к файлу spendings/index.js корректный
import * as spendingsAPI from '../api/spendings/index'; // Предполагаем, что тут есть addSpending, updateSpendingById, deleteSpendingById, getSpendings
// Импортируем authStore для получения токена
import useAuthStore from './authStore'; // Этот импорт остаётся, так как getToken его использует
// Импортируем balanceStore, чтобы обновить баланс после операций с расходами
import useBalanceStore from './balanceStore';


// --- УДАЛЕНО: Подписка на изменения в authStore (Теперь эта подписка находится в файле storeInitializer.js) ---
// useAuthStore.subscribe(
//     (authState) => {
//         console.log('spendingsStore: Auth state changed detected by subscription.', authState);
//         const spendingsStoreState = useSpendingsStore.getState();
//         if (!authState.isAuthenticated && spendingsStoreState.spendings !== null) {
//             console.log('spendingsStore: User became unauthenticated, triggering resetSpendings...');
//             spendingsStoreState.resetSpendings();
//         }
//     },
//     (state) => ({ isAuthenticated: state.isAuthenticated })
// );
// --- Конец УДАЛЕНИЯ ---


const useSpendingsStore = create((set, get) => ({
    // --- Состояние (State) ---
    spendings: null, // Инициализируем как null
    loading: false, // Индикатор загрузки
    error: null, // Информация об ошибке

    // --- Вспомогательная функция ---
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

    // --- УДАЛЕНА Вспомогательная функция для форматирования даты (форматирование не нужно) ---
    // formatDateForServer: (dateString) => { ... }


    // --- Действия (Actions) ---

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
            console.log('useSpendingsStore: fetchSpendings finished.'); // Лог завершения
        }
    },


    // Действие для добавления нового расхода
    addSpending: async (spendingData) => {
        console.log('useSpendingsStore: addSpending started with data:', spendingData); // Лог начала действия с данными

        set({ loading: true, error: null }); // Устанавливаем loading и сбрасываем ошибку

        const token = get().getToken(); // Получаем токен
        if (!token) {
            set({ loading: false });
            return;
        }
        console.log('useSpendingsStore: addSpending - Token found, proceeding with API call.'); // Лог вызова API

        try {
            // --- ИСПРАВЛЕНО: Отправляем дату в формате YYYY-MM-DD или null ---
            const dataToSend = {
                amount: spendingData.amount, // Число
                description: spendingData.description, // Строка
                is_permanent: spendingData.is_permanent, // Булево
                category_id: spendingData.category_id, // Число или null
                // Отправляем строку даты YYYY-MM-DD как есть из формы, или null если пусто
                // (Если поле обязательно, валидация в модале поймает пустое значение)
                date: spendingData.date ? spendingData.date : null,
            };
            console.log('useSpendingsStore: addSpending - Data sent to API (YYYY-MM-DD or null):', dataToSend); // Лог данных для отправки

            const result = await spendingsAPI.addSpending(dataToSend, token);
            console.log('useSpendingsStore: API addSpending result:', result); // Лог результата API


            if (result.error) {
                set({ error: result.error, loading: false });
                console.error('useSpendingsStore: Error adding spending from API:', result.error); // Лог ошибки
                throw result.error; // Пробрасываем ошибку API дальше
            } else {
                console.log('useSpendingsStore: Spending added successfully. Triggering fetchSpendings...'); // Лог успеха
                await get().fetchSpendings(); // fetchSpendings сам установит loading=false и обновит spendings
                useBalanceStore.getState().fetchBalance(token); // Обновляем баланс
                console.log('useSpendingsStore: Balance fetch triggered after adding spending.'); // Лог триггера баланса

                return result.data; // Возвращаем ответ от API
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
            console.error('useSpendingsStore: Error in addSpending:', error); // Лог ошибки

            set({
                error: unexpectedError,
                loading: false
            });
            throw error; // Пробрасываем ошибку дальше
        } finally {
            console.log('useSpendingsStore: addSpending finished.'); // Лог завершения
        }
    },

    // Действие для обновления расхода по ID
    updateSpending: async (id, spendingData) => {
        console.log(`useSpendingsStore: updateSpending started for ID: ${id} with data:`, spendingData); // Лог начала действия с ID и данными

        set({ loading: true, error: null }); // Устанавливаем loading и сбрасываем ошибку

        const token = get().getToken(); // Получаем токен
        if (!token) {
            set({ loading: false });
            return;
        }
        console.log('useSpendingsStore: updateSpending - Token found, proceeding with API call.'); // Лог вызова API


        try {
            // --- ИСПРАВЛЕНО: Отправляем дату в формате YYYY-MM-DD или null ---
            const dataToSend = {
                amount: spendingData.amount, // Число
                description: spendingData.description, // Строка
                is_permanent: spendingData.is_permanent, // Булево
                category_id: spendingData.category_id, // Число или null
                // Отправляем строку даты YYYY-MM-DD как есть из формы, или null если пусто
                date: spendingData.date ? spendingData.date : null,
            };
            console.log(`useSpendingsStore: updateSpending - Data sent to API (YYYY-MM-DD or null) for ID ${id}:`, dataToSend); // Лог данных для отправки

            const result = await spendingsAPI.updateSpendingById(id, dataToSend, token);
            console.log(`useSpendingsStore: API updateSpendingById result for ID ${id}:`, result); // Лог результата API


            if (result.error) {
                set({ error: result.error, loading: false });
                console.error(`useSpendingsStore: Error updating spending ID ${id} from API:`, result.error); // Лог ошибки
                throw result.error;
            } else {
                // Если успешно, перезагружаем список
                console.log(`useSpendingsStore: Spending ID ${id} updated successfully. Triggering fetchSpendings...`); // Лог успеха
                await get().fetchSpendings(); // fetchSpendings сам установит loading=false и обновит spendings
                // Также, после обновления расхода, нужно обновить баланс
                useBalanceStore.getState().fetchBalance(token); // Обновляем баланс
                console.log('useSpendingsStore: Balance fetch triggered after updating spending.'); // Лог триггера баланса


                return result.data; // Возвращаем ответ от API
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
            console.error(`useSpendingsStore: Error in updateSpending ID ${id}:`, error); // Лог непредвиденной ошибки
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
            return;
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
                // Если успешно, перезагружаем список
                console.log(`useSpendingsStore: Spending ID ${id} deleted successfully. Triggering fetchSpendings...`); // Лог успеха
                await get().fetchSpendings(); // fetchSpendings сам установит loading=false и обновит spendings
                // Также, после удаления расхода, нужно обновить баланс
                useBalanceStore.getState().fetchBalance(token); // Обновляем баланс
                console.log('useSpendingsStore: Balance fetch triggered after deleting spending.'); // Лог триггера баланса


                return result.data; // Возвращаем ответ от API
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
            console.error(`useSpendingsStore: Error in deleteSpending ID ${id}:`, error); // Лог непредвиденной ошибки
            throw error;
        } finally {
            console.log(`useSpendingsStore: deleteSpending finished for ID: ${id}.`); // Лог завершения
        }
    },


    // Действие для сброса состояния стора расходов (например, при выходе пользователя)
    // Эта функция будет вызываться подпиской из storeInitializer.js
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

export default useSpendingsStore;