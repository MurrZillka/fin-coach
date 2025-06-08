// src/02_stores/categoryStore/categoryStore.ts

import {create} from 'zustand';
import {subscribeWithSelector} from 'zustand/middleware';
import * as categoryAPI from '../../01_api/categories/index';
import {handleCategoryApiError} from '../../01_api/categories/utils/handleCategoryApiError';
import {CHART_COLORS} from '../../constants/colors';
import type {CategoryStore, CategoryStoreActions} from './types';

const initialState: Omit<CategoryStore, keyof CategoryStoreActions> = {
    categories: null,
    categoriesMonth: null,
    categoryColorMap: {},
    nextColorIndex: 0,
    loading: false,
    error: null,
};

const useCategoryStore = create<CategoryStore>()(subscribeWithSelector((set, get) => ({
    ...initialState,

    setCategories: (categories) => set({ categories }),
    setCategoriesMonth: (categoriesMonth) => set({ categoriesMonth }),
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

    fetchCategories: async () => {
        set({ loading: true, error: null });
        try {
            const { Categories } = await categoryAPI.getCategories();
            set({ categories: Categories || [] });
            get()._updateCategoryColorMap(Categories || []);
        } catch (error) {
            get().handleError(error, 'fetchCategories');
        } finally {
            set({ loading: false });
        }
    },

    addCategory: async (categoryData) => {
        set({ loading: true, error: null });
        try {
            const result = await categoryAPI.addCategory(categoryData);
            await get().fetchCategories();
            return result;
        } catch (error) {
            get().handleError(error, 'addCategory');
        } finally {
            set({ loading: false });
        }
    },

    updateCategory: async (id, categoryData) => {
        set({ loading: true, error: null });
        try {
            const result = await categoryAPI.updateCategoryById(id, categoryData);
            await get().fetchCategories();
            return result;
        } catch (error) {
            get().handleError(error, 'updateCategory');
        } finally {
            set({ loading: false });
        }
    },

    deleteCategory: async (id) => {
        set({ loading: true, error: null });
        try {
            const result = await categoryAPI.deleteCategoryById(id);
            await get().fetchCategories();
            return result;
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
            const categoriesMonth = result.Categories ?? {};
            console.log('categoriesStore',categoriesMonth);
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
    },

    resetCategories: () => {
        set(initialState);
    },

    clearError: () => {
        set({ error: null });
    },
})));

export default useCategoryStore;
