import React from 'react';
import Text from '../components/ui/Text';
import useCreditStore from '../stores/creditStore';
import useModalStore from '../stores/modalStore.js';
import CreditCardList from '../components/mobile/CreditCardList.jsx';
import {dataCoordinator} from '../dataCoordinator.js';
import CreditAmountCell from "../components/ui/cells/CreditAmountCell.jsx";
import SimpleTextCell from "../components/ui/cells/SimpleTextCell.jsx";
import DateCell from "../components/ui/cells/DateCell.jsx";
import ActionsCell from "../components/ui/cells/ActionsCell.jsx";
import Table from "../components/ui/Table.jsx";
import CreditStatusCell from "../components/ui/cells/CreditStatusCell.jsx";
import TextButton from "../components/ui/TextButton.jsx";
import {useDateFormatting} from "../hooks/useDateFormatting.js";
import {useFinancialData} from "../hooks/useFinancialData.js";

// Динамическое формирование полей (без изменений)
function getCreditFields(formData) {
    const isPermanent = !!formData.is_permanent;
    const isExhausted = !!formData.is_exhausted;

    const fields = [
        {name: 'amount', label: 'Сумма', required: true, type: 'number', placeholder: 'Например: 50000'},
        {
            name: 'description',
            label: 'Описание',
            required: false,
            type: 'text',
            placeholder: 'Например: Зарплата за месяц'
        },
        {name: 'is_permanent', label: 'Постоянный доход?', required: false, type: 'checkbox'},
        {
            name: 'date',
            label: isPermanent ? 'Дата начала получения дохода' : 'Дата получения дохода',
            required: true,
            type: 'date'
        },
    ];

    if (isPermanent) {
        fields.push({
            name: 'is_exhausted',
            label: 'Этот источник иссяк?',
            required: false,
            type: 'checkbox',
        });
        fields.push({
            name: 'end_date',
            label: 'Дата окончания доходов из этого источника',
            required: false,
            type: 'date',
            disabled: !isExhausted,
        });
    }

    return fields;
}

