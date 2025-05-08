// src/pages/GoalsPage.jsx
import React, {useEffect, useState} from 'react'; // Импортируем useState и useEffect
// Import necessary components and stores
import Text from '../components/ui/Text';
import TextButton from '../components/ui/TextButton';
import IconButton from '../components/ui/IconButton';
// Import icons
import {PencilIcon, StarIcon, TrashIcon} from '@heroicons/react/24/outline'; // Импортируем StarIcon для использования в списке
// --- Import Stores ---
import useGoalsStore from '../stores/goalsStore'; // Убедись, что путь корректен
// Импорт useAuthStore может потребоваться, если нужно получить user?.userName или другие данные пользователя
// import useAuthStore from '../stores/authStore'; // Пока не нужен для базовой логики
// --- Корректный путь к modalStore.js ---
import useModalStore from '../stores/modalStore.js'; // Убедись, что путь корректен
// --- ДОБАВЛЕНО: Импорт стора Баланса для расчета процента и цвета иконки ---
import useBalanceStore from '../stores/balanceStore'; // Убедись, что путь корректен
// --- Конец ИМПОРТОВ ---


// Define fields for the Goal form (Add/Edit)
// Based on API spec for AddGoal and UpdateGoalByID
const goalFields = [
    { name: 'description', label: 'Описание цели', required: true, type: 'text', placeholder: 'Например: Накопить на отпуск' },
    { name: 'amount', label: 'Целевая сумма', required: true, type: 'number', placeholder: 'Например: 150000' },
    // wish_date should be a date input
    { name: 'wish_date', label: 'Желаемая дата', required: true, type: 'date' }, // API ожидает "YYYY-MM-DD"
    // achievement_date, is_achieved, is_current, is_delete - не редактируются через эту форму
];


