import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { login as apiLogin, logout as apiLogout, signup as apiSignup } from '../api/auth';

// Восстановление авторизации из localStorage
export const restoreAuth = createAsyncThunk('auth/restoreAuth', async (_, { rejectWithValue }) => {
    try {
        const token = localStorage.getItem('token');
        if (!token) {
            return rejectWithValue({ message: 'No token found', status: 401 });
        }
        return { token };
    } catch {
        return rejectWithValue({ message: 'Failed to restore auth', status: 500 });
    }
});

// Логин
export const login = createAsyncThunk('auth/login', async ({ login, password }, { rejectWithValue }) => {
    try {
        const response = await apiLogin({ login, password });
        if (response.error) {
            return rejectWithValue(response.error);
        }
        localStorage.setItem('token', response.data.access_token);
        return response.data;
    } catch {
        return rejectWithValue({ message: 'Failed to login', status: 500 });
    }
});

// Регистрация с авто-логином
export const signup = createAsyncThunk('auth/signup', async ({ user_name, login, password }, { dispatch, rejectWithValue }) => {
    try {
        // Сначала регистрируем
        const signupResponse = await apiSignup({ user_name, login, password });
        if (signupResponse.error) {
            return rejectWithValue(signupResponse.error);
        }
        // При успехе сразу логиним
        await dispatch(login({ login, password })).unwrap();
        return signupResponse.data; // Возвращаем { ok: true }
    } catch {
        return rejectWithValue({ message: 'Failed to signup', status: 500 });
    }
});

// Логаут
export const logout = createAsyncThunk('auth/logout', async (_, { getState, rejectWithValue }) => {
    try {
        const token = getState().auth.token;
        const response = await apiLogout(token);
        if (response.error) {
            return rejectWithValue(response.error);
        }
        localStorage.removeItem('token');
        return response.data;
    } catch {
        return rejectWithValue({ message: 'Failed to logout', status: 500 });
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
        clearError(state) {
            state.error = null;
        },
    },
    extraReducers: (builder) => {
        // restoreAuth
        builder
            .addCase(restoreAuth.fulfilled, (state, action) => {
                state.token = action.payload.token;
                state.isAuthenticated = true;
                state.status = 'succeeded';
            })
            .addCase(restoreAuth.rejected, (state) => {
                state.status = 'failed';
                state.isAuthenticated = false;
            });

        // login
        builder
            .addCase(login.pending, (state) => {
                state.status = 'loading';
                state.error = null;
            })
            .addCase(login.fulfilled, (state, action) => {
                state.status = 'succeeded';
                state.token = action.payload.access_token;
                state.isAuthenticated = true;
            })
            .addCase(login.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.payload;
            });

        // signup
        builder
            .addCase(signup.pending, (state) => {
                state.status = 'loading';
                state.error = null;
            })
            .addCase(signup.fulfilled, (state) => {
                state.status = 'succeeded';
                // token и isAuthenticated уже установлены через login
            })
            .addCase(signup.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.payload;
            });

        // logout
        builder.addCase(logout.fulfilled, (state) => {
            state.status = 'succeeded';
            state.token = null;
            state.isAuthenticated = false;
        });
    },
});

export const { clearError } = authSlice.actions;
export default authSlice.reducer;