export default function CreditsPage() {
    const {credits, loading, error, clearError} = useCreditStore();
    const {openModal, closeModal, setModalSubmissionError, modalType} = useModalStore();
    const { prepareInitialData } = useDateFormatting();
    const { prepareDataForSubmit } = useFinancialData();

    const handleAddClick = () => {
        clearError();
        const initialData = {is_permanent: false, is_exhausted: false, date: '', end_date: ''};
        openModal('addCredit', {
            title: 'Добавить доход',
            fields: getCreditFields(initialData),
            initialData,
            onSubmit: handleAddSubmit,
            submitText: 'Добавить',
            onFieldChange: (name, value, prevFormData) => {
                const newFormData = {...prevFormData, [name]: value};
                if (name === 'is_permanent') {
                    if (!value) {
                        newFormData.is_exhausted = false;
                        newFormData.end_date = '';
                    }
                } else if (name === 'is_exhausted' && !value) {
                    newFormData.end_date = '';
                }
                return getCreditFields(newFormData);
            },
            onClose: () => {
                closeModal();
                useCreditStore.getState().clearError();
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
            submitText: 'Сохранить изменения',
            onFieldChange: (name, value, prevFormData) => {
                const newFormData = {...prevFormData, [name]: value};
                if (name === 'is_permanent') {
                    if (!value) {
                        newFormData.is_exhausted = false;
                        newFormData.end_date = '';
                    }
                } else if (name === 'is_exhausted' && !value) {
                    newFormData.end_date = '';
                }
                return getCreditFields(newFormData);
            },
            onClose: () => {
                closeModal();
                useCreditStore.getState().clearError();
            }
        });
    };

    const handleDeleteClick = (credit) => {
        clearError();
        const creditDescription = credit.description || `с ID ${credit.id}`;
        const amountToFormat = credit.is_permanent && typeof credit.full_amount === 'number'
            ? credit.full_amount
            : credit.amount;
        const formattedAmount = typeof amountToFormat === 'number'
            ? amountToFormat.toLocaleString('ru-RU', {minimumFractionDigits: 2, maximumFractionDigits: 2})
            : amountToFormat;
        const message = `Вы уверены, что хотите удалить доход "${creditDescription}" на сумму ${formattedAmount} ₽?`;

        openModal('confirmDelete', {
            title: 'Подтверждение удаления',
            message,
            onConfirm: () => handleDeleteConfirm(credit.id),
            confirmText: 'Удалить',
        });
    };

    const handleAddSubmit = async (formData) => {
        // ✅ Логика обработки дат остается
        const dataToSend = prepareDataForSubmit(formData, 'is_exhausted');

        try {
            await dataCoordinator.addCredit(dataToSend); // ← Используем dataToSend, не formData
            closeModal();
        } catch (err) {
            console.error('Error during add credit:', err);

            // ✅ Новая логика обработки ошибок
            if (err.field) {
                setModalSubmissionError(err);
            } else {
                setModalSubmissionError({message: err.message, field: null});
            }

            useCreditStore.getState().clearError();
        }
    };

    const handleEditSubmit = async (id, formData) => {
        // ✅ Логика обработки дат остается
        const dataToUpdate = prepareDataForSubmit(formData, 'is_exhausted');

        try {
            await dataCoordinator.updateCredit(id, dataToUpdate); // ← Используем dataToUpdate
            closeModal();
        } catch (err) {
            console.error('Error during edit credit:', err);

            // ✅ Новая логика обработки ошибок
            if (err.field) {
                setModalSubmissionError(err);
            } else {
                setModalSubmissionError({message: err.message, field: null});
            }

            useCreditStore.getState().clearError();
        }
    };

    const handleDeleteConfirm = async (id) => {
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

    const displayError = error;

    const creditColumns = [
        {
            key: 'amount',
            header: 'Сумма',
            component: CreditAmountCell,
            cellClassName: 'px-2 py-4'
        },
        {
            key: 'description',
            header: 'Описание',
            component: SimpleTextCell,
            props: {field: 'description', variant: 'tdSecondary'},
            cellClassName: 'px-2 py-4'
        },
        {
            key: 'date',
            header: 'Дата начала',
            component: DateCell,
            props: {field: 'date', variant: 'tdSecondary'},
            cellClassName: 'px-2 py-4'
        },
        {
            key: 'status',
            header: 'Статус',
            component: CreditStatusCell,
            cellClassName: 'px-2 py-4 max-w-[100px]'
        },
        {
            key: 'actions',
            header: 'Действия',
            component: ActionsCell,
            props: {
                actions: ['edit', 'delete'],
                onEdit: handleEditClick,
                onDelete: handleDeleteClick
            },
            cellClassName: 'px-2 py-4'
        }
    ];


    const renderContent = () => {
        // Early return для первичной загрузки
        if (loading && credits === null) {
            return (
                <div className="text-center p-4">
                    <Text variant="body">Загрузка доходов...</Text>
                </div>
            );
        }

        // Early return для пустого списка
        if (credits !== null && credits.length === 0) {
            return (
                <div className="p-4 text-center">
                    <Text variant="body">У вас пока нет добавленных доходов.</Text>
                </div>
            );
        }

        // Рендер списка доходов
        if (credits !== null && credits.length > 0) {
            return (
                <>
                    {/* Десктопная таблица */}
                    <Table
                        data={credits}
                        columns={creditColumns}
                        loading={loading}
                        emptyMessage="У вас пока нет добавленных доходов."
                        className="hidden md:table"
                    />

                    {/* Мобильный список карточек */}
                    <CreditCardList
                        className="block md:hidden"
                        credits={credits}
                        handleEditClick={handleEditClick}
                        handleDeleteClick={handleDeleteClick}
                    />

                    {/* Индикатор фоновой загрузки */}
                    {loading && (
                        <div className="text-center mt-4">
                            <Text variant="body">Обновление списка доходов...</Text>
                        </div>
                    )}
                </>
            );
        }

        return null;
    };

    return (
        <div className="bg-secondary-50">
            <main className="max-w-7xl mx-auto p-4">
                {/* Заголовок страницы и кнопка "Добавить доход" */}
                <div className="flex justify-between items-center">
                    <Text variant="h2">Мои доходы</Text>
                    <TextButton onClick={handleAddClick}>
                        Добавить доход
                    </TextButton>
                </div>

                {/* Отображаем общую ошибку из стора */}
                {displayError && modalType === null && (
                    <div className="mb-4 p-3 bg-red-100 border border-red-300 text-gray-800 rounded-md">
                        {displayError.message}
                    </div>
                )}

                {/* Основная область контента */}
                <div className="p-4">
                    {renderContent()}
                </div>
            </main>
        </div>
    );
}