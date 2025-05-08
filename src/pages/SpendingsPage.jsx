// src/pages/SpendingsPage.jsx
import React, {useEffect, useMemo} from 'react';
// Import necessary components and stores
import Text from '../components/ui/Text';
import TextButton from '../components/ui/TextButton';
import IconButton from '../components/ui/IconButton';
// Import icons
import {PencilIcon, TrashIcon} from '@heroicons/react/24/outline';

// --- Import Stores ---
import useSpendingsStore from '../stores/spendingsStore'; // Убедись, что путь корректен
import useCategoryStore from '../stores/categoryStore'; // Убедись, что путь корректен
// --- ИСПРАВЛЕНО: Корректный путь к modalStore.js ---
import useModalStore from '../stores/modalStore.js'; // Убедись, что путь корректен
// --- Конец ИМПОРТОВ ---

// --- УДАЛЕНО: Импорт PropTypes и определение optionShape (для исправления ESLint ошибки) ---
// import PropTypes from 'prop-types';
// const optionShape = PropTypes.shape({
//     value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
//     label: PropTypes.string.isRequired,
// });
// --- Конец УДАЛЕНИЯ ---

// Define fields for the Spending form (similar to Credit fields structure)
// Based on API spec examples and UI needs
const spendingFields = [
    { name: 'amount', label: 'Сумма', required: true, type: 'number', placeholder: 'Например: 1500' },
    { name: 'description', label: 'Описание', required: false, type: 'text', placeholder: 'Например: Продукты из магазина' },
    // is_permanent is a boolean, might need a checkbox input type
    { name: 'is_permanent', label: 'Постоянный расход?', required: false, type: 'checkbox' },
    // category_id needs a select input type with options from categories
    // The options will be generated dynamically in the component
    { name: 'category_id', label: 'Категория', required: true, type: 'select', options: [] }, // options will be filled dynamically
    // Date field - using type="date"
    { name: 'date', label: 'Дата расхода', required: true, type: 'date' }, // Дата расхода, по API UpdateSpending ожидает
];


