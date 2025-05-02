import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { signup as apiSignup, login as apiLogin, logout as apiLogout } from '../api/auth';

// Начальное состояние
const initialState = {
    isAuthenticated: false,
    token: null,
    user: null,
    status: 'idle', // 'idle' | 'loading' | 'succeeded' | 'failed'
    error: null,
};

// Асинхронные thunks
export const signup = createAsyncThunk(
    'auth/signup',
    async (userData, { rejectWithValue }) => {
        const response = await apiSignup(userData);
        if (response.error) {
            return rejectWithValue(response.error);
        }
        return response.data;
    }
);

export const login = createAsyncThunk(
    'auth/login',
    async (credentials, { rejectWithValue }) => {
        const response = await apiLogin(credentials);
        if (response.error) {
            return rejectWithValue(response.error);
        }
        return response.data;
    }
);

export const restoreAuth = createAsyncThunk(
    'auth/restore',
    async (token) => {
        return { token };
    }
);

export const logoutAsync = createAsyncThunk(
    'auth/logoutAsync',
    async (_, { getState, rejectWithValue }) => {
        const { token } = getState().auth;
        if (!token) return null;

        const response = await apiLogout(token);
        if (response.error) {
            return rejectWithValue(response.error);
        }
        return response.data;
    }
);

const authSlice = createSlice({
    name: 'auth',
    initialState,
    reducers: {
        clearError: (state) => {
            state.error = null;
        },
        logout: (state) => {
            state.token = null;
            state.user = null;
            state.isAuthenticated = false;
            state.status = 'idle';
            state.error = null;
        },
    },
    extraReducers: (builder) => {
        builder
            // Обработка signup
            .addCase(signup.pending, (state) => {
                state.status = 'loading';
                state.error = null;
            })
            .addCase(signup.fulfilled, (state) => {
                state.status = 'succeeded';
            })
            .addCase(signup.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.payload || { message: 'Ошибка регистрации' };
            })

            // Обработка login
            .addCase(login.pending, (state) => {
                state.status = 'loading';
                state.error = null;
            })
            .addCase(login.fulfilled, (state, action) => {
                state.status = 'succeeded';
                state.isAuthenticated = true;
                state.token = action.payload.access_token;
                state.user = action.payload.user;
                localStorage.setItem('token', action.payload.access_token);
            })
            .addCase(login.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.payload || { message: 'Ошибка входа' };
            })

            // Обработка restoreAuth
            .addCase(restoreAuth.fulfilled, (state, action) => {
                state.token = action.payload.token;
                state.isAuthenticated = true;
            })

            // Обработка logoutAsync
            .addCase(logoutAsync.fulfilled, (state) => {
                state.token = null;
                state.user = null;
                state.isAuthenticated = false;
                state.status = 'idle';
                localStorage.removeItem('token');
            });
    },
});

export const { clearError, logout } = authSlice.actions;
export default authSlice.reducer;