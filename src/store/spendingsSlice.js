import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { getSpendings, getSpendingsPermanent, addSpending, getSpendingById, updateSpendingById, deleteSpendingById } from '../api/spendings';
import { logout } from './authSlice';

// Асинхронный thunk для получения списка расходов
export const fetchSpendings = createAsyncThunk('spendings/fetchSpendings', async (_, { getState, dispatch, rejectWithValue }) => {
    try {
        const token = getState().auth.token;
        if (!token) {
            return rejectWithValue({ message: 'Token required', status: 401 });
        }
        const response = await getSpendings(token);
        if (response.error) {
            if (response.error.status === 401) {
                dispatch(logout());
            }
            return rejectWithValue(response.error);
        }
        return response.data.spendings;
    } catch {
        return rejectWithValue({ message: 'Failed to fetch spendings', status: 500 });
    }
});

// Асинхронный thunk для получения перманентных расходов
export const fetchPermanentSpendings = createAsyncThunk('spendings/fetchPermanentSpendings', async (_, { getState, dispatch, rejectWithValue }) => {
    try {
        const token = getState().auth.token;
        if (!token) {
            return rejectWithValue({ message: 'Token required', status: 401 });
        }
        const response = await getSpendingsPermanent(token);
        if (response.error) {
            if (response.error.status === 401) {
                dispatch(logout());
            }
            return rejectWithValue(response.error);
        }
        return response.data.spendings;
    } catch {
        return rejectWithValue({ message: 'Failed to fetch permanent spendings', status: 500 });
    }
});

// Асинхронный thunk для добавления расхода
export const addNewSpending = createAsyncThunk('spendings/addNewSpending', async (spendingData, { getState, dispatch, rejectWithValue }) => {
    try {
        const token = getState().auth.token;
        if (!token) {
            return rejectWithValue({ message: 'Token required', status: 401 });
        }
        const response = await addSpending(spendingData, token);
        if (response.error) {
            if (response.error.status === 401) {
                dispatch(logout());
            }
            return rejectWithValue(response.error);
        }
        return response.data;
    } catch {
        return rejectWithValue({ message: 'Failed to add spending', status: 500 });
    }
});

// Асинхронный thunk для получения расхода по ID
export const fetchSpendingById = createAsyncThunk('spendings/fetchSpendingById', async (id, { getState, dispatch, rejectWithValue }) => {
    try {
        const token = getState().auth.token;
        if (!token) {
            return rejectWithValue({ message: 'Token required', status: 401 });
        }
        const response = await getSpendingById(id, token);
        if (response.error) {
            if (response.error.status === 401) {
                dispatch(logout());
            }
            return rejectWithValue(response.error);
        }
        return response.data;
    } catch {
        return rejectWithValue({ message: 'Failed to fetch spending by ID', status: 500 });
    }
});

// Асинхронный thunk для обновления расхода
export const updateExistingSpending = createAsyncThunk('spendings/updateExistingSpending', async ({ id, spendingData }, { getState, dispatch, rejectWithValue }) => {
    try {
        const token = getState().auth.token;
        if (!token) {
            return rejectWithValue({ message: 'Token required', status: 401 });
        }
        const response = await updateSpendingById(id, spendingData, token);
        if (response.error) {
            if (response.error.status === 401) {
                dispatch(logout());
            }
            return rejectWithValue(response.error);
        }
        return response.data;
    } catch {
        return rejectWithValue({ message: 'Failed to update spending', status: 500 });
    }
});

// Асинхронный thunk для удаления расхода
export const deleteExistingSpending = createAsyncThunk('spendings/deleteExistingSpending', async (id, { getState, dispatch, rejectWithValue }) => {
    try {
        const token = getState().auth.token;
        if (!token) {
            return rejectWithValue({ message: 'Token required', status: 401 });
        }
        const response = await deleteSpendingById(id, token);
        if (response.error) {
            if (response.error.status === 401) {
                dispatch(logout());
            }
            return rejectWithValue(response.error);
        }
        return id;
    } catch {
        return rejectWithValue({ message: 'Failed to delete spending', status: 500 });
    }
});

const spendingsSlice = createSlice({
    name: 'spendings',
    initialState: {
        spendings: [],
        permanentSpendings: [],
        selectedSpending: null,
        status: 'idle', // 'idle' | 'loading' | 'succeeded' | 'failed'
        error: null,
    },
    reducers: {
        clearError(state) {
            state.error = null;
        },
    },
    extraReducers: (builder) => {
        // fetchSpendings
        builder
            .addCase(fetchSpendings.pending, (state) => {
                state.status = 'loading';
                state.error = null;
            })
            .addCase(fetchSpendings.fulfilled, (state, action) => {
                state.status = 'succeeded';
                state.spendings = action.payload;
            })
            .addCase(fetchSpendings.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.payload;
            });
        // fetchPermanentSpendings
        builder
            .addCase(fetchPermanentSpendings.pending, (state) => {
                state.status = 'loading';
                state.error = null;
            })
            .addCase(fetchPermanentSpendings.fulfilled, (state, action) => {
                state.status = 'succeeded';
                state.permanentSpendings = action.payload;
            })
            .addCase(fetchPermanentSpendings.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.payload;
            });
        // addNewSpending
        builder
            .addCase(addNewSpending.pending, (state) => {
                state.status = 'loading';
                state.error = null;
            })
            .addCase(addNewSpending.fulfilled, (state, action) => {
                state.status = 'succeeded';
                state.spendings.push(action.payload);
            })
            .addCase(addNewSpending.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.payload;
            });
        // fetchSpendingById
        builder
            .addCase(fetchSpendingById.pending, (state) => {
                state.status = 'loading';
                state.error = null;
            })
            .addCase(fetchSpendingById.fulfilled, (state, action) => {
                state.status = 'succeeded';
                state.selectedSpending = action.payload;
            })
            .addCase(fetchSpendingById.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.payload;
            });
        // updateExistingSpending
        builder
            .addCase(updateExistingSpending.pending, (state) => {
                state.status = 'loading';
                state.error = null;
            })
            .addCase(updateExistingSpending.fulfilled, (state, action) => {
                state.status = 'succeeded';
                const updatedSpending = action.payload;
                const index = state.spendings.findIndex((spending) => spending.id === updatedSpending.id);
                if (index !== -1) {
                    state.spendings[index] = updatedSpending;
                }
                if (updatedSpending.is_permanent) {
                    const permIndex = state.permanentSpendings.findIndex((spending) => spending.id === updatedSpending.id);
                    if (permIndex !== -1) {
                        state.permanentSpendings[permIndex] = updatedSpending;
                    } else {
                        state.permanentSpendings.push(updatedSpending);
                    }
                }
            })
            .addCase(updateExistingSpending.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.payload;
            });
        // deleteExistingSpending
        builder
            .addCase(deleteExistingSpending.pending, (state) => {
                state.status = 'loading';
                state.error = null;
            })
            .addCase(deleteExistingSpending.fulfilled, (state, action) => {
                state.status = 'succeeded';
                const id = action.payload;
                state.spendings = state.spendings.filter((spending) => spending.id !== id);
                state.permanentSpendings = state.permanentSpendings.filter((spending) => spending.id !== id);
                if (state.selectedSpending?.id === id) {
                    state.selectedSpending = null;
                }
            })
            .addCase(deleteExistingSpending.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.payload;
            });
    },
});

export const { clearError } = spendingsSlice.actions;
export default spendingsSlice.reducer;