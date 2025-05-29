//src/stores/spendingsStore.js
import { create } from 'zustand';
import * as spendingsAPI from '../api/spendings/index';
import useAuthStore from './authStore';
import useBalanceStore from './balanceStore';
// ДОБАВЛЕНО: Импортируем стор Целей
import useGoalsStore from './goalsStore';
// ДОБАВЛЕНО: Импортируем useCategoryStore для вызова fetchCategoriesMonthSummary
import useCategoryStore from './categoryStore';
import useMainPageStore from "./mainPageStore.js";
import useRemindersStore from "./remindersStore.js"; // <= ЭТО НОВОЕ ДОБАВЛЕНИЕ

const useSpendingsStore = create((set, get) => ({
    // --- Состояние (State) ---
    spendings: null,
    loading: false,
    error: null,
    setSpendings: (spendings) => set({ spendings }),
    setLoading: (loading) => set({ loading }),
    setError: (error) => set({ error }),

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
                let originalErrorMessage = result.error.message || 'Ошибка при добавлении расхода с сервера.';
                const dateValidationErrorEnglish = 'spending end_date must be greater than spending date';
                const dateValidationErrorRussianSpending = 'Дата окончания расхода должна быть больше или равна дате начала расхода.';

                // НОВОЕ: Ошибка - дата окончания расхода больше текущей
                const endDateGreaterThanCurrentDateEnglish = 'spending end_date must be less than current date';
                const endDateGreaterThanCurrentDateRussian = 'Дата окончания расхода должна быть не больше текущей даты.';

                const authErrorMessage = 'Сессия истекла. Попробуйте, пожалуйста, позже.';
                const formInputErrorMessage = 'Ошибка в данных формы. Проверьте введенные значения.';
                const genericErrorMessage = 'Ошибка связи или сервера. Попробуйте, пожалуйста, позже.';
                const startDateValidationErrorEnglish = 'spending date must be less than current date';
                const startDateValidationErrorRussian = 'Дата расхода должна быть не больше текущей';

                let userMessage = genericErrorMessage; // <-- Здесь userMessage ИНИЦИАЛИЗИРУЕТСЯ ОБЩИМ СООБЩЕНИЕМ

                // Затем идут проверки от СПЕЦИФИЧЕСКИХ к МЕНЕЕ СПЕЦИФИЧЕСКИМ
                // Если originalErrorMessage совпадает с endDateGreaterThanCurrentDateEnglish,
                // то userMessage будет перезаписано на endDateGreaterThanCurrentDateRussian.
                // Иначе, проверяется следующее условие, и так далее.
                // Если ни одно из if/else if не сработает, userMessage останется genericErrorMessage.

                if (originalErrorMessage === endDateGreaterThanCurrentDateEnglish) {
                    userMessage = endDateGreaterThanCurrentDateRussian;
                }
                else if (originalErrorMessage === startDateValidationErrorEnglish) {
                    userMessage = startDateValidationErrorRussian;
                }
                else if (originalErrorMessage === dateValidationErrorEnglish) {
                    userMessage = dateValidationErrorRussianSpending;
                }
                else if (result.error.status === 401 || result.error.status === 403 || (originalErrorMessage && (originalErrorMessage.toLowerCase().includes('token') || originalErrorMessage.toLowerCase().includes('unauthorized') || originalErrorMessage.toLowerCase().includes('forbidden')))) {
                    userMessage = authErrorMessage;
                }
                else if (result.error.status >= 400 && result.error.status < 500) {
                    userMessage = formInputErrorMessage;
                }

                const apiError = {
                    message: userMessage,
                    status: result.error.status,
                };
                set({ error: apiError, loading: false });
                console.error('useSpendingsStore: API error adding spending:', result.error);
                throw apiError; // Выбрасываем ошибку с переведённым сообщением
            } else {
                console.log('useSpendingsStore: Spending added successfully.');
                await get().fetchSpendings();
                useBalanceStore.getState().fetchBalance(token);
                useGoalsStore.getState().getCurrentGoal();
                // <= ЭТО КЛЮЧЕВОЕ ДОБАВЛЕНИЕ: Вызываем fetchCategoriesMonthSummary
                useCategoryStore.getState().fetchCategoriesMonthSummary(); // <= НОВОЕ ДОБАВЛЕНИЕ
                console.log('useSpendingsStore: Balance and Category Month Summary fetch triggered after adding spending.');
                useMainPageStore.getState().fetchRecommendations(); // <-- Добавляем здесь
                useRemindersStore.getState().fetchTodayReminder();
                console.log('useSpendingsStore: Recommendations fetch triggered after adding spending.');
            }
        } catch (error) {
            console.error('useSpendingsStore: Error caught in addSpending action:', error);
            throw error; // Просто перевыбрасываем ошибку, не меняя её
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
                let originalErrorMessage = result.error.message || 'Ошибка при добавлении расхода с сервера.';
                const dateValidationErrorEnglish = 'spending end_date must be greater than spending date';
                const dateValidationErrorRussianSpending = 'Дата окончания расхода должна быть больше или равна дате начала расхода.';

                // НОВОЕ: Ошибка - дата окончания расхода больше текущей
                const endDateGreaterThanCurrentDateEnglish = 'spending end_date must be less than current date';
                const endDateGreaterThanCurrentDateRussian = 'Дата окончания расхода должна быть не больше текущей даты.';

                const authErrorMessage = 'Сессия истекла. Попробуйте, пожалуйста, позже.';
                const formInputErrorMessage = 'Ошибка в данных формы. Проверьте введенные значения.';
                const genericErrorMessage = 'Ошибка связи или сервера. Попробуйте, пожалуйста, позже.';
                const startDateValidationErrorEnglish = 'spending date must be less than current date';
                const startDateValidationErrorRussian = 'Дата расхода должна быть не больше текущей';

                let userMessage = genericErrorMessage; // <-- Здесь userMessage ИНИЦИАЛИЗИРУЕТСЯ ОБЩИМ СООБЩЕНИЕМ

                // Затем идут проверки от СПЕЦИФИЧЕСКИХ к МЕНЕЕ СПЕЦИФИЧЕСКИМ
                // Если originalErrorMessage совпадает с endDateGreaterThanCurrentDateEnglish,
                // то userMessage будет перезаписано на endDateGreaterThanCurrentDateRussian.
                // Иначе, проверяется следующее условие, и так далее.
                // Если ни одно из if/else if не сработает, userMessage останется genericErrorMessage.

                if (originalErrorMessage === endDateGreaterThanCurrentDateEnglish) {
                    userMessage = endDateGreaterThanCurrentDateRussian;
                }
                else if (originalErrorMessage === startDateValidationErrorEnglish) {
                    userMessage = startDateValidationErrorRussian;
                }
                else if (originalErrorMessage === dateValidationErrorEnglish) {
                    userMessage = dateValidationErrorRussianSpending;
                }
                else if (result.error.status === 401 || result.error.status === 403 || (originalErrorMessage && (originalErrorMessage.toLowerCase().includes('token') || originalErrorMessage.toLowerCase().includes('unauthorized') || originalErrorMessage.toLowerCase().includes('forbidden')))) {
                    userMessage = authErrorMessage;
                }
                else if (result.error.status >= 400 && result.error.status < 500) {
                    userMessage = formInputErrorMessage;
                }

                const apiError = {
                    message: userMessage,
                    status: result.error.status,
                };
                set({ error: apiError, loading: false });
                console.error(`useSpendingsStore: API error updating spending ID ${id}:`, result.error);
                throw apiError; // Выбрасываем ошибку с переведённым сообщением // Выбрасываем ошибку
            } else {
                console.log(`useSpendingsStore: Spending ID ${id} updated successfully.`);
                await get().fetchSpendings();
                useBalanceStore.getState().fetchBalance(token);
                useGoalsStore.getState().getCurrentGoal();
                // <= ЭТО КЛЮЧЕВОЕ ДОБАВЛЕНИЕ: Вызываем fetchCategoriesMonthSummary
                useCategoryStore.getState().fetchCategoriesMonthSummary(); // <= НОВОЕ ДОБАВЛЕНИЕ
                console.log('useSpendingsStore: Balance and Category Month Summary fetch triggered after updating spending.');
                useMainPageStore.getState().fetchRecommendations(); // <-- Добавляем здесь
                useRemindersStore.getState().fetchTodayReminder();
                console.log('useSpendingsStore: Recommendations fetch triggered after adding spending.');
            }
        } catch (error) {
            console.error('useSpendingsStore: Error caught in updateSpending action:', error);
            throw error; // Просто перевыбрасываем
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
                // --- ИЗМЕНЕНИЕ: Исправленная логика обработки и замена сообщения об ошибке ---
                let originalErrorMessage = result.error.message || 'Ошибка при добавлении расхода с сервера.';
                const dateValidationErrorEnglish = 'spending end_date must be greater than spending date';
                const dateValidationErrorRussianSpending = 'Дата окончания расхода должна быть больше или равна дате начала расхода.';

                // НОВОЕ: Ошибка - дата окончания расхода больше текущей
                const endDateGreaterThanCurrentDateEnglish = 'spending end_date must be less than current date';
                const endDateGreaterThanCurrentDateRussian = 'Дата окончания расхода должна быть не больше текущей даты.';

                const authErrorMessage = 'Сессия истекла. Попробуйте, пожалуйста, позже.';
                const formInputErrorMessage = 'Ошибка в данных формы. Проверьте введенные значения.';
                const genericErrorMessage = 'Ошибка связи или сервера. Попробуйте, пожалуйста, позже.';
                const startDateValidationErrorEnglish = 'spending date must be less than current date';
                const startDateValidationErrorRussian = 'Дата расхода должна быть не больше текущей';

                let userMessage = genericErrorMessage; // <-- Здесь userMessage ИНИЦИАЛИЗИРУЕТСЯ ОБЩИМ СООБЩЕНИЕМ

                // Затем идут проверки от СПЕЦИФИЧЕСКИХ к МЕНЕЕ СПЕЦИФИЧЕСКИМ
                // Если originalErrorMessage совпадает с endDateGreaterThanCurrentDateEnglish,
                // то userMessage будет перезаписано на endDateGreaterThanCurrentDateRussian.
                // Иначе, проверяется следующее условие, и так далее.
                // Если ни одно из if/else if не сработает, userMessage останется genericErrorMessage.

                if (originalErrorMessage === endDateGreaterThanCurrentDateEnglish) {
                    userMessage = endDateGreaterThanCurrentDateRussian;
                }
                else if (originalErrorMessage === startDateValidationErrorEnglish) {
                    userMessage = startDateValidationErrorRussian;
                }
                else if (originalErrorMessage === dateValidationErrorEnglish) {
                    userMessage = dateValidationErrorRussianSpending;
                }
                else if (result.error.status === 401 || result.error.status === 403 || (originalErrorMessage && (originalErrorMessage.toLowerCase().includes('token') || originalErrorMessage.toLowerCase().includes('unauthorized') || originalErrorMessage.toLowerCase().includes('forbidden')))) {
                    userMessage = authErrorMessage;
                }
                else if (result.error.status >= 400 && result.error.status < 500) {
                    userMessage = formInputErrorMessage;
                }
                // **ПРИОРИТЕТ 4:** Для всех остальных ошибок (серверные 5хх, сетевые, неизвестные) оставляем универсальное сообщение
                // userMessage = genericErrorMessage; // Это значение уже установлено по умолчанию


                // --- Конец ИЗМЕНЕНИЯ ---

                const apiError = {
                    message: userMessage, // Используем финальное сообщение для пользователя
                    status: result.error.status, // Передаем статус, может быть полезен
                };
                console.error(`useSpendingsStore: API error deleting spending ID ${id}:`, result.error);
                throw apiError; // Выбрасываем
            } else {
                console.log(`useSpendingsStore: Spending ID ${id} deleted successfully.`);
                // При успехе обновляем список и баланс
                await get().fetchSpendings();
                useBalanceStore.getState().fetchBalance(token);
                useGoalsStore.getState().getCurrentGoal();
                // <= ЭТО КЛЮЧЕВОЕ ДОБАВЛЕНИЕ: Вызываем fetchCategoriesMonthSummary
                useCategoryStore.getState().fetchCategoriesMonthSummary(); // <= НОВОЕ ДОБАВЛЕНИЕ
                console.log('useSpendingsStore: Balance and Category Month Summary fetch triggered after deleting spending.');
                useMainPageStore.getState().fetchRecommendations(); // <-- Добавляем здесь
                useRemindersStore.getState().fetchTodayReminder();
                console.log('useSpendingsStore: Recommendations fetch triggered after adding spending.');
            }
        } catch (error) {
            // Перехватываем ошибку (API error или непредвиденную) и обрабатываем ее сообщение
            const processedError = {
                message: error.message || 'Произошла непредвиденная ошибка при удалении расхода.',
                status: error.status, // Сохраняем статус, если есть
            };
            // Пытаемся получить более детальное сообщение, если оно пришло в ответе API
            if (error.response && error.response.data && error.response.data.message) {
                processedError.message = error.response.data.message;
                processedError.status = error.response.status || processedError.status; // Сохраняем статус из ответа, если есть
            } else if (error.message === "Failed to fetch") {
                processedError.message = "Не удалось подключиться к серверу. Проверьте ваше интернет-соединение.";
            } else if (error.message) {
                // Если это ошибка, которую мы сами выбросили ранее (например, ошибка аутентификации из getToken)
                processedError.message = error.message;
                if (error.status) processedError.status = error.status; // Сохраняем статус, если есть
            }

            // --- ИЗМЕНЕНИЕ: Применяем ту же исправленную логику замены сообщения для пойманных ошибок ---
            const dateValidationErrorEnglish = 'spending end_date must be greater than spending date';
            const dateValidationErrorRussianSpending = 'Дата окончания расхода должна быть больше или равна дате начала расхода.';
            const authErrorMessage = 'Сессия истекла. Попробуйте, пожалуйста, позже.';
            const formInputErrorMessage = 'Ошибка в данных формы. Проверьте введенные значения.';
            const genericErrorMessage = 'Ошибка связи или сервера. Попробуйте, пожалуйста, позже.';

            let userMessage = genericErrorMessage; // Начинаем с универсального по умолчанию

            // **ПРИОРИТЕТ 1:** В первую очередь проверяем на специфическую ошибку валидации даты (английскую)
            if (processedError.message === dateValidationErrorEnglish) {
                userMessage = dateValidationErrorRussianSpending; // Если совпало, используем наш русский текст для даты
            }
            // **ПРИОРИТЕТ 2:** Если это НЕ специфическая ошибка даты, проверяем на ошибки аутентификации/авторизации
            else if (processedError.status === 401 || processedError.status === 403 || (processedError.message && (processedError.message.toLowerCase().includes('token') || processedError.message.toLowerCase().includes('unauthorized') || processedError.message.toLowerCase().includes('forbidden')))) {
                userMessage = authErrorMessage;
            }
            // **ПРИОРИТЕТ 3:** Если это НЕ ошибка даты и НЕ ошибка аутентификации/авторизации, проверяем на другие клиентские ошибки (4хх)
            else if (processedError.status >= 400 && processedError.status < 500) {
                // Используем общее сообщение для ошибок в данных формы
                userMessage = formInputErrorMessage;
            }
            // **ПРИОРИТЕТ 4:** Для всех остальных ошибок (серверные 5хх, сетевые, неизвестные) оставляем универсальное сообщение
            // userMessage = genericErrorMessage; // Это значение уже установлено по умолчанию


            processedError.message = userMessage; // Устанавливаем финальное сообщение

            // --- Конец ИЗМЕНЕНИЯ ---

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