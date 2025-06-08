//03_pages/CreditsPage/utils/creditsPageHandlers.ts
import { dateFormatting } from '../../../07_utils/dateFormatting';
import { financialData } from '../../../07_utils/financialData';
import { dataCoordinator } from '../../../dataCoordinator';
import useCreditStore from '../../../02_stores/creditsStore/creditStore';
import { getCreditFields } from '../config/modalFields';
import type { Credit, CreditRequest } from '../../../01_api/credit/types';
import type { CreditFormData } from '../config/modalFields';

// Типы для параметров хендлеров
export interface CreditsPageHandlersParams {
    clearError: () => void;
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
export interface CreditsPageHandlers {
    handleAddClick: () => void;
    handleEditClick: (credit: Credit) => void;
    handleDeleteClick: (credit: Credit) => void;
}

export const creditsPageHandlers = ({
                                        clearError,
                                        openModal,
                                        closeModal,
                                        setModalSubmissionError
                                    }: CreditsPageHandlersParams): CreditsPageHandlers => {
    const { prepareInitialData } = dateFormatting();
    const { prepareDataForSubmit } = financialData();

    // API хендлеры
    const handleAddSubmit = async (formData: CreditFormData): Promise<void> => {
        const dataToSend = prepareDataForSubmit(formData, 'is_exhausted');

        try {
            await dataCoordinator.addCredit(dataToSend);
            closeModal();
        } catch (err: any) {
            console.error('Error during add credit:', err);

            if (err.field) {
                setModalSubmissionError(err);
            } else {
                setModalSubmissionError({ message: err.message, field: null });
            }

            useCreditStore.getState().clearError();
        }
    };

    const handleEditSubmit = async (id: number, formData: CreditFormData): Promise<void> => {
        const dataToUpdate = prepareDataForSubmit(formData, 'is_exhausted');

        try {
            await dataCoordinator.updateCredit(id, dataToUpdate);
            closeModal();
        } catch (err: any) {
            console.error('Error during edit credit:', err);

            if (err.field) {
                setModalSubmissionError(err);
            } else {
                setModalSubmissionError({ message: err.message, field: null });
            }

            useCreditStore.getState().clearError();
        }
    };

    const handleDeleteSubmit = async (id: number): Promise<void> => {
        try {
            await dataCoordinator.deleteCredit(id);
            closeModal();
        } catch (err: any) {
            console.error('Error during delete credit:', err);
            const errorMessage = err.message === 'Failed to delete credit'
                ? 'Ошибка связи или сервера. Попробуйте позже.'
                : err.message || 'Ошибка при удалении дохода.';

            // Исправлено: передаем полный CreditFieldError
            useCreditStore.getState().setError({
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
        const initialData = {
            is_permanent: false,
            is_exhausted: false,
            date: '',
            end_date: ''
        };

        openModal('addCredit', {
            title: 'Добавить доход',
            fields: getCreditFields(initialData),
            initialData,
            onSubmit: handleAddSubmit,
            submitText: 'Добавить',
            onFieldChange: (name: string, value: any, prevFormData: any) => {
                const newFormData = { ...prevFormData, [name]: value };
                if (name === 'is_permanent' && !value) {
                    newFormData.is_exhausted = false;
                    newFormData.end_date = '';
                } else if (name === 'is_exhausted' && !value) {
                    newFormData.end_date = '';
                }
                return getCreditFields(newFormData);
            },
            onClose: () => {
                closeModal();
                clearError();
            }
        });
    };

    const handleEditClick = (credit: Credit): void => {
        clearError();
        const initialData = prepareInitialData(credit, 'is_exhausted');

        openModal('editCredit', {
            title: 'Редактировать доход',
            fields: getCreditFields(initialData),
            initialData,
            onSubmit: (formData: CreditFormData) => handleEditSubmit(credit.id, formData),
            submitText: 'Сохранить',
            onFieldChange: (name: string, value: any, prevFormData: any) => {
                const newFormData = { ...prevFormData, [name]: value };
                if (name === 'is_permanent' && !value) {
                    newFormData.is_exhausted = false;
                    newFormData.end_date = '';
                } else if (name === 'is_exhausted' && !value) {
                    newFormData.end_date = '';
                }
                return getCreditFields(newFormData);
            },
            onClose: () => {
                closeModal();
                clearError();
            }
        });
    };

    const handleDeleteClick = (credit: Credit): void => {
        clearError();
        openModal('confirmDelete', {
            title: 'Подтверждение удаления',
            message: `Вы уверены, что хотите удалить доход "${credit.description}"?`,
            onConfirm: () => handleDeleteSubmit(credit.id),
            confirmText: 'Удалить',
        });
    };

    return {
        handleAddClick,
        handleEditClick,
        handleDeleteClick
    };
};
