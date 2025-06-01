// src/api/categories/index.js
import apiClient from '../client.js';

export const getCategories = async () => {
    return apiClient.get('/Categories');
};

export const addCategory = async (categoryData) => {
    return apiClient.post('/AddCategory', categoryData);
};

export const getCategoryById = async (id) => {
    return apiClient.get(`/Category/${id}`);
};

export const updateCategoryById = async (id, categoryData) => {
    return apiClient.put(`/Category/${id}`, categoryData);
};

export const deleteCategoryById = async (id) => {
    return apiClient.delete(`/Category/${id}`);
};

export const getCategoriesMonth = async () => {
    return apiClient.get('/CategoriesMonth');
};
