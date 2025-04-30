export const mockCategories = {
    addCategory: async () => ({
        message: 'Category added successfully',
    }),
    getCategories: async () => ({
        Categories: [
            { id: 1, name: 'Еда', description: 'жралово', is_delete: false, user_id: 1 },
            { id: 2, name: 'Одежда', description: 'для моих шмоток', is_delete: false, user_id: 1 },
            { id: 3, name: 'Транспорт', description: 'на автобусы', is_delete: false, user_id: 1 },
            { id: 4, name: 'Развлечения', description: 'кино и тусовки', is_delete: false, user_id: 1 },
            { id: 5, name: 'Здоровье', description: 'лекарства и врачи', is_delete: false, user_id: 1 },
        ],
    }),
    getCategoryById: async (id) => ({
        Category: {
            id: Number(id),
            name: 'Еда',
            description: 'жралово',
            is_delete: false,
            user_id: 1,
        },
    }),
    updateCategoryById: async () => ({
        message: 'Category updated successfully',
    }),
    deleteCategoryById: async () => ({
        message: 'Category deleted successfully',
    }),
};