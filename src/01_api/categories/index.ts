import apiClient from '../client';
import {
    Category,
    GetCategoriesResponse,
    CategoryRequest,
    CategoryActionResponse,
    CategoriesMonthResponse,
} from './types';

// Получить все категории
export const getCategories = async (): Promise<GetCategoriesResponse> => {
    const response = await apiClient.get<GetCategoriesResponse>('/Categories');
    return response.data;
}

// Добавить категорию
export const addCategory = async (categoryData: CategoryRequest): Promise<CategoryActionResponse> => {
    const response = await apiClient.post<CategoryActionResponse>('/AddCategory', categoryData);
    return response.data;
}

// Получить категорию по id
export const getCategoryById = async (id: number): Promise<Category> => {
    const response = await apiClient.get<Category>(`/Category/${id}`);
    return response.data;
}

// Обновить категорию по id
export const updateCategoryById = async (id: number, categoryData: CategoryRequest): Promise<CategoryActionResponse> => {
    const response = await apiClient.put<CategoryActionResponse>(`/Category/${id}`, categoryData);
    return response.data;
}

// Удалить категорию по id
export const deleteCategoryById = async (id: number): Promise<CategoryActionResponse> => {
    const response = await apiClient.delete<CategoryActionResponse>(`/Category/${id}`);
    return response.data;
}

// Получить категории за месяц
export const getCategoriesMonth = async (): Promise<CategoriesMonthResponse> => {
    const response = await apiClient.get<CategoriesMonthResponse>('/CategoriesMonth');
    return response.data;
}
