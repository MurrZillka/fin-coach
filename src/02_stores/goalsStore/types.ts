// src/goalsStore/types.ts
import type { Goal, GoalRequest, GoalActionResponse } from '../../01_api/goals/types';
import type { ApiErrorWithMessage } from '../../01_api/apiTypes';

export interface GoalsStoreState {
    goals: Goal[];
    currentGoal: Goal | null;
    loading: boolean;
    error: ApiErrorWithMessage | null;
}

export interface GoalsStoreActions {
    setGoals: (goals: Goal[]) => void;
    setCurrentGoal: (currentGoal: Goal | null) => void;
    setLoading: (loading: boolean) => void;
    setError: (error: ApiErrorWithMessage | null) => void;
    handleError: (error: unknown, actionName: string) => never;
    fetchGoals: () => Promise<void>;
    getCurrentGoal: () => Promise<void>;
    addGoal: (goalData: GoalRequest) => Promise<GoalActionResponse>;
    updateGoal: (id: number, goalData: GoalRequest) => Promise<GoalActionResponse>;
    deleteGoal: (id: number) => Promise<GoalActionResponse>;
    setCurrentGoalById: (id: number) => Promise<GoalActionResponse>;
    resetGoals: () => void;
    clearError: () => void;
}

export type GoalsStore = GoalsStoreState & GoalsStoreActions;
