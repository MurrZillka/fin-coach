export const mockGoals = {
    addGoal: async (body) => ({
        data: { id: 1, amount: body.amount, description: body.description, wish_date: body.wish_date },
        error: null,
    }),
    getGoals: async () => ({
        data: {
            goals: [
                { id: 1, amount: 1000000, description: 'Test goal 1', wish_date: '2025-12-31' },
                { id: 2, amount: 500000, description: 'Test goal 2', wish_date: '2026-01-15' },
                { id: 3, amount: 2000000, description: 'Test goal 3', wish_date: '2026-06-30' },
                { id: 4, amount: 300000, description: 'Test goal 4', wish_date: '2025-11-01' },
                { id: 5, amount: 750000, description: 'Test goal 5', wish_date: '2026-03-31' },
            ],
        },
        error: null,
    }),
    getGoalById: async (id) => {
        if (id === 1) {
            return { data: { id: 1, amount: 1000000, description: 'Test goal', wish_date: '2025-12-31' }, error: null };
        }
        return { data: null, error: { message: 'Goal not found', status: 404 } };
    },
    updateGoalById: async (id, body) => {
        if (id === 1) {
            return { data: { id, amount: body.amount, description: body.description, wish_date: body.wish_date }, error: null };
        }
        return { data: null, error: { message: 'Goal not found', status: 404 } };
    },
    setCurrentGoal: async (id) => {
        if (id === 1) {
            return { data: { status: 200 }, error: null };
        }
        return { data: null, error: { message: 'Goal not found', status: 404 } };
    },
    getCurrentGoal: async () => ({
        data: { goal: { id: 1, amount: 1000000, description: 'Test goal', wish_date: '2025-12-31' } },
        error: null,
    }),
    deleteGoalById: async (id) => {
        if (id === 1) {
            return { data: { status: 200 }, error: null };
        }
        return { data: null, error: { message: 'Goal not found', status: 404 } };
    },
};