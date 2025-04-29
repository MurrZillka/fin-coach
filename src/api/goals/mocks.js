export const mockGoals = {
    addGoal: async () => ({
        message: 'Goal added successfully',
    }),
    getGoals: async () => ({
        Goals: [
            {
                id: 2,
                user_id: 1,
                amount: 1000000,
                description: 'На жрачку 4',
                wish_date: '2027-08-05T00:00:00Z',
                achievement_date: '0001-01-01T00:00:00Z',
                is_achieved: false,
                is_current: false,
                is_delete: false,
            },
            {
                id: 1,
                user_id: 1,
                amount: 0,
                description: '',
                wish_date: '0001-01-01T00:00:00Z',
                achievement_date: '2025-03-09T00:00:00Z',
                is_achieved: true,
                is_current: true,
                is_delete: false,
            },
        ],
    }),
    getGoalById: async (id) => ({
        Goal: {
            id: Number(id),
            user_id: 1,
            amount: 0,
            description: '',
            wish_date: '0001-01-01T00:00:00Z',
            achievement_date: '2025-03-09T00:00:00Z',
            is_achieved: true,
            is_current: true,
            is_delete: false,
        },
    }),
    updateGoalById: async () => ({
        message: 'Goal updated successfully',
    }),
    setCurrentGoal: async () => ({
        message: 'Goal updated successfully',
    }),
    getCurrentGoal: async () => ({
        Goal: {
            id: 2,
            user_id: 1,
            amount: 1111,
            description: 'Измененное описание 3',
            wish_date: '2024-05-05T00:00:00Z',
            achievement_date: '0001-01-01T00:00:00Z',
            is_achieved: false,
            is_current: true,
            is_delete: false,
        },
    }),
    deleteGoalById: async () => ({
        message: 'Goal deleted successfully',
    }),
};