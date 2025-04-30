export const mockSpendings = {
    addSpending: async (body) => ({
        data: { id: 1, amount: body.amount, description: body.description, category_id: body.category_id, is_permanent: body.is_permanent },
        error: null,
    }),
    getSpendings: async () => ({
        data: { spendings: [{ id: 1, amount: 1000, description: 'Test spending', category_id: 1, is_permanent: false }] },
        error: null,
    }),
    getSpendingsPermanent: async () => ({
        data: { spendings: [] },
        error: null,
    }),
    getSpendingById: async (id) => {
        if (id === 1) {
            return { data: { id: 1, amount: 1000, description: 'Test spending', category_id: 1, is_permanent: false }, error: null };
        }
        return { data: null, error: { message: 'Spending not found', status: 404 } };
    },
    updateSpendingById: async (id, body) => {
        if (id === 1) {
            return {
                data: {
                    id,
                    amount: body.amount,
                    description: body.description,
                    category_id: body.category_id,
                    is_permanent: body.is_permanent,
                    date: body.date, // Добавляем date в ответ
                },
                error: null,
            };
        }
        return { data: null, error: { message: 'Spending not found', status: 404 } };
    },
    deleteSpendingById: async (id) => {
        if (id === 1) {
            return { data: { status: 200 }, error: null };
        }
        return { data: null, error: { message: 'Spending not found', status: 404 } };
    },
};