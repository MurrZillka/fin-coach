// src/pages/SpendingsPage.jsx
import React, { useEffect, useMemo } from 'react'; // Импортируем useMemo
// Import necessary components and stores
import Text from '../components/ui/Text'; // Убедись, что путь корректен
import TextButton from '../components/ui/TextButton'; // Убедись, что путь корректен
import IconButton from '../components/ui/IconButton'; // Убедись, что путь корректен
// Import icons
import { PlusIcon, PencilIcon, TrashIcon } from '@heroicons/react/24/outline'; // Убедись, что путь корректен

// --- Use Spendings Store ---
// Убедись, что путь к spendingStore (теперь useSpendingsStore) корректен
import useSpendingsStore from '../stores/spendingsStore'; // Используем переименованный стор расходов
// --- Use Modal Store ---
// Убедись, что путь к modalStore корректен
import useModalStore from '../stores/modalStore.js';
// --- Use Category Store ---
// Убедись, что путь к categoryStore корректен
import useCategoryStore from '../stores/categoryStore';


// Define fields for the Spending form (similar to creditFields but for Spendings)
// Based on API AddSpending/UpdateSpending: { "amount": number, "description": string, "is_permanent": boolean, "category_id": number, "date": date }
const spendingFields = [
    { name: 'amount', label: 'Сумма', required: true, type: 'number', placeholder: 'Например: 500' },
    { name: 'description', label: 'Описание', required: false, type: 'text', placeholder: 'Например: Продукты' },
    { name: 'is_permanent', label: 'Постоянный расход?', required: false, type: 'checkbox' },
    // category_id будет полем типа select, опции которого нужно будет загрузить из стора категорий
    // Указываем type: 'select' и добавляем опции динамически в fieldsWithCategoryOptions
    { name: 'category_id', label: 'Категория', required: true, type: 'select', options: [] }, // Опции будут добавлены динамически
    { name: 'date', label: 'Дата расхода', required: false, type: 'date' },
];


