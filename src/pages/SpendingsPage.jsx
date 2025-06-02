import React from 'react';
import Text from '../components/ui/Text';
import TextButton from '../components/ui/TextButton';
import useSpendingsStore from '../stores/spendingsStore';
import useCategoryStore from '../stores/categoryStore';
import useModalStore from '../stores/modalStore.js';
import SpendingCardList from '../components/mobile/SpendingCardList.jsx';
import {dataCoordinator} from '../dataCoordinator.js';
import SpendingAmountCell from "../components/ui/cells/SpendingAmountCell.jsx";
import SimpleTextCell from "../components/ui/cells/SimpleTextCell.jsx";
import CategoryCell from "../components/ui/cells/CategoryCell.jsx";
import DateCell from "../components/ui/cells/DateCell.jsx";
import SpendingStatusCell from "../components/ui/cells/SpendingStatusCell.jsx";
import ActionsCell from "../components/ui/cells/ActionsCell.jsx";
import Table from "../components/ui/Table.jsx";

// Формируем динамические поля для модалки расходов
function getSpendingFields(formData, categories) {
    const isPermanent = !!formData.is_permanent;
    const isFinished = !!formData.is_finished;

    const categoryOptions = (categories || []).map(category => ({
        value: category.id,
        label: category.name,
    }));

    const fields = [
        {name: 'amount', label: 'Сумма', required: true, type: 'number', placeholder: 'Например: 1500'},
        {
            name: 'description',
            label: 'Описание',
            required: false,
            type: 'text',
            placeholder: 'Например: Продукты из магазина'
        },
        {name: 'category_id', label: 'Категория', required: true, type: 'select', options: categoryOptions},
        {name: 'is_permanent', label: 'Регулярный расход?', required: false, type: 'checkbox'},
        {name: 'date', label: isPermanent ? 'Дата начала расхода' : 'Дата расхода', required: true, type: 'date'},
    ];

    if (isPermanent) {
        fields.push({
            name: 'is_finished',
            label: 'Этот расход завершён?',
            required: false,
            type: 'checkbox',
        });
        fields.push({
            name: 'end_date',
            label: 'Дата окончания расхода',
            required: false,
            type: 'date',
            disabled: !isFinished,
        });
    }
    return fields;
}

