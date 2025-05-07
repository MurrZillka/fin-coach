// src/stores/spendingStore.js
import { create } from 'zustand';
// Убедись, что путь к spending/index.js корректный
import * as spendingsAPI from '../api/spendings/index';
// Импортируем authStore для получения токена
import useAuthStore from './authStore';
// Импортируем стор баланса (нужен для обновления баланса после операций)
import useBalanceStore from './balanceStore';

const useSpendingStore = create((set, get) => ({
    // --- Состояние (State) ---
    spendings: null, // Список расходов, null по умолчанию, пока не загружен
    loading: false, // Индикатор загрузки
    error: null, // Информация об ошибке

    // --- Вспомогательная функция: Получение токена ---
    // Централизует получение токена из authStore и обработку его отсутствия
    getToken: () => {
        // Получаем токен из состояния authStore через getState()
        const token = useAuthStore.getState().user?.access_token;
        if (!token) {
            // Если токена нет, устанавливаем ошибку в текущем сторе
            const authError = { message: 'Пользователь не аутентифицирован. Пожалуйста, войдите.' };
            set({ error: authError, loading: false });
            console.error('Ошибка аутентификации в spendingStore:', authError);
            return null;
        }
        return token;
    },

    // --- Действия (Actions) ---

    // Действие для загрузки списка расходов пользователя
    // Вызывает API getSpendings
    fetchSpendings: async () => {
        console.log('spendingStore: fetchSpendings started');
        // Не устанавливаем loading=true, если другая загрузка уже идет
        if (!get().loading) {
            set({ loading: true, error: null });
        } else {
            set({ error: null }); // Просто сбрасываем ошибку
        }

        // Получаем токен перед вызовом API
        const token = get().getToken();
        if (!token) {
            console.log('spendingStore: fetchSpendings - No token, stopping fetch.');
            // ЕслиgetToken вернул null, он уже установил ошибку/loading=false (если не было CUD)
            if (!get().loading) set({ loading: false });
            return;
        }
        console.log('spendingStore: fetchSpendings - Token found, proceeding with API call.');

        try {
            // Вызываем API функцию для получения расходов
            const result = await spendingsAPI.getSpendings(token);
            console.log('spendingStore: API getSpendings result:', result);

            if (result.error) {
                // Если API вернуло ошибку
                set({ error: result.error, loading: false });
                console.error('Ошибка загрузки расходов от API:', result.error);
            } else {
                // Если успешно: обновляем список расходов в состоянии
                // API возвращает объект с ключом "Spendings", содержащим массив
                set({ spendings: result.data.Spendings || [], loading: false });
            }

        } catch (error) {
            // Обработка непредвиденных ошибок (например, проблемы сети)
            const unexpectedError = { message: error.message || 'Произошла непредвиденная ошибка при загрузке расходов.' };
            set({
                error: unexpectedError,
                loading: false
            });
            console.error('Непредвиденная ошибка fetchSpendings:', error);
        } finally {
            console.log('spendingStore: fetchSpendings finished.');
        }
    },

    // Действие для добавления нового расхода
    // Принимает объект spendingData: { amount, description, is_permanent, category_id, date }
    addSpending: async (spendingData) => {
        console.log('spendingStore: addSpending started', spendingData);
        set({ loading: true, error: null });

        const token = get().getToken();
        if (!token) {
            set({ loading: false });
            // Пробрасываем ошибку дальше, чтобы UI мог ее обработать (например, модальное окно)
            throw new Error('Пользователь не аутентифицирован');
        }

        try {
            // Вызываем API функцию для добавления расхода
            const result = await spendingsAPI.addSpending(spendingData, token);
            console.log('spendingStore: API addSpending result:', result);

            if (result.error) {
                // Если API вернуло ошибку
                set({ error: result.error, loading: false });
                console.error('Ошибка добавления расхода от API:', result.error);
                throw result.error; // Пробрасываем ошибку дальше
            } else {
                // Если успешно: перезагружаем список расходов И ОБНОВЛЯЕМ БАЛАНС
                await get().fetchSpendings(); // Вызываем fetchSpendings из этого же стора, чтобы обновить список
                // Инициируем обновление баланса через balanceStore
                useBalanceStore.getState().fetchBalance(token);
                console.log('spendingStore: addSpending success, fetching spendings and balance.');
                return result.data; // Возвращаем данные от API (например, сообщение об успехе)
            }

        } catch (error) {
            // Обработка непредвиденных ошибок
            const unexpectedError = { message: error.message || 'Произошла непредвиденная ошибка при добавлении расхода.' };
            set({
                error: unexpectedError,
                loading: false
            });
            console.error('Непредвиденная ошибка addSpending:', error);
            throw error; // Пробрасываем ошибку дальше
        } finally {
            console.log('spendingStore: addSpending finished.');
        }
    },

    // Действие для обновления расхода по ID
    // Принимает id расхода и объект spendingData: { amount, description, is_permanent, category_id, date }
    updateSpending: async (id, spendingData) => {
        console.log('spendingStore: updateSpending started', id, spendingData);
        set({ loading: true, error: null });

        const token = get().getToken();
        if (!token) {
            set({ loading: false });
            throw new Error('Пользователь не аутентифицирован');
        }

        try {
            // Вызываем API функцию для обновления расхода
            const result = await spendingsAPI.updateSpendingById(id, spendingData, token);
            console.log('spendingStore: API updateSpending result:', result);

            if (result.error) {
                // Если API вернуло ошибку
                set({ error: result.error, loading: false });
                console.error('Ошибка обновления расхода от API:', result.error);
                throw result.error; // Пробрасываем ошибку дальше
            } else {
                // Если успешно: перезагружаем список и ОБНОВЛЯЕМ БАЛАНС
                await get().fetchSpendings(); // Вызываем fetchSpendings из этого же стора
                // Инициируем обновление баланса через balanceStore
                useBalanceStore.getState().fetchBalance(token);
                console.log('spendingStore: updateSpending success, fetching spendings and balance.');
                return result.data; // Возвращаем данные от API
            }

        } catch (error) {
            // Обработка непредвиденных ошибок
            const unexpectedError = { message: error.message || 'Произошла непредвиденная ошибка при обновлении расхода.' };
            set({
                error: unexpectedError,
                loading: false
            });
            console.error('Непредвиденная ошибка updateSpending:', error);
            throw error; // Пробрасываем ошибку дальше
        } finally {
            console.log('spendingStore: updateSpending finished.');
        }
    },

    // Действие для удаления расхода по ID
    // Принимает id расхода
    deleteSpending: async (id) => {
        console.log('spendingStore: deleteSpending started', id);
        set({ loading: true, error: null });

        const token = get().getToken();
        if (!token) {
            set({ loading: false });
            throw new Error('Пользователь не аутентифицирован');
        }

        try {
            // Вызываем API функцию для удаления расхода
            const result = await spendingsAPI.deleteSpendingById(id, token);
            console.log('spendingStore: API deleteSpending result:', result);

            if (result.error) {
                // Если API вернуло ошибку
                set({ error: result.error, loading: false });
                console.error('Ошибка удаления расхода от API:', result.error);
                throw result.error; // Пробрасываем ошибку дальше
            } else {
                // Если успешно: перезагружаем список и ОБНОВЛЯЕМ БАЛАНС
                await get().fetchSpendings(); // Вызываем fetchSpendings из этого же стора
                // Инициируем обновление баланса через balanceStore
                useBalanceStore.getState().fetchBalance(token);
                console.log(`spendingStore: Расход ${id} успешно удален, fetching spendings and balance.`);
                return result.data; // Возвращаем данные от API
            }

        } catch (error) {
            // Обработка непредвиденных ошибок
            const unexpectedError = { message: error.message || 'Произошла непредвиденная ошибка при удалении расхода.' };
            set({
                error: unexpectedError,
                loading: false
            });
            console.error('Непредвиденная ошибка deleteSpending:', error);
            throw error; // Пробрасываем ошибку дальше
        } finally {
            console.log('spendingStore: deleteSpending finished.');
        }
    },

    // Действие для сброса состояния стора расходов (используется при выходе пользователя)
    resetSpendings: () => {
        console.log('spendingStore: resetSpendings called.');
        set({ spendings: null, loading: false, error: null }); // Сбрасываем к начальному состоянию null
    },

    // Действие для сброса только ошибки
    clearError: () => {
        console.log('spendingStore: clearError called.');
        set({ error: null });
    }
}));

export default useSpendingStore;