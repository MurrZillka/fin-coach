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
            // Аутентификация не пройдена - это ошибка на уровне приложения, а не модалки
            const authError = { message: 'Аутентификация не пройдена. Пожалуйста, войдите снова.' };
            set({ error: authError, loading: false });
            console.error('useSpendingsStore: Authentication error in getToken.', authError);
            // Не выбрасываем здесь, просто устанавливаем ошибку стора и возвращаем null
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
            // Если нет токена, ошибка уже установлена в getToken, просто выходим
            if (!get().loading) set({ loading: false });
            return;
        }
        console.log('useSpendingsStore: fetchSpendings - Token found, proceeding with API call.');

        try {
            const result = await spendingsAPI.getSpendings(token);
            console.log('useSpendingsStore: API getSpendings result:', result);

            if (result.error) {
                // Если API вернуло ошибку, устанавливаем ее в стор
                set({ error: result.error, loading: false });
                console.error('useSpendingsStore: Error fetching spendings from API:', result.error);
                // Не выбрасываем здесь, т.к. это фоновая загрузка для страницы
            } else {
                const spendingsArray = result.data?.Spendings || [];
                set({ spendings: spendingsArray, loading: false, error: null });
                console.log('useSpendingsStore: Spendings updated successfully.', spendingsArray.length, 'items.');
            }
        } catch (error) {
            // Непредвиденная ошибка запроса
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
            console.error('useSpendingsStore: Unexpected error fetching spendings:', error);
            // Не выбрасываем здесь
        } finally {
            console.log('useSpendingsStore: fetchSpendings finished.');
        }
    },

    addSpending: async (spendingData) => {
        console.log('useSpendingsStore: addSpending started with data:', spendingData);
        const token = get().getToken();
        if (!token) {
            throw new Error('Аутентификация не пройдена.'); // Выбрасываем для обработки компонентом
        }
        console.log('useSpendingsStore: addSpending - Token found, proceeding with API call.');

        try {
            const dataToSend = {
                amount: spendingData.amount,
                description: spendingData.description,
                is_permanent: spendingData.is_permanent,
                category_id: spendingData.category_id,
                // Если дата отсутствует (пустая строка, null, undefined), отправляем '0001-01-01'
                date: spendingData.date ? spendingData.date : '0001-01-01',
                // Если end_date отсутствует (пустая строка, null, undefined), отправляем '0001-01-01'
                end_date: spendingData.end_date ? spendingData.end_date : '0001-01-01',
            };
            console.log('useSpendingsStore: addSpending - Data sent to API:', dataToSend);

            const result = await spendingsAPI.addSpending(dataToSend, token);
            console.log('useSpendingsStore: API addSpending result:', result);

            if (result.error) {
                // --- ИЗМЕНЕНИЕ: Перехватываем конкретное сообщение об ошибке даты и заменяем его ---
                let errorMessage = result.error.message || 'Ошибка при добавлении расхода с сервера.';
                const dateValidationErrorEnglish = 'spending end_date must be greater than spending date';
                const dateValidationErrorRussian = 'Дата окончания расхода должна быть больше или равна дате начала расхода.';

                if (errorMessage === dateValidationErrorEnglish) {
                    errorMessage = dateValidationErrorRussian;
                }
                // --- Конец ИЗМЕНЕНИЯ ---

                const apiError = {
                    message: errorMessage, // Используем возможно замененное сообщение
                    status: result.error.status,
                };
                console.error('useSpendingsStore: API error adding spending:', result.error);
                throw apiError; // Выбрасываем ошибку для обработки компонентом
            } else {
                console.log('useSpendingsStore: Spending added successfully.');
                await get().fetchSpendings();
                useBalanceStore.getState().fetchBalance(token);
                console.log('useSpendingsStore: Balance fetch triggered after adding spending.');
            }
        } catch (error) {
            // Перехватываем ошибку (API error или непредвиденную) и перевыбрасываем
            const processedError = {
                message: error.message || 'Произошла непредвиденная ошибка при добавлении расхода.',
                status: error.status,
            };
            // Если ошибка имеет структуру ответа API (например, status, data.message)
            if (error.response && error.response.data && error.response.data.message) {
                processedError.message = error.response.data.message;
                processedError.status = error.response.status;
            } else if (error.message === "Failed to fetch") {
                processedError.message = "Не удалось подключиться к серверу. Проверьте ваше интернет-соединение.";
            } else if (error.message) {
                // Если это ошибка, которую мы сами выбросили ранее (например, apiError)
                processedError.message = error.message;
                if (error.status) processedError.status = error.status;
            }

            // --- ИЗМЕНЕНИЕ: Повторяем замену сообщения для непредвиденных ошибок, если они содержат этот текст (менее вероятно) ---
            const dateValidationErrorEnglish = 'spending end_date must be greater than spending date';
            const dateValidationErrorRussian = 'Дата окончания расхода должна быть больше или равна дате начала расхода.';
            if (processedError.message === dateValidationErrorEnglish) {
                processedError.message = dateValidationErrorRussian;
            }
            // --- Конец ИЗМЕНЕНИЯ ---


            console.error('useSpendingsStore: Error caught in addSpending action:', error);
            throw processedError; // Перевыбрасываем обработанную ошибку
        } finally {
            console.log('useSpendingsStore: addSpending finished.');
        }
    },

    updateSpending: async (id, spendingData) => {
        console.log(`useSpendingsStore: updateSpending started for ID: ${id} with data:`, spendingData);
        const token = get().getToken();
        if (!token) {
            throw new Error('Аутентификация не пройдена.'); // Выбрасываем
        }
        console.log('useSpendingsStore: updateSpending - Token found, proceeding with API call.');

        try {
            const dataToSend = {
                amount: spendingData.amount,
                description: spendingData.description,
                is_permanent: spendingData.is_permanent,
                category_id: spendingData.category_id,
                // Если дата отсутствует (пустая строка, null, undefined), отправляем '0001-01-01'
                date: spendingData.date ? spendingData.date : '0001-01-01',
                // Если end_date отсутствует (пустая строка, null, undefined), отправляем '0001-01-01'
                end_date: spendingData.end_date ? spendingData.end_date : '0001-01-01',
            };
            console.log(`useSpendingsStore: updateSpending - Data sent to API for ID ${id}:`, dataToSend);

            const result = await spendingsAPI.updateSpendingById(id, dataToSend, token);
            console.log(`useSpendingsStore: API updateSpendingById result for ID ${id}:`, result);

            if (result.error) {
                // --- ИЗМЕНЕНИЕ: Перехватываем конкретное сообщение об ошибке даты и заменяем его ---
                let errorMessage = result.error.message || 'Ошибка при обновлении расхода с сервера.';
                const dateValidationErrorEnglish = 'spending end_date must be greater than spending date';
                const dateValidationErrorRussian = 'Дата окончания расхода должна быть больше или равна дате начала расхода.';

                if (errorMessage === dateValidationErrorEnglish) {
                    errorMessage = dateValidationErrorRussian;
                }
                // --- Конец ИЗМЕНЕНИЯ ---

                const apiError = {
                    message: errorMessage, // Используем возможно замененное сообщение
                    status: result.error.status,
                };
                console.error(`useSpendingsStore: API error updating spending ID ${id}:`, result.error);
                throw apiError; // Выбрасываем ошибку
            } else {
                console.log(`useSpendingsStore: Spending ID ${id} updated successfully.`);
                await get().fetchSpendings();
                useBalanceStore.getState().fetchBalance(token);
                console.log('useSpendingsStore: Balance fetch triggered after updating spending.');
            }
        } catch (error) {
            // Перехватываем ошибку и перевыбрасываем
            const processedError = {
                message: error.message || 'Произошла непредвиденная ошибка при обновлении расхода.',
                status: error.status,
            };
            if (error.response && error.response.data && error.response.data.message) {
                processedError.message = error.response.data.message;
                processedError.status = error.response.status;
            } else if (error.message === "Failed to fetch") {
                processedError.message = "Не удалось подключиться к серверу. Проверьте ваше интернет-соединение.";
            } else if (error.message) {
                processedError.message = error.message;
                if (error.status) processedError.status = error.status;
            }

            // --- ИЗМЕНЕНИЕ: Повторяем замену сообщения для непредвиденных ошибок ---
            const dateValidationErrorEnglish = 'spending end_date must be greater than spending date';
            const dateValidationErrorRussian = 'Дата окончания расхода должна быть больше или равна дате начала расхода.';
            if (processedError.message === dateValidationErrorEnglish) {
                processedError.message = dateValidationErrorRussian;
            }
            // --- Конец ИЗМЕНЕНИЯ ---

            console.error(`useSpendingsStore: Error caught in updateSpending action for ID ${id}:`, error);
            throw processedError; // Перевыбрасываем
        } finally {
            console.log(`useSpendingsStore: updateSpending finished for ID: ${id}.`);
        }
    },

    deleteSpending: async (id) => {
        console.log(`useSpendingsStore: deleteSpending started for ID: ${id}`);
        const token = get().getToken();
        if (!token) {
            throw new Error('Аутентификация не пройдена.'); // Выбрасываем
        }
        console.log('useSpendingsStore: deleteSpending - Token found, proceeding with API call.');

        try {
            const result = await spendingsAPI.deleteSpendingById(id, token);
            console.log(`useSpendingsStore: API deleteSpendingById result for ID ${id}:`, result);

            if (result.error) {
                // Если API вернуло ошибку, выбрасываем ее
                const apiError = {
                    message: result.error.message || 'Ошибка при удалении расхода с сервера.',
                    status: result.error.status,
                };
                console.error(`useSpendingsStore: API error deleting spending ID ${id}:`, result.error);
                throw apiError; // Выбрасываем
            } else {
                console.log(`useSpendingsStore: Spending ID ${id} deleted successfully.`);
                // При успехе обновляем список и баланс
                await get().fetchSpendings();
                useBalanceStore.getState().fetchBalance(token);
                console.log('useSpendingsStore: Balance fetch triggered after deleting spending.');
            }
        } catch (error) {
            // Перехватываем ошибку и перевыбрасываем
            const processedError = {
                message: error.message || 'Произошла непредвиденная ошибка при удалении расхода.',
                status: error.status,
            };
            if (error.response && error.response.data && error.response.data.message) {
                processedError.message = error.response.data.message;
                processedError.status = error.response.status;
            } else if (error.message === "Failed to fetch") {
                processedError.message = "Не удалось подключиться к серверу. Проверьте ваше интернет-соединение.";
            } else if (error.message) {
                processedError.message = error.message;
                if (error.status) processedError.status = error.status;
            }
            console.error(`useSpendingsStore: Error caught in deleteSpending action for ID ${id}:`, error);
            throw processedError; // Перевыбрасываем
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