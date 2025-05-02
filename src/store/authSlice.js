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
        console.log('Redux login thunk: начало выполнения', { login });

        const response = await apiLogin({ login, password });

        console.log('Redux login thunk: ответ API', response);

        if (response.error) {
            console.error('Redux login thunk: ошибка от API', response.error);
            return rejectWithValue(response.error);
        }

        localStorage.setItem('token', response.data.access_token);
        console.log('Redux login thunk: токен сохранен в localStorage');

        return response.data;
    } catch (error) {
        console.error('Redux login thunk: ошибка', error);
        return rejectWithValue({ message: 'Failed to login', status: 500 });
    }
});

// Регистрация без авто-логина (простая)
export const signup = createAsyncThunk(
    'auth/signup', // 🛠 Исправленное имя action type
    async ({ user_name, login, password }, { rejectWithValue }) => {
        try {
            console.log('Redux signup thunk: начало выполнения', { user_name, login });

            // Вызываем API-метод регистрации
            const signupResponse = await apiSignup({ user_name, login, password });

            console.log('Redux signup thunk: ответ API', signupResponse);

            if (signupResponse.error) {
                console.error('Redux signup thunk: ошибка от API', signupResponse.error);
                return rejectWithValue(signupResponse.error);
            }

            return signupResponse.data;
        } catch (error) {
            console.error('Redux signup thunk: необработанная ошибка', error);
            return rejectWithValue({ message: 'Failed to signup', status: 500 });
        }
    }
);

// Расширенная версия регистрации с авто-логином (если понадобится в будущем)
export const signupWithAutoLogin = createAsyncThunk(
    'auth/signupWithAutoLogin',
    async ({ user_name, login, password }, { dispatch, rejectWithValue }) => {
        try {
            console.log('Redux signupWithAutoLogin: начало выполнения', { user_name, login });

            // Вызываем API-метод регистрации
            const signupResponse = await apiSignup({ user_name, login, password });

            console.log('Redux signupWithAutoLogin: ответ API', signupResponse);

            if (signupResponse.error) {
                console.error('Redux signupWithAutoLogin: ошибка от API', signupResponse.error);
                return rejectWithValue(signupResponse.error);
            }

            // При успехе пытаемся выполнить логин
            try {
                console.log('Redux signupWithAutoLogin: начало авто-логина');
                const loginResult = await dispatch(login({ login, password })).unwrap();
                console.log('Redux signupWithAutoLogin: авто-логин успешен', loginResult);
                return { ...signupResponse.data, loginSuccess: true, ...loginResult };
            } catch (loginError) {
                console.error('Redux signupWithAutoLogin: ошибка авто-логина', loginError);
                // Если логин не удался, но регистрация прошла успешно,
                // мы все равно считаем регистрацию успешной
                return { ...signupResponse.data, loginSuccess: false };
            }
        } catch (error) {
            console.error('Redux signupWithAutoLogin: необработанная ошибка', error);
            return rejectWithValue({ message: 'Failed to signup', status: 500 });
        }
    }
);

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
                // Просто отмечаем успешную регистрацию без установки токена
            })
            .addCase(signup.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.payload;
            });

        // signupWithAutoLogin (добавляем обработчики для нового thunk)
        builder
            .addCase(signupWithAutoLogin.pending, (state) => {
                state.status = 'loading';
                state.error = null;
            })
            .addCase(signupWithAutoLogin.fulfilled, (state, action) => {
                state.status = 'succeeded';
                // Если авто-логин прошел успешно, устанавливаем токен
                if (action.payload.loginSuccess && action.payload.access_token) {
                    state.token = action.payload.access_token;
                    state.isAuthenticated = true;
                }
            })
            .addCase(signupWithAutoLogin.rejected, (state, action) => {
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