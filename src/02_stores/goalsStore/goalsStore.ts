// src/goalsStore/goalsStore.ts
import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';
import * as goalsAPI from '../../01_api/goals/index';
import { handleGoalsApiError } from '../../01_api/goals/utils/handleGoalsApiError';
import type { GoalsStore, GoalsStoreState } from './types';
import type { ApiErrorWithMessage } from '../../01_api/apiTypes';

const initialState: GoalsStoreState = {
    goals: [],
    currentGoal: null,
    loading: false,
    error: null,
};

const useGoalsStore = create<GoalsStore>()(
    subscribeWithSelector((set, get) => ({
        ...initialState,

        setGoals: (goals) => set({ goals }),
        setCurrentGoal: (currentGoal) => set({ currentGoal }),
        setLoading: (loading) => set({ loading }),
        setError: (error) => set({ error }),

        handleError: (error, actionName) => {
            const processedError = handleGoalsApiError(error as ApiErrorWithMessage);
            set({ error: processedError, loading: false });
            console.error(`Ошибка ${actionName}:`, error);
            throw processedError;
        },

        fetchGoals: async () => {
            set({ loading: true, error: null });
            try {
                const goals = await goalsAPI.getGoals();
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
                const currentGoal = await goalsAPI.getCurrentGoal();
                set({ currentGoal });
            } catch (error) {
                // Проверяем, что ошибка — объект с нужным статусом и сообщением
                if (
                    typeof error === 'object' && error !== null &&
                    'status' in error && error.status === 404 &&
                    (
                        error.message === 'no current goal found' ||
                        error.message === 'У вас пока нет активной цели'
                    )
                ) {
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
            set(initialState);
        },

        clearError: () => {
            set({ error: null });
        },
    }))
);

export default useGoalsStore;
