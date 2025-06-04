// CreditsPage/utils/creditsPageHandlers.js
import {dateFormatting} from '../../../07_utils/dateFormatting.js';
import {financialData} from '../../../07_utils/financialData.js';
import {dataCoordinator} from '../../../dataCoordinator';
import useCreditStore from '../../../02_stores/creditStore';
import {getCreditFields} from '../config/modalFields';

export const creditsPageHandlers = ({
                                           clearError,
                                           openModal,
                                           closeModal,
                                           setModalSubmissionError
                                       }) => {
    const {prepareInitialData} = dateFormatting();
    const {prepareDataForSubmit} = financialData();

    // API хендлеры
    const handleAddSubmit = async (formData) => {
        const dataToSend = prepareDataForSubmit(formData, 'is_exhausted');

        try {
            await dataCoordinator.addCredit(dataToSend);
            closeModal();
        } catch (err) {
            console.error('Error during add credit:', err);

            if (err.field) {
                setModalSubmissionError(err);
            } else {
                setModalSubmissionError({message: err.message, field: null});
            }

            useCreditStore.getState().clearError();
        }
    };

    const handleEditSubmit = async (id, formData) => {
        const dataToUpdate = prepareDataForSubmit(formData, 'is_exhausted');

        try {
            await dataCoordinator.updateCredit(id, dataToUpdate);
            closeModal();
        } catch (err) {
            console.error('Error during edit credit:', err);

            if (err.field) {
                setModalSubmissionError(err);
            } else {
                setModalSubmissionError({message: err.message, field: null});
            }

            useCreditStore.getState().clearError();
        }
    };

    const handleDeleteSubmit = async (id) => {
        try {
            await dataCoordinator.deleteCredit(id);
            closeModal();
        } catch (err) {
            console.error('Error during delete credit:', err);
            const errorMessage = err.message === 'Failed to delete credit'
                ? 'Ошибка связи или сервера. Попробуйте позже.'
                : err.message || 'Ошибка при удалении дохода.';
            useCreditStore.getState().setError({message: errorMessage});
            closeModal();
        }
    };

    // UI хендлеры
    const handleAddClick = () => {
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
            onFieldChange: (name, value, prevFormData) => {
                const newFormData = {...prevFormData, [name]: value};
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

    const handleEditClick = (credit) => {
        clearError();
        const initialData = prepareInitialData(credit, 'is_exhausted');

        openModal('editCredit', {
            title: 'Редактировать доход',
            fields: getCreditFields(initialData),
            initialData,
            onSubmit: (formData) => handleEditSubmit(credit.id, formData),
            submitText: 'Сохранить',
            onFieldChange: (name, value, prevFormData) => {
                const newFormData = {...prevFormData, [name]: value};
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

    const handleDeleteClick = (credit) => {
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
