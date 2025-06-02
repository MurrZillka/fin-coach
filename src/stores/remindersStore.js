// src/stores/remindersStore.js
import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';
import * as remindersAPI from '../api/reminders/index';
import { handleRemindersApiError } from '../api/reminders/utils/handleRemindersApiError.js';

const initialState = {
    todayReminder: null,
    loading: false,
    error: null,
};

const useRemindersStore = create()(subscribeWithSelector((set, get) => ({
    // --- Состояние (State) ---
    ...initialState,
    setTodayReminder: (todayReminder) => set({ todayReminder }),
    setLoading: (loading) => set({ loading }),
    setError: (error) => set({ error }),
    handleError: (error, actionName) => {
        const processedError = handleRemindersApiError(error);
        set({ error: processedError, loading: false });
        console.error(`Ошибка ${actionName}:`, error);
        throw processedError;
    },

    // --- Действия (Actions) ---
    fetchTodayReminder: async () => {
        set({ loading: true, error: null });
        try {
            const result = await remindersAPI.getTodayReminder();
            console.log('remindersStore: API getTodayReminder result:', result);

            // API возвращает данные о напоминании
            set({ todayReminder: result.data });
        } catch (error) {
            get().handleError(error, 'fetchTodayReminder');
        } finally {
            set({ loading: false });
        }
    },

    resetReminders: () => {
        console.log('remindersStore: resetReminders called.');
        set(initialState);
    },

    clearError: () => {
        console.log('remindersStore: clearError called.');
        set({ error: null });
    },
})));

export default useRemindersStore;
