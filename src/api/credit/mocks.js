export const mockCredit = {
    addCredit: async () => ({
        message: 'Credit added successfully',
    }),
    getCredits: async () => ({
        Credits: [
            {
                id: 2,
                user_id: 1,
                amount: 1000000,
                description: 'No Is perm',
                is_permanent: false,
                date: '2025-04-27T00:00:00Z',
                is_delete: false,
            },
            {
                id: 1,
                user_id: 1,
                amount: 1000000,
                description: 'No Is perm',
                is_permanent: false,
                date: '2025-03-09T00:00:00Z',
                is_delete: false,
            },
        ],
    }),
    getCreditsPermanent: async () => ({
        Credits: [
            {
                id: 1,
                user_id: 1,
                amount: 1000000,
                description: 'No Is perm',
                is_permanent: true,
                date: '2025-03-09T00:00:00Z',
                is_delete: false,
            },
            {
                id: 2,
                user_id: 1,
                amount: 1000000,
                description: 'No Is perm',
                is_permanent: true,
                date: '2025-04-27T00:00:00Z',
                is_delete: false,
            },
        ],
    }),
    getCreditById: async (id) => ({
        Credit: {
            id: Number(id),
            user_id: 1,
            amount: 1000000,
            description: 'No Is perm',
            is_permanent: false,
            date: '2025-03-09T00:00:00Z',
            is_delete: false,
        },
    }),
    updateCreditById: async () => ({
        message: 'Credit updated successfully',
    }),
    deleteCreditById: async () => ({
        message: 'Credit deleted successfully',
    }),
};