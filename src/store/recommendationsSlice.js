import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { getRecommendations, getRecommendationById } from '../api/recommendations';
import { logout } from './authSlice';

// Асинхронный thunk для получения списка рекомендаций
export const fetchRecommendations = createAsyncThunk('recommendations/fetchRecommendations', async (_, { getState, dispatch, rejectWithValue }) => {
    try {
        const token = getState().auth.token;
        if (!token) {
            return rejectWithValue({ message: 'Token required', status: 401 });
        }
        const response = await getRecommendations(token);
        if (response.error) {
            if (response.error.status === 401) {
                dispatch(logout());
            }
            return rejectWithValue(response.error);
        }
        return response.data.recommendations;
    } catch {
        return rejectWithValue({ message: 'Failed to fetch recommendations', status: 500 });
    }
});

// Асинхронный thunk для получения рекомендации по ID
export const fetchRecommendationById = createAsyncThunk('recommendations/fetchRecommendationById', async (id, { getState, dispatch, rejectWithValue }) => {
    try {
        const token = getState().auth.token;
        if (!token) {
            return rejectWithValue({ message: 'Token required', status: 401 });
        }
        const response = await getRecommendationById(id, token);
        if (response.error) {
            if (response.error.status === 401) {
                dispatch(logout());
            }
            return rejectWithValue(response.error);
        }
        return response.data;
    } catch {
        return rejectWithValue({ message: 'Failed to fetch recommendation by ID', status: 500 });
    }
});

const recommendationsSlice = createSlice({
    name: 'recommendations',
    initialState: {
        recommendations: [],
        selectedRecommendation: null,
        status: 'idle', // 'idle' | 'loading' | 'succeeded' | 'failed'
        error: null,
    },
    reducers: {
        clearError(state) {
            state.error = null;
        },
    },
    extraReducers: (builder) => {
        // fetchRecommendations
        builder
            .addCase(fetchRecommendations.pending, (state) => {
                state.status = 'loading';
                state.error = null;
            })
            .addCase(fetchRecommendations.fulfilled, (state, action) => {
                state.status = 'succeeded';
                state.recommendations = action.payload;
            })
            .addCase(fetchRecommendations.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.payload;
            });
        // fetchRecommendationById
        builder
            .addCase(fetchRecommendationById.pending, (state) => {
                state.status = 'loading';
                state.error = null;
            })
            .addCase(fetchRecommendationById.fulfilled, (state, action) => {
                state.status = 'succeeded';
                state.selectedRecommendation = action.payload;
            })
            .addCase(fetchRecommendationById.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.payload;
            });
    },
});

export const { clearError } = recommendationsSlice.actions;
export default recommendationsSlice.reducer;