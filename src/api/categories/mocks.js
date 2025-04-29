export const mockCategories = {
    addCategory: async () => ({
        message: 'Category added successfully',
    }),
    getCategories: async () => ({
        Categories: [
            {
                id: 1,
                name: 'Еда',
                description: 'жралово',
                is_delete: false,
                user_id: 1,
            },
            {
                id: 3,
                name: 'Одежда',
                description: 'для моих шмоток',
                is_delete: false,
                user_id: 1,
            },
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