// src/stores/creditStore.js
import { create } from 'zustand';
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

    // --- Вспомогательная функция: Получение токена ---
    getToken: () => {
        const token = useAuthStore.getState().user?.access_token;
        if (!token) {
            const authError = { message: 'Пользователь не аутентифицирован. Пожалуйста, войдите.' };
            set({ error: authError, loading: false });
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
            set({ loading: true, error: null });
        } else {
            set({ error: null });
        }

        console.log('creditStore: Inside fetchCredits, get() contains:', get());

        const token = get().getToken();

        if (!token) {
            console.log('creditStore: fetchCredits - No token, stopping fetch.');
            if (!get().loading) set({ loading: false });
            return;
        }
        console.log('creditStore: fetchCredits - Token found, proceeding with API call.');


        try {
            const result = await creditAPI.getCredits(token);
            console.log('creditStore: API getCredits result:', result);

            if (result.error) {
                set({ error: result.error, loading: false });
                console.error('Ошибка загрузки доходов от API:', result.error);
            } else {
                set({ credits: result.data.Credits || [], loading: false });
            }

        } catch (error) {
            const unexpectedError = { message: error.message || 'Произошла непредвиденная ошибка при загрузке доходов.' };
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
        set({ loading: true, error: null });

        const token = get().getToken();
        if (!token) {
            set({ loading: false });
            throw new Error('Пользователь не аутентифицирован');
        }

        try {
            const result = await creditAPI.addCredit(creditData, token);
            console.log('creditStore: API addCredit result:', result);

            if (result.error) {
                // --- ИЗМЕНЕНИЕ: Обработка специфической ошибки валидации с сервера ---
                if (result.error.message === 'credit end_date must be greater than credit date') {
                    result.error.message = 'Дата окончания кредита должна быть больше или равна дате начала.';
                }
                set({ error: result.error, loading: false });
                console.error('Ошибка добавления дохода от API:', result.error);
                throw result.error;
            } else {
                await get().fetchCredits();
                useBalanceStore.getState().fetchBalance(token);
                // ДОБАВЛЕНО: Обновляем текущую цель
                useGoalsStore.getState().getCurrentGoal();
                console.log('creditStore: addCredit success, fetching credits and balance.');
                return result.data;
            }

        } catch (error) {
            const unexpectedError = { message: error.message || 'Произошла непредвиденная ошибка при добавлении дохода.' };
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
        set({ loading: true, error: null });

        const token = get().getToken();
        if (!token) {
            set({ loading: false });
            throw new Error('Пользователь не аутентифицирован');
        }

        try {
            const result = await creditAPI.updateCreditById(id, creditData, token);
            console.log('creditStore: API updateCredit result:', result);

            if (result.error) {
                // --- ИЗМЕНЕНИЕ: Обработка специфической ошибки валидации с сервера ---
                if (result.error.message === 'credit end_date must be greater than credit date') {
                    result.error.message = 'Дата окончания кредита должна быть больше или равна дате начала.';
                }
                set({ error: result.error, loading: false });
                console.error('Ошибка обновления дохода от API:', result.error);
                throw result.error;
            } else {
                await get().fetchCredits();
                useBalanceStore.getState().fetchBalance(token);
                // ДОБАВЛЕНО: Обновляем текущую цель
                useGoalsStore.getState().getCurrentGoal();
                console.log('creditStore: updateCredit success, fetching credits and balance.');
                return result.data;
            }

        } catch (error) {
            const unexpectedError = { message: error.message || 'Произошла непредвиденная ошибка при обновлении дохода.' };
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
        set({ loading: true, error: null });

        const token = get().getToken();
        if (!token) {
            set({ loading: false });
            throw new Error('Пользователь не аутентифицирован');
        }

        try {
            const result = await creditAPI.deleteCreditById(id, token);
            console.log('creditStore: API deleteCredit result:', result);

            if (result.error) {
                set({ error: result.error, loading: false });
                console.error('Ошибка удаления дохода от API:', result.error);
                throw result.error;
            } else {
                await get().fetchCredits();
                useBalanceStore.getState().fetchBalance(token);
                // ДОБАВЛЕНО: Обновляем текущую цель
                useGoalsStore.getState().getCurrentGoal();
                console.log(`creditStore: Доход ${id} успешно удален, fetching credits and balance.`);
                return result.data;
            }

        } catch (error) {
            const unexpectedError = { message: error.message || 'Произошла непредвиденная ошибка при удалении дохода.' };
            set({
                error: unexpectedError,
                loading: false
            });
            console.error('Непредвиденная ошибка deleteCredit:', error);
            throw error;
        } finally {
            console.log('creditStore: deleteCredit finished.');
        }
    },

    // Действие для сброса состояния стора доходов (используется при выходе пользователя)
    resetCredits: () => {
        console.log('creditStore: resetCredits called.');
        set({ credits: null, loading: false, error: null });
    },

    // Действие для сброса только ошибки
    clearError: () => {
        console.log('creditStore: clearError called.');
        set({ error: null });
    }
}));

export default useCreditStore;