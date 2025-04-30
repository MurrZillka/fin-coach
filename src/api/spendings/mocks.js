export const mockSpendings = {
    addSpending: async (body) => ({
        data: { id: 1, amount: body.amount, description: body.description, category_id: body.category_id, is_permanent: body.is_permanent },
        error: null,
    }),
    getSpendings: async () => ({
        data: {
            spendings: [
                { id: 1, amount: 1000, description: 'Test spending 1', category_id: 1, is_permanent: false },
                { id: 2, amount: 2000, description: 'Test spending 2', category_id: 2, is_permanent: true },
                { id: 3, amount: 1500, description: 'Test spending 3', category_id: 1, is_permanent: false },
                { id: 4, amount: 3000, description: 'Test spending 4', category_id: 3, is_permanent: true },
                { id: 5, amount: 500, description: 'Test spending 5', category_id: 2, is_permanent: false },
            ],
        },
        error: null,
    }),
    getSpendingsPermanent: async () => ({
        data: {
            spendings: [
                { id: 2, amount: 2000, description: 'Test spending 2', category_id: 2, is_permanent: true },
                { id: 4, amount: 3000, description: 'Test spending 4', category_id: 3, is_permanent: true },
                { id: 6, amount: 2500, description: 'Test spending 6', category_id: 1, is_permanent: true },
                { id: 7, amount: 1200, description: 'Test spending 7', category_id: 2, is_permanent: true },
                { id: 8, amount: 1800, description: 'Test spending 8', category_id: 3, is_permanent: true },
            ],
        },
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
                    date: body.date,
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