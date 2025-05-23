// src/stores/categoryStore.js
import { create } from 'zustand';
// Убедись, что путь к файлу categories/index.js корректный
import * as categoriesAPI from '../api/categories/index';
// Импортируем authStore для получения токена
import useAuthStore from './authStore'; // Этот импорт остаётся, так как getToken его использует

const useCategoryStore = create((set, get) => ({
    // Состояние
    categories: null, // Список категорий
    categoriesMonthSummary: null, // --- ДОБАВЛЕНО: Новое состояние для сумм по категориям за месяц
    loading: false,
    error: null,

    // Вспомогательная функция для получения токена и обработки ошибок аутентификации
    getToken: () => {
        const token = useAuthStore.getState().user?.access_token;
        if (!token) {
            const authError = { message: 'Пользователь не аутентифицирован. Пожалуйста, войдите.' };
            set({ error: authError, loading: false });
            console.error('Ошибка аутентификации в categoryStore:', authError);
            return null;
        }
        return token;
    },

    // Действия

    // Загрузка списка категорий
    fetchCategories: async () => {
        console.log('categoryStore: fetchCategories started');
        if (!get().loading) {
            set({ loading: true, error: null });
        } else {
            set({ error: null });
        }

        const token = get().getToken();
        if (!token) {
            console.log('categoryStore: fetchCategories - No token, stopping fetch.');
            if (!get().loading) set({ loading: false });
            return;
        }
        console.log('categoryStore: fetchCategories - Token found, proceeding with API call.');

        try {
            const result = await categoriesAPI.getCategories(token);
            console.log('categoryStore: API getCategories result:', result);

            if (result.error) {
                set({ error: result.error, loading: false });
                console.error('Ошибка загрузки категорий от API:', result.error);
            } else {
                set({ categories: result.data.categories || [], loading: false });
                console.log('categoryStore: Categories updated successfully.');
            }

        } catch (error) {
            const unexpectedError = { message: error.message || 'Произошла непредвиденная ошибка при загрузке категорий.' };
            set({
                error: unexpectedError,
                loading: false
            });
            console.error('Непредвиденная ошибка fetchCategories:', error);
        }
        console.log('categoryStore: fetchCategories finished.');
    },

    // --- ДОБАВЛЕНО: Новое действие для загрузки сумм по категориям за месяц ---
    fetchCategoriesMonthSummary: async () => {
        console.log('categoryStore: fetchCategoriesMonthSummary started');
        // Эта загрузка может идти параллельно с другими, поэтому не обязательно сбрасывать loading всего стора,
        // если он уже true из-за другой CUD-операции.
        // Однако, если это единственная загрузка, то loading: true, error: null.
        if (!get().loading) {
            set({ loading: true, error: null });
        } else {
            set({ error: null }); // Сбрасываем только ошибку
        }

        const token = get().getToken();
        if (!token) {
            console.log('categoryStore: fetchCategoriesMonthSummary - No token, stopping fetch.');
            if (!get().loading) set({ loading: false }); // Устанавливаем loading=false только если не было активной CUD операции
            return;
        }
        console.log('categoryStore: fetchCategoriesMonthSummary - Token found, proceeding with API call.');

        try {
            const result = await categoriesAPI.getCategoriesMonth(token); // Вызываем новую API-функцию
            console.log('categoryStore: API getCategoriesMonth result:', result);

            if (result.error) {
                set({ error: result.error, loading: false });
                console.error('Ошибка загрузки сумм по категориям за месяц от API:', result.error);
            } else {
                // Предполагаем, что result.data - это объект, например: { "Еда": 200, "Одежда": 60000 }
                set({ categoriesMonthSummary: result.data || {}, loading: false }); // Если данных нет, устанавливаем пустой объект
                console.log('categoryStore: Categories month summary updated successfully.');
            }
        } catch (error) {
            const unexpectedError = { message: error.message || 'Произошла непредвиденная ошибка при загрузке сводки категорий за месяц.' };
            set({
                error: unexpectedError,
                loading: false
            });
            console.error('Непредвиденная ошибка fetchCategoriesMonthSummary:', error);
        }
        console.log('categoryStore: fetchCategoriesMonthSummary finished.');
    },
    // --- КОНЕЦ ДОБАВЛЕННОГО ---

    // Добавление новой категории
    addCategory: async (categoryData) => {
        console.log('categoryStore: addCategory started', categoryData);
        set({ loading: true, error: null });

        const token = get().getToken();
        if (!token) {
            set({ loading: false });
            throw new Error('Пользователь не аутентифицирован');
        }
        console.log('categoryStore: addCategory - Token found, proceeding with API call.');

        try {
            const result = await categoriesAPI.addCategory(categoryData, token);
            console.log('categoryStore: API addCategory result:', result);

            if (result.error) {
                set({ error: result.error, loading: false });
                console.error('Ошибка добавления категории от API:', result.error);
                throw result.error;
            } else {
                await get().fetchCategories(); // Перезагружаем список категорий
                // --- ДОБАВЛЕНО: Перезагружаем также сводку по месяцу, т.к. новая категория может влиять на нее ---
                await get().fetchCategoriesMonthSummary();
                // --- КОНЕЦ ДОБАВЛЕННОГО ---

                console.log('categoryStore: addCategory success, fetching categories and month summary.');
                return result.data;
            }

        } catch (error) {
            const unexpectedError = { message: error.message || 'Произошла непредвиденная ошибка при добавлении категории.' };
            set({
                error: unexpectedError,
                loading: false
            });
            console.error('Непредвиденная ошибка addCategory:', error);
            throw error;
        } finally {
            console.log('categoryStore: addCategory finished.');
        }
    },

    // Обновление категории по ID
    updateCategory: async (id, categoryData) => {
        console.log('categoryStore: updateCategory started', id, categoryData);
        set({ loading: true, error: null });

        const token = get().getToken();
        if (!token) {
            set({ loading: false });
            throw new Error('Пользователь не аутентифицирован');
        }
        console.log('categoryStore: updateCategory - Token found, proceeding with API call.');

        try {
            const result = await categoriesAPI.updateCategoryById(id, categoryData, token);
            console.log('categoryStore: API updateCategory result:', result);

            if (result.error) {
                set({ error: result.error, loading: false });
                console.error('Ошибка обновления категории от API:', result.error);
                throw result.error;
            } else {
                await get().fetchCategories(); // Перезагружаем список
                // --- ДОБАВЛЕНО: Перезагружаем сводку по месяцу, т.к. изменение категории может влиять ---
                await get().fetchCategoriesMonthSummary();
                // --- КОНЕЦ ДОБАВЛЕННОГО ---

                console.log('categoryStore: updateCategory success, fetching categories and month summary.');
                return result.data;
            }

        } catch (error) {
            const unexpectedError = { message: error.message || 'Произошла непредвиденная ошибка при обновлении категории.' };
            set({
                error: unexpectedError,
                loading: false
            });
            console.error('Непредвиденная ошибка updateCategory:', error);
            throw error;
        } finally {
            console.log('categoryStore: updateCategory finished.');
        }
    },

    // Удаление категории по ID
    deleteCategory: async (id) => {
        console.log('categoryStore: deleteCategory started', id);
        set({ loading: true, error: null });

        const token = get().getToken();
        if (!token) {
            set({ loading: false });
            throw new Error('Пользователь не аутентифицирован');
        }
        console.log('categoryStore: deleteCategory - Token found, proceeding with API call.');

        try {
            const result = await categoriesAPI.deleteCategoryById(id, token);
            console.log('categoryStore: API deleteCategory result:', result);

            if (result.error) {
                set({ error: result.error, loading: false });
                console.error('Ошибка удаления категории от API:', result.error);
                throw result.error;
            } else {
                await get().fetchCategories(); // Перезагружаем список
                // --- ДОБАВЛЕНО: Перезагружаем сводку по месяцу, т.к. удаление категории может влиять ---
                await get().fetchCategoriesMonthSummary();
                // --- КОНЕЦ ДОБАВЛЕННОГО ---

                console.log(`categoryStore: Категория ${id} успешно удалена, fetching categories and month summary.`);
                return result.data;
            }

        } catch (error) {
            const unexpectedError = { message: error.message || 'Произошла непредвиденная ошибка при удалении категории.' };
            set({
                error: unexpectedError,
                loading: false
            });
            console.error('Непредвиденная ошибка deleteCategory:', error);
            throw error;
        } finally {
            console.log('categoryStore: deleteCategory finished.');
        }
    },

    // --- Добавлено: Действие для сброса состояния стора категорий ---
    resetCategories: () => {
        console.log('categoryStore: resetCategories called.');
        // --- ИЗМЕНЕНО: Сбрасываем и categoriesMonthSummary тоже ---
        set({ categories: null, categoriesMonthSummary: null, loading: false, error: null });
    },
    // --- Конец добавления ---


    // Сброс ошибки
    clearError: () => {
        console.log('categoryStore: clearError called.');
        set({ error: null });
    }
}));

export default useCategoryStore;