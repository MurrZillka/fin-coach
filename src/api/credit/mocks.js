export const mockCredit = {
    addCredit: async (body) => ({
        data: { id: 1, amount: body.amount, description: body.description, is_permanent: body.is_permanent },
        error: null,
    }),
    getCredits: async () => ({
        data: {
            credits: [
                { id: 1, amount: 1000000, description: 'Test credit 1', is_permanent: false },
                { id: 2, amount: 500000, description: 'Test credit 2', is_permanent: true },
                { id: 3, amount: 750000, description: 'Test credit 3', is_permanent: false },
                { id: 4, amount: 200000, description: 'Test credit 4', is_permanent: true },
                { id: 5, amount: 300000, description: 'Test credit 5', is_permanent: false },
            ],
        },
        error: null,
    }),
    getCreditsPermanent: async () => ({
        data: {
            credits: [
                { id: 2, amount: 500000, description: 'Test credit 2', is_permanent: true },
                { id: 4, amount: 200000, description: 'Test credit 4', is_permanent: true },
                { id: 6, amount: 400000, description: 'Test credit 6', is_permanent: true },
                { id: 7, amount: 600000, description: 'Test credit 7', is_permanent: true },
                { id: 8, amount: 800000, description: 'Test credit 8', is_permanent: true },
            ],
        },
        error: null,
    }),
    getCreditById: async (id) => {
        if (id === 1) {
            return { data: { id: 1, amount: 1000000, description: 'Test credit', is_permanent: false }, error: null };
        }
        return { data: null, error: { message: 'Credit not found', status: 404 } };
    },
    updateCreditById: async (id, body) => {
        if (id === 1) {
            return {
                data: {
                    id,
                    amount: body.amount,
                    description: body.description,
                    is_permanent: body.is_permanent,
                    date: body.date,
                },
                error: null,
            };
        }
        return { data: null, error: { message: 'Credit not found', status: 404 } };
    },
    deleteCreditById: async (id) => {
        if (id === 1) {
            return { data: { status: 200 }, error: null };
        }
        return { data: null, error: { message: 'Credit not found', status: 404 } };
    },
};