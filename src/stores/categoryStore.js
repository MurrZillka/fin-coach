// src/stores/categoryStore.js
import { create } from 'zustand';
// Убедись, что путь к файлу categories/index.js корректный
import * as categoriesAPI from '../api/categories/index';
// Импортируем authStore для получения токена
import useAuthStore from './authStore';

const useCategoryStore = create((set, get) => ({
    // Состояние
    categories: [],
    loading: false,
    error: null,

    // Вспомогательная функция для получения токена и обработки ошибок аутентификации
    getToken: () => {
        // Получаем токен из состояния authStore
        const token = useAuthStore.getState().user?.access_token;
        if (!token) {
            // Если токена нет, устанавливаем ошибку в сторе категорий
            const authError = { message: 'Пользователь не аутентифицирован. Пожалуйста, войдите.' };
            set({ error: authError, loading: false });
            console.error('Ошибка аутентификации в categoryStore:', authError);
            // Возвращаем null или undefined, чтобы вызывающая функция знала об отсутствии токена
            return null;
        }
        return token;
    },

    // Действия

    // Загрузка списка категорий
    fetchCategories: async () => {
        set({ loading: true, error: null });

        // Получаем токен перед вызовом API
        const token = get().getToken(); // Используем вспомогательную функцию getToken

        if (!token) {
            // Если getToken вернул null (нет токена), функция уже установила ошибку и статус loading=false
            return; // Прерываем выполнение
        }

        try {
            // Вызываем API функцию, передавая токен
            const result = await categoriesAPI.getCategories(token);

            // Обрабатываем ответ в формате { data, error }
            if (result.error) {
                // Если API вернуло ошибку, устанавливаем ее в состояние
                set({ error: result.error, loading: false });
                console.error('Ошибка загрузки категорий от API:', result.error);
            } else {
                // Если успешно, обновляем список категорий в состоянии
                // Предполагаем, что result.data содержит { categories: [...] }
                set({ categories: result.data.categories || [], loading: false }); // Учитываем случай пустого массива
            }

        } catch (error) {
            // Ловим непредвиденные ошибки (например, проблемы с сетью)
            const unexpectedError = { message: error.message || 'Произошла непредвиденная ошибка при загрузке категорий.' };
            set({
                error: unexpectedError,
                loading: false
            });
            console.error('Непредвиденная ошибка fetchCategories:', error);
        }
    },

    // Добавление новой категории
    addCategory: async (categoryData) => {
        set({ loading: true, error: null });

        // Получаем токен перед вызовом API
        const token = get().getToken(); // Используем вспомогательную функцию getToken

        if (!token) {
            // Если getToken вернул null (нет токена)
            throw new Error('Пользователь не аутентифицирован'); // Пробрасываем ошибку дальше
        }

        try {
            // Вызываем API функцию, передавая данные и токен
            const result = await categoriesAPI.addCategory(categoryData, token);

            // Обрабатываем ответ в формате { data, error }
            if (result.error) {
                set({ error: result.error, loading: false });
                console.error('Ошибка добавления категории от API:', result.error);
                throw result.error; // Пробрасываем ошибку API дальше
            } else {
                // Если успешно (API вернуло сообщение об успехе), перезагружаем список
                // Это гарантирует, что новая категория появится в списке в сторе
                await get().fetchCategories();
                // loading и error будут обновлены внутри fetchCategories
                // set({ loading: false }); // Уже обновится в fetchCategories

                // Можно вернуть что-то в случае успеха, например, сообщение
                return result.data; // result.data содержит { message: "..." }
            }

        } catch (error) {
            // Ловим непредвиденные ошибки
            const unexpectedError = { message: error.message || 'Произошла непредвиденная ошибка при добавлении категории.' };
            set({
                error: unexpectedError,
                loading: false
            });
            console.error('Непредвиденная ошибка addCategory:', error);
            throw error; // Пробрасываем ошибку дальше
        }
    },

    // Обновление категории по ID
    updateCategory: async (id, categoryData) => {
        set({ loading: true, error: null });

        // Получаем токен перед вызовом API
        const token = get().getToken(); // Используем вспомогательную функцию getToken

        if (!token) {
            throw new Error('Пользователь не аутентифицирован');
        }

        try {
            // Вызываем API функцию, передавая ID, данные и токен
            const result = await categoriesAPI.updateCategoryById(id, categoryData, token);

            // Обрабатываем ответ в формате { data, error }
            if (result.error) {
                set({ error: result.error, loading: false });
                console.error('Ошибка обновления категории от API:', result.error);
                throw result.error;
            } else {
                // Если успешно, перезагружаем список
                await get().fetchCategories();
                // set({ loading: false });

                // Можно вернуть что-то в случае успеха
                return result.data; // result.data содержит { message: "..." }
            }

        } catch (error) {
            const unexpectedError = { message: error.message || 'Произошла непредвиденная ошибка при обновлении категории.' };
            set({
                error: unexpectedError,
                loading: false
            });
            console.error('Непредвиденная ошибка updateCategory:', error);
            throw error;
        }
    },

    // Удаление категории по ID
    deleteCategory: async (id) => {
        set({ loading: true, error: null });

        // Получаем токен перед вызовом API
        const token = get().getToken(); // Используем вспомогательную функцию getToken

        if (!token) {
            throw new Error('Пользователь не аутентифицирован');
        }

        try {
            // Вызываем API функцию, передавая ID и токен
            const result = await categoriesAPI.deleteCategoryById(id, token);

            // Обрабатываем ответ в формате { data, error }
            if (result.error) {
                set({ error: result.error, loading: false });
                console.error('Ошибка удаления категории от API:', result.error);
                throw result.error;
            } else {
                // Если успешно, перезагружаем список
                // Это самый простой способ убедиться, что категория удалена из списка в сторе
                await get().fetchCategories();
                // set({ loading: false });

                // Можно вернуть что-то в случае успеха
                return result.data; // result.data содержит { message: "..." }
            }

        } catch (error) {
            const unexpectedError = { message: error.message || 'Произошла непредвиденная ошибка при удалении категории.' };
            set({
                error: unexpectedError,
                loading: false
            });
            console.error('Непредвиденная ошибка deleteCategory:', error);
            throw error;
        }
    },


    // Сброс ошибки
    clearError: () => set({ error: null })
}));

export default useCategoryStore;