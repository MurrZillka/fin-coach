// src/02_stores/remindersStore/types.ts
import type { ApiErrorWithMessage } from '../../01_api/apiTypes';

export interface TodayReminder {
    TodayRemind: {
        need_remind: boolean;
    };
}

export interface RemindersStoreState {
    todayReminder: TodayReminder | null;
    loading: boolean;
    error: ApiErrorWithMessage | null;
}

export interface RemindersStoreActions {
    setTodayReminder: (todayReminder: TodayReminder | null) => void;
    setLoading: (loading: boolean) => void;
    setError: (error: ApiErrorWithMessage | null) => void;
    handleError: (error: any, actionName: string) => never;
    fetchTodayReminder: () => Promise<void>;
    resetReminders: () => void;
    clearError: () => void;
}

export type RemindersStore = RemindersStoreState & RemindersStoreActions;
