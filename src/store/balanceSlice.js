import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { getBalance } from '../api/balance';
import { logout } from './authSlice';

// Асинхронный thunk для получения баланса
export const fetchBalance = createAsyncThunk('balance/fetchBalance', async (_, { getState, dispatch, rejectWithValue }) => {
    try {
        const token = getState().auth.token;
        if (!token) {
            return rejectWithValue({ message: 'Token required', status: 401 });
        }
        const response = await getBalance(token);
        if (response.error) {
            if (response.error.status === 401) {
                dispatch(logout());
            }
            return rejectWithValue(response.error);
        }
        return response.data.balance;
    } catch {
        return rejectWithValue({ message: 'Failed to fetch balance', status: 500 });
    }
});

const balanceSlice = createSlice({
    name: 'balance',
    initialState: {
        balance: null,
        status: 'idle', // 'idle' | 'loading' | 'succeeded' | 'failed'
        error: null,
    },
    reducers: {
        clearError(state) {
            state.error = null;
        },
    },
    extraReducers: (builder) => {
        // fetchBalance
        builder
            .addCase(fetchBalance.pending, (state) => {
                state.status = 'loading';
                state.error = null;
            })
            .addCase(fetchBalance.fulfilled, (state, action) => {
                state.status = 'succeeded';
                state.balance = action.payload;
            })
            .addCase(fetchBalance.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.payload;
            });
    },
});

export const { clearError } = balanceSlice.actions;
export default balanceSlice.reducer;