export default function GoalsPage() {
    // Get state and actions from the goals store
    const {
        goals, loading, error,
        currentGoal, currentGoalLoading, currentGoalError,
        fetchGoals, addGoal, updateGoal, deleteGoal,
        setCurrentGoal, getCurrentGoal,
        clearError, clearCurrentGoalError
    } = useGoalsStore();

    // --- ДОБАВЛЕНО: Получаем баланс и статус его загрузки для расчета процента и цвета иконки ---
    const { balance, isLoading: isBalanceLoading } = useBalanceStore(); // Убедись, что isLoading переименован
    // --- Конец ДОБАВЛЕННОГО ---

    const { openModal, closeModal } = useModalStore();

    // --- ДОБАВЛЕНО: Локальное состояние для отслеживания попытки загрузки текущей цели ---
    // Этот флаг будет true после первой попытки загрузки, независимо от результата.
    const [hasFetchedCurrentGoal, setHasFetchedCurrentGoal] = useState(false);
    // --- Конец ДОБАВЛЕННОГО ---


    // --- useEffect for initial data fetching ---
    useEffect(() => {
        console.log('GoalsPage: useEffect triggered.'); // Лог триггера useEffect

        // Fetch goals list if not loading and data hasn't been loaded yet and no error
        // Проверяем loading ИЛИ error основного списка перед fetchGoals
        if (!loading && goals === null && !error) {
            console.log('GoalsPage: Triggering fetchGoals...'); // Лог вызова fetchGoals
            fetchGoals();
        } else {
            console.log('GoalsPage: fetchGoals skipped. Loading:', loading, 'goals:', goals ? 'loaded' : null, 'error:', !!error); // Лог пропуска
        }

        // Fetch current goal if not loading, data hasn't been loaded, NO error, AND we haven't attempted fetching it before
        // --- ИСПРАВЛЕНО: Добавлена проверка !hasFetchedCurrentGoal в условие ---
        // Теперь getCurrentGoal() вызывается ТОЛЬКО ОДИН РАЗ, если currentGoal === null и нет активной загрузки или ошибки
        if (!currentGoalLoading && currentGoal === null && !currentGoalError && !hasFetchedCurrentGoal) {
            console.log('GoalsPage: Triggering getCurrentGoal...'); // Лог вызова getCurrentGoal
            getCurrentGoal();
            // --- ДОБАВЛЕНО: Устанавливаем флаг, что попытка загрузки текущей цели была ---
            // Устанавливаем флаг СРАЗУ после вызова async функции, чтобы prevent subsequent calls in this effect run
            setHasFetchedCurrentGoal(true);
            // --- Конец ДОБАВЛЕННОГО ---
        } else {
            // Улучшенный лог для понимания, почему пропущена загрузка текущей цели
            console.log('GoalsPage: getCurrentGoal skipped.',
                'currentGoalLoading:', currentGoalLoading,
                'currentGoal:', currentGoal ? 'loaded' : null,
                'currentGoalError:', !!currentGoalError, // Логгируем булево наличие ошибки
                'hasFetchedCurrentGoal:', hasFetchedCurrentGoal // Логгируем новый флаг
            );
        }

        // Cleanup effect: clear error states in stores when unmounts
        return () => {
            console.log('GoalsPage: useEffect cleanup.'); // Лог cleanup
            clearError(); // Clear goals store main error
            clearCurrentGoalError(); // Clear goals store current goal error
            // Не сбрасываем hasFetchedCurrentGoal здесь, чтобы не вызывать повторную загрузку при перемонтировании компонента
        };
        // Dependencies: fetch actions и state variables, PLUS the new local state flag
        // --- ИСПРАВЛЕНО: Добавлена зависимость hasFetchedCurrentGoal ---
        // Важно: если setHasFetchedCurrentGoal вызывает ре-рендер, useEffect запустится снова.
        // Зависимость нужна, если флаг используется в условии.
        // Также добавляем зависимости balance и isBalanceLoading, потому что они используются в рендере (для цвета иконки)
    }, [
        fetchGoals, loading, goals, error, // Зависимости для fetchGoals
        getCurrentGoal, currentGoalLoading, currentGoal, currentGoalError, // Зависимости для getCurrentGoal
        clearError, clearCurrentGoalError, // Зависимости для cleanup
        hasFetchedCurrentGoal, // <-- ДОБАВЛЕНА новая зависимость
        balance, isBalanceLoading // <-- ДОБАВЛЕНЫ зависимости для баланса
    ]);
    // Примечание: Когда setHasFetchedCurrentGoal(true) меняет состояние, useEffect запускается снова.
    // Но благодаря проверке `!hasFetchedCurrentGoal` внутри условия, fetchGoals() не будет вызван повторно.


    // --- Handlers for UI actions (opening modals/confirmations) ---
    // Определяем все функции обработчики кликов и действий
    const handleAddClick = () => { // <-- Функция handleAddClick определена здесь
        console.log('GoalsPage: Add Goal button clicked'); // Лог клика
        clearError(); // Clear store errors before opening modal
        clearCurrentGoalError();

        openModal('addGoal', { // 'addGoal' is a type string for Modal
            title: 'Добавить цель',
            fields: goalFields, // Use defined goal fields
            initialData: {}, // Empty object for add form
            onSubmit: handleAddSubmit, // Function to call on modal form submission
            submitText: 'Добавить',
        });
    };

    const handleEditClick = (goal) => { // <-- Функция handleEditClick определена здесь
        console.log('GoalsPage: Edit button clicked for goal:', goal); // Лог клика
        clearError(); // Clear store errors
        clearCurrentGoalError();

        // Open the generic Modal component for editing
        openModal('editGoal', { // 'editGoal' is a type string for Modal
            title: 'Редактировать цель',
            fields: goalFields, // Use defined goal fields
            // Prepare initialData, formatting date for the input type="date"
            initialData: {
                ...goal, // Include all other fields from the goal object
                // Format wish_date: ISO string from API -> Date object -> ISO string -> "YYYY-MM-DD" for input
                // API может вернуть "0001-01-01T00:00:00Z" для пустой даты, проверяем это
                wish_date: goal.wish_date && goal.wish_date !== "0001-01-01T00:00:00Z"
                    ? new Date(goal.wish_date).toISOString().split('T')[0]
                    : '',
                // Другие поля, возможно, не нужно форматировать (amount, description)
            },
            // onSubmit handler that captures the goal.id
            onSubmit: (formData) => handleEditSubmit(goal.id, formData),
            submitText: 'Сохранить изменения',
        });
        console.log('GoalsPage: Calling openModal for Edit Goal...'); // Лог вызова модала
    };

    const handleDeleteClick = (goal) => { // <-- Функция handleDeleteClick определена здесь
        console.log(`GoalsPage: Delete button clicked for goal ID: ${goal.id}`); // Лог клика
        clearError(); // Clear store errors
        clearCurrentGoalError();

        // Formulate confirmation message
        const goalDescription = goal.description || `с ID ${goal.id}`;
        const formattedAmount = typeof goal.amount === 'number'
            ? goal.amount.toLocaleString('ru-RU', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
            : goal.amount;
        const message = `Вы уверены, что хотите удалить цель "${goalDescription}" на сумму ${formattedAmount} ₽?`;

        // Open the ConfirmModal component
        openModal('confirmDeleteGoal', { // 'confirmDeleteGoal' is a type string
            title: 'Подтверждение удаления цели',
            message: message,
            onConfirm: () => handleDeleteConfirm(goal.id), // Pass ID to confirm handler
            confirmText: 'Удалить',
        });
        console.log('GoalsPage: Calling openModal for Delete Goal confirmation...'); // Лог вызова модала
    };

    const handleSetCurrentClick = (goal) => { // <-- Функция handleSetCurrentClick определена здесь
        console.log(`GoalsPage: Set Current button clicked for goal ID: ${goal.id}`); // Лог клика
        clearError(); // Clear store errors
        clearCurrentGoalError();

        // Check if this goal is already the current goal
        if (currentGoal && currentGoal.id === goal.id) {
            console.log('GoalsPage: Selected goal is already the current one.'); // Лог, если уже текущая
            // Optionally show a message or do nothing
            return; // Do nothing if already current
        }

        const goalDescription = goal.description || `с ID ${goal.id}`;
        const message = `Вы уверены, что хотите установить цель "${goalDescription}" как текущую?`;


        // Open the ConfirmModal component for setting current
        openModal('confirmSetCurrentGoal', { // 'confirmSetCurrentGoal' is a type string
            title: 'Установить текущую цель',
            message: message,
            onConfirm: () => handleSetCurrentConfirm(goal.id), // Pass ID to confirm handler
            confirmText: 'Установить',
        });
        console.log('GoalsPage: Calling openModal for Set Current Goal confirmation...'); // Лог вызова модала
    };


    // --- Logic functions called by Modal/ConfirmModal components after user interaction ---
    // Эти функции вызываются из модальных окон после подтверждения действий
    const handleAddSubmit = async (formData) => { // <-- Функция handleAddSubmit определена здесь
        console.log('GoalsPage Logic: handleAddSubmit called with data:', formData);
        try {
            // formData contains wish_date as "YYYY-MM-DD" string (from Modal validation)
            await addGoal(formData);
            closeModal(); // Close modal on success
            console.log('GoalsPage Logic: addGoal store action finished successfully.');
        } catch (err) {
            console.error('GoalsPage Logic: Error during add goal (after form submit):', err);
            closeModal(); // Close modal on error too
            // Errors are displayed by LayoutWithHeader
        }
        console.log('GoalsPage Logic: handleAddSubmit finished.');
    };

    const handleEditSubmit = async (id, formData) => { // <-- Функция handleEditSubmit определена здесь
        console.log(`GoalsPage Logic: handleEditSubmit called for ID: ${id} with data:`, formData);
        try {
            // formData contains wish_date as "YYYY-MM-DD" string or null
            await updateGoal(id, formData);
            closeModal(); // Close modal on success
            console.log(`GoalsPage Logic: updateGoal store action finished successfully for ID: ${id}.`);
            // eslint-disable-next-line no-unused-vars
        } catch (err) {
            console.error(`GoalsPage Logic: Error during edit goal ID ${id} (after form submit):`, err);
            closeModal(); // Close modal on error
            // Errors are displayed by LayoutWithHeader
        }
        console.log(`GoalsPage Logic: handleEditSubmit finished for ID: ${id}.`);
    };

    const handleDeleteConfirm = async (id) => { // <-- Функция handleDeleteConfirm определена здесь
        console.log(`GoalsPage Logic: handleDeleteConfirm called for ID: ${id}`);
        try {
            await deleteGoal(id);
            console.log(`GoalsPage Logic: deleteGoal store action finished for ID: ${id}.`);
            closeModal(); // Close modal on success
            console.log(`GoalsPage Logic: handleDeleteConfirm finished.`);
            // eslint-disable-next-line no-unused-vars
        } catch (err) {
            console.error(`GoalsPage Logic: Error during delete goal ID ${id} (after confirmation):', err);`);
            closeModal(); // Close modal on error
            // Errors are displayed by LayoutWithHeader
        }
    };

    const handleSetCurrentConfirm = async (id) => { // <-- Функция handleSetCurrentConfirm определена здесь
        console.log(`GoalsPage Logic: handleSetCurrentConfirm called for ID: ${id}`);
        try {
            await setCurrentGoal(id); // Call the store action to set current
            console.log(`GoalsPage Logic: setCurrentGoal store action finished for ID: ${id}.`);
            closeModal(); // Close modal on success
            console.log(`GoalsPage Logic: handleSetCurrentConfirm finished.`);
            // eslint-disable-next-line no-unused-vars
        } catch (err) {
            console.error(`GoalsPage Logic: Error during setting goal ID ${id} as current (after confirmation):', err);`);
            closeModal(); // Close modal on error
            // Errors are displayed by LayoutWithHeader
        }
    };
    // --- Конец определения Logic functions ---


    // Determine if a general error message should be displayed
    // Show error if there is an error in main goals operations or current goal operations
    const displayError = error || currentGoalError;


    // --- Rendering ---
    return (
        <div className="bg-secondary-50 min-h-screen"> {/* Light grey background */}
            <main className="max-w-7xl mx-auto p-4"> {/* Centered container с padding */}

                {/* Header section: Title and Add Button */}
                <div className="flex justify-between items-center mb-4">
                    <Text variant="h2">Мои цели</Text>
                    {/* Кнопка Add Goal использует handleAddClick */}
                    <TextButton onClick={handleAddClick}> {/* <-- handleAddClick используется здесь */}
                        Добавить цель
                    </TextButton>
                </div>

                {/* Display general error message from the store */}
                {displayError && (
                    <div className="mb-4 p-3 bg-red-100 border border-red-300 text-gray-800 rounded-md">
                        {displayError.message}
                    </div>
                )}

                {/* Section for Current Goal */}
                <div className="mb-6 p-4 bg-blue-100 border border-blue-300 rounded-md shadow-sm">
                    <Text variant="h3" className="mb-2 text-blue-800">Текущая цель:</Text>
                    {currentGoalLoading || isBalanceLoading ? ( // Добавлена проверка загрузки баланса
                        <div className="text-blue-700"><Text variant="body">Загрузка текущей цели и баланса...</Text></div>
                    ) : currentGoal ? (
                        <div className="flex items-center flex-wrap gap-x-4">
                            <Text variant="body" className="font-semibold">{currentGoal.description}</Text>
                            <Text variant="body">Сумма: {typeof currentGoal.amount === 'number'
                                ? currentGoal.amount.toLocaleString('ru-RU', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
                                : currentGoal.amount} ₽
                            </Text>
                            {currentGoal.wish_date && currentGoal.wish_date !== "0001-01-01T00:00:00Z" && (
                                <Text variant="body">Желаемая дата: {new Date(currentGoal.wish_date).toLocaleDateString()}</Text>
                            )}
                            {/* Можно добавить индикатор достижения и дату достижения */}
                            {currentGoal.is_achieved && currentGoal.achievement_date && currentGoal.achievement_date !== "0001-01-01T00:00:00Z" && (
                                <Text variant="body" className="text-green-700">Достигнута: {new Date(currentGoal.achievement_date).toLocaleDateString()}</Text>
                            )}
                        </div>
                    ) : (
                        <Text variant="body" className="text-blue-700">Текущая цель не установлена.</Text>
                    )}
                </div>


                {/* Conditional Rendering for Goals List */}
                {loading && goals === null ? (
                    // Show initial loading spinner for goals list
                    <div className="text-center p-4">
                        <Text variant="body">Загрузка списка целей...</Text>
                    </div>
                ) : (
                    // Content container for the list
                    <div className="bg-background shadow-md rounded-md overflow-hidden">
                        {/* If not loading, no error, and goals list is loaded but empty */}
                        {goals !== null && goals.length === 0 ? (
                            <div className="p-4 text-center">
                                <Text variant="body">У вас пока нет добавленных целей.</Text>
                            </div>
                        ) : (
                            // If goals list is loaded and not empty
                            goals !== null && goals.length > 0 && (
                                <table className="min-w-full">
                                    <thead className="bg-secondary-200">
                                    <tr>
                                        <th className="text-left p-4"><Text variant="th">№</Text></th>
                                        <th className="text-left p-4"><Text variant="th">Описание</Text></th>
                                        <th className="text-left p-4"><Text variant="th">Сумма</Text></th>
                                        <th className="text-left p-4"><Text variant="th">Желаемая дата</Text></th>
                                        {/* Можем добавить колонки для is_achieved, achievement_date */}
                                        <th className="text-left p-4"><Text variant="th">Действия</Text></th>
                                    </tr>
                                    </thead>
                                    <tbody>
                                    {/* Проходим по массиву goals и рендерим строку для каждой цели */}
                                    {goals.map((goal, index) => {
                                        // Определяем, является ли текущая цель в итерации текущей выбранной целью
                                        const isCurrent = currentGoal && currentGoal.id === goal.id;

                                        // --- ДОБАВЛЕНО: Расчет процента и определение класса цвета для иконки ---
                                        let percentage = 0;
                                        let starColorClass = 'text-gray-500'; // Цвет по умолчанию (если не текущая или баланс не загружен)

                                        // Рассчитываем процент только если это текущая цель, баланс и сумма цели - числа и сумма цели > 0
                                        // Убедимся, что balance и goal.amount доступны и валидны
                                        if (isCurrent && typeof balance === 'number' && typeof goal.amount === 'number' && goal.amount > 0) {
                                            const achieved = balance >= 0 ? balance : 0; // Достигнутая часть
                                            percentage = Math.min((achieved / goal.amount) * 100, 100); // Процент (не более 100)

                                            // Определяем класс цвета на основе процента (логика по пороговым значениям)
                                            if (percentage < 25) {
                                                starColorClass = 'text-red-500';      // Красный до 25%
                                            } else if (percentage < 50) {
                                                starColorClass = 'text-orange-500';   // Оранжевый до 50% (используем оранжевый Tailwind)
                                            } else if (percentage < 75) {
                                                starColorClass = 'text-yellow-500';   // Желтый до 75%
                                            } else { // percentage >= 75
                                                starColorClass = 'text-green-500';    // Зеленый от 75% и выше
                                            }
                                            // Дополнительно можно сделать цвет ярче, если цель достигнута (percentage >= 100)
                                            if (percentage >= 100) {
                                                starColorClass = 'text-green-600'; // Или text-green-700 для более насыщенного зеленого
                                            }

                                        } else if (!isCurrent) {
                                            // Если цель не текущая, звездочка может быть, например, серой или невидимой
                                            // starColorClass = 'text-gray-400'; // Можно оставить серый, если хотим показывать иконку всегда
                                            starColorClass = 'text-transparent'; // Делаем иконку невидимой, если не текущая цель
                                        }
                                        // --- Конец ДОБАВЛЕННОГО ---


                                        return (
                                            <tr key={goal.id} // Ключ строки таблицы
                                                // Чередующиеся классы фона строк
                                                className={index % 2 === 0 ? 'bg-background' : 'bg-secondary-50'}>
                                                <td className="p-4"><Text variant="tdPrimary">{index + 1}</Text></td> {/* Номер по порядку */}
                                                {/* --- ИСПРАВЛЕНО: Добавляем иконку и условные классы для выделения названия --- */}
                                                <td className="p-4"> {/* Ячейка для описания цели */}
                                                    {/* Flex контейнер для иконки и текста, выравнивание по центру */}
                                                    <div className="flex items-center">
                                                        {/* Рендерим StarIcon только если это текущая цель ИЛИ если мы хотим показывать серую звездочку для нетекущих */}
                                                        {/* Согласно запросу, звездочку ставим только для текущей цели, но цвет берем по проценту */}
                                                        {/* Рендерим иконку, если это текущая цель, с вычисленным цветом.
                                                             Если не текущая, она не рендерится благодаря !isCurrent */}
                                                        {isCurrent && ( // Рендерим только если isCurrent истинно
                                                            // Используем определенный класс цвета для звездочки
                                                            // Добавляем mx-0 mr-1 для контроля отступа между иконкой и текстом
                                                            <StarIcon className={`w-5 h-5 mr-1 ${starColorClass}`} />
                                                        )}
                                                        {/* Текст описания цели */}
                                                        <Text
                                                            variant="tdPrimary" // Вариант текста для ячейки таблицы
                                                            // Убираем старые классы font-bold и text-primary-700 отсюда, так как выделение делается иконкой
                                                            // className={`${isCurrent ? 'font-bold text-primary-700' : ''}`}
                                                        >
                                                            {goal.description} {/* Само описание цели */}
                                                        </Text>
                                                    </div>
                                                </td>
                                                {/* --- Конец ИСПРАВЛЕНИЯ --- */}
                                                <td className="p-4"><Text variant="tdSecondary"> {/* Ячейка для суммы */}
                                                    {typeof goal.amount === 'number'
                                                        ? goal.amount.toLocaleString('ru-RU', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
                                                        : goal.amount} ₽
                                                </Text></td>
                                                <td className="p-4"><Text variant="tdSecondary"> {/* Ячейка для желаемой даты */}
                                                    {/* Форматирование даты для отображения */}
                                                    {goal.wish_date && goal.wish_date !== "0001-01-01T00:00:00Z" ? new Date(goal.wish_date).toLocaleDateString() : '-'}
                                                </Text></td>
                                                <td className="p-4 flex gap-2"> {/* Ячейка для кнопок действий */}
                                                    {/* Кнопка "Редактировать" */}
                                                    <IconButton
                                                        icon={PencilIcon}
                                                        tooltip="Редактировать цель"
                                                        className="text-primary-600 hover:bg-primary-600/10 hover:text-primary-500"
                                                        onClick={() => handleEditClick(goal)}
                                                    />
                                                    {/* Кнопка "Установить текущей" */}
                                                    {/* Рендерим кнопку только если эта цель НЕ является текущей */}
                                                    {/* Используем флаг isCurrent для более чистого условия */}
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
                                        ); // Конец возврата из map
                                    })}
                                    </tbody>
                                </table>
                            )
                        )}
                        {/* Show a general loading/updating indicator if loading but we already have data */}
                        {loading && goals !== null ? (
                            <div className="text-center p-4">
                                <Text variant="body">Обновление списка целей...</Text>
                            </div>
                        ) : null}
                    </div>
                )}

                {/* Modal and ConfirmModal components are rendered by LayoutWithHeader */}

            </main>
        </div>
    );
}