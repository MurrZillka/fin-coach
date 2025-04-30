import { configureStore } from '@reduxjs/toolkit';
import authReducer from './authSlice';
import creditReducer from './creditSlice';
import spendingsReducer from './spendingsSlice';
import categoriesReducer from './categoriesSlice';
import goalsReducer from './goalsSlice';
import balanceReducer from './balanceSlice';
import recommendationsReducer from './recommendationsSlice';

export const store = configureStore({
    reducer: {
        auth: authReducer,
        credit: creditReducer,
        spendings: spendingsReducer,
        categories: categoriesReducer,
        goals: goalsReducer,
        balance: balanceReducer,
        recommendations: recommendationsReducer,
    },
});