export default function SpendingsPage() { // Компонент страницы расходов
    // Get state and actions from the Spendings store (переименованный стор)
    // spendings can be null initially
    const { spendings, loading, error, fetchSpendings, addSpending, updateSpending, deleteSpending, clearError } = useSpendingsStore(); // Используем useSpendingsStore
    // Get state and actions from the Category store (needed for category select in modal and display in table)
    // categories can be null initially
    const { categories, loading: categoriesLoading, fetchCategories } = useCategoryStore();
    // Get actions from the Modal store
    const { openModal, closeModal } = useModalStore();

    // --- useEffect for initial data fetching ---
    useEffect(() => {
        console.log('SpendingsPage: useEffect triggered.'); // Лог триггера useEffect

        // Trigger fetchSpendings if not currently loading AND data hasn't been loaded yet (spendings is null) AND no previous error
        // Если spendings === null, это означает, что данные еще не загружались
        if (!loading && spendings === null && !error) {
            console.log('SpendingsPage: Triggering fetchSpendings...'); // Лог вызова fetchSpendings
            fetchSpendings(); // Call the fetch action
        } else {
            console.log('SpendingsPage: fetchSpendings skipped. Loading:', loading, 'spendings:', spendings !== null ? 'loaded' : 'null', 'error:', !!error); // Лог пропуска fetchSpendings
        }


        // Fetch categories if they haven't been loaded yet (categories is null) AND not already loading
        // Если categories === null, это означает, что данные еще не загружались
        if (!categoriesLoading && categories === null) { // Проверяем, что категории === null И не загружаются
            console.log('SpendingsPage: Triggering fetchCategories...'); // Лог вызова fetchCategories
            fetchCategories(); // Call the fetch action
        } else {
            console.log('SpendingsPage: fetchCategories skipped. categoriesLoading:', categoriesLoading, 'categories:', categories !== null ? 'loaded' : 'null'); // Лог пропуска fetchCategories
        }


        // Cleanup effect: clear error state in the spending store when unmounts
        return () => {
            console.log('SpendingsPage: useEffect cleanup.'); // Лог cleanup
            clearError(); // Сброс ошибки стора расходов
            // Если у categoryStore есть clearError, его тоже можно вызвать при необходимости
            const categoryStoreState = useCategoryStore.getState();
            if (categoryStoreState.clearError) {
                categoryStoreState.clearError();
            }
        };
        // Dependencies: fetch actions, and state values that determine if fetches are needed
        // Добавили categoriesLoading в зависимости, так как он используется в условии
    }, [fetchSpendings, fetchCategories, loading, spendings, categories, error, clearError, categoriesLoading]);


    // --- Prepare fields for the modal, adding category options ---
    // Эта подготовка полей должна происходить каждый раз, когда categories меняется
    // Зависит от categories
    const fieldsWithCategoryOptions = useMemo(() => { // Используем useMemo
        console.log('SpendingsPage: Recalculating fieldsWithCategoryOptions based on categories.'); // Лог пересчета полей
        return spendingFields.map(field => {
            if (field.name === 'category_id') {
                // Если это поле категории, добавляем опции из загруженных категорий
                // Формат опции для Modal компонента: { value: id, label: name }
                // Убедимся, что категории не null перед маппингом. Если null, используем пустой массив опций.
                const options = categories ? categories.map(cat => ({ value: cat.id, label: cat.name })) : [];
                console.log('SpendingsPage: Category options prepared:', options.length); // Лог количества опций
                return {
                    ...field,
                    options: options
                };
            }
            return field;
        });
    }, [categories]); // Зависимость от categories


    // --- Handlers for UI actions (opening modals) ---
    // These use openModal from the modal store

    // Handle click on "Add Spending" button
    const handleAddClick = () => {
        console.log('SpendingsPage: Add Spending button clicked'); // Лог клика
        clearError(); // Clear store error before opening modal
        console.log('SpendingsPage: Calling openModal for Add Spending...'); // Лог вызова модала

        // Открываем модальное окно добавления расхода
        openModal('addSpending', { // 'addSpending' - тип модала
            title: 'Добавить расход',
            fields: fieldsWithCategoryOptions, // Передаем поля с опциями категорий
            initialData: {}, // Пустой объект для формы добавления
            onSubmit: handleAddSubmit, // Функция, вызываемая при отправке формы
            submitText: 'Добавить',
        });

        console.log('SpendingsPage: openModal for Add Spending called.'); // Лог после вызова модала
    };

    // Handle click on "Edit" icon button for a specific spending
    // Receives the spending object to pre-fill the form
    const handleEditClick = (spending) => {
        console.log('SpendingsPage: Edit button clicked for spending ID:', spending.id); // Лог клика
        clearError(); // Clear store error
        console.log('SpendingsPage: Calling openModal for Edit Spending...'); // Лог вызова модала

        // Открываем модальное окно редактирования расхода
        openModal('editSpending', { // 'editSpending' - тип модала
            title: 'Редактировать расход',
            fields: fieldsWithCategoryOptions, // Передаем поля с опциями категорий
            // Подготавливаем initialData, форматируя дату и category_id
            initialData: {
                ...spending, // Включаем остальные поля из объекта расхода
                // Форматируем дату для input type="date" (YYYY-MM-DD)
                date: spending.date ? new Date(spending.date).toISOString().split('T')[0] : '',
                // category_id должен быть числом в сторе, но input type="select" ожидает строку для value.
                // Преобразуем в строку, если category_id существует, иначе пустая строка.
                category_id: spending.category_id !== undefined && spending.category_id !== null ? String(spending.category_id) : ''
            },
            onSubmit: (formData) => handleEditSubmit(spending.id, formData), // Обработчик отправки с ID расхода
            submitText: 'Сохранить изменения',
        });
        console.log('SpendingsPage: openModal for Edit Spending called.'); // Лог после вызова модала
    };

    // Handle click on "Delete" icon button for a specific spending
    // Receives the spending object for confirmation message
    const handleDeleteClick = (spending) => {
        console.log('SpendingsPage: Delete button clicked for spending ID:', spending.id); // Лог клика
        clearError(); // Clear store error

        // Формируем сообщение подтверждения с деталями расхода
        const spendingDescription = spending.description || `с ID ${spending.id}`; // Описание или ID
        // Находим название категории для отображения
        // Убедимся, что categories не null перед поиском
        const category = categories?.find(cat => cat.id === spending.category_id);
        const categoryName = category ? ` (Категория: ${category.name})` : ''; // Название категории или пустая строка

        // Форматируем сумму для сообщения
        const formattedAmount = typeof spending.amount === 'number'
            ? spending.amount.toLocaleString('ru-RU', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
            : spending.amount;

        const message = `Вы уверены, что хотите удалить расход "${spendingDescription}" на сумму ${formattedAmount} ₽${categoryName}?`;
        console.log('SpendingsPage: Calling openModal for Delete Spending...'); // Лог вызова модала

        // Открываем модальное окно подтверждения удаления
        openModal('confirmDelete', { // 'confirmDelete' - тип модала
            title: 'Подтверждение удаления',
            message: message, // Сообщение с отформатированной суммой и категорией
            onConfirm: () => handleDeleteConfirm(spending.id), // Обработчик подтверждения с ID расхода
            confirmText: 'Удалить',
        });
        console.log('SpendingsPage: openModal for Delete Spending called.'); // Лог после вызова модала
    };
    // --- End Handlers for UI actions ---


    // --- Logic functions called by Modal/ConfirmModal components after user interaction ---
    // These functions call the store actions and then close the modal

    // Logic for adding a spending (called by Modal component via onSubmit)
    const handleAddSubmit = async (formData) => {
        console.log('SpendingsPage Logic: handleAddSubmit called with data:', formData); // Лог начала

        try {
            // category_id из select придет как строка (т.к. value HTML select это строка) или число (если initialData было числом)
            // Преобразуем в число или null, если пустое
            const categoryIdNumber = formData.category_id ? Number(formData.category_id) : null; // Преобразуем в число или null

            const dataToSend = {
                ...formData,
                category_id: categoryIdNumber, // Отправляем числовой ID или null
                // date из type="date" придет как строка "YYYY-MM-DD", API ожидает ISO строку.
                // Преобразование даты в ISO происходит в сторе (spendingStore.js).
            };

            console.log('SpendingsPage Logic: Calling addSpending store action with data:', dataToSend); // Лог вызова стора
            // Вызываем действие добавления расхода из стора
            await addSpending(dataToSend);
            // Если успешно, стор сам обновит список и баланс и закроет модал через closeModal,
            // если мы передали его в Modal.jsx (но мы не передаем, Modal вызывает onSubmit, который мы обрабатываем здесь).
            // Поэтому закрываем модал ЗДЕСЬ после успешного выполнения store action:
            // closeModal(); // Убрано, т.к. Modal.jsx вызывает onSubmit, который уже в try/catch и может вызвать closeModal
            console.log('SpendingsPage Logic: addSpending store action finished.'); // Лог завершения стор действия

        } catch (err) {
            console.error('SpendingsPage Logic: Error during add spending (after form submit):', err); // Лог ошибки
            // Ошибки от API или непредвиденные ошибки будут установлены в spendingStore.error
            // Модальное окно не закроется автоматически при ошибке, чтобы пользователь мог видеть поля и сообщения об ошибках (если они там есть).
            // Если нужно закрыть модал при любой ошибке, раскомментируй closeModal() здесь.
            // closeModal();
            throw err; // Пробрасываем ошибку дальше, чтобы компоненты выше могли ее обработать
        }
        // Успешное закрытие модала должно происходить после await addSpending(dataToSend);
        // Но так как addSpending сам вызывает fetchSpendings, который устанавливает loading=false
        // и триггерит ререндер, модал закроется, когда modalType в modalStore сбросится в null.
        // Поэтому явный closeModal() здесь может быть не нужен, если store action успешен и модал управляется стором.
        // Проверим в UI. Если модал не закрывается при успехе, нужно добавить closeModal() сюда:
        // closeModal();
        console.log('SpendingsPage Logic: handleAddSubmit finished.'); // Лог завершения handleAddSubmit
    };


    // Logic for editing a spending (called by Modal component via onSubmit)
    // Принимает id расхода и formData из модала
    const handleEditSubmit = async (id, formData) => {
        console.log(`SpendingsPage Logic: handleEditSubmit called for ID: ${id} with data:`, formData); // Лог начала

        try {
            // category_id из select придет как строка (т.к. value HTML select это строка) или число (если initialData было числом)
            // Преобразуем в число или null, если пустое
            const categoryIdNumber = formData.category_id !== undefined && formData.category_id !== null && formData.category_id !== '' ? Number(formData.category_id) : null; // Преобразуем в число или null, учитывая пустую строку

            const dataToSend = {
                ...formData,
                category_id: categoryIdNumber, // Отправляем числовой ID или null
                // date из type="date" придет как строка "YYYY-MM-DD", API ожидает ISO строку.
                // Преобразование даты в ISO происходит в сторе (spendingStore.js).
            };
            console.log(`SpendingsPage Logic: Calling updateSpending store action for ID ${id} with data:`, dataToSend); // Лог вызова стора

            // Вызываем действие обновления расхода из стора
            await updateSpending(id, dataToSend);
            console.log('SpendingsPage Logic: updateSpending store action finished.'); // Лог завершения стор действия

        } catch (err) {
            console.error(`SpendingsPage Logic: Error during edit spending ID ${id} (after form submit):`, err); // Лог ошибки
            // Ошибки от API или непредвиденные ошибки будут установлены в spendingStore.error
            // Модальное окно не закроется автоматически при ошибке.
            // closeModal(); // Если нужно закрыть модал при любой ошибке
            throw err;
        }
        // Успешное закрытие модала должно происходить после await updateSpending(...)
        // Как и для Add, если store action успешен и триггерит fetchSpendings, модал закроется
        // когда modalType в modalStore сбросится в null.
        // Если модал не закрывается при успехе, нужно добавить closeModal() сюда:
        // closeModal();
        console.log('SpendingsPage Logic: handleEditSubmit finished.'); // Лог завершения handleEditSubmit
    };


    // Logic for confirming deletion of a spending (called by ConfirmModal component via onConfirm)
    // Принимает id расхода для удаления
    const handleDeleteConfirm = async (id) => {
        console.log(`SpendingsPage Logic: handleDeleteConfirm called for ID: ${id}`); // Лог начала

        try {
            // Вызываем действие удаления расхода из стора
            console.log(`SpendingsPage Logic: Calling deleteSpending store action for ID: ${id}`); // Лог вызова стора
            await deleteSpending(id);
            console.log(`SpendingsPage Logic: deleteSpending store action finished for ID: ${id}.`); // Лог завершения стор действия

        } catch (err) {
            console.error(`SpendingsPage Logic: Error during delete spending ID ${id} (after confirmation):`, err); // Лог ошибки
            // Ошибки от API или непредвиденные ошибки будут установлены в spendingStore.error
            // ConfirmModal должен сам закрыться или его закрытие управляется в LayoutWithHeader
            // после onConfirm. Проверим в UI. Если не закрывается при ошибке, нужно добавить closeModal() сюда:
            // closeModal();
            throw err;
        }
        // Закрытие ConfirmModal происходит в LayoutWithHeader после вызова onConfirm, который мы передали
        // Поэтому явный closeModal() здесь может быть не нужен.
        console.log('SpendingsPage Logic: handleDeleteConfirm finished.'); // Лог завершения handleDeleteConfirm
    };
    // --- End Logic functions ---


    // Determine if a general error message should be displayed
    const displayError = error;

    // Определяем, идет ли общая загрузка (либо расходов, либо категорий), ИЛИ категории еще не загружены (т.е. null или пустой массив)
    // Кнопка добавления должна быть отключена, если категории еще грузятся или их нет
    //spendings === null ? 'загрузка расходов' : (categories === null || (Array.isArray(categories) && categories.length === 0) ? 'загрузка категорий' : 'данные загружены')
    const isOverallLoading = loading || categoriesLoading;
    const isAddButtonDisabled = isOverallLoading || !categories || (Array.isArray(categories) && categories.length === 0);


    // --- Rendering ---
    return (
        // Main page container, replicating CreditsPage styling
        <div className="bg-secondary-50"> {/* Light grey background */}
            <main className="max-w-7xl mx-auto p-4"> {/* Centered container with padding */}

                {/* Header section: Title and Add Button */}
                <div className="flex justify-between items-center mb-4"> {/* Flex container for title and button */}
                    <Text variant="h2">Мои Расходы</Text> {/* Page Title */}
                    {/* Add Spending Button - using TextButton */}
                    {/* Отключаем кнопку, если идет загрузка (чтобы не открывать модал без опций категорий) ИЛИ категории не загружены/пусты */}
                    <TextButton onClick={handleAddClick} disabled={isAddButtonDisabled}> {/* Используем переменную isAddButtonDisabled */}
                        Добавить расход
                    </TextButton>
                </div>

                {/* Display general error message from the store */}
                {displayError && (
                    <div
                        className="mb-4 p-3 bg-red-100 border border-red-300 text-gray-800 rounded-md"> {/* Error message styling */}
                        {displayError.message}
                    </div>
                )}

                {/* Conditional Rendering based on Loading State, Errors, and Data availability */}
                {/* Show initial loading spinner if overall loading is true */}
                {/* Показываем индикатор загрузки только при первой загрузке (когда данные еще null) */}
                {isOverallLoading && (spendings === null || categories === null) ? (
                    <div className="text-center p-4">
                        {/* Уточняем, что грузится */}
                        <Text variant="body">Загрузка {loading && spendings === null ? 'расходов' : ''} {categoriesLoading && categories === null ? 'категорий' : ''}...</Text>
                    </div>
                ) : (
                    // Content container: either empty list message or the list/table
                    <div
                        className="bg-background shadow-md rounded-md overflow-hidden"> {/* White background container for list/table */}
                        {/* Если не загрузка, нет ошибки, данные расходов загружены (spendings !== null), но список пуст */}
                        {/* Check spendings is NOT null AND spendings.length is 0 */}
                        {spendings !== null && spendings.length === 0 ? (
                            // Message when the list is empty
                            <div className="p-4 text-center">
                                <Text variant="body">У вас пока нет добавленных расходов.</Text> {/* Empty list message */}
                            </div>
                        ) : (
                            // Если не загрузка, нет ошибки, и список расходов не пуст
                            // Также убедимся, что категории загружены (categories !== null) и не пустой массив (categories.length > 0, хотя проверка на null выше достаточна)
                            // Отрисовываем таблицу только если spendings не null и не пуст, И категории не null (для отображения имен)
                            spendings !== null && spendings.length > 0 && categories !== null && (
                                // Table to display the list of spendings
                                <table className="min-w-full">
                                    <thead className="bg-secondary-200">
                                    <tr>
                                        <th className="text-left p-4"><Text variant="th">№</Text></th>
                                        <th className="text-left p-4"><Text variant="th">Сумма</Text></th>
                                        <th className="text-left p-4"><Text variant="th">Описание</Text></th>
                                        <th className="text-left p-4"><Text variant="th">Категория</Text></th> {/* Новая колонка Категория */}
                                        <th className="text-left p-4"><Text variant="th">Дата</Text></th>
                                        <th className="text-left p-4"><Text variant="th">Постоянный</Text></th>
                                        <th className="text-left p-4"><Text variant="th">Действия</Text></th>
                                    </tr>
                                    </thead>
                                    <tbody>
                                    {/* Mapping over the spendings array to create table rows */}
                                    {/* Check spendings is NOT null before mapping */}
                                    {spendings.map((spending, index) => { // Можно безопасно мапить, т.к. проверили spendings !== null
                                        // Находим название категории для текущего расхода
                                        // Ищем только если categories не null (проверено в родительском условии рендеринга)
                                        const category = categories.find(cat => cat.id === spending.category_id); // Ищем в массиве categories
                                        const categoryName = category ? category.name : 'Неизвестно'; // Отображаем название или "Неизвестно"

                                        return (
                                            <tr key={spending.id}
                                                className={index % 2 === 0 ? 'bg-background' : 'bg-secondary-50'}>
                                                <td className="p-4"><Text variant="tdPrimary">{index + 1}</Text></td>
                                                {/* Сумма расхода - красным цветом */}
                                                {/* Используем text-accent-error для красного цвета расходов */}
                                                <td className="p-4"><Text variant="tdPrimary"
                                                                          className="text-accent-error font-semibold"> {/* Цвет ошибки для расходов */}
                                                    {typeof spending.amount === 'number'
                                                        // Используем toLocaleString для форматирования с разделителями и 2 знаками после запятой
                                                        ? spending.amount.toLocaleString('ru-RU', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
                                                        : spending.amount} ₽
                                                </Text></td>
                                                <td className="p-4"><Text
                                                    variant="tdSecondary">{spending.description || '-'}</Text></td>
                                                {/* Ячейка для названия категории */}
                                                <td className="p-4"><Text variant="tdSecondary">{categoryName}</Text></td>
                                                <td className="p-4"><Text variant="tdSecondary">
                                                    {/* Отображаем дату в локальном формате */}
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
                        {/* Loading индикатор при перезагрузке данных расходов (список уже есть) */}
                        {loading && spendings !== null && ( // Показываем только если грузятся расходы, а список уже был загружен (не null)
                            <div className="text-center p-4">
                                <Text variant="body">Обновление данных расходов...</Text>
                            </div>
                        )}
                        {/* Loading индикатор при перезагрузке данных категорий (список уже есть) */}
                        {categoriesLoading && categories !== null && ( // Показываем только если грузятся категории, а список уже был загружен (не null)
                            <div className="text-center p-4">
                                <Text variant="body">Обновление данных категорий...</Text>
                            </div>
                        )}
                    </div>
                )}

                {/* Modal components are rendered by LayoutWithHeader */}

            </main>
        </div>
    );
}