import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { getGoals, addGoal, getGoalById, updateGoalById, setCurrentGoal, getCurrentGoal, deleteGoalById } from '../api/goals';
import { logout } from './authSlice';

// Асинхронный thunk для получения списка целей
export const fetchGoals = createAsyncThunk('goals/fetchGoals', async (_, { getState, dispatch, rejectWithValue }) => {
    try {
        const token = getState().auth.token;
        if (!token) {
            return rejectWithValue({ message: 'Token required', status: 401 });
        }
        const response = await getGoals(token);
        if (response.error) {
            if (response.error.status === 401) {
                dispatch(logout());
            }
            return rejectWithValue(response.error);
        }
        return response.data.goals;
    } catch {
        return rejectWithValue({ message: 'Failed to fetch goals', status: 500 });
    }
});

// Асинхронный thunk для добавления цели
export const addNewGoal = createAsyncThunk('goals/addNewGoal', async (goalData, { getState, dispatch, rejectWithValue }) => {
    try {
        const token = getState().auth.token;
        if (!token) {
            return rejectWithValue({ message: 'Token required', status: 401 });
        }
        const response = await addGoal(goalData, token);
        if (response.error) {
            if (response.error.status === 401) {
                dispatch(logout());
            }
            return rejectWithValue(response.error);
        }
        return response.data;
    } catch {
        return rejectWithValue({ message: 'Failed to add goal', status: 500 });
    }
});

// Асинхронный thunk для получения цели по ID
export const fetchGoalById = createAsyncThunk('goals/fetchGoalById', async (id, { getState, dispatch, rejectWithValue }) => {
    try {
        const token = getState().auth.token;
        if (!token) {
            return rejectWithValue({ message: 'Token required', status: 401 });
        }
        const response = await getGoalById(id, token);
        if (response.error) {
            if (response.error.status === 401) {
                dispatch(logout());
            }
            return rejectWithValue(response.error);
        }
        return response.data;
    } catch {
        return rejectWithValue({ message: 'Failed to fetch goal by ID', status: 500 });
    }
});

// Асинхронный thunk для обновления цели
export const updateExistingGoal = createAsyncThunk('goals/updateExistingGoal', async ({ id, goalData }, { getState, dispatch, rejectWithValue }) => {
    try {
        const token = getState().auth.token;
        if (!token) {
            return rejectWithValue({ message: 'Token required', status: 401 });
        }
        const response = await updateGoalById(id, goalData, token);
        if (response.error) {
            if (response.error.status === 401) {
                dispatch(logout());
            }
            return rejectWithValue(response.error);
        }
        return response.data;
    } catch {
        return rejectWithValue({ message: 'Failed to update goal', status: 500 });
    }
});

// Асинхронный thunk для установки текущей цели
export const setActiveGoal = createAsyncThunk('goals/setActiveGoal', async (id, { getState, dispatch, rejectWithValue }) => {
    try {
        const token = getState().auth.token;
        if (!token) {
            return rejectWithValue({ message: 'Token required', status: 401 });
        }
        const response = await setCurrentGoal(id, token);
        if (response.error) {
            if (response.error.status === 401) {
                dispatch(logout());
            }
            return rejectWithValue(response.error);
        }
        return response.data;
    } catch {
        return rejectWithValue({ message: 'Failed to set current goal', status: 500 });
    }
});

// Асинхронный thunk для получения текущей цели
export const fetchCurrentGoal = createAsyncThunk('goals/fetchCurrentGoal', async (_, { getState, dispatch, rejectWithValue }) => {
    try {
        const token = getState().auth.token;
        if (!token) {
            return rejectWithValue({ message: 'Token required', status: 401 });
        }
        const response = await getCurrentGoal(token);
        if (response.error) {
            if (response.error.status === 401) {
                dispatch(logout());
            }
            return rejectWithValue(response.error);
        }
        return response.data;
    } catch {
        return rejectWithValue({ message: 'Failed to fetch current goal', status: 500 });
    }
});

