// src/02_stores/goalsStore.js
import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';
import * as goalsAPI from '../01_api/goals/index.js';
import { handleGoalsApiError } from '../01_api/goals/utils/handleGoalsApiError.js';

const initialState = {
    goals: null,
    currentGoal: null,
    loading: false,
    error: null,
};

const useGoalsStore = create()(subscribeWithSelector((set, get) => ({
    // --- Состояние (State) ---
    ...initialState,
    setGoals: (goals) => set({ goals }),
    setCurrentGoal: (currentGoal) => set({ currentGoal }),
    setLoading: (loading) => set({ loading }),
    setError: (error) => set({ error }),
    handleError: (error, actionName) => {
        const processedError = handleGoalsApiError(error);
        set({ error: processedError, loading: false });
        console.error(`Ошибка ${actionName}:`, error);
        throw processedError;
    },

    // --- Действия (Actions) ---
    fetchGoals: async () => {
        set({ loading: true, error: null });
        try {
            const data = await goalsAPI.getGoals();
            console.log('goalsStore: API getGoals result:', data);

            const { Goals: goals = [] } = data || {};
            set({ goals });
        } catch (error) {
            get().handleError(error, 'fetchGoals');
        } finally {
            set({ loading: false });
        }
    },

    getCurrentGoal: async () => {
        set({ loading: true, error: null });
        try {
            const data = await goalsAPI.getCurrentGoal();
            console.log('goalsStore: API getCurrentGoal result:', data);

            // Специальная обработка "no current goal found"
            if (data?.Goal) {
                set({ currentGoal: data.Goal });
            } else {
                set({ currentGoal: null });
            }
        } catch (error) {
            // Если ошибка "no current goal found" - это не ошибка, а отсутствие данных
            if (error.message === "no current goal found") {
                set({ currentGoal: null, error: null });
            } else {
                get().handleError(error, 'getCurrentGoal');
            }
        } finally {
            set({ loading: false });
        }
    },

    addGoal: async (goalData) => {
        set({ loading: true, error: null });
        console.log('goalsStore: addGoal started');
        try {
            const data = await goalsAPI.addGoal(goalData);
            await get().fetchGoals();
            await get().getCurrentGoal();
            return data;
        } catch (error) {
            get().handleError(error, 'addGoal');
        } finally {
            set({ loading: false });
        }
    },

    updateGoal: async (id, goalData) => {
        set({ loading: true, error: null });
        console.log('goalsStore: updateGoal started');
        try {
            const data = await goalsAPI.updateGoalById(id, goalData);
            await get().fetchGoals();
            await get().getCurrentGoal();
            return data;
        } catch (error) {
            get().handleError(error, 'updateGoal');
        } finally {
            set({ loading: false });
        }
    },

    deleteGoal: async (id) => {
        set({ loading: true, error: null });
        console.log('goalsStore: deleteGoal started');
        try {
            const data = await goalsAPI.deleteGoalById(id);
            await get().fetchGoals();
            await get().getCurrentGoal();
            return data;
        } catch (error) {
            get().handleError(error, 'deleteGoal');
        } finally {
            set({ loading: false });
        }
    },

    setCurrentGoalById: async (id) => {
        set({ loading: true, error: null });
        console.log('goalsStore: setCurrentGoal started');
        try {
            const data = await goalsAPI.setCurrentGoal(id);
            await get().fetchGoals();
            await get().getCurrentGoal();
            return data;
        } catch (error) {
            get().handleError(error, 'setCurrentGoal');
        } finally {
            set({ loading: false });
        }
    },

    resetGoals: () => {
        console.log('goalsStore: resetGoals called.');
        set(initialState);
    },

    clearError: () => {
        console.log('goalsStore: clearError called.');
        set({ error: null });
    },
})));

export default useGoalsStore;
