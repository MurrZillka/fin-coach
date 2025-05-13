// src/pages/GoalsPage.jsx
import React, {useEffect, useState} from 'react';
// Import necessary components and stores
import Text from '../components/ui/Text';
import TextButton from '../components/ui/TextButton';
import IconButton from '../components/ui/IconButton';
// Import icons
import {PencilIcon, StarIcon, TrashIcon} from '@heroicons/react/24/outline';
// --- Import Stores ---
import useGoalsStore from '../stores/goalsStore';
import useModalStore from '../stores/modalStore.js';
// --- ДОБАВЛЕНО: Импорт стора Баланса для расчета процента и цвета иконки ---
import useBalanceStore from '../stores/balanceStore';
// --- ДОБАВЛЕНО: Импорт нового компонента для мобильной раскладки ---
import GoalsCardList from '../components/GoalsCardList'; // Убедись, что путь корректен
// --- Конец ИМПОРТОВ ---


// Define fields for the Goal form (Add/Edit)
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
        currentGoal, currentGoalLoading, currentGoalError,
        fetchGoals, addGoal, updateGoal, deleteGoal,
        setCurrentGoal, getCurrentGoal,
        clearError, clearCurrentGoalError
    } = useGoalsStore();

    // --- ДОБАВЛЕНО: Получаем баланс и статус его загрузки ---
    const {balance, isLoading: isBalanceLoading} = useBalanceStore();
    // --- Конец ДОБАВЛЕННОГО ---

    const {openModal, closeModal} = useModalStore();

    // --- ДОБАВЛЕНО: Локальное состояние для отслеживания попытки загрузки текущей цели ---
    const [hasFetchedCurrentGoal, setHasFetchedCurrentGoal] = useState(false);
    // --- Конец ДОБАВЛЕННОГО ---


    // --- useEffect for initial data fetching ---
    useEffect(() => {
        // console.log('GoalsPage: useEffect triggered.'); // Лог триггера useEffect

        // Fetch goals list if not loading and data hasn't been loaded yet and no error
        if (!loading && goals === null && !error) {
            // console.log('GoalsPage: Triggering fetchGoals...'); // Лог вызова fetchGoals
            fetchGoals();
        } else {
            // console.log('GoalsPage: fetchGoals skipped. Loading:', loading, 'goals:', goals ? 'loaded' : null, 'error:', !!error); // Лог пропуска
        }

        // Fetch current goal if not loading, data hasn't been loaded, NO error, AND we haven't attempted fetching it before
        if (!currentGoalLoading && currentGoal === null && !currentGoalError && !hasFetchedCurrentGoal) {
            // console.log('GoalsPage: Triggering getCurrentGoal...'); // Лог вызова getCurrentGoal
            getCurrentGoal();
            setHasFetchedCurrentGoal(true); // Устанавливаем флаг сразу
        } else {
            // console.log('GoalsPage: getCurrentGoal skipped.',
            //     'currentGoalLoading:', currentGoalLoading,
            //     'currentGoal:', currentGoal ? 'loaded' : null,
            //     'currentGoalError:', !!currentGoalError,
            //     'hasFetchedCurrentGoal:', hasFetchedCurrentGoal
            // );
        }

        // Cleanup effect: clear error states in stores when unmounts
        return () => {
            // console.log('GoalsPage: useEffect cleanup.'); // Лог cleanup
            clearError();
            clearCurrentGoalError();
        };
    }, [
        fetchGoals, loading, goals, error,
        getCurrentGoal, currentGoalLoading, currentGoal, currentGoalError,
        clearError, clearCurrentGoalError,
        hasFetchedCurrentGoal,
        balance, isBalanceLoading // Зависимости для данных, используемых в рендере
    ]);


    // --- Handlers for UI actions (opening modals/confirmations) ---
    const handleAddClick = () => {
        // console.log('GoalsPage: Add Goal button clicked');
        clearError();
        clearCurrentGoalError();

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
        clearCurrentGoalError();

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
        clearCurrentGoalError();

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
        clearCurrentGoalError();

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


    // --- Logic functions called by Modal/ConfirmModal components ---
    const handleAddSubmit = async (formData) => {
        // console.log('GoalsPage Logic: handleAddSubmit called with data:', formData);
        try {
            await addGoal(formData);
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
            await updateGoal(id, formData);
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
            await deleteGoal(id);
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
            await setCurrentGoal(id);
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
    const displayError = error || currentGoalError;


    // --- Rendering ---
    return (
        <div className="bg-secondary-50">
            <main className="max-w-7xl mx-auto p-4">

                {/* Header section: Title and Add Button */}
                <div className="flex justify-between items-center mb-4">
                    <Text variant="h2">Мои Цели</Text>
                    <TextButton onClick={handleAddClick}>
                        Добавить цель
                    </TextButton>
                </div>

                {/* Display general error message from the store */}
                {displayError && (
                    <div className="mb-4 p-3 bg-red-100 border border-red-300 text-gray-800 rounded-md">
                        {displayError.message}
                    </div>
                )}

                {/* Section for Current Goal (Desktop only) */}
                {/* Этот блок виден только на десктопе */}
                <div className="hidden md:block mb-6 p-4 bg-blue-100 border border-blue-300 rounded-md shadow-sm">
                    <Text variant="h3" className="mb-2 text-blue-800">Текущая цель:</Text>
                    {currentGoalLoading || isBalanceLoading ? (
                        <div className="text-blue-700"><Text variant="body">Загрузка текущей цели и баланса...</Text>
                        </div>
                    ) : currentGoal ? (
                        <div className="flex items-center flex-wrap gap-x-4">
                            {/* Описание цели с иконкой звезды (на десктопе иконка отрисовывается в таблице) */}
                            <Text variant="body" className="font-semibold">{currentGoal.description}</Text>
                            {/* Сумма цели */}
                            <Text variant="body">Сумма: {typeof currentGoal.amount === 'number'
                                ? currentGoal.amount.toLocaleString('ru-RU', {
                                    minimumFractionDigits: 2,
                                    maximumFractionDigits: 2
                                })
                                : currentGoal.amount} ₽
                            </Text>
                            {/* Желаемая дата */}
                            {currentGoal.wish_date && currentGoal.wish_date !== "0001-01-01T00:00:00Z" && (
                                <Text variant="body">Желаемая
                                    дата: {new Date(currentGoal.wish_date).toLocaleDateString('ru-RU')}</Text>
                                )}
                            {/* Достигнута / Дата достижения */}
                            {currentGoal.is_achieved && currentGoal.achievement_date && currentGoal.achievement_date !== "0001-01-01T00:00:00Z" && (
                                <Text variant="body"
                                      className="text-green-700">Достигнута: {new Date(currentGoal.achievement_date).toLocaleDateString('ru-RU')}</Text> // Формат даты
                            )}
                        </div>
                    ) : (
                        <Text variant="body" className="text-blue-700 ml-2">Текущая цель не установлена.</Text>
                    )}
                </div>


                {/* Container for Goals List (Table for Desktop, Cards for Mobile) */}
                <div className=" rounded-md overflow-hidden">
                    {loading && goals === null && !currentGoalLoading && !isBalanceLoading ? (
                        <div className="text-center p-4">
                            <Text variant="body">Загрузка списка целей...</Text>
                        </div>
                    ) : (
                        // Content container
                        <>
                            {/* Desktop Table (hidden on mobile) */}
                            {/* Отображаем таблицу только если есть цели ИЛИ если загрузка еще идет, но данных пока нет (чтобы показать "Обновление") */}
                            {/* Проверяем, что есть данные goals ИЛИ loading, но goals == null (т.е. идет первая загрузка) */}
                            {(goals !== null && goals.length > 0) || (loading && goals === null) ? (
                                <table className="min-w-full hidden md:table">
                                    <thead className="bg-secondary-200">
                                    <tr>
                                        {/* Заголовки таблицы - Отступы как в финальной SpendingTable */}
                                        <th className="text-left pl-2 pr-0 py-4"><Text variant="th">№</Text></th>
                                        {/* № */}
                                        <th className="text-left p-4"><Text variant="th">Описание</Text></th>
                                        {/* Описание */}
                                        <th className="text-left p-4"><Text variant="th">Сумма</Text></th>
                                        {/* Сумма */}
                                        <th className="text-left px-2 py-4"><Text variant="th">Желаемая дата</Text></th>
                                        {/* Желаемая дата */}
                                        <th className="text-left px-2 py-4"><Text variant="th">Действия</Text></th>
                                        {/* Действия */}
                                    </tr>
                                    </thead>
                                    <tbody>
                                    {/* Проходим по массиву goals и рендерим строку для каждой цели */}
                                    {goals !== null && goals.length > 0 && goals.map((goal, index) => {
                                        {/* Проверяем goals перед map */
                                        }
                                        const isCurrent = currentGoal && currentGoal.id === goal.id;

                                        // --- Расчет процента и определение класса цвета для иконки (для звезды в таблице) ---
                                        let percentage = 0;
                                        let starColorClass = 'text-gray-500'; // Цвет по умолчанию (если не текущая или баланс не загружен)

                                        if (isCurrent && typeof balance === 'number' && typeof goal.amount === 'number' && goal.amount > 0) {
                                            const achieved = balance >= 0 ? balance : 0; // Достигнутая часть
                                            percentage = Math.min((achieved / goal.amount) * 100, 100); // Процент (не более 100)

                                            if (percentage < 25) starColorClass = 'text-red-500';
                                            else if (percentage < 50) starColorClass = 'text-orange-500';
                                            else if (percentage < 75) starColorClass = 'text-yellow-500';
                                            else starColorClass = 'text-green-500';
                                            if (percentage >= 100) starColorClass = 'text-green-600';
                                        } else if (!isCurrent) {
                                            starColorClass = 'text-transparent'; // Делаем иконку невидимой, если не текущая цель
                                        }
                                        // --- Конец расчета ---

                                        return (
                                            <tr key={goal.id}
                                                className={index % 2 === 0 ? 'bg-background' : 'bg-secondary-50'}>
                                                {/* № */}
                                                <td className="pl-2 pr-0 py-4"><Text
                                                    variant="tdPrimary">{index + 1}</Text></td>
                                                {/* Отступы как в SpendingTable */}
                                                {/* Описание с иконкой звезды (в таблице) */}
                                                <td className="p-4"> {/* Отступы как в SpendingTable */}
                                                    <div className="flex items-center">
                                                        {/* Рендерим StarIcon только если это текущая цель */}
                                                        {isCurrent && (
                                                            <StarIcon
                                                                className={`w-5 h-5 mr-1 ${starColorClass}`}/>
                                                            )}
                                                        <Text variant="tdPrimary">{goal.description}</Text>
                                                    </div>
                                                </td>
                                                {/* Сумма */}
                                                <td className="p-4"><Text
                                                    variant="tdSecondary"> {/* Отступы как в SpendingTable */}
                                                    {typeof goal.amount === 'number'
                                                        ? goal.amount.toLocaleString('ru-RU', {
                                                            minimumFractionDigits: 2,
                                                            maximumFractionDigits: 2
                                                        })
                                                        : goal.amount}
                                                    {'\u00A0'}₽ {/* Неразрывный пробел */}
                                                </Text></td>
                                                {/* Желаемая дата */}
                                                <td className="px-2 py-4"><Text
                                                    variant="tdSecondary"> {/* Отступы как в SpendingTable */}
                                                    {goal.wish_date && goal.wish_date !== "0001-01-01T00:00:00Z" ? new Date(goal.wish_date).toLocaleDateString('ru-RU') : '-'} {/* Формат даты */}
                                                </Text></td>
                                                {/* Действия */}
                                                <td className="px-2 py-4 flex gap-1"> {/* Отступы и зазор как в финальной SpendingTable */}
                                                    {/* Кнопка "Редактировать" */}
                                                    <IconButton
                                                        icon={PencilIcon}
                                                        tooltip="Редактировать цель"
                                                        className="text-primary-600 hover:bg-primary-600/10 hover:text-primary-500"
                                                        onClick={() => handleEditClick(goal)}
                                                    />
                                                    {/* Кнопка "Установить текущей" (не отображается для текущей) */}
                                                    {!(isCurrent) && (
                                                        <IconButton
                                                            icon={StarIcon}
                                                            tooltip="Установить как текущую"
                                                            className="text-yellow-500 hover:bg-yellow-500/10 hover:text-yellow-400"
                                                            onClick={() => handleSetCurrentClick(goal)}
                                                        />
                                                    )}
                                                    {/* Кнопка "Удалить" */}
                                                    <IconButton
                                                        icon={TrashIcon}
                                                        tooltip="Удалить цель"
                                                        className="text-accent-error hover:bg-accent-error/10 hover:text-accent-error/80"
                                                        onClick={() => handleDeleteClick(goal)}
                                                    />
                                                </td>
                                            </tr>
                                        );
                                    })}
                                    </tbody>
                                </table>
                            ) : null /* Не рендерим таблицу, если целей нет и не идет загрузка */
                            }

                            {/* Mobile Card List (hidden on desktop) */}
                            {/* Отображаем карточки только если есть цели ИЛИ если загрузка еще идет, но данных пока нет */}
                            {/* goals === null && loading - условие для показа "Загрузка списка целей..." внутри карточек, если goals пуст при первой загрузке */}
                            {(goals !== null && goals.length > 0) || (loading && goals === null) ? (
                                <GoalsCardList
                                    className="block md:hidden"
                                    goals={goals}
                                    currentGoal={currentGoal}
                                    balance={balance}
                                    loading={loading}
                                    currentGoalLoading={currentGoalLoading}
                                    isBalanceLoading={isBalanceLoading}
                                    handleEditClick={handleEditClick}
                                    handleDeleteClick={handleDeleteClick}
                                    handleSetCurrentClick={handleSetCurrentClick}
                                />
                            ) : (
                                // Состояние "Нет целей" (для обоих видов, но будет видно только там, где нет таблицы/карточек)
                                // Поскольку таблица и карточки скрываются при goals === null && !loading,
                                // этот блок будет виден только в этом случае.
                                !loading && goals !== null && goals.length === 0 && (
                                    <div className="p-4 text-center">
                                        <Text variant="body">У вас пока нет добавленных целей.</Text>
                                    </div>
                                )
                            )}

                            {/* Show a general loading/updating indicator only if loading and we already have data (for table/cards) */}
                            {/* Этот индикатор будет отображаться ПОСЛЕ таблицы ИЛИ карточек, если они уже были загружены ранее */}
                            {loading && goals !== null && goals.length > 0 ? (
                                <div className="text-center p-4">
                                    <Text variant="body">Обновление списка целей...</Text>
                                </div>
                            ) : null}

                        </>
                    )}
                </div>

                {/* Modal and ConfirmModal components are rendered by LayoutWithHeader */}

            </main>
        </div>
    );
}