export default function SpendingsPage() {
    // Get state and actions from the stores
    const { spendings, loading, error, fetchSpendings, addSpending, updateSpending, deleteSpending, clearError } = useSpendingsStore();
    const { categories, categoriesLoading, categoriesError, fetchCategories, clearError: clearCategoriesError } = useCategoryStore(); // Используем другое имя для clearError стора категорий
    const { openModal, closeModal } = useModalStore();


    // --- useEffect for initial data fetching ---
    useEffect(() => {
        console.log('SpendingsPage: useEffect triggered.'); // Лог триггера useEffect

        // Fetch spendings if not loading and data hasn't been loaded yet and no error
        if (!loading && spendings === null && !error) {
            console.log('SpendingsPage: Triggering fetchSpendings...'); // Лог вызова fetchSpendings
            fetchSpendings();
        } else {
            console.log('SpendingsPage: fetchSpendings skipped. Loading:', loading, 'spendings:', spendings ? 'loaded' : null, 'error:', !!error); // Лог пропуска
        }

        // Fetch categories if not loading and data hasn't been loaded yet and no error
        if (!categoriesLoading && categories === null && !categoriesError) {
            console.log('SpendingsPage: Triggering fetchCategories...'); // Лог вызова fetchCategories
            fetchCategories();
        } else {
            console.log('SpendingsPage: fetchCategories skipped. categoriesLoading:', categoriesLoading, 'categories:', categories ? 'loaded' : null); // Лог пропуска
        }


        // Cleanup effect: clear error states in stores when unmounts
        return () => {
            console.log('SpendingsPage: useEffect cleanup.'); // Лог cleanup
            clearError(); // Clear spending store error
            clearCategoriesError(); // Clear category store error
        };
        // Dependencies: fetch actions and state variables that determine fetching necessity
    }, [fetchSpendings, loading, spendings, error, fetchCategories, categoriesLoading, categories, categoriesError, clearError, clearCategoriesError]);


    // --- Prepare category options for the select input ---
    // Use useMemo to re-calculate only when categories data changes
    const fieldsWithCategoryOptions = useMemo(() => {
        console.log('SpendingsPage: Recalculating fieldsWithCategoryOptions based on categories.'); // Лог пересчета
        // Find the category field definition by name
        const categoryFieldDefinition = spendingFields.find(field => field.name === 'category_id');

        // If categories are loaded and the category field exists
        if (categories !== null && categoryFieldDefinition) {
            // Map categories data to the required format for select options { value, label }
            const categoryOptions = categories.map(category => ({
                value: category.id, // API expects numeric category_id
                label: category.name,
            }));

            console.log('SpendingsPage: Category options prepared:', categoryOptions.length); // Лог готовности опций

            // Create a new array of fields, replacing the category field with options
            return spendingFields.map(field =>
                field.name === 'category_id' ? { ...field, options: categoryOptions } : field
            );
        }

        // If categories are not loaded or category field not found, return original fields
        console.log('SpendingsPage: Category options not prepared. Categories loaded:', categories !== null, 'Category field exists:', !!categoryFieldDefinition); // Лог, почему опции не готовы
        return spendingFields;

    }, [categories]); // Recalculate only when 'categories' array changes


    // --- Handlers for UI actions (opening modals) ---

    const handleAddClick = () => {
        clearError(); // Clear store error before opening modal (spending store)
        clearCategoriesError(); // Clear category store error too
        // Open the generic Modal component
        openModal('addSpending', { // 'addSpending' is a type string
            title: 'Добавить расход',
            fields: fieldsWithCategoryOptions, // Pass fields including dynamic category options
            initialData: {}, // Empty object for add form
            onSubmit: handleAddSubmit, // Function to call on modal form submission
            submitText: 'Добавить',
        });
        console.log('SpendingsPage: Add Spending button clicked'); // Лог клика
        console.log('SpendingsPage: Calling openModal for Add Spending...'); // Лог вызова модала
    };

    // Handle click on "Edit" icon button for a specific spending
    const handleEditClick = (spending) => {
        clearError(); // Clear store error
        clearCategoriesError(); // Clear category store error

        console.log('SpendingsPage: Edit button clicked for spending:', spending); // Лог клика
        // Open the generic Modal component for editing
        openModal('editSpending', { // 'editSpending' is a type string
            title: 'Редактировать расход',
            fields: fieldsWithCategoryOptions, // Pass fields with options
            // Prepare initialData, formatting date for the input type="date"
            initialData: {
                ...spending, // Include all other fields from the spending object
                // Format date: ISO string from API -> Date object -> ISO string -> "YYYY-MM-DD" for input
                date: spending.date ? new Date(spending.date).toISOString().split('T')[0] : '',
                // Ensure category_id is number or null if necessary, though Modal handles number conversion
                category_id: spending.category_id === null || spending.category_id === undefined ? '' : spending.category_id,
            },
            // onSubmit handler that captures the spending.id
            onSubmit: (formData) => handleEditSubmit(spending.id, formData),
            submitText: 'Сохранить изменения',
        });
        console.log('SpendingsPage: Calling openModal for Edit Spending...'); // Лог вызова модала
    };

    // Handle click on "Delete" icon button for a specific spending
    const handleDeleteClick = (spending) => {
        clearError(); // Clear store error
        clearCategoriesError(); // Clear category store error

        console.log(`SpendingsPage: Delete button clicked for spending ID: ${spending.id}`); // Лог клика

        // Formulate confirmation message
        const spendingDescription = spending.description || `с ID ${spending.id}`;
        const formattedAmount = typeof spending.amount === 'number'
            ? spending.amount.toLocaleString('ru-RU', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
            : spending.amount;
        const message = `Вы уверены, что хотите удалить расход "${spendingDescription}" на сумму ${formattedAmount} ₽?`;

        // Open the ConfirmModal component
        openModal('confirmDelete', { // 'confirmDelete' is a type string
            title: 'Подтверждение удаления',
            message: message,
            // onConfirm handler that captures the spending.id
            onConfirm: () => handleDeleteConfirm(spending.id),
            confirmText: 'Удалить',
        });
        console.log('SpendingsPage: Calling openModal for Delete Spending...'); // Лог вызова модала
    };

    // --- Logic functions called by Modal/ConfirmModal components after user interaction ---

    // Logic for adding a spending (called by Modal component via onSubmit)
    const handleAddSubmit = async (formData) => {
        console.log('SpendingsPage Logic: handleAddSubmit called with data:', formData); // Лог вызова с данными
        try {
            // Call the addSpending action from the store
            console.log('SpendingsPage Logic: Calling addSpending store action with data:', formData); // Лог вызова стора
            await addSpending(formData); // formData contains date as "YYYY-MM-DD" string
            // If successful, close the modal
            closeModal(); // <-- ЭТОТ closeModal должен сработать при успехе
            console.log('SpendingsPage Logic: addSpending store action finished successfully.'); // Лог успеха стора

        } catch (err) {
            // If an error occurred during addSpending (handled and set in store.error),
            // the error message will be displayed by LayoutWithHeader.
            console.error('SpendingsPage Logic: Error during add spending (after form submit):', err); // Лог ошибки
            closeModal(); // <-- ЭТОТ closeModal должен сработать при ошибке
            // --- ИСПРАВЛЕНО: УДАЛИЛИ throw err; чтобы не вызывать неперехваченное исключение ---
            // throw err;
            // --- КОНЕЦ ИСПРАВЛЕНИЯ ---
        }
        console.log('SpendingsPage Logic: handleAddSubmit finished.'); // Лог завершения
    };

    // Logic for editing a spending (called by Modal component via onSubmit)
    const handleEditSubmit = async (id, formData) => {
        console.log(`SpendingsPage Logic: handleEditSubmit called for ID: ${id} with data:`, formData); // Лог вызова с ID и данными
        try {
            // formData contains date as "YYYY-MM-DD" string or null
            // We pass it directly to the store action, which sends YYYY-MM-DD or null to API
            console.log(`SpendingsPage Logic: Calling updateSpending store action for ID: ${id} with data:`, formData); // Лог вызова стора
            await updateSpending(id, formData); // formData contains date as "YYYY-MM-DD" string or null
            closeModal(); // <-- ЭТОТ closeModal должен сработать при успехе
            console.log(`SpendingsPage Logic: updateSpending store action finished successfully for ID: ${id}.`); // Лог успеха стора

        } catch (err) {
            console.error(`SpendingsPage Logic: Error during edit spending ID ${id} (after form submit):`, err); // Лог ошибки
            closeModal(); // <-- ЭТОТ closeModal должен сработать при ошибке
            // --- ИСПРАВЛЕНО: УДАЛИЛИ throw err; ---
            // throw err;
            // --- КОНЕЦ ИСПРАВЛЕНИЯ ---
        }
        console.log(`SpendingsPage Logic: handleEditSubmit finished for ID: ${id}.`); // Лог завершения
    };


    // Logic for confirming deletion of a spending (called by ConfirmModal component via onConfirm)
    const handleDeleteConfirm = async (id) => {
        console.log(`SpendingsPage Logic: handleDeleteConfirm called for ID: ${id}`); // Лог вызова с ID
        try {
            // Call the deleteSpending action from the store
            console.log(`SpendingsPage Logic: Calling deleteSpending store action for ID: ${id}`); // Лог вызова стора
            await deleteSpending(id);
            // If successful, close the modal
            console.log(`SpendingsPage Logic: deleteSpending store action finished for ID: ${id}.`); // Лог успеха стора
            closeModal(); // <-- ЭТОТ closeModal должен сработать при успехе
            console.log(`SpendingsPage Logic: handleDeleteConfirm finished.`); // Лог завершения


        } catch (err) {
            console.error(`SpendingsPage Logic: Error during delete spending ID ${id} (after confirmation):`, err); // Лог ошибки
            closeModal(); // <-- ЭТОТ closeModal должен сработать при ошибке
            // --- ИСПРАВЛЕНО: УДАЛИЛИ throw err; ---
            // throw err;
            // --- КОНЕЦ ИСПРАВЛЕНИЯ ---
        }
    };
    // --- End Logic functions ---


    // Determine if a general error message should be displayed
    // Show error if there is an error in spendings or categories store
    const displayError = error || categoriesError;


    // --- Rendering ---
    return (
        <div className="bg-secondary-50"> {/* Light grey background */}
            <main className="max-w-7xl mx-auto p-4"> {/* Centered container with padding */}

                {/* Header section: Title and Add Button */}
                <div className="flex justify-between items-center mb-4">
                    <Text variant="h2">Мои Расходы</Text>
                    <TextButton onClick={handleAddClick}>
                        Добавить расход
                    </TextButton>
                </div>

                {/* Display general error message from the store */}
                {displayError && (
                    <div className="mb-4 p-3 bg-red-100 border border-red-300 text-gray-800 rounded-md">
                        {displayError.message}
                    </div>
                )}

                {/* Conditional Rendering based on Loading State, Errors, and Data availability */}
                {(loading && spendings === null) || (categoriesLoading && categories === null) ? (
                    // Show initial loading spinner if either spendings or categories are loading for the first time
                    <div className="text-center p-4">
                        <Text variant="body">Загрузка данных...</Text> {/* Универсальное сообщение загрузки */}
                    </div>
                ) : (
                    // Content container
                    <div className="bg-background shadow-md rounded-md overflow-hidden">
                        {/* If not loading, no error, and data is loaded but empty */}
                        {spendings !== null && spendings.length === 0 ? (
                            // Message when the list is empty (only if categories are also loaded or not required for display logic)
                            categories !== null && ( // Убедимся, что категории загружены для полной картины
                                <div className="p-4 text-center">
                                    <Text variant="body">У вас пока нет добавленных расходов.</Text>
                                </div>
                            )
                        ) : (
                            // If data is loaded and not empty
                            spendings !== null && spendings.length > 0 && categories !== null && ( // Убедимся, что все нужные данные загружены
                                <table className="min-w-full">
                                    <thead className="bg-secondary-200">
                                    {/* --- ПРЕДУПРЕЖДЕНИЕ validateTextNesting - проверь отсутствие пробелов между <tr> и <th>/<td> --- */}
                                    <tr>
                                        <th className="text-left p-4"><Text variant="th">№</Text></th>
                                        <th className="text-left p-4"><Text variant="th">Сумма</Text></th>
                                        <th className="text-left p-4"><Text variant="th">Описание</Text></th>
                                        <th className="text-left p-4"><Text variant="th">Категория</Text></th> {/* Колонка для категории */}
                                        <th className="text-left p-4"><Text variant="th">Дата</Text></th>
                                        <th className="text-left p-4"><Text variant="th">Постоянный</Text></th>
                                        <th className="text-left p-4"><Text variant="th">Действия</Text></th>
                                    </tr>
                                    {/* --- ПРЕДУПРЕЖДЕНИЕ validateTextNesting - проверь отсутствие пробелов между <tr> и <th>/<td> --- */}
                                    </thead>
                                    <tbody>
                                    {spendings.map((spending, index) => {
                                        // Находим объект категории по category_id расхода
                                        const category = categories.find(cat => cat.id === spending.category_id);
                                        const categoryName = category ? category.name : 'Неизвестно'; // Если категория не найдена

                                        return (
                                            <tr key={spending.id}
                                                className={index % 2 === 0 ? 'bg-background' : 'bg-secondary-50'}>
                                                <td className="p-4"><Text variant="tdPrimary">{index + 1}</Text></td>
                                                <td className="p-4"><Text variant="tdPrimary" className="text-accent-error font-semibold"> {/* Красный цвет для расходов */}
                                                    {typeof spending.amount === 'number'
                                                        ? spending.amount.toLocaleString('ru-RU', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
                                                        : spending.amount} ₽
                                                </Text></td>
                                                <td className="p-4"><Text variant="tdSecondary">{spending.description || '-'}</Text></td>
                                                {/* Отображение названия категории */}
                                                <td className="p-4"><Text variant="tdSecondary">{categoryName}</Text></td>
                                                <td className="p-4"><Text variant="tdSecondary">
                                                    {/* Форматирование даты для отображения */}
                                                    {spending.date ? new Date(spending.date).toLocaleDateString() : '-'}
                                                </Text></td>
                                                <td className="p-4"><Text variant="tdSecondary">
                                                    {spending.is_permanent ? 'Да' : 'Нет'}
                                                </Text></td>
                                                <td className="p-4 flex gap-2">
                                                    <IconButton
                                                        icon={PencilIcon}
                                                        tooltip="Редактировать"
                                                        className="text-primary-600 hover:bg-primary-600/10 hover:text-primary-500"
                                                        onClick={() => handleEditClick(spending)}
                                                    />
                                                    <IconButton
                                                        icon={TrashIcon}
                                                        tooltip="Удалить"
                                                        className="text-accent-error hover:bg-accent-error/10 hover:text-accent-error/80"
                                                        onClick={() => handleDeleteClick(spending)}
                                                    />
                                                </td>
                                            </tr>
                                        );
                                    })}
                                    </tbody>
                                </table>
                            )
                        )}
                        {/* Show a general loading/updating indicator if loading but we already have data */}
                        {(loading && spendings !== null) || (categoriesLoading && categories !== null) ? (
                            <div className="text-center p-4">
                                <Text variant="body">Обновление данных...</Text>
                            </div>
                        ) : null /* Nothing to show if not in initial load and not updating */}
                    </div>
                )}

                {/* Modal components are rendered by LayoutWithHeader */}

            </main>
        </div>
    );
}

// --- УДАЛЕНО: PropTypes определение для компонента SpendingsPage (не использовалось) ---
// SpendingsPage.propTypes = {};