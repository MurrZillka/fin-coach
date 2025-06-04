// CategoriesPage/utils/goalsPageHandlers.js
import { dataCoordinator } from '../../../dataCoordinator';
import useCategoryStore from '../../../02_stores/categoryStore';
import { categoryFields } from '../config/modalFields';

export const categoriesPageHandlers = ({
                                              categories,
                                              clearError,
                                              openModal,
                                              closeModal,
                                              setModalSubmissionError
                                          }) => {
    // API хендлеры
    const handleAddSubmit = async (formData) => {
        try {
            await dataCoordinator.addCategory(formData);
            closeModal();
        } catch (err) {
            console.error('Error during add category:', err);
            setModalSubmissionError(err.message || 'Произошла ошибка при добавлении категории.');
        }
    };

    const handleEditSubmit = async (id, formData) => {
        try {
            await dataCoordinator.updateCategory(id, formData);
            closeModal();
        } catch (err) {
            console.error('Error during edit category:', err);
            setModalSubmissionError(err.message || 'Произошла ошибка при сохранении изменений.');
        }
    };

    const handleDeleteConfirm = async (id) => {
        try {
            await dataCoordinator.deleteCategory(id);
            closeModal();
        } catch (err) {
            console.error('Error during delete category:', err);
            closeModal();
            throw err;
        }
    };

    // UI хендлеры
    const handleAddClick = () => {
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

    const handleEditClick = (category) => {
        clearError();
        openModal('editCategory', {
            title: 'Редактировать категорию',
            fields: categoryFields,
            initialData: category,
            onSubmit: (formData) => handleEditSubmit(category.id, formData),
            submitText: 'Сохранить изменения',
            onClose: () => {
                closeModal();
                useCategoryStore.getState().clearError();
            }
        });
    };

    const handleDeleteClick = (id) => {
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
