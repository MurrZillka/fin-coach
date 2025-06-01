// src/stores/categoryStore.js
import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';
import * as categoryAPI from '../api/categories/index';
import { handleCategoryApiError } from '../utils/handleCategoryApiError';

const initialState = {
    categories: null,
    loading: false,
    error: null,
};

const useCategoryStore = create()(subscribeWithSelector((set, get) => ({
    // --- Состояние (State) ---
    ...initialState,
    setCategories: (categories) => set({ categories }),
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

            // API возвращает { categories: [...] }
            const { Categories: categories } = result.data || {};
            set({ categories: categories || [] });
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
