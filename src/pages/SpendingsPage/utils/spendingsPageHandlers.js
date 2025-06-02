// SpendingsPage/utils/creditsPageHandlers.js
import {dateFormatting} from '../../../utils/dateFormatting.js';
import {financialData} from '../../../utils/financialData.js';
import {dataCoordinator} from '../../../dataCoordinator';
import useSpendingsStore from '../../../stores/spendingsStore';
import {getSpendingFields} from '../config/modalFields';

export const spendingsPageHandlers = ({
                                             categories,
                                             clearError,
                                             clearCategoriesError,
                                             openModal,
                                             closeModal,
                                             setModalSubmissionError
                                         }) => {
    const { prepareInitialData } = dateFormatting();
    const { prepareDataForSubmit } = financialData();

    // API хендлеры
    const handleAddSubmit = async (formData) => {
        const dataToSend = prepareDataForSubmit(formData, 'is_finished');

        try {
            await dataCoordinator.addSpending(dataToSend);
            closeModal();
        } catch (err) {
            console.error('Error during add spending:', err);

            if (err.field) {
                setModalSubmissionError(err);
            } else {
                setModalSubmissionError({ message: err.message, field: null });
            }

            useSpendingsStore.getState().clearError();
        }
    };

    const handleEditSubmit = async (id, formData) => {
        const dataToUpdate = prepareDataForSubmit(formData, 'is_finished');

        try {
            await dataCoordinator.updateSpending(id, dataToUpdate);
            closeModal();
        } catch (err) {
            console.error('Error during edit spending:', err);

            if (err.field) {
                setModalSubmissionError(err);
            } else {
                setModalSubmissionError({ message: err.message, field: null });
            }

            useSpendingsStore.getState().clearError();
        }
    };

    const handleDeleteSubmit = async (id) => {
        try {
            await dataCoordinator.deleteSpending(id);
            closeModal();
        } catch (err) {
            console.error('Error during delete spending:', err);
            const errorMessage = err.message === 'Failed to delete spending'
                ? 'Ошибка связи или сервера. Попробуйте позже.'
                : err.message || 'Ошибка при удалении расхода.';
            useSpendingsStore.getState().setError({ message: errorMessage });
            closeModal();
        }
    };

    // UI хендлеры
    const handleAddClick = () => {
        clearError();
        clearCategoriesError();
        const initialData = {
            is_permanent: false,
            is_finished: false,
            date: '',
            end_date: '',
            category_id: categories && categories.length > 0 ? categories[0].id : ''
        };

        openModal('addSpending', {
            title: 'Добавить расход',
            fields: getSpendingFields(initialData, categories),
            initialData,
            onSubmit: handleAddSubmit,
            submitText: 'Добавить',
            onFieldChange: (name, value, prevFormData) => {
                const newFormData = { ...prevFormData, [name]: value };
                if (name === 'is_permanent' && !value) {
                    newFormData.is_finished = false;
                    newFormData.end_date = '';
                } else if (name === 'is_finished' && !value) {
                    newFormData.end_date = '';
                }
                return getSpendingFields(newFormData, categories);
            },
            onClose: () => {
                closeModal();
                clearError();
            }
        });
    };

    const handleEditClick = (spending) => {
        clearError();
        clearCategoriesError();
        const initialData = prepareInitialData(spending, 'is_finished');

        openModal('editSpending', {
            title: 'Редактировать расход',
            fields: getSpendingFields(initialData, categories),
            initialData,
            onSubmit: (formData) => handleEditSubmit(spending.id, formData),
            submitText: 'Сохранить',
            onFieldChange: (name, value, prevFormData) => {
                const newFormData = { ...prevFormData, [name]: value };
                if (name === 'is_permanent' && !value) {
                    newFormData.is_finished = false;
                    newFormData.end_date = '';
                } else if (name === 'is_finished' && !value) {
                    newFormData.end_date = '';
                }
                return getSpendingFields(newFormData, categories);
            },
            onClose: () => {
                closeModal();
                clearError();
            }
        });
    };

    const handleDeleteClick = (spending) => {
        clearError();
        clearCategoriesError();
        openModal('confirmDelete', {
            title: 'Подтверждение удаления',
            message: `Вы уверены, что хотите удалить расход "${spending.description}"?`,
            onConfirm: () => handleDeleteSubmit(spending.id),
            confirmText: 'Удалить',
        });
    };

    return {
        handleAddClick,
        handleEditClick,
        handleDeleteClick
    };
};
