// src/stores/goalsStore.js
import { create } from 'zustand';
// Импортируем все API-функции для целей
import * as goalsAPI from '../api/goals'; // Убедись, что путь корректен
// Импортируем authStore для получения токена в действиях
import useAuthStore from './authStore'; // Убедись, что путь корректен


// --- ВАЖНО: Подписка на authStore для сброса состояния ДОБАВЛЯЕТСЯ НЕ ЗДЕСЬ, а в storeInitializer.js ---


const useGoalsStore = create((set, get) => ({
    // --- Состояние (State) ---
    goals: null, // Список всех целей пользователя
    currentGoal: null, // Текущая (активная) цель
    loading: false, // Индикатор загрузки для списка целей и CUD операций
    error: null, // Информация об ошибке для списка целей и CUD операций
    currentGoalLoading: false, // Индикатор загрузки для операций с текущей целью
    currentGoalError: null, // Информация об ошибке для операций с текущей целью


    // --- Вспомогательная функция: Получение токена ---
    getToken: () => {
        const token = useAuthStore.getState().user?.access_token;
        if (!token) {
            // В сторе данных, если нет токена, просто логируем и возвращаем null.
            // Ошибку в UI покажет LayoutWithHeader на основе authStore.error.
            console.error('goalsStore: Authentication error - No token found.');
            // Не устанавливаем ошибку в этом сторе, чтобы не перекрывать ошибку аутентификации
            return null;
        }
        return token;
    },


    // --- Действия (Actions) ---

    // Загрузка списка всех целей
    fetchGoals: async () => {
        console.log('goalsStore: fetchGoals started');
        set({ loading: true, error: null }); // Сбрасываем ошибку перед началом загрузки

        const token = get().getToken(); // Получаем токен
        if (!token) {
            set({ loading: false }); // Если нет токена, просто заканчиваем загрузку
            console.log('goalsStore: fetchGoals - No token, stopping fetch.');
            return; // Прерываем выполнение
        }

        try {
            const result = await goalsAPI.getGoals(token);
            console.log('goalsStore: API getGoals result:', result);

            if (result.error) {
                set({ error: result.error, loading: false });
                console.error('goalsStore: Error fetching goals from API:', result.error);
            } else {
                // API возвращает { Goals: [...] }
                set({ goals: result.data.Goals || [], loading: false, error: null }); // Обновляем список целей, учитываем пустой массив
                console.log('goalsStore: Goals fetched successfully.');
            }

        } catch (error) {
            const unexpectedError = { message: error.message || 'Произошла непредвиденная ошибка при загрузке целей.' };
            set({
                error: unexpectedError,
                loading: false
            });
            console.error('goalsStore: Unexpected error in fetchGoals:', error);
        } finally {
            console.log('goalsStore: fetchGoals finished.');
        }
    },

    // Добавление новой цели
    addGoal: async (goalData) => { // goalData должен содержать amount, description, wish_date (строка "YYYY-MM-DD")
        console.log('goalsStore: addGoal started with data:', goalData);
        set({ loading: true, error: null });

        const token = get().getToken();
        if (!token) {
            set({ loading: false });
            throw new Error('Пользователь не аутентифицирован'); // Пробрасываем ошибку
        }

        try {
            const result = await goalsAPI.addGoal(goalData, token); // Отправляем данные как есть (дата уже должна быть "YYYY-MM-DD")
            console.log('goalsStore: API addGoal result:', result);

            if (result.error) {
                set({ error: result.error, loading: false });
                console.error('goalsStore: Error adding goal from API:', result.error);
                throw result.error; // Пробрасываем ошибку API
            } else {
                // Если успешно, перезагружаем список целей
                await get().fetchGoals(); // fetchGoals сам установит loading=false
                console.log('goalsStore: Goal added successfully, fetching goals.');
                return result.data; // Возвращаем ответ
            }

        } catch (error) {
            const unexpectedError = { message: error.message || 'Произошла непредвиденная ошибка при добавлении цели.' };
            set({
                error: unexpectedError,
                loading: false
            });
            console.error('goalsStore: Unexpected error in addGoal:', error);
            throw error; // Пробрасываем ошибку
        } finally {
            console.log('goalsStore: addGoal finished.');
        }
    },

    // Обновление цели по ID
    updateGoal: async (id, goalData) => { // goalData может содержать amount, description, wish_date
        console.log(`goalsStore: updateGoal started for ID: ${id} with data:`, goalData);
        set({ loading: true, error: null });

        const token = get().getToken();
        if (!token) {
            set({ loading: false });
            throw new Error('Пользователь не аутентифицирован');
        }

        try {
            const result = await goalsAPI.updateGoalById(id, goalData, token); // Отправляем данные как есть
            console.log(`goalsStore: API updateGoalById result for ID ${id}:`, result);

            if (result.error) {
                set({ error: result.error, loading: false });
                console.error(`goalsStore: Error updating goal ID ${id} from API:`, result.error);
                throw result.error;
            } else {
                // Если успешно, перезагружаем список целей
                await get().fetchGoals(); // fetchGoals сам установит loading=false
                // Возможно, нужно также обновить текущую цель, если она была изменена
                // Это можно сделать, проверив, является ли обновленная цель текущей,
                // или просто перезагрузив текущую цель после обновления списка.
                // Пока просто перезагрузим список, этого может быть достаточно для UI.
                console.log(`goalsStore: Goal ID ${id} updated successfully, fetching goals.`);
                return result.data;
            }

        } catch (error) {
            const unexpectedError = { message: error.message || 'Произошла непредвиденная ошибка при обновлении цели.' };
            set({
                error: unexpectedError,
                loading: false
            });
            console.error(`goalsStore: Unexpected error in updateGoal ID ${id}:`, error);
            throw error;
        } finally {
            console.log(`goalsStore: updateGoal finished for ID: ${id}.`);
        }
    },

    // Удаление цели по ID
    deleteGoal: async (id) => {
        console.log(`goalsStore: deleteGoal started for ID: ${id}`);
        set({ loading: true, error: null });

        const token = get().getToken();
        if (!token) {
            set({ loading: false });
            throw new Error('Пользователь не аутентифицирован');
        }

        try {
            const result = await goalsAPI.deleteGoalById(id, token);
            console.log(`goalsStore: API deleteGoalById result for ID ${id}:`, result);

            if (result.error) {
                set({ error: result.error, loading: false });
                console.error(`goalsStore: Error deleting goal ID ${id} from API:`, result.error);
                throw result.error;
            } else {
                // Если успешно, перезагружаем список целей
                await get().fetchGoals(); // fetchGoals сам установит loading=false
                // Если удалили текущую цель, нужно сбросить currentGoal
                if (get().currentGoal?.id === id) {
                    set({ currentGoal: null });
                    console.log(`goalsStore: Deleted goal ID ${id} was current goal, resetting currentGoal state.`);
                }
                console.log(`goalsStore: Goal ID ${id} deleted successfully, fetching goals.`);
                return result.data;
            }

        } catch (error) {
            const unexpectedError = { message: error.message || 'Произошла непредвиденная ошибка при удалении цели.' };
            set({
                error: unexpectedError,
                loading: false
            });
            console.error(`goalsStore: Unexpected error in deleteGoal ID ${id}:`, error);
            throw error;
        } finally {
            console.log(`goalsStore: deleteGoal finished for ID: ${id}.`);
        }
    },

    // Установка цели как текущей
    setCurrentGoal: async (id) => {
        console.log(`goalsStore: setCurrentGoal started for ID: ${id}`);
        set({ currentGoalLoading: true, currentGoalError: null }); // Используем отдельные флаги для текущей цели

        const token = get().getToken();
        if (!token) {
            set({ currentGoalLoading: false });
            throw new Error('Пользователь не аутентифицирован');
        }

        try {
            const result = await goalsAPI.setCurrentGoal(id, token); // Используем исправленную API функцию
            console.log(`goalsStore: API setCurrentGoal result for ID ${id}:`, result);

            if (result.error) {
                set({ currentGoalError: result.error, currentGoalLoading: false });
                console.error(`goalsStore: Error setting current goal ID ${id} from API:`, result.error);
                throw result.error;
            } else {
                // Если успешно, нужно обновить текущую цель в состоянии
                // Самый надежный способ - запросить ее заново или запросить список целей
                // Вызовем fetchGoals, чтобы обновить список и убедиться в статусе is_current
                await get().fetchGoals();
                // А затем запросим текущую цель
                await get().getCurrentGoal(); // Это обновит поле currentGoal
                console.log(`goalsStore: Goal ID ${id} set as current successfully, fetching goals and current goal.`);
                return result.data;
            }

        } catch (error) {
            const unexpectedError = { message: error.message || 'Произошла непредвиденная ошибка при установке текущей цели.' };
            set({
                currentGoalError: unexpectedError,
                currentGoalLoading: false
            });
            console.error(`goalsStore: Unexpected error in setCurrentGoal ID ${id}:`, error);
            throw error;
        } finally {
            console.log(`goalsStore: setCurrentGoal finished for ID: ${id}.`);
        }
    },

    // Получение текущей цели
    getCurrentGoal: async () => {
        console.log('goalsStore: getCurrentGoal started');
        set({ currentGoalLoading: true, currentGoalError: null }); // Используем отдельные флаги

        const token = get().getToken();
        if (!token) {
            set({ currentGoalLoading: false });
            console.log('goalsStore: getCurrentGoal - No token, stopping fetch.');
            return;
        }

        try {
            const result = await goalsAPI.getCurrentGoal(token);
            console.log('goalsStore: API getCurrentGoal result:', result);

            if (result.error) {
                // Если нет текущей цели или ошибка, сбрасываем currentGoal в null
                set({ currentGoal: null, currentGoalError: result.error, currentGoalLoading: false });
                console.error('goalsStore: Error fetching current goal from API:', result.error);
            } else {
                // API возвращает { Goal: {...} } или { Goal: null }
                set({ currentGoal: result.data.Goal || null, currentGoalLoading: false, currentGoalError: null }); // Обновляем текущую цель
                console.log('goalsStore: Current goal fetched successfully.');
            }

        } catch (error) {
            const unexpectedError = { message: error.message || 'Произошла непредвиденная ошибка при загрузке текущей цели.' };
            set({
                currentGoalError: unexpectedError,
                currentGoalLoading: false
            });
            console.error('goalsStore: Unexpected error in getCurrentGoal:', error);
        } finally {
            console.log('goalsStore: getCurrentGoal finished.');
        }
    },


    // --- Действие для сброса состояния стора Целей ---
    // Эта функция будет вызываться подпиской из storeInitializer.js при выходе
    resetGoals: () => {
        console.log('goalsStore: resetGoals called.');
        // Сбрасываем все состояние к начальным значениям
        set({
            goals: null,
            currentGoal: null,
            loading: false,
            error: null,
            currentGoalLoading: false,
            currentGoalError: null,
        });
    },
    // --- Конец добавления ---


    // Сброс ошибки основного состояния (списка целей)
    clearError: () => {
        console.log('goalsStore: clearError called.');
        set({ error: null });
    },

    // Сброс ошибки состояния текущей цели
    clearCurrentGoalError: () => {
        console.log('goalsStore: clearCurrentGoalError called.');
        set({ currentGoalError: null });
    }
}));


export default useGoalsStore;