export default function SpendingsPage() {
    const {
        spendings, loading, error, clearError
    } = useSpendingsStore();
    const {
        categories, loading: categoriesLoading, error: categoriesError,
        clearError: clearCategoriesError
    } = useCategoryStore();
    const {openModal, closeModal, submissionError, setModalSubmissionError, modalType} = useModalStore();

    const handleAddClick = () => {
        clearError();
        clearCategoriesError();
        const initialData = {is_permanent: false, is_finished: false, date: '', end_date: ''};
        openModal('addSpending', {
            title: 'Добавить расход',
            fields: getSpendingFields(initialData, categories),
            initialData,
            onSubmit: handleAddSubmit,
            submitText: 'Добавить',
            onFieldChange: (name, value, prevFormData) => {
                const newFormData = {...prevFormData, [name]: value};
                if (name === 'is_permanent') {
                    if (!value) {
                        newFormData.is_finished = false;
                        newFormData.end_date = '';
                    }
                } else if (name === 'is_finished' && !value) {
                    newFormData.end_date = '';
                }
                return getSpendingFields(newFormData, categories);
            },
            submissionError,
            onClose: () => {
                closeModal();
                useSpendingsStore.getState().clearError();
            }
        });
    };

    const handleEditClick = (spending) => {
        clearError();
        clearCategoriesError();
        const initialData = {
            ...spending,
            date: (spending.date && spending.date !== '0001-01-01' && spending.date !== '0001-01-01T00:00:00Z')
                ? new Date(spending.date).toISOString().split('T')[0]
                : '',
            end_date: (spending.end_date && spending.end_date !== '0001-01-01' && spending.end_date !== '0001-01-01T00:00:00Z')
                ? new Date(spending.end_date).toISOString().split('T')[0]
                : '',
            is_finished: !!spending.end_date && spending.end_date !== '0001-01-01T00:00:00Z' && spending.end_date !== '0001-01-01',
        };
        openModal('editSpending', {
            title: 'Редактировать расход',
            fields: getSpendingFields(initialData, categories),
            initialData,
            onSubmit: (formData) => handleEditSubmit(spending.id, formData),
            submitText: 'Сохранить изменения',
            onFieldChange: (name, value, prevFormData) => {
                const newFormData = {...prevFormData, [name]: value};
                if (name === 'is_permanent') {
                    if (!value) {
                        newFormData.is_finished = false;
                        newFormData.end_date = '';
                    }
                } else if (name === 'is_finished' && !value) {
                    newFormData.end_date = '';
                }
                return getSpendingFields(newFormData, categories);
            },
            submissionError,
            onClose: () => {
                closeModal();
                useSpendingsStore.getState().clearError();
            }
        });
    };

    const handleDeleteClick = (spending) => {
        clearError();
        clearCategoriesError();
        const spendingDescription = spending.description || `с ID ${spending.id}`;
        const formattedAmount = typeof spending.amount === 'number'
            ? spending.amount.toLocaleString('ru-RU', {minimumFractionDigits: 2, maximumFractionDigits: 2})
            : spending.amount;
        const message = `Вы уверены, что хотите удалить расход "${spendingDescription}" на сумму ${formattedAmount} ₽?`;

        openModal('confirmDelete', {
            title: 'Подтверждение удаления',
            message,
            onConfirm: () => handleDeleteConfirm(spending.id),
            confirmText: 'Удалить',
            onClose: () => {
                closeModal();
            }
        });
    };

    const handleAddSubmit = async (formData) => {
        const dataToSend = {...formData};
        if (dataToSend.is_permanent) {
            if (!dataToSend.is_finished) {
                dataToSend.end_date = '0001-01-01';
            }
        } else {
            dataToSend.end_date = '0001-01-01';
        }

        try {
            await dataCoordinator.addSpending(dataToSend);
            closeModal();
        } catch (err) {
            console.error('Error during add spending:', err);

            // Используем новую структуру ошибок
            if (err.field) {
                setModalSubmissionError(err);
            } else {
                setModalSubmissionError({message: err.message, field: null});
            }

            useSpendingsStore.getState().clearError();
        }
    };

    const handleEditSubmit = async (id, formData) => {
        const dataToUpdate = {...formData};
        if (dataToUpdate.is_permanent) {
            if (!dataToUpdate.is_finished) {
                dataToUpdate.end_date = '0001-01-01';
            }
        } else {
            dataToUpdate.end_date = '0001-01-01';
        }

        try {
            await dataCoordinator.updateSpending(id, dataToUpdate);
            closeModal();
        } catch (err) {
            console.error('Error during edit spending:', err);

            if (err.field) {
                setModalSubmissionError(err);
            } else {
                setModalSubmissionError({message: err.message, field: null});
            }

            useSpendingsStore.getState().clearError();
        }
    };

    const handleDeleteConfirm = async (id) => {
        try {
            await dataCoordinator.deleteSpending(id);
            closeModal();
        } catch (err) {
            console.error('Error during delete spending:', err);
            useSpendingsStore.getState().setError({message: err.message || 'Ошибка при удалении расхода.'});
            closeModal();
        }
    };

    const displayError = error || categoriesError;
    // Создать конфигурацию колонок
    const spendingColumns = [
        {
            key: 'amount',
            header: 'Сумма',
            component: SpendingAmountCell,
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
            key: 'category',
            header: 'Категория',
            component: CategoryCell,
            props: {categories}, // Передаем categories
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
            component: SpendingStatusCell,
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


    // В SpendingsPage.jsx - полная секция JSX после определения переменных

    const renderContent = () => {
        // Early return для первичной загрузки
        if ((loading && spendings === null) || (categoriesLoading && categories === null)) {
            return (
                <div className="text-center p-4">
                    <Text variant="body">Загрузка данных...</Text>
                </div>
            );
        }

        // Early return для пустого списка
        if (spendings !== null && spendings.length === 0 && categories !== null) {
            return (
                <div className="p-4 text-center">
                    <Text variant="body">У вас пока нет добавленных расходов.</Text>
                </div>
            );
        }

        // Рендер списка расходов
        if (spendings !== null && spendings.length > 0 && categories !== null) {
            return (
                <>
                    {/* Десктопная таблица */}
                    <Table
                        data={spendings}
                        columns={spendingColumns}
                        loading={loading}
                        emptyMessage="У вас пока нет добавленных расходов."
                        className="hidden md:table"
                    />

                    {/* Мобильный список карточек */}
                    <SpendingCardList
                        className="block md:hidden"
                        spendings={spendings}
                        handleEditClick={handleEditClick}
                        handleDeleteClick={handleDeleteClick}
                        categories={categories}
                    />

                    {/* Индикатор фоновой загрузки */}
                    {((loading && spendings !== null) || (categoriesLoading && categories !== null)) && (
                        <div className="text-center mt-4">
                            <Text variant="body">Обновление данных...</Text>
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
                {/* Заголовок страницы и кнопка "Добавить расход" */}
                <div className="flex justify-between items-center">
                    <Text variant="h2">Мои расходы</Text>
                    <TextButton onClick={handleAddClick}>
                        Добавить расход
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