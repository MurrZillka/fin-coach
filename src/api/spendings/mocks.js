export const mockSpendings = {
    addSpending: async () => ({
        message: 'Spending added successfully',
    }),
    getSpendings: async () => ({
        Spendings: [
            {
                id: 5,
                user_id: 1,
                is_delete: false,
                amount: 1000,
                description: 'Просрал',
                is_permanent: false,
                date: '2025-04-27T00:00:00Z',
                category_id: 1,
            },
            {
                id: 2,
                user_id: 1,
                is_delete: false,
                amount: 1000,
                description: 'Просрал',
                is_permanent: false,
                date: '2025-03-09T00:00:00Z',
                category_id: 1,
            },
        ],
    }),
    getSpendingsPermanent: async () => ({
        Spendings: [
            {
                id: 8,
                user_id: 1,
                is_delete: false,
                amount: 1000,
                description: 'Просрал',
                is_permanent: true,
                date: '2025-04-27T00:00:00Z',
                category_id: 2,
            },
        ],
    }),
    getSpendingById: async (id) => ({
        Spending: {
            id: Number(id),
            user_id: 1,
            is_delete: false,
            amount: 1000,
            description: 'Просрал',
            is_permanent: false,
            date: '2025-02-09T00:00:00Z',
            category_id: 1,
        },
    }),
    updateSpendingById: async () => ({
        message: 'Spending updated successfully',
    }),
    deleteSpendingById: async () => ({
        message: 'Spending deleted successfully',
    }),
};