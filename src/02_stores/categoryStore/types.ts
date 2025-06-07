//src/02_stores/categoryStore/types.ts
import type { ApiErrorWithMessage } from '../../01_api/apiTypes';
import type { Category } from '../../01_api/categories/types';

export interface CategoriesMonth {
    [categoryName: string]: number;
}

export interface CategoryColorMap {
    [categoryName: string]: string;
}

export interface CategoryStoreState {
    categories: Category[] | null;
    categoriesMonth: CategoriesMonth | null;
    categoryColorMap: CategoryColorMap;
    nextColorIndex: number;
    loading: boolean;
    error: ApiErrorWithMessage | null;
}

export interface CategoryStoreActions {
    setCategories: (categories: Category[] | null) => void;
    setCategoriesMonth: (categoriesMonth: CategoriesMonth | null) => void;
    setCategoryColorMap: (categoryColorMap: CategoryColorMap) => void;
    setNextColorIndex: (nextColorIndex: number) => void;
    setLoading: (loading: boolean) => void;
    setError: (error: ApiErrorWithMessage | null) => void;
    handleError: (error: any, actionName: string) => never;

    fetchCategories: () => Promise<void>;
    addCategory: (categoryData: any) => Promise<any>;
    updateCategory: (id: number, categoryData: any) => Promise<any>;
    deleteCategory: (id: number) => Promise<any>;
    getCategoriesMonth: () => Promise<void>;
    _updateCategoryColorMap: (allCategories: Category[]) => void;
    resetCategories: () => void;
    clearError: () => void;
}

export type CategoryStore = CategoryStoreState & CategoryStoreActions;
