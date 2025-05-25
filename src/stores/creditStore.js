// src/stores/creditStore.js
import {create} from 'zustand';
// Убедись, что путь к файлу credit/index.js корректный
import * as creditAPI from '../api/credit/index';
// Импортируем authStore для получения токена и подписки
import useAuthStore from './authStore';
// Импортируем стор баланса (нужен для обновления баланса после операций)
import useBalanceStore from './balanceStore';
// ДОБАВЛЕНО: Импортируем стор Целей
import useGoalsStore from './goalsStore';


const useCreditStore = create((set, get) => ({
    // --- Состояние (State) ---
    credits: null,
    loading: false,
    error: null,
    setCredits: (credits) => set({credits}),
    setLoading: (loading) => set({loading}),
    setError: (error) => set({error}),

    // --- Вспомогательная функция: Получение токена ---
    getToken: () => {
        const token = useAuthStore.getState().user?.access_token;
        if (!token) {
            const authError = {message: 'Пользователь не аутентифицирован. Пожалуйста, войдите.'};
            set({error: authError, loading: false});
            console.error('Ошибка аутентификации в creditStore:', authError);
            return null;
        }
        return token;
    },

    // --- Действия (Actions) ---

    // Действие для загрузки списка доходов
    fetchCredits: async () => {
        console.log('creditStore: fetchCredits started');
        if (!get().loading) {
            set({loading: true, error: null});
        } else {
            set({error: null});
        }

        console.log('creditStore: Inside fetchCredits, get() contains:', get());

        const token = get().getToken();

        if (!token) {
            console.log('creditStore: fetchCredits - No token, stopping fetch.');
            if (!get().loading) set({loading: false});
            return;
        }
        console.log('creditStore: fetchCredits - Token found, proceeding with API call.');


        try {
            const result = await creditAPI.getCredits(token);
            console.log('creditStore: API getCredits result:', result);

            if (result.error) {
                set({error: result.error, loading: false});
                console.error('Ошибка загрузки доходов от API:', result.error);
            } else {
                set({credits: result.data.Credits || [], loading: false});
            }

        } catch (error) {
            const unexpectedError = {message: error.message || 'Произошла непредвиденная ошибка при загрузке доходов.'};
            set({
                error: unexpectedError,
                loading: false
            });
            console.error('Непредвиденная ошибка fetchCredits:', error);
        } finally {
            console.log('creditStore: fetchCredits finished.');
        }
    },

    // Действие для добавления нового дохода
    addCredit: async (creditData) => {
        console.log('creditStore: addCredit started');
        set({loading: true, error: null});

        const token = get().getToken();
        if (!token) {
            set({loading: false});
            throw new Error('Пользователь не аутентифицирован');
        }

        try {
            const result = await creditAPI.addCredit(creditData, token);
            console.log('creditStore: API addCredit result:', result);

            if (result.error) {
                let originalErrorMessage = result.error.message; // Получаем оригинальное сообщение от сервера

                // Существующие переводы, которые ты уже имел
                const dateValidationErrorCreditEnglish = 'credit end_date must be greater than credit date';
                const dateValidationErrorCreditRussian = 'Дата окончания дохода должна быть больше или равна дате начала.';
                const dateValidationErrorCreditStartDateEnglish = 'credit date must be less than current date';
                const dateValidationErrorCreditStartDateRussian = 'Дата дохода должна быть не больше текущей';

                // !!! НОВОЕ: Добавляем константы для ошибки, которая приходит от сервера (spending_end_date)
                const spendingEndDateGreaterThanCurrentDateEnglish = 'spending end_date must be less than current date';
                const spendingEndDateGreaterThanCurrentDateRussian = 'Дата окончания дохода должна быть не больше текущей даты.'; // Это русский текст для дохода

                let userMessage = originalErrorMessage; // По умолчанию оставляем оригинальное сообщение

                // Порядок приоритета:
                // 1. Ошибка с "spending end_date..." (хотя она приходит для дохода)
                if (originalErrorMessage === spendingEndDateGreaterThanCurrentDateEnglish) {
                    userMessage = spendingEndDateGreaterThanCurrentDateRussian;
                }
                // 2. Ошибка "credit date must be less than current date"
                else if (originalErrorMessage === dateValidationErrorCreditStartDateEnglish) {
                    userMessage = dateValidationErrorCreditStartDateRussian;
                }
                // 3. Ошибка "credit end_date must be greater than credit date"
                else if (originalErrorMessage === dateValidationErrorCreditEnglish) {
                    userMessage = dateValidationErrorCreditRussian;
                }
                    // Если ни одна из вышеперечисленных ошибок не совпала,
                    // можно добавить общую обработку статусов, если это требуется.
                // Например:
                else if (result.error.status && result.error.status >= 400 && result.error.status < 500) {
                    // Это может быть общая ошибка валидации, которую ты не распознал
                    userMessage = 'Ошибка в данных формы. Проверьте введенные значения.';
                } else {
                    // Общая ошибка, если ничего не подошло
                    userMessage = 'Ошибка связи или сервера. Попробуйте, пожалуйста, позже.';
                }


                const processedError = {
                    message: userMessage,
                    status: result.error.status || 500 // Если статус отсутствует, по умолчанию 500
                };
                set({ error: processedError, loading: false });
                console.error('Ошибка обработки дохода от API:', result.error);
                throw processedError; // Выбрасываем переведенную ошибку
            } else {
                await get().fetchCredits();
                useBalanceStore.getState().fetchBalance(token);
                // ДОБАВЛЕНО: Обновляем текущую цель
                useGoalsStore.getState().getCurrentGoal();
                console.log('creditStore: addCredit success, fetching credits and balance.');
                return result.data;
            }

        } catch (error) {
            const unexpectedError = {message: error.message || 'Произошла непредвиденная ошибка при добавлении дохода.'};
            set({
                error: unexpectedError,
                loading: false
            });
            console.error('Непредвиденная ошибка addCredit:', error);
            throw error;
        } finally {
            console.log('creditStore: addCredit finished.');
        }
    },

    // Действие для обновления дохода по ID
    updateCredit: async (id, creditData) => {
        console.log('creditStore: updateCredit started');
        set({loading: true, error: null});

        const token = get().getToken();
        if (!token) {
            set({loading: false});
            throw new Error('Пользователь не аутентифицирован');
        }

        try {
            const result = await creditAPI.updateCreditById(id, creditData, token);
            console.log('creditStore: API updateCredit result:', result);

            if (result.error) {
                // НОВОЕ: Константа для новой английской ошибки
                let originalErrorMessage = result.error.message; // Получаем оригинальное сообщение от сервера

                // Существующие переводы, которые ты уже имел
                const dateValidationErrorCreditEnglish = 'credit end_date must be greater than credit date';
                const dateValidationErrorCreditRussian = 'Дата окончания дохода должна быть больше или равна дате начала.';
                const dateValidationErrorCreditStartDateEnglish = 'credit date must be less than current date';
                const dateValidationErrorCreditStartDateRussian = 'Дата дохода должна быть не больше текущей';

                // !!! НОВОЕ: Добавляем константы для ошибки, которая приходит от сервера (spending_end_date)
                const spendingEndDateGreaterThanCurrentDateEnglish = 'spending end_date must be less than current date';
                const spendingEndDateGreaterThanCurrentDateRussian = 'Дата окончания дохода должна быть не больше текущей даты.'; // Это русский текст для дохода

                let userMessage = originalErrorMessage; // По умолчанию оставляем оригинальное сообщение

                // Порядок приоритета:
                // 1. Ошибка с "spending end_date..." (хотя она приходит для дохода)
                if (originalErrorMessage === spendingEndDateGreaterThanCurrentDateEnglish) {
                    userMessage = spendingEndDateGreaterThanCurrentDateRussian;
                }
                // 2. Ошибка "credit date must be less than current date"
                else if (originalErrorMessage === dateValidationErrorCreditStartDateEnglish) {
                    userMessage = dateValidationErrorCreditStartDateRussian;
                }
                // 3. Ошибка "credit end_date must be greater than credit date"
                else if (originalErrorMessage === dateValidationErrorCreditEnglish) {
                    userMessage = dateValidationErrorCreditRussian;
                }
                    // Если ни одна из вышеперечисленных ошибок не совпала,
                    // можно добавить общую обработку статусов, если это требуется.
                // Например:
                else if (result.error.status && result.error.status >= 400 && result.error.status < 500) {
                    // Это может быть общая ошибка валидации, которую ты не распознал
                    userMessage = 'Ошибка в данных формы. Проверьте введенные значения.';
                } else {
                    // Общая ошибка, если ничего не подошло
                    userMessage = 'Ошибка связи или сервера. Попробуйте, пожалуйста, позже.';
                }


                const processedError = {
                    message: userMessage,
                    status: result.error.status || 500 // Если статус отсутствует, по умолчанию 500
                };
                set({error: processedError, loading: false});
                console.error('Ошибка обработки дохода от API:', result.error);
                throw processedError; // Выбрасываем переведенную ошибку
            } else {
                await get().fetchCredits();
                useBalanceStore.getState().fetchBalance(token);
                // ДОБАВЛЕНО: Обновляем текущую цель
                useGoalsStore.getState().getCurrentGoal();
                console.log('creditStore: updateCredit success, fetching credits and balance.');
                return result.data;
            }

        } catch (error) {
            const unexpectedError = {message: error.message || 'Произошла непредвиденная ошибка при обновлении дохода.'};
            set({
                error: unexpectedError,
                loading: false
            });
            console.error('Непредвиденная ошибка updateCredit:', error);
            throw error;
        } finally {
            console.log('creditStore: updateCredit finished.');
        }
    },

    // Действие для удаления дохода по ID
    deleteCredit: async (id) => {
        console.log('creditStore: deleteCredit started');
        set({loading: true, error: null});

        const token = get().getToken();
        if (!token) {
            set({loading: false});
            throw new Error('Пользователь не аутентифицирован');
        }

        try {
            const result = await creditAPI.deleteCreditById(id, token);
            console.log('creditStore: API deleteCredit result:', result);

            if (result.error) {
                console.error('Ошибка удаления дохода от API:', result.error);
                throw result.error;
            } else {
                await get().fetchCredits();
                useBalanceStore.getState().fetchBalance(token);
                useGoalsStore.getState().getCurrentGoal();
                console.log(`creditStore: Доход ${id} успешно удален, fetching credits and balance.`);
                return result.data;
            }
        } catch (error) {
            console.error('Непредвиденная ошибка deleteCredit:', error);
            throw error;
        } finally {
            console.log('creditStore: deleteCredit finished.');
        }
    },
    // Действие для сброса состояния стора доходов (используется при выходе пользователя)
    resetCredits: () => {
        console.log('creditStore: resetCredits called.');
        set({credits: null, loading: false, error: null});
    },

    // Действие для сброса только ошибки
    clearError: () => {
        console.log('creditStore: clearError called.');
        set({error: null});
    }
}));

export default useCreditStore;