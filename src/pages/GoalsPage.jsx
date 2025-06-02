// src/pages/GoalsPage.jsx
import React from 'react';
import Text from '../components/ui/Text';
import TextButton from '../components/ui/TextButton';
import useGoalsStore from '../stores/goalsStore';
import useModalStore from '../stores/modalStore.js';
import useBalanceStore from '../stores/balanceStore';
import GoalsCardList from '../components/mobile/GoalsCardList.jsx';
import {dataCoordinator} from '../dataCoordinator.js';
import GoalDescriptionCell from "../components/ui/cells/GoalDescriptionCell.jsx";
import CurrencyCell from "../components/ui/cells/CurrencyCell.jsx";
import DateCell from "../components/ui/cells/DateCell.jsx";
import GoalActionsCell from "../components/ui/cells/GoalActionsCell.jsx";
import Table from "../components/ui/Table.jsx";

const goalFields = [
    {
        name: 'description',
        label: 'Описание цели',
        required: true,
        type: 'text',
        placeholder: 'Например: Накопить на отпуск'
    },
    {name: 'amount', label: 'Целевая сумма', required: true, type: 'number', placeholder: 'Например: 150000'},
    {name: 'wish_date', label: 'Желаемая дата', required: true, type: 'date'},
];


export default function GoalsPage() {
    const {
        goals, loading, error,
        currentGoal,
        clearError,
    } = useGoalsStore();

    // --- ДОБАВЛЕНО: Получаем баланс и статус его загрузки ---
    const {balance, isLoading: isBalanceLoading} = useBalanceStore();
    // --- Конец ДОБАВЛЕННОГО ---

    const {openModal, closeModal} = useModalStore();
    // --- Handlers for UI actions (opening modals/confirmations) ---
    const handleAddClick = () => {
        // console.log('GoalsPage: Add Goal button clicked');
        clearError();

        openModal('addGoal', {
            title: 'Добавить цель',
            fields: goalFields,
            initialData: {},
            onSubmit: handleAddSubmit,
            submitText: 'Добавить',
        });
    };

    const handleEditClick = (goal) => {
        // console.log('GoalsPage: Edit button clicked for goal:', goal);
        clearError();

        openModal('editGoal', {
            title: 'Редактировать цель',
            fields: goalFields,
            initialData: {
                ...goal,
                wish_date: goal.wish_date && goal.wish_date !== "0001-01-01T00:00:00Z"
                    ? new Date(goal.wish_date).toISOString().split('T')[0]
                    : '',
            },
            onSubmit: (formData) => handleEditSubmit(goal.id, formData),
            submitText: 'Сохранить изменения',
        });
        // console.log('GoalsPage: Calling openModal for Edit Goal...');
    };

    const handleDeleteClick = (goal) => {
        // console.log(`GoalsPage: Delete button clicked for goal ID: ${goal.id}`);
        clearError();

        const goalDescription = goal.description || `с ID ${goal.id}`;
        const formattedAmount = typeof goal.amount === 'number'
            ? goal.amount.toLocaleString('ru-RU', {minimumFractionDigits: 2, maximumFractionDigits: 2})
            : goal.amount;
        const message = `Вы уверены, что хотите удалить цель "${goalDescription}" на сумму ${formattedAmount} ₽?`;

        openModal('confirmDeleteGoal', {
            title: 'Подтверждение удаления цели',
            message: message,
            onConfirm: () => handleDeleteConfirm(goal.id),
            confirmText: 'Удалить',
        });
        // console.log('GoalsPage: Calling openModal for Delete Goal confirmation...');
    };

    const handleSetCurrentClick = (goal) => {
        // console.log(`GoalsPage: Set Current button clicked for goal ID: ${goal.id}`);
        clearError();
        if (currentGoal && currentGoal.id === goal.id) {
            // console.log('GoalsPage: Selected goal is already the current one.');
            return;
        }

        const goalDescription = goal.description || `с ID ${goal.id}`;
        const message = `Вы уверены, что хотите установить цель "${goalDescription}" как текущую?`;

        openModal('confirmSetCurrentGoal', {
            title: 'Установить текущую цель',
            message: message,
            onConfirm: () => handleSetCurrentConfirm(goal.id),
            confirmText: 'Установить',
        });
        // console.log('GoalsPage: Calling openModal for Set Current Goal confirmation...');
    };


    // --- Logic functions called by Modals/ConfirmModal components ---
    const handleAddSubmit = async (formData) => {
        // console.log('GoalsPage Logic: handleAddSubmit called with data:', formData);
        try {
            await dataCoordinator.addGoal(formData);
            closeModal();
            // console.log('GoalsPage Logic: addGoal store action finished successfully.');
        } catch (err) {
            console.error('GoalsPage Logic: Error during add goal (after form submit):', err);
            closeModal();
        }
        // console.log('GoalsPage Logic: handleAddSubmit finished.');
    };

    const handleEditSubmit = async (id, formData) => {
        // console.log(`GoalsPage Logic: handleEditSubmit called for ID: ${id} with data:`, formData);
        try {
            await dataCoordinator.updateGoal(id, formData);
            closeModal();
            // console.log(`GoalsPage Logic: updateGoal store action finished successfully for ID: ${id}.`);
            // eslint-disable-next-line no-unused-vars
        } catch (err) {
            console.error(`GoalsPage Logic: Error during edit goal ID ${id} (after form submit):', err);`);
            closeModal();
        }
        // console.log(`GoalsPage Logic: handleEditSubmit finished for ID: ${id}.`);
    };

    const handleDeleteConfirm = async (id) => {
        // console.log(`GoalsPage Logic: handleDeleteConfirm called for ID: ${id}`);
        try {
            await dataCoordinator.deleteGoal(id);
            // console.log(`GoalsPage Logic: deleteGoal store action finished for ID: ${id}.`);
            closeModal();
            // console.log(`GoalsPage Logic: handleDeleteConfirm finished.`);
            // eslint-disable-next-line no-unused-vars
        } catch (err) {
            console.error(`GoalsPage Logic: Error during delete goal ID ${id} (after confirmation):', err);`);
            closeModal();
        }
    };

    const handleSetCurrentConfirm = async (id) => {
        // console.log(`GoalsPage Logic: handleSetCurrentConfirm called for ID: ${id}`);
        try {
            await dataCoordinator.setCurrentGoalById(id);
            // console.log(`GoalsPage Logic: setCurrentGoal store action finished for ID: ${id}.`);
            closeModal();
            // console.log(`GoalsPage Logic: handleSetCurrentConfirm finished.`);
            // eslint-disable-next-line no-unused-vars
        } catch (err) {
            console.error(`GoalsPage Logic: Error during setting goal ID ${id} as current (after confirmation):', err);`);
            closeModal();
        }
    };
    // --- Конец определения Logic functions ---


    // Determine if a general error message should be displayed
    const displayError = error;

    const goalColumns = [
        {
            key: 'description',
            header: 'Описание',
            component: GoalDescriptionCell,
            props: {currentGoal, balance},
            cellClassName: 'p-4'
        },
        {
            key: 'amount',
            header: 'Сумма',
            component: CurrencyCell,
            props: {field: 'amount', variant: 'tdSecondary'},
            cellClassName: 'p-4'
        },
        {
            key: 'wish_date',
            header: 'Желаемая дата',
            component: DateCell,
            props: {field: 'wish_date', variant: 'tdSecondary'},
            cellClassName: 'px-2 py-4'
        },
        {
            key: 'actions',
            header: 'Действия',
            component: GoalActionsCell,
            props: {
                currentGoal,
                onEdit: handleEditClick,
                onDelete: handleDeleteClick,
                onSetCurrent: handleSetCurrentClick
            },
            cellClassName: 'px-2 py-4'
        }
    ];

    // --- Rendering ---
    const renderCurrentGoalSection = () => {
        if (loading || isBalanceLoading) {
            return (
                <div className="text-blue-700">
                    <Text variant="body">Загрузка текущей цели и баланса...</Text>
                </div>
            );
        }

        if (currentGoal) {
            return (
                <div className="flex items-center flex-wrap gap-x-4">
                    <Text variant="body" className="font-semibold">{currentGoal.description}</Text>
                    <Text variant="body">
                        Сумма: {typeof currentGoal.amount === 'number'
                        ? currentGoal.amount.toLocaleString('ru-RU', {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2
                        })
                        : currentGoal.amount} ₽
                    </Text>
                    {currentGoal.wish_date && currentGoal.wish_date !== "0001-01-01T00:00:00Z" && (
                        <Text variant="body">
                            Желаемая дата: {new Date(currentGoal.wish_date).toLocaleDateString('ru-RU')}
                        </Text>
                    )}
                    {currentGoal.is_achieved && currentGoal.achievement_date && currentGoal.achievement_date !== "0001-01-01T00:00:00Z" && (
                        <Text variant="body" className="text-green-700">
                            Достигнута: {new Date(currentGoal.achievement_date).toLocaleDateString('ru-RU')}
                        </Text>
                    )}
                </div>
            );
        }

        return (
            <Text variant="body" className="text-blue-700 ml-2">
                Текущая цель не установлена.
            </Text>
        );
    };

    const renderGoalsContent = () => {
        // Early return для первичной загрузки
        if (loading && goals === null && !isBalanceLoading) {
            return (
                <div className="text-center p-4">
                    <Text variant="body">Загрузка списка целей...</Text>
                </div>
            );
        }

        // Early return для пустого списка
        if (!loading && goals !== null && goals.length === 0) {
            return (
                <div className="p-4 text-center">
                    <Text variant="body">У вас пока нет добавленных целей.</Text>
                </div>
            );
        }

        // Рендер списка целей
        const shouldShowTable = (goals !== null && goals.length > 0) || (loading && goals === null);

        if (shouldShowTable) {
            return (
                <>
                    {/* Десктопная таблица */}
                    <Table
                        data={goals || []}
                        columns={goalColumns}
                        loading={loading}
                        emptyMessage="У вас пока нет добавленных целей."
                        className="min-w-full hidden md:table"
                    />

                    {/* Мобильный список карточек */}
                    <GoalsCardList
                        className="block md:hidden"
                        goals={goals}
                        currentGoal={currentGoal}
                        balance={balance}
                        loading={loading}
                        currentGoalLoading={loading}
                        isBalanceLoading={isBalanceLoading}
                        handleEditClick={handleEditClick}
                        handleDeleteClick={handleDeleteClick}
                        handleSetCurrentClick={handleSetCurrentClick}
                    />

                    {/* Индикатор фоновой загрузки */}
                    {loading && goals !== null && goals.length > 0 && (
                        <div className="text-center p-4">
                            <Text variant="body">Обновление списка целей...</Text>
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
                {/* Заголовок страницы и кнопка "Добавить цель" */}
                <div className="flex justify-between items-center mb-4">
                    <Text variant="h2">Мои цели</Text>
                    <TextButton onClick={handleAddClick}>
                        Добавить цель
                    </TextButton>
                </div>

                {/* Отображаем общую ошибку из стора */}
                {displayError && (
                    <div className="mb-4 p-3 bg-red-100 border border-red-300 text-gray-800 rounded-md">
                        {displayError.message}
                    </div>
                )}

                {/* Секция текущей цели (только для десктопа) */}
                <div className="hidden md:block mb-6 p-4 bg-blue-100 border border-blue-300 rounded-md shadow-sm">
                    <Text variant="h3" className="mb-2 text-blue-800">Текущая цель:</Text>
                    {renderCurrentGoalSection()}
                </div>

                {/* Основная область контента */}
                <div>
                    {renderGoalsContent()}
                </div>
            </main>
        </div>
    );
}