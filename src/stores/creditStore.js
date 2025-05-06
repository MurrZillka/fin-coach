// src/stores/creditStore.js
import { create } from 'zustand';
// Убедись, что путь к файлу credit/index.js корректный
import * as creditAPI from '../api/credit/index';
// Импортируем authStore для получения токена
import useAuthStore from './authStore';
// Импортируем стор баланса (нужен для обновления баланса после операций)
import useBalanceStore from './balanceStore';


const useCreditStore = create((set, get) => ({
    // --- Состояние (State) ---
    credits: null, // Изменено на null для исправления бесконечного цикла
    loading: false,
    error: null,

    // --- Вспомогательная функция: Получение токена ---
    // Эта функция централизует получение токена из authStore
    // и установку ошибки в текущем сторе, если токен отсутствует.
    getToken: () => {
        // Получаем токен из состояния authStore через getState()
        const token = useAuthStore.getState().user?.access_token; // <--- Это строка 25 в коде ниже
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
        console.log('creditStore: fetchCredits started'); // Диагностический лог
        // Проверка, нужно ли устанавливать loading в true.
        // Не устанавливаем, если уже идет загрузка (например, CUD операция).
        if (!get().loading) {
            set({ loading: true, error: null });
        } else {
            set({ error: null });
        }

        // --- Диагностический лог: что находится в get() перед вызовом getToken ---
        console.log('creditStore: Inside fetchCredits, get() contains:', get());
        // --- Конец диагностического лога ---

        // Получаем токен перед вызовом API
        // Трассировка указывала на строку в районе этого вызова: get().getToken()
        const token = get().getToken(); // <--- Проверяем, что get() имеет getToken

        if (!token) {
            console.log('creditStore: fetchCredits - No token, stopping fetch.'); // Диагностический лог
            // Если getToken вернул null, значит, он сам установил ошибку и loading=false (если не было CUD)
            if (!get().loading) set({ loading: false });
            return;
        }
        console.log('creditStore: fetchCredits - Token found, proceeding with API call.'); // Диагностический лог


        try {
            const result = await creditAPI.getCredits(token);
            console.log('creditStore: API getCredits result:', result); // Диагностический лог

            if (result.error) {
                set({ error: result.error, loading: false });
                console.error('Ошибка загрузки доходов от API:', result.error);
            } else {
                // Если успешно, обновляем список доходов.
                // Если API вернуло null или undefined для Credits, используем пустой массив.
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
            console.log('creditStore: fetchCredits finished.'); // Диагностический лог
        }
    },

    // Действие для добавления нового дохода
    addCredit: async (creditData) => {
        console.log('creditStore: addCredit started'); // Диагностический лог
        set({ loading: true, error: null });

        const token = get().getToken();
        if (!token) {
            set({ loading: false });
            throw new Error('Пользователь не аутентифицирован');
        }

        try {
            const result = await creditAPI.addCredit(creditData, token);
            console.log('creditStore: API addCredit result:', result); // Диагностический лог

            if (result.error) {
                set({ error: result.error, loading: false });
                console.error('Ошибка добавления дохода от API:', result.error);
                throw result.error;
            } else {
                // Если успешно: перезагружаем список и баланс
                await get().fetchCredits(); // Используем get().fetchCredits() для вызова другого экшена
                useBalanceStore.getState().fetchBalance(token);
                console.log('creditStore: addCredit success, fetching credits and balance.'); // Диагностический лог
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
            console.log('creditStore: addCredit finished.'); // Диагностический лог
        }
    },

    // Действие для обновления дохода по ID
    updateCredit: async (id, creditData) => {
        console.log('creditStore: updateCredit started'); // Диагностический лог
        set({ loading: true, error: null });

        const token = get().getToken();
        if (!token) {
            set({ loading: false });
            throw new Error('Пользователь не аутентифицирован');
        }

        try {
            const result = await creditAPI.updateCreditById(id, creditData, token);
            console.log('creditStore: API updateCredit result:', result); // Диагностический лог

            if (result.error) {
                set({ error: result.error, loading: false });
                console.error('Ошибка обновления дохода от API:', result.error);
                throw result.error;
            } else {
                await get().fetchCredits(); // Используем get().fetchCredits()
                useBalanceStore.getState().fetchBalance(token);
                console.log('creditStore: updateCredit success, fetching credits and balance.'); // Диагностический лог
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
            console.log('creditStore: updateCredit finished.'); // Диагностический лог
        }
    },

    // Действие для удаления дохода по ID
    deleteCredit: async (id) => {
        console.log('creditStore: deleteCredit started'); // Диагностический лог
        set({ loading: true, error: null });

        const token = get().getToken();
        if (!token) {
            set({ loading: false });
            throw new Error('Пользователь не аутентифицирован');
        }

        try {
            const result = await creditAPI.deleteCreditById(id, token);
            console.log('creditStore: API deleteCredit result:', result); // Диагностический лог

            if (result.error) {
                set({ error: result.error, loading: false });
                console.error('Ошибка удаления дохода от API:', result.error);
                throw result.error;
            } else {
                await get().fetchCredits(); // Используем get().fetchCredits()
                useBalanceStore.getState().fetchBalance(token);
                console.log(`creditStore: Доход ${id} успешно удален, fetching credits and balance.`); // Диагностический лог
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
            console.log('creditStore: deleteCredit finished.'); // Диагностический лог
        }
    },

    // Действие для сброса состояния стора доходов (используется при выходе пользователя)
    resetCredits: () => {
        console.log('creditStore: resetCredits called.'); // Диагностический лог
        set({ credits: null, loading: false, error: null }); // Сбрасываем к начальному состоянию null
    },

    // Действие для сброса только ошибки
    clearError: () => {
        console.log('creditStore: clearError called.'); // Диагностический лог
        set({ error: null });
    }
}));

export default useCreditStore;