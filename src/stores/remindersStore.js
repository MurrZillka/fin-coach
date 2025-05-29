// src/stores/remindersStore.js
import { create } from 'zustand';
import * as remindersAPI from '../api/reminders'; // Убедись, что путь к API-файлу напоминаний корректен
import useAuthStore from './authStore'; // Убедись, что путь к authStore корректен

// Определяем начальное состояние для remindersStore
const initialState = {
    todayReminder: null, // { need_remind: boolean } - данные о необходимости напоминания на сегодня
    loading: false,      // Индикатор загрузки для операций с напоминаниями
    error: null,         // Информация об ошибке для операций с напоминаниями
};

const useRemindersStore = create((set, get) => ({
    // --- Состояние (State) ---
    ...initialState, // Распределяем начальное состояние при создании стора

    // --- Вспомогательная функция: Получение токена ---
    // Эта функция помогает получить токен из useAuthStore
    getToken: () => {
        const token = useAuthStore.getState().user?.access_token;
        if (!token) {
            // Если токен не найден, логируем ошибку, но не устанавливаем ее в этом сторе,
            // чтобы не перекрывать ошибки аутентификации в authStore.
            console.error('remindersStore: Authentication error - No token found.');
            return null;
        }
        return token;
    },

    // --- Действия (Actions) ---

    /**
     * Загружает информацию о необходимости напоминания на сегодня с бэкенда.
     * Обновляет состояние `todayReminder`, `loading` и `error`.
     */
    fetchTodayReminder: async () => {
        console.log('remindersStore: fetchTodayReminder started');
        // Устанавливаем loading в true и сбрасываем предыдущие ошибки
        set({ loading: true, error: null });

        const token = get().getToken(); // Получаем токен авторизации
        if (!token) {
            // Если токена нет, сбрасываем todayReminder, отключаем loading и логируем
            set({ todayReminder: null, loading: false });
            console.log('remindersStore: fetchTodayReminder - No token, stopping fetch.');
            return; // Прерываем выполнение, т.к. без токена запрос невозможен
        }

        try {
            // Выполняем API-запрос для получения напоминания
            const result = await remindersAPI.getTodayReminder(token);
            console.log('remindersStore: API getTodayReminder result:', result);

            if (result.error) {
                // Если API вернуло ошибку, устанавливаем ее в состояние стора
                set({ todayReminder: null, error: result.error, loading: false });
                console.error('remindersStore: Error fetching today reminder from API:', result.error);
            } else {
                // Если запрос успешен, обновляем todayReminder и сбрасываем loading и error
                set({ todayReminder: result.data, loading: false, error: null });
                console.log('remindersStore: Today reminder fetched successfully.');
            }

        } catch (error) {
            // Обработка непредвиденных ошибок (например, сетевые проблемы)
            const unexpectedError = { message: error.message || 'Произошла непредвиденная ошибка при загрузке напоминания.' };
            console.error('remindersStore: Unexpected error in fetchTodayReminder:', error);
            set({
                todayReminder: null, // Сбрасываем данные при непредвиденной ошибке
                error: unexpectedError,
                loading: false
            });
        } finally {
            console.log('remindersStore: fetchTodayReminder finished.');
        }
    },

    /**
     * Действие для сброса всего состояния стора Напоминаний к начальным значениям.
     * Используется, например, при выходе пользователя из системы.
     */
    resetReminders: () => {
        console.log('remindersStore: resetReminders called.');
        set(initialState); // Используем initialState для полного сброса
    },

    /**
     * Действие для сброса только ошибки в состоянии стора.
     */
    clearError: () => {
        console.log('remindersStore: clearError called.');
        set({ error: null });
    }
}));

export default useRemindersStore;