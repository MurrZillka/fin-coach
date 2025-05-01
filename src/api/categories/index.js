import axios from 'axios';
import { getUseMocks, API_BASE_URL } from '../config';
import { mockCategories } from './mocks';

const api = axios.create({
    baseURL: API_BASE_URL,
    headers: { 'Content-Type': 'application/json' },
});

export const addCategory = async (data, token) => {
    try {
        if (getUseMocks()) return { data: await mockCategories.addCategory(), error: null };
        const response = await api.post('/AddCategory', data, {
            headers: { Authorization: `Bearer ${token}` },
        });
        return { data: response.data, error: null };
    } catch (error) {
        return {
            data: null,
            error: {
                message: error.response?.data?.error || 'Failed to add category',
                status: error.response?.status || 500,
            },
        };
    }
};

export const getCategories = async (token) => {
    try {
        if (getUseMocks()) return { data: { categories: (await mockCategories.getCategories()).Categories }, error: null };
        const response = await api.get('/Categories', {
            headers: { Authorization: `Bearer ${token}` },
        });
        return { data: { categories: response.data.Categories }, error: null };
    } catch (error) {
        return {
            data: null,
            error: {
                message: error.response?.data?.error || 'Failed to fetch categories',
                status: error.response?.status || 500,
            },
        };
    }
};

export const getCategoryById = async (id, token) => {
    try {
        if (getUseMocks()) return { data: (await mockCategories.getCategoryById(id)).Category, error: null };
        const response = await api.get(`/Category/${id}`, {
            headers: { Authorization: `Bearer ${token}` },
        });
        return { data: response.data.Category, error: null };
    } catch (error) {
        return {
            data: null,
            error: {
                message: error.response?.data?.error || 'Failed to fetch category',
                status: error.response?.status || 500,
            },
        };
    }
};

export const updateCategoryById = async (id, data, token) => {
    try {
        if (getUseMocks()) return { data: await mockCategories.updateCategoryById(), error: null };
        const response = await api.put(`/Category/${id}`, data, {
            headers: { Authorization: `Bearer ${token}` },
        });
        return { data: response.data, error: null };
    } catch (error) {
        return {
            data: null,
            error: {
                message: error.response?.data?.error || 'Failed to update category',
                status: error.response?.status || 500,
            },
        };
    }
};

export const deleteCategoryById = async (id, token) => {
    try {
        if (getUseMocks()) return { data: await mockCategories.deleteCategoryById(), error: null };
        const response = await api.delete(`/Category/${id}`, {
            headers: { Authorization: `Bearer ${token}` },
        });
        return { data: response.data, error: null };
    } catch (error) {
        return {
            data: null,
            error: {
                message: error.response?.data?.error || 'Failed to delete category',
                status: error.response?.status || 500,
            },
        };
    }
};