// Асинхронный thunk для удаления цели
export const deleteExistingGoal = createAsyncThunk('goals/deleteExistingGoal', async (id, { getState, dispatch, rejectWithValue }) => {
    try {
        const token = getState().auth.token;
        if (!token) {
            return rejectWithValue({ message: 'Token required', status: 401 });
        }
        const response = await deleteGoalById(id, token);
        if (response.error) {
            if (response.error.status === 401) {
                dispatch(logout());
            }
            return rejectWithValue(response.error);
        }
        return id;
    } catch {
        return rejectWithValue({ message: 'Failed to delete goal', status: 500 });
    }
});

const goalsSlice = createSlice({
    name: 'goals',
    initialState: {
        goals: [],
        currentGoal: null,
        selectedGoal: null,
        status: 'idle', // 'idle' | 'loading' | 'succeeded' | 'failed'
        error: null,
    },
    reducers: {
        clearError(state) {
            state.error = null;
        },
    },
    extraReducers: (builder) => {
        // fetchGoals
        builder
            .addCase(fetchGoals.pending, (state) => {
                state.status = 'loading';
                state.error = null;
            })
            .addCase(fetchGoals.fulfilled, (state, action) => {
                state.status = 'succeeded';
                state.goals = action.payload;
            })
            .addCase(fetchGoals.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.payload;
            });
        // addNewGoal
        builder
            .addCase(addNewGoal.pending, (state) => {
                state.status = 'loading';
                state.error = null;
            })
            .addCase(addNewGoal.fulfilled, (state, action) => {
                state.status = 'succeeded';
                state.goals.push(action.payload);
            })
            .addCase(addNewGoal.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.payload;
            });
        // fetchGoalById
        builder
            .addCase(fetchGoalById.pending, (state) => {
                state.status = 'loading';
                state.error = null;
            })
            .addCase(fetchGoalById.fulfilled, (state, action) => {
                state.status = 'succeeded';
                state.selectedGoal = action.payload;
            })
            .addCase(fetchGoalById.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.payload;
            });
        // updateExistingGoal
        builder
            .addCase(updateExistingGoal.pending, (state) => {
                state.status = 'loading';
                state.error = null;
            })
            .addCase(updateExistingGoal.fulfilled, (state, action) => {
                state.status = 'succeeded';
                const updatedGoal = action.payload;
                const index = state.goals.findIndex((goal) => goal.id === updatedGoal.id);
                if (index !== -1) {
                    state.goals[index] = updatedGoal;
                }
                if (state.currentGoal?.id === updatedGoal.id) {
                    state.currentGoal = updatedGoal;
                }
            })
            .addCase(updateExistingGoal.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.payload;
            });
        // setActiveGoal
        builder
            .addCase(setActiveGoal.pending, (state) => {
                state.status = 'loading';
                state.error = null;
            })
            .addCase(setActiveGoal.fulfilled, (state, action) => {
                state.status = 'succeeded';
                state.currentGoal = action.payload;
            })
            .addCase(setActiveGoal.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.payload;
            });
        // fetchCurrentGoal
        builder
            .addCase(fetchCurrentGoal.pending, (state) => {
                state.status = 'loading';
                state.error = null;
            })
            .addCase(fetchCurrentGoal.fulfilled, (state, action) => {
                state.status = 'succeeded';
                state.currentGoal = action.payload;
            })
            .addCase(fetchCurrentGoal.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.payload;
            });
        // deleteExistingGoal
        builder
            .addCase(deleteExistingGoal.pending, (state) => {
                state.status = 'loading';
                state.error = null;
            })
            .addCase(deleteExistingGoal.fulfilled, (state, action) => {
                state.status = 'succeeded';
                const id = action.payload;
                state.goals = state.goals.filter((goal) => goal.id !== id);
                if (state.currentGoal?.id === id) {
                    state.currentGoal = null;
                }
                if (state.selectedGoal?.id === id) {
                    state.selectedGoal = null;
                }
            })
            .addCase(deleteExistingGoal.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.payload;
            });
    },
});

export const { clearError } = goalsSlice.actions;
export default goalsSlice.reducer;