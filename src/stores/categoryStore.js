// src/stores/categoryStore.js
import { create } from 'zustand';
import * as categoriesAPI from '../api/categories/index';
import useAuthStore from './authStore';

// Импортируем централизованный массив цветов
import { CHART_COLORS } from '../constants/colors';
import useSpendingsStore from "./spendingsStore.js";

const useCategoryStore = create((set, get) => ({
    // Состояние
    categories: null, // Список категорий, загруженных из API (справочник)
    categoriesMonthSummary: null, // Суммы по категориям за текущий месяц
    loading: false,
    error: null,
    // НОВОЕ: Объект для хранения маппинга имени категории к её цвету
    categoryColorMap: {},
    // НОВОЕ: Индекс для выдачи следующего цвета из CHART_COLORS для новых категорий
    nextColorIndex: 0,

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
            set({ error: null }); // Сбрасываем только ошибку, если загрузка уже идет
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
                const fetchedCategories = result.data.categories || [];
                set({ categories: fetchedCategories, loading: false });
                console.log('categoryStore: Categories updated successfully.');

                // НОВОЕ: Обновляем маппинг цветов после получения полного списка категорий
                get()._updateCategoryColorMap(fetchedCategories);
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

    // Загрузка сумм по категориям за текущий месяц
    fetchCategoriesMonthSummary: async () => {
        console.log('categoryStore: fetchCategoriesMonthSummary started');
        if (!get().loading) {
            set({ loading: true, error: null });
        } else {
            set({ error: null });
        }

        const token = get().getToken();
        if (!token) {
            console.log('categoryStore: fetchCategoriesMonthSummary - No token, stopping fetch.');
            if (!get().loading) set({ loading: false });
            return;
        }
        console.log('categoryStore: fetchCategoriesMonthSummary - Token found, proceeding with API call.');

        try {
            const result = await categoriesAPI.getCategoriesMonth(token);
            console.log('categoryStore: API getCategoriesMonth result:', result);

            if (result.error) {
                set({ error: result.error, loading: false });
                console.error('Ошибка загрузки сумм по категориям за месяц от API:', result.error);
            } else {
                set({ categoriesMonthSummary: result.data || {}, loading: false });
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

    // НОВОЕ: Внутренняя функция для создания/обновления маппинга цветов категорий
    // Она вызывается при изменении списка категорий, чтобы гарантировать, что
    // каждая категория имеет постоянный цвет.
    _updateCategoryColorMap: (allCategories) => {
        const currentMap = get().categoryColorMap;
        let currentIndex = get().nextColorIndex;
        const updatedMap = { ...currentMap }; // Создаем изменяемую копию текущего маппинга

        // Проходим по всем известным категориям
        allCategories.forEach(category => {
            // Если этой категории еще нет в нашем маппинге, назначаем ей новый цвет
            if (!updatedMap[category.name]) {
                updatedMap[category.name] = CHART_COLORS[currentIndex % CHART_COLORS.length];
                currentIndex++; // Переходим к следующему цвету в массиве CHART_COLORS
            }
        });

        // Обновляем состояние стора с новым маппингом и индексом
        set({ categoryColorMap: updatedMap, nextColorIndex: currentIndex });
        console.log('categoryStore: categoryColorMap updated', updatedMap);
    },

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
                let errorMessage = result.error.message;

                // Проверяем, является ли ошибка уникальности имени
                if (errorMessage === 'Category name must be unique') {
                    errorMessage = 'Категория с таким именем уже существует. Выберите другое, пожалуйста.';
                }

                set({ error: { message: errorMessage, status: result.error.status }, loading: false });
                console.error('Ошибка добавления категории от API:', { message: errorMessage, status: result.error.status });
                throw { message: errorMessage, status: result.error.status }; // Выбрасываем ошибку с новым сообщением
            } else {
                // После успешного добавления, перезагружаем список категорий.
                // fetchCategories сам вызовет _updateCategoryColorMap, чтобы обновить цвета.
                await get().fetchCategories();
                // Перезагружаем также сводку по месяцу
                await get().fetchCategoriesMonthSummary();

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
                // После успешного обновления, перезагружаем список категорий.
                // fetchCategories сам вызовет _updateCategoryColorMap, чтобы обновить цвета.
                await get().fetchCategories();
                // Перезагружаем сводку по месяцу
                await get().fetchCategoriesMonthSummary();

                useSpendingsStore.getState().fetchSpendings();

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
                // После успешного удаления, перезагружаем список категорий.
                // fetchCategories сам вызовет _updateCategoryColorMap.
                await get().fetchCategories();
                // Перезагружаем сводку по месяцу
                await get().fetchCategoriesMonthSummary();

                useSpendingsStore.getState().fetchSpendings();

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

    // Действие для сброса состояния стора категорий (например, при выходе пользователя)
    resetCategories: () => {
        console.log('categoryStore: resetCategories called.');
        set({
            categories: null,
            categoriesMonthSummary: null,
            loading: false,
            error: null,
            // НОВОЕ: Сбрасываем также маппинг цветов и индекс при сбросе стора
            categoryColorMap: {},
            nextColorIndex: 0,
        });
    },

    // Сброс ошибки
    clearError: () => {
        console.log('categoryStore: clearError called.');
        set({ error: null });
    }
}));

export default useCategoryStore;