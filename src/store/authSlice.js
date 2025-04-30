import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { login as apiLogin, logout as apiLogout } from '../api/auth';

// Асинхронный thunk для логина
export const login = createAsyncThunk('auth/login', async (credentials, { rejectWithValue }) => {
    try {
        const response = await apiLogin(credentials);
        if (response.error) {
            return rejectWithValue(response.error);
        }
        return response.data; // { access_token, userName, ... }
    } catch {
        return rejectWithValue({ message: 'Login failed', status: 500 });
    }
});

// Асинхронный thunk для логаута
export const logout = createAsyncThunk('auth/logout', async (_, { getState, rejectWithValue }) => {
    try {
        const token = getState().auth.token;
        const response = await apiLogout(token);
        if (response.error) {
            return rejectWithValue(response.error);
        }
        return response.data; // { status: 200 }
    } catch {
        return rejectWithValue({ message: 'Logout failed', status: 500 });
    }
});

const authSlice = createSlice({
    name: 'auth',
    initialState: {
        token: null,
        isAuthenticated: false,
        status: 'idle', // 'idle' | 'loading' | 'succeeded' | 'failed'
        error: null,
    },
    reducers: {
        restoreAuth(state, action) {
            state.token = action.payload;
            state.isAuthenticated = true;
            state.status = 'succeeded';
        },
    },
    extraReducers: (builder) => {
        // Login
        builder
            .addCase(login.pending, (state) => {
                state.status = 'loading';
                state.error = null;
            })
            .addCase(login.fulfilled, (state, action) => {
                state.status = 'succeeded';
                state.token = action.payload.access_token;
                state.isAuthenticated = true;
                // Сохраняем токен в localStorage
                localStorage.setItem('token', action.payload.access_token);
            })
            .addCase(login.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.payload;
            });
        // Logout
        builder
            .addCase(logout.pending, (state) => {
                state.status = 'loading';
                state.error = null;
            })
            .addCase(logout.fulfilled, (state) => {
                state.status = 'succeeded';
                state.token = null;
                state.isAuthenticated = false;
                // Очищаем localStorage
                localStorage.removeItem('token');
            })
            .addCase(logout.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.payload;
                // На случай ошибки всё равно очищаем состояние
                state.token = null;
                state.isAuthenticated = false;
                localStorage.removeItem('token');
            });
    },
});

export const { restoreAuth } = authSlice.actions;
export default authSlice.reducer;