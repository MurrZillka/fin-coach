// src/stores/categoryStore.js
import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';
import * as categoryAPI from '../api/categories/index';
import { handleCategoryApiError } from '../api/categories/utils/handleCategoryApiError.js';
import { CHART_COLORS } from '../constants/colors';

const initialState = {
    categories: null,
    categoriesMonth: null,
    categoryColorMap: {},
    nextColorIndex: 0,
    loading: false,
    error: null,
};

const useCategoryStore = create()(subscribeWithSelector((set, get) => ({
    // --- Состояние (State) ---
    ...initialState,
    setCategories: (categories) => set({ categories }),
    etCategoriesMonth: (categoriesMonth) => set({ categoriesMonth }),
    setCategoryColorMap: (categoryColorMap) => set({ categoryColorMap }),
    setNextColorIndex: (nextColorIndex) => set({ nextColorIndex }),
    setLoading: (loading) => set({ loading }),
    setError: (error) => set({ error }),
    handleError: (error, actionName) => {
        const processedError = handleCategoryApiError(error);
        set({ error: processedError, loading: false });
        console.error(`Ошибка ${actionName}:`, error);
        throw processedError;
    },

    // --- Действия (Actions) ---
    fetchCategories: async () => {
        set({ loading: true, error: null });
        try {
            const result = await categoryAPI.getCategories();
            console.log('categoryStore: API getCategories result:', result);

            const { Categories: categories } = result.data || {};
            set({ categories: categories || [] });
            get()._updateCategoryColorMap(categories);
        } catch (error) {
            get().handleError(error, 'fetchCategories');
        } finally {
            set({ loading: false });
        }
    },

    addCategory: async (categoryData) => {
        set({ loading: true, error: null });
        console.log('categoryStore: addCategory started');
        try {
            const result = await categoryAPI.addCategory(categoryData);
            await get().fetchCategories();
            return result.data;
        } catch (error) {
            get().handleError(error, 'addCategory');
        } finally {
            set({ loading: false });
        }
    },

    updateCategory: async (id, categoryData) => {
        set({ loading: true, error: null });
        console.log('categoryStore: updateCategory started');
        try {
            const result = await categoryAPI.updateCategoryById(id, categoryData);
            console.log('categoryStore: API updateCategory result:', result);
            await get().fetchCategories();
            return result.data;
        } catch (error) {
            get().handleError(error, 'updateCategory');
        } finally {
            set({ loading: false });
        }
    },

    deleteCategory: async (id) => {
        set({ loading: true, error: null });
        console.log('categoryStore: deleteCategory started');
        try {
            const result = await categoryAPI.deleteCategoryById(id);
            console.log('categoryStore: API deleteCategory result:', result);
            await get().fetchCategories();
            return result.data;
        } catch (error) {
            get().handleError(error, 'deleteCategory');
        } finally {
            set({ loading: false });
        }
    },

    getCategoriesMonth: async () => {
        set({ loading: true, error: null });
        try {
            const result = await categoryAPI.getCategoriesMonth();
            console.log('categoryStore: API getCategoriesMonth result:', result);

            // API возвращает { Categories: {Еда2: 34536, Разное: 38008} }
            const { Categories: categoriesMonth = {} } = result.data || {}; // ← ИСПРАВЬ ЭТУ СТРОКУ
            set({ categoriesMonth });
        } catch (error) {
            get().handleError(error, 'getCategoriesMonth');
        } finally {
            set({ loading: false });
        }
    },

    _updateCategoryColorMap: (allCategories) => {
        const currentMap = get().categoryColorMap;
        let currentIndex = get().nextColorIndex;
        const updatedMap = { ...currentMap };

        allCategories.forEach(category => {
            if (!updatedMap[category.name]) {
                updatedMap[category.name] = CHART_COLORS[currentIndex % CHART_COLORS.length];
                currentIndex++;
            }
        });

        set({ categoryColorMap: updatedMap, nextColorIndex: currentIndex });
        console.log('categoryStore: categoryColorMap updated', updatedMap);
    },

    resetCategories: () => {
        console.log('categoryStore: resetCategories called.');
        set(initialState);
    },

    clearError: () => {
        console.log('categoryStore: clearError called.');
        set({ error: null });
    },
})));

export default useCategoryStore;
