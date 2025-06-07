// src/02_stores/remindersStore/remindersStore.ts
import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';
import * as remindersAPI from '../../01_api/reminders/index';
import { handleRemindersApiError } from '../../01_api/reminders/utils/handleRemindersApiError';
import type { RemindersStore, TodayReminder } from './types';

const initialState = {
    todayReminder: null,
    loading: false,
    error: null,
};

const useRemindersStore = create<RemindersStore>()(subscribeWithSelector((set, get) => ({
    // --- Состояние (State) ---
    ...initialState,

    setTodayReminder: (todayReminder: TodayReminder | null) => set({ todayReminder }),
    setLoading: (loading: boolean) => set({ loading }),
    setError: (error: any) => set({ error }),

    handleError: (error: any, actionName: string): never => {
    const processedError = handleRemindersApiError(error);
    set({ error: processedError, loading: false });
    console.error(`Ошибка ${actionName}:`, error);
    throw processedError;
},

    // --- Действия (Actions) ---
    fetchTodayReminder: async (): Promise<void> => {
    set({ loading: true, error: null });
    try {
        const data = await remindersAPI.getTodayReminder();
        console.log('remindersStore: API getTodayReminder result:', data);
        set({ todayReminder: data });
    } catch (error) {
        get().handleError(error, 'fetchTodayReminder');
    } finally {
        set({ loading: false });
    }
},

resetReminders: (): void => {
    console.log('remindersStore: resetReminders called.');
    set(initialState);
},

clearError: (): void => {
    console.log('remindersStore: clearError called.');
    set({ error: null });
},
})));

export default useRemindersStore;
