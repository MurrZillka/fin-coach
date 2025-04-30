import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { getCredits, getCreditsPermanent, addCredit, getCreditById, updateCreditById, deleteCreditById } from '../api/credit';
import { logout } from './authSlice';

// Асинхронный thunk для получения списка кредитов
export const fetchCredits = createAsyncThunk('credit/fetchCredits', async (_, { getState, dispatch, rejectWithValue }) => {
    try {
        const token = getState().auth.token;
        if (!token) {
            return rejectWithValue({ message: 'Token required', status: 401 });
        }
        const response = await getCredits(token);
        if (response.error) {
            if (response.error.status === 401) {
                dispatch(logout());
            }
            return rejectWithValue(response.error);
        }
        return response.data.credits;
    } catch {
        return rejectWithValue({ message: 'Failed to fetch credits', status: 500 });
    }
});

// Асинхронный thunk для получения перманентных кредитов
export const fetchPermanentCredits = createAsyncThunk('credit/fetchPermanentCredits', async (_, { getState, dispatch, rejectWithValue }) => {
    try {
        const token = getState().auth.token;
        if (!token) {
            return rejectWithValue({ message: 'Token required', status: 401 });
        }
        const response = await getCreditsPermanent(token);
        if (response.error) {
            if (response.error.status === 401) {
                dispatch(logout());
            }
            return rejectWithValue(response.error);
        }
        return response.data.credits;
    } catch {
        return rejectWithValue({ message: 'Failed to fetch permanent credits', status: 500 });
    }
});

// Асинхронный thunk для добавления кредита
export const addNewCredit = createAsyncThunk('credit/addNewCredit', async (creditData, { getState, dispatch, rejectWithValue }) => {
    try {
        const token = getState().auth.token;
        if (!token) {
            return rejectWithValue({ message: 'Token required', status: 401 });
        }
        const response = await addCredit(creditData, token);
        if (response.error) {
            if (response.error.status === 401) {
                dispatch(logout());
            }
            return rejectWithValue(response.error);
        }
        return response.data;
    } catch {
        return rejectWithValue({ message: 'Failed to add credit', status: 500 });
    }
});

// Асинхронный thunk для получения кредита по ID
export const fetchCreditById = createAsyncThunk('credit/fetchCreditById', async (id, { getState, dispatch, rejectWithValue }) => {
    try {
        const token = getState().auth.token;
        if (!token) {
            return rejectWithValue({ message: 'Token required', status: 401 });
        }
        const response = await getCreditById(id, token);
        if (response.error) {
            if (response.error.status === 401) {
                dispatch(logout());
            }
            return rejectWithValue(response.error);
        }
        return response.data;
    } catch {
        return rejectWithValue({ message: 'Failed to fetch credit by ID', status: 500 });
    }
});

// Асинхронный thunk для обновления кредита
export const updateExistingCredit = createAsyncThunk('credit/updateExistingCredit', async ({ id, creditData }, { getState, dispatch, rejectWithValue }) => {
    try {
        const token = getState().auth.token;
        if (!token) {
            return rejectWithValue({ message: 'Token required', status: 401 });
        }
        const response = await updateCreditById(id, creditData, token);
        if (response.error) {
            if (response.error.status === 401) {
                dispatch(logout());
            }
            return rejectWithValue(response.error);
        }
        return response.data;
    } catch {
        return rejectWithValue({ message: 'Failed to update credit', status: 500 });
    }
});

// Асинхронный thunk для удаления кредита
export const deleteExistingCredit = createAsyncThunk('credit/deleteExistingCredit', async (id, { getState, dispatch, rejectWithValue }) => {
    try {
        const token = getState().auth.token;
        if (!token) {
            return rejectWithValue({ message: 'Token required', status: 401 });
        }
        const response = await deleteCreditById(id, token);
        if (response.error) {
            if (response.error.status === 401) {
                dispatch(logout());
            }
            return rejectWithValue(response.error);
        }
        return id;
    } catch {
        return rejectWithValue({ message: 'Failed to delete credit', status: 500 });
    }
});

const creditSlice = createSlice({
    name: 'credit',
    initialState: {
        credits: [],
        permanentCredits: [],
        selectedCredit: null,
        status: 'idle', // 'idle' | 'loading' | 'succeeded' | 'failed'
        error: null,
    },
    reducers: {
        clearError(state) {
            state.error = null;
        },
    },
    extraReducers: (builder) => {
        // fetchCredits
        builder
            .addCase(fetchCredits.pending, (state) => {
                state.status = 'loading';
                state.error = null;
            })
            .addCase(fetchCredits.fulfilled, (state, action) => {
                state.status = 'succeeded';
                state.credits = action.payload;
            })
            .addCase(fetchCredits.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.payload;
            });
        // fetchPermanentCredits
        builder
            .addCase(fetchPermanentCredits.pending, (state) => {
                state.status = 'loading';
                state.error = null;
            })
            .addCase(fetchPermanentCredits.fulfilled, (state, action) => {
                state.status = 'succeeded';
                state.permanentCredits = action.payload;
            })
            .addCase(fetchPermanentCredits.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.payload;
            });
        // addNewCredit
        builder
            .addCase(addNewCredit.pending, (state) => {
                state.status = 'loading';
                state.error = null;
            })
            .addCase(addNewCredit.fulfilled, (state, action) => {
                state.status = 'succeeded';
                state.credits.push(action.payload);
            })
            .addCase(addNewCredit.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.payload;
            });
        // fetchCreditById
        builder
            .addCase(fetchCreditById.pending, (state) => {
                state.status = 'loading';
                state.error = null;
            })
            .addCase(fetchCreditById.fulfilled, (state, action) => {
                state.status = 'succeeded';
                state.selectedCredit = action.payload;
            })
            .addCase(fetchCreditById.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.payload;
            });
        // updateExistingCredit
        builder
            .addCase(updateExistingCredit.pending, (state) => {
                state.status = 'loading';
                state.error = null;
            })
            .addCase(updateExistingCredit.fulfilled, (state, action) => {
                state.status = 'succeeded';
                const updatedCredit = action.payload;
                const index = state.credits.findIndex((credit) => credit.id === updatedCredit.id);
                if (index !== -1) {
                    state.credits[index] = updatedCredit;
                }
                if (updatedCredit.is_permanent) {
                    const permIndex = state.permanentCredits.findIndex((credit) => credit.id === updatedCredit.id);
                    if (permIndex !== -1) {
                        state.permanentCredits[permIndex] = updatedCredit;
                    } else {
                        state.permanentCredits.push(updatedCredit);
                    }
                }
            })
            .addCase(updateExistingCredit.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.payload;
            });
        // deleteExistingCredit
        builder
            .addCase(deleteExistingCredit.pending, (state) => {
                state.status = 'loading';
                state.error = null;
            })
            .addCase(deleteExistingCredit.fulfilled, (state, action) => {
                state.status = 'succeeded';
                const id = action.payload;
                state.credits = state.credits.filter((credit) => credit.id !== id);
                state.permanentCredits = state.permanentCredits.filter((credit) => credit.id !== id);
                if (state.selectedCredit?.id === id) {
                    state.selectedCredit = null;
                }
            })
            .addCase(deleteExistingCredit.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.payload;
            });
    },
});

export const { clearError } = creditSlice.actions;
export default creditSlice.reducer;