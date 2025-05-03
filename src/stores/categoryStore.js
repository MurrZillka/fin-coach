// src/stores/categoryStore.js
import { create } from 'zustand';
import * as categoriesAPI from '../api/categories';

const useCategoryStore = create((set, get) => ({
    // Состояние
    categories: [],
    loading: false,
    error: null,

    // Действия
    fetchCategories: async () => {
        set({ loading: true, error: null });
        try {
            const response = await categoriesAPI.getCategories();
            set({ categories: response.Categories, loading: false });
        } catch (error) {
            set({
                error: {
                    message: 'Не удалось загрузить категории. Попробуйте позже.'
                },
                loading: false
            });
            console.error('Error fetching categories:', error);
        }
    },

    addCategory: async (categoryData) => {
        set({ loading: true, error: null });
        try {
            const response = await categoriesAPI.addCategory(categoryData);
            // Обновляем список категорий после добавления
            set({
                categories: [...get().categories, response.Category],
                loading: false
            });
            return response.Category;
        } catch (error) {
            set({
                error: {
                    message: 'Не удалось добавить категорию. Попробуйте позже.'
                },
                loading: false
            });
            console.error('Error adding category:', error);
            throw error; // Пробрасываем ошибку для обработки в компоненте
        }
    },

    updateCategory: async (id, categoryData) => {
        set({ loading: true, error: null });
        try {
            const response = await categoriesAPI.updateCategory(id, categoryData);
            // Обновляем список категорий
            set({
                categories: get().categories.map(cat =>
                    cat.id === id ? response.Category : cat
                ),
                loading: false
            });
            return response.Category;
        } catch (error) {
            set({
                error: {
                    message: 'Не удалось обновить категорию. Попробуйте позже.'
                },
                loading: false
            });
            console.error('Error updating category:', error);
            throw error;
        }
    },

    deleteCategory: async (id) => {
        set({ loading: true, error: null });
        try {
            await categoriesAPI.deleteCategory(id);
            // Удаляем категорию из списка
            set({
                categories: get().categories.filter(cat => cat.id !== id),
                loading: false
            });
        } catch (error) {
            set({
                error: {
                    message: 'Не удалось удалить категорию. Попробуйте позже.'
                },
                loading: false
            });
            console.error('Error deleting category:', error);
            throw error;
        }
    },

    // Сброс ошибки
    clearError: () => set({ error: null })
}));

export default useCategoryStore;