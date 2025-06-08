// 03_pages/SpendingsPage/utils/spendingsPageHandlers.ts
import {dateFormatting} from '../../../07_utils/dateFormatting';
import {financialData} from '../../../07_utils/financialData';
import {dataCoordinator} from '../../../dataCoordinator';
import useSpendingsStore from '../../../02_stores/spendingsStore/spendingsStore';
import type {SpendingFormData} from '../config/modalFields';
import {getSpendingFields} from '../config/modalFields';
import type {Spending} from '../../../01_api/spendings/types';
import type {Category} from '../../../01_api/categories/types';

// Типы для параметров хендлеров
export interface SpendingsPageHandlersParams {
    categories: Category[] | null;
    clearError: () => void;
    clearCategoriesError: () => void;
    openModal: (modalType: string, config: ModalConfig) => void;
    closeModal: () => void;
    setModalSubmissionError: (error: any) => void;
}

// Типы для конфигурации модальных окон
export interface ModalConfig {
    title: string;
    fields?: any[];
    initialData?: any;
    onSubmit?: (formData: any) => Promise<void>;
    submitText?: string;
    onFieldChange?: (name: string, value: any, prevFormData: any) => any[];
    onClose?: () => void;
    message?: string;
    onConfirm?: () => Promise<void>;
    confirmText?: string;
}

// Типы для возвращаемых хендлеров
export interface SpendingsPageHandlers {
    handleAddClick: () => void;
    handleEditClick: (spending: Spending) => void;
    handleDeleteClick: (spending: Spending) => void;
}

export const spendingsPageHandlers = ({
    categories,
    clearError,
    clearCategoriesError,
    openModal,
    closeModal,
    setModalSubmissionError
}: SpendingsPageHandlersParams): SpendingsPageHandlers => {
    const { prepareInitialData } = dateFormatting();
    const { prepareDataForSubmit } = financialData();

    // API хендлеры
    const handleAddSubmit = async (formData: SpendingFormData): Promise<void> => {
        const dataToSend = prepareDataForSubmit(formData, 'is_finished');

        try {
            await dataCoordinator.addSpending(dataToSend);
            closeModal();
        } catch (err: any) {
            console.error('Error during add spending:', err);

            if (err.field) {
                setModalSubmissionError(err);
            } else {
                setModalSubmissionError({ message: err.message, field: null });
            }

            useSpendingsStore.getState().clearError();
        }
    };

    const handleEditSubmit = async (id: number, formData: SpendingFormData): Promise<void> => {
        const dataToUpdate = prepareDataForSubmit(formData, 'is_finished');

        try {
            await dataCoordinator.updateSpending(id, dataToUpdate);
            closeModal();
        } catch (err: any) {
            console.error('Error during edit spending:', err);

            if (err.field) {
                setModalSubmissionError(err);
            } else {
                setModalSubmissionError({ message: err.message, field: null });
            }

            useSpendingsStore.getState().clearError();
        }
    };

    const handleDeleteSubmit = async (id: number): Promise<void> => {
        try {
            await dataCoordinator.deleteSpending(id);
            closeModal();
        } catch (err: any) {
            console.error('Error during delete spending:', err);
            const errorMessage = err.message === 'Failed to delete spending'
                ? 'Ошибка связи или сервера. Попробуйте позже.'
                : err.message || 'Ошибка при удалении расхода.';

            // Исправлено: передаем полный SpendingFieldError
            useSpendingsStore.getState().setError({
                message: errorMessage,
                field: null,
                status: 500
            });
            closeModal();
        }
    };

    // UI хендлеры
    const handleAddClick = (): void => {
        clearError();
        clearCategoriesError();
        const initialData = {
            is_permanent: false,
            is_finished: false,
            date: '',
            end_date: '',
            category_id: categories && categories.length > 0 ? categories[0].id : 0
        };

        openModal('addSpending', {
            title: 'Добавить расход',
            fields: getSpendingFields(initialData, categories),
            initialData,
            onSubmit: handleAddSubmit,
            submitText: 'Добавить',
            onFieldChange: (name: string, value: any, prevFormData: any) => {
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

    const handleEditClick = (spending: Spending): void => {
        clearError();
        clearCategoriesError();
        const initialData = prepareInitialData(spending, 'is_finished');

        openModal('editSpending', {
            title: 'Редактировать расход',
            fields: getSpendingFields(initialData, categories),
            initialData,
            onSubmit: (formData: SpendingFormData) => handleEditSubmit(spending.id, formData),
            submitText: 'Сохранить',
            onFieldChange: (name: string, value: any, prevFormData: any) => {
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

    const handleDeleteClick = (spending: Spending): void => {
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
