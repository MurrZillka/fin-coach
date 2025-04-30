import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { getCategories, addCategory, getCategoryById, updateCategoryById, deleteCategoryById } from '../api/categories';
import { logout } from './authSlice';

// Асинхронный thunk для получения списка категорий
export const fetchCategories = createAsyncThunk('categories/fetchCategories', async (_, { getState, dispatch, rejectWithValue }) => {
    try {
        const token = getState().auth.token;
        if (!token) {
            return rejectWithValue({ message: 'Token required', status: 401 });
        }
        const response = await getCategories(token);
        if (response.error) {
            if (response.error.status === 401) {
                dispatch(logout());
            }
            return rejectWithValue(response.error);
        }
        return response.data.categories;
    } catch {
        return rejectWithValue({ message: 'Failed to fetch categories', status: 500 });
    }
});

// Асинхронный thunk для добавления категории
export const addNewCategory = createAsyncThunk('categories/addNewCategory', async (categoryData, { getState, dispatch, rejectWithValue }) => {
    try {
        const token = getState().auth.token;
        if (!token) {
            return rejectWithValue({ message: 'Token required', status: 401 });
        }
        const response = await addCategory(categoryData, token);
        if (response.error) {
            if (response.error.status === 401) {
                dispatch(logout());
            }
            return rejectWithValue(response.error);
        }
        return response.data;
    } catch {
        return rejectWithValue({ message: 'Failed to add category', status: 500 });
    }
});

// Асинхронный thunk для получения категории по ID
export const fetchCategoryById = createAsyncThunk('categories/fetchCategoryById', async (id, { getState, dispatch, rejectWithValue }) => {
    try {
        const token = getState().auth.token;
        if (!token) {
            return rejectWithValue({ message: 'Token required', status: 401 });
        }
        const response = await getCategoryById(id, token);
        if (response.error) {
            if (response.error.status === 401) {
                dispatch(logout());
            }
            return rejectWithValue(response.error);
        }
        return response.data;
    } catch {
        return rejectWithValue({ message: 'Failed to fetch category by ID', status: 500 });
    }
});

// Асинхронный thunk для обновления категории
export const updateExistingCategory = createAsyncThunk('categories/updateExistingCategory', async ({ id, categoryData }, { getState, dispatch, rejectWithValue }) => {
    try {
        const token = getState().auth.token;
        if (!token) {
            return rejectWithValue({ message: 'Token required', status: 401 });
        }
        const response = await updateCategoryById(id, categoryData, token);
        if (response.error) {
            if (response.error.status === 401) {
                dispatch(logout());
            }
            return rejectWithValue(response.error);
        }
        return response.data;
    } catch {
        return rejectWithValue({ message: 'Failed to update category', status: 500 });
    }
});

// Асинхронный thunk для удаления категории
export const deleteExistingCategory = createAsyncThunk('categories/deleteExistingCategory', async (id, { getState, dispatch, rejectWithValue }) => {
    try {
        const token = getState().auth.token;
        if (!token) {
            return rejectWithValue({ message: 'Token required', status: 401 });
        }
        const response = await deleteCategoryById(id, token);
        if (response.error) {
            if (response.error.status === 401) {
                dispatch(logout());
            }
            return rejectWithValue(response.error);
        }
        return id;
    } catch {
        return rejectWithValue({ message: 'Failed to delete category', status: 500 });
    }
});

const categoriesSlice = createSlice({
    name: 'categories',
    initialState: {
        categories: [],
        selectedCategory: null,
        status: 'idle', // 'idle' | 'loading' | 'succeeded' | 'failed'
        error: null,
    },
    reducers: {
        clearError(state) {
            state.error = null;
        },
    },
    extraReducers: (builder) => {
        // fetchCategories
        builder
            .addCase(fetchCategories.pending, (state) => {
                state.status = 'loading';
                state.error = null;
            })
            .addCase(fetchCategories.fulfilled, (state, action) => {
                state.status = 'succeeded';
                state.categories = action.payload;
            })
            .addCase(fetchCategories.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.payload;
            });
        // addNewCategory
        builder
            .addCase(addNewCategory.pending, (state) => {
                state.status = 'loading';
                state.error = null;
            })
            .addCase(addNewCategory.fulfilled, (state, action) => {
                state.status = 'succeeded';
                state.categories.push(action.payload);
            })
            .addCase(addNewCategory.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.payload;
            });
        // fetchCategoryById
        builder
            .addCase(fetchCategoryById.pending, (state) => {
                state.status = 'loading';
                state.error = null;
            })
            .addCase(fetchCategoryById.fulfilled, (state, action) => {
                state.status = 'succeeded';
                state.selectedCategory = action.payload;
            })
            .addCase(fetchCategoryById.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.payload;
            });
        // updateExistingCategory
        builder
            .addCase(updateExistingCategory.pending, (state) => {
                state.status = 'loading';
                state.error = null;
            })
            .addCase(updateExistingCategory.fulfilled, (state, action) => {
                state.status = 'succeeded';
                const updatedCategory = action.payload;
                const index = state.categories.findIndex((category) => category.id === updatedCategory.id);
                if (index !== -1) {
                    state.categories[index] = updatedCategory;
                }
            })
            .addCase(updateExistingCategory.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.payload;
            });
        // deleteExistingCategory
        builder
            .addCase(deleteExistingCategory.pending, (state) => {
                state.status = 'loading';
                state.error = null;
            })
            .addCase(deleteExistingCategory.fulfilled, (state, action) => {
                state.status = 'succeeded';
                const id = action.payload;
                state.categories = state.categories.filter((category) => category.id !== id);
                if (state.selectedCategory?.id === id) {
                    state.selectedCategory = null;
                }
            })
            .addCase(deleteExistingCategory.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.payload;
            });
    },
});

export const { clearError } = categoriesSlice.actions;
export default categoriesSlice.reducer;