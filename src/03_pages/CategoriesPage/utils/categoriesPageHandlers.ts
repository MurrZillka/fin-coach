//03_pages/CategoriesPage/utils/categoriesPageHandlers.ts
import { dataCoordinator } from '../../../dataCoordinator';
import useCategoryStore from '../../../02_stores/categoryStore/categoryStore';
import { categoryFields } from '../config/modalFields';
import type { Category, CategoryRequest } from '../../../01_api/categories/types';

// Типы для параметров хендлеров
export interface CategoriesPageHandlersParams {
    categories: Category[] | null;
    clearError: () => void;
    openModal: (modalType: string, config: ModalConfig) => void;
    closeModal: () => void;
    setModalSubmissionError: (error: string) => void;
}

// Типы для конфигурации модальных окон
export interface ModalConfig {
    title: string;
    fields?: any[];
    initialData?: any;
    onSubmit?: (formData: any) => Promise<void>;
    submitText?: string;
    onClose?: () => void;
    message?: string;
    onConfirm?: () => Promise<void>;
    confirmText?: string;
}

// Типы для возвращаемых хендлеров
export interface CategoriesPageHandlers {
    handleAddClick: () => void;
    handleEditClick: (category: { id: string | number; name: string }) => void;
    handleDeleteClick: (id: string | number) => void;
}

export const categoriesPageHandlers = ({
    categories,
    clearError,
    openModal,
    closeModal,
    setModalSubmissionError
}: CategoriesPageHandlersParams): CategoriesPageHandlers => {
    // API хендлеры
    const handleAddSubmit = async (formData: CategoryRequest): Promise<void> => {
        try {
            await dataCoordinator.addCategory(formData);
            closeModal();
        } catch (err: any) {
            console.error('Error during add category:', err);
            setModalSubmissionError(err.message || 'Произошла ошибка при добавлении категории.');
        }
    };

    const handleEditSubmit = async (id: string | number, formData: CategoryRequest): Promise<void> => {
        try {
            await dataCoordinator.updateCategory(id, formData);
            closeModal();
        } catch (err: any) {
            console.error('Error during edit category:', err);
            setModalSubmissionError(err.message || 'Произошла ошибка при сохранении изменений.');
        }
    };

    const handleDeleteConfirm = async (id: string | number): Promise<void> => {
        try {
            await dataCoordinator.deleteCategory(id);
            closeModal();
        } catch (err: any) {
            console.error('Error during delete category:', err);
            closeModal();
            throw err;
        }
    };

    // UI хендлеры
    const handleAddClick = (): void => {
        clearError();
        openModal('addCategory', {
            title: 'Добавить категорию',
            fields: categoryFields,
            initialData: {},
            onSubmit: handleAddSubmit,
            submitText: 'Добавить',
            onClose: () => {
                closeModal();
                useCategoryStore.getState().clearError();
            }
        });
    };

    const handleEditClick = (category: { id: string | number; name: string }): void => {
        clearError();
        openModal('editCategory', {
            title: 'Редактировать категорию',
            fields: categoryFields,
            initialData: category,
            onSubmit: (formData: CategoryRequest) => handleEditSubmit(category.id, formData),
            submitText: 'Сохранить изменения',
            onClose: () => {
                closeModal();
                useCategoryStore.getState().clearError();
            }
        });
    };

    const handleDeleteClick = (id: string | number): void => {
        clearError();
        const category = categories !== null ? categories.find(cat => cat.id === id) : null;
        const categoryName = category ? category.name : 'эту категорию';

        openModal('confirmDelete', {
            title: 'Подтверждение удаления',
            message: `Вы уверены, что хотите удалить "${categoryName}"?`,
            onConfirm: () => handleDeleteConfirm(id),
            confirmText: 'Удалить',
        });
    };

    return {
        handleAddClick,
        handleEditClick,
        handleDeleteClick
    };
};
