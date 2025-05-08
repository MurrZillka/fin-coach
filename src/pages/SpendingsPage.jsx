// src/pages/SpendingsPage.jsx
import React, {useEffect} from 'react'; // useState удален, так как поля определяются статически
// Import necessary components and stores
import Text from '../components/ui/Text';
import TextButton from '../components/ui/TextButton';
import IconButton from '../components/ui/IconButton';
// Import icons
import {PlusIcon, PencilIcon, TrashIcon} from '@heroicons/react/24/outline';

// --- Use Spendings Store ---
import useSpendingStore from '../stores/spendingsStore.js'; // Используем стор расходов
// --- Use Modal Store ---
import useModalStore from '../stores/modalStore.js';
// --- Use Category Store ---
// Расходам нужны категории, поэтому импортируем стор категорий
import useCategoryStore from '../stores/categoryStore';


// Define fields for the Spending form (similar to creditFields but for Spendings)
// Based on API AddSpending/UpdateSpending: { "amount": number, "description": string, "is_permanent": boolean, "category_id": number, "date": date }
// Note: category_id will likely need a select input type
const spendingFields = [
    {name: 'amount', label: 'Сумма', required: true, type: 'number', placeholder: 'Например: 500'},
    {name: 'description', label: 'Описание', required: false, type: 'text', placeholder: 'Например: Продукты'},
    {name: 'is_permanent', label: 'Постоянный расход?', required: false, type: 'checkbox'},
    // category_id будет полем типа select, опции которого нужно будет загрузить из стора категорий
    // Указываем type: 'select' и добавляем опции динамически
    // Опции будут загружены и добавлены в fieldsWithCategoryOptions
    {name: 'category_id', label: 'Категория', required: true, type: 'select', options: []},
    {name: 'date', label: 'Дата расхода', required: false, type: 'date'},
];


export default function SpendingsPage() { // Компонент страницы расходов
    // Get state and actions from the Spending store
    // spendings can be null initially
    const {spendings, loading, error, fetchSpendings, addSpending, updateSpending, deleteSpending, clearError} = useSpendingStore();
    // Get state and actions from the Category store (needed for category select in modal and display in table)
    // categories can be null initially (после нашего изменения)
    const {categories, loading: categoriesLoading, fetchCategories} = useCategoryStore(); // Добавили loading для категорий
    // Get actions from the Modal store
    const {openModal, closeModal} = useModalStore();

    // --- useEffect for initial data fetching ---
    useEffect(() => {
        // Fetch spendings if not currently loading AND data hasn't been loaded yet (spendings is null) AND no previous error
        if (!loading && spendings === null && !error) {
            console.log('SpendingsPage: Triggering fetchSpendings...');
            fetchSpendings(); // Call the fetch action
        }

        // Fetch categories if they haven't been loaded yet (categories is null) AND not already loading
        if (!categoriesLoading && categories === null) { // Проверяем, что категории === null И не загружаются
            console.log('SpendingsPage: Triggering fetchCategories...');
            fetchCategories(); // Call the fetch action
        }


        // Cleanup effect: clear error state in the store when unmounts
        return () => {
            clearError(); // Сброс ошибки стора расходов
            // Если у categoryStore есть clearError, его тоже можно вызвать
            if (useCategoryStore.getState().clearError) {
                useCategoryStore.getState().clearError();
            }
        };
        // Dependencies: fetch actions, and state values that determine if fetches are needed
        // Добавили categoriesLoading в зависимости
    }, [fetchSpendings, fetchCategories, loading, spendings, categories, error, clearError, categoriesLoading]);


    // --- Prepare fields for the modal, adding category options ---
    // Эта подготовка полей должна происходить каждый раз, когда categories меняется
    // Зависит от categories
    const fieldsWithCategoryOptions = React.useMemo(() => { // Мемоизируем, чтобы не пересоздавать без нужды
        return spendingFields.map(field => {
            if (field.name === 'category_id') {
                // Если это поле категории, добавляем опции из загруженных категорий
                // Формат опции для Modal компонента: { value: id, label: name }
                // Убедимся, что категории не null перед маппингом
                const options = categories ? categories.map(cat => ({value: cat.id, label: cat.name})) : [];
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
        clearError(); // Clear store error before opening modal
        // Открываем модальное окно добавления расхода
        openModal('addSpending', { // 'addSpending' - тип модала
            title: 'Добавить расход',
            fields: fieldsWithCategoryOptions, // Передаем поля с опциями категорий
            initialData: {}, // Пустой объект для формы добавления
            onSubmit: handleAddSubmit, // Функция, вызываемая при отправке формы
            submitText: 'Добавить',
        });
    };

    // Handle click on "Edit" icon button for a specific spending
    // Receives the spending object to pre-fill the form
    const handleEditClick = (spending) => {
        clearError(); // Clear store error
        // Открываем модальное окно редактирования расхода
        openModal('editSpending', { // 'editSpending' - тип модала
            title: 'Редактировать расход',
            fields: fieldsWithCategoryOptions, // Передаем поля с опциями категорий
            // Подготавливаем initialData, форматируя дату и category_id
            initialData: {
                ...spending, // Включаем остальные поля из объекта расхода
                // Форматируем дату для input type="date" (YYYY-MM-DD)
                date: spending.date ? new Date(spending.date).toISOString().split('T')[0] : '',
                // category_id должен быть числом для select
                category_id: spending.category_id || '' // Используем пустую строку или null, если категория отсутствует, чтобы select был пустым по умолчанию
            },
            onSubmit: (formData) => handleEditSubmit(spending.id, formData), // Обработчик отправки с ID расхода
            submitText: 'Сохранить изменения',
        });
    };

    // Handle click on "Delete" icon button for a specific spending
    // Receives the spending object for confirmation message
    const handleDeleteClick = (spending) => {
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

        // Открываем модальное окно подтверждения удаления
        openModal('confirmDelete', { // 'confirmDelete' - тип модала
            title: 'Подтверждение удаления',
            message: message, // Сообщение с отформатированной суммой и категорией
            onConfirm: () => handleDeleteConfirm(spending.id), // Обработчик подтверждения с ID расхода
            confirmText: 'Удалить',
        });
    };
    // --- End Handlers for UI actions ---


    // --- Logic functions called by Modal/ConfirmModal components after user interaction ---
    // These functions call the store actions and then close the modal

    // Logic for adding a spending (called by Modal component via onSubmit)
    const handleAddSubmit = async (formData) => {
        try {
            console.log('SpendingsPage Logic: handleAddSubmit called with data:', formData);
            // category_id из select придет как строка или число, убедимся, что это число
            // Если select пустой, может прийти null, undefined или пустая строка. API ждет number.
            // Если required: true, то скорее придет что-то непустое, но лучше проверить.
            const categoryIdNumber = formData.category_id ? Number(formData.category_id) : null; // Преобразуем в число или null

            const dataToSend = {
                ...formData,
                category_id: categoryIdNumber,
                // date из type="date" придет как строка "YYYY-MM-DD", это то, что нужно API
            };

            // Дополнительная валидация на случай, если select категорий был required, но пуст
            if (fieldsWithCategoryOptions.find(field => field.name === 'category_id')?.required && categoryIdNumber === null) {
                console.error('SpendingsPage Logic: category_id is required but is null/empty');
                // Можно показать ошибку пользователю, но Modal уже должен был это сделать
                throw new Error('Пожалуйста, выберите категорию.');
            }


            // Вызываем действие добавления расхода из стора
            await addSpending(dataToSend);
            // Если успешно, закрываем модальное окно
            closeModal();

        } catch (err) {
            console.error('SpendingsPage Logic: Error during add spending (after form submit):', err);
            // Сообщение об ошибке от API отображается Layout'ом через store.error
            closeModal(); // Закрываем модал при ошибке
            throw err; // Пробрасываем ошибку дальше
        }
    };

    // Logic for editing a spending (called by Modal component via onSubmit)
    // Принимает id расхода и formData из модала
    const handleEditSubmit = async (id, formData) => {
        try {
            console.log(`SpendingsPage Logic: handleEditSubmit called for ID: ${id} with data:`, formData);
            // category_id из select придет как строка или число, убедимся, что это число
            const categoryIdNumber = formData.category_id ? Number(formData.category_id) : null; // Преобразуем в число или null

            const dataToSend = {
                ...formData,
                category_id: categoryIdNumber,
                // date из type="date" придет как строка "YYYY-MM-DD", это то, что нужно API
            };

            // Дополнительная валидация на случай, если select категорий был required, но пуст
            if (fieldsWithCategoryOptions.find(field => field.name === 'category_id')?.required && categoryIdNumber === null) {
                console.error('SpendingsPage Logic: category_id is required but is null/empty');
                throw new Error('Пожалуйста, выберите категорию.');
            }


            // Вызываем действие обновления расхода из стора
            await updateSpending(id, dataToSend);
            // Если успешно, закрываем модальное окно
            closeModal();
            console.log('SpendingsPage Logic: handleEditSubmit successful, modal closed.');

        } catch (err) {
            console.error('SpendingsPage Logic: Error during edit spending (after form submit):', err);
            // Сообщение об ошибке от API отображается Layout'ом через store.error
            closeModal(); // Закрываем модал при ошибке
            throw err; // Пробрасываем ошибку дальше
        }
    };


    // Logic for confirming deletion of a spending (called by ConfirmModal component via onConfirm)
    // Принимает id расхода для удаления
    const handleDeleteConfirm = async (id) => {
        try {
            console.log(`SpendingsPage Logic: handleDeleteConfirm called for ID: ${id}`);
            // Вызываем действие удаления расхода из стора
            await deleteSpending(id);
            // Если успешно, закрываем модальное окно
            console.log(`SpendingsPage Logic: Расход ${id} успешно удален.`);
            closeModal(); // Закрываем модал после успешного удаления

        } catch (err) {
            console.error('SpendingsPage Logic: Error during delete spending (after confirmation):', err);
            // Сообщение об ошибке от API отображается Layout'ом через store.error
            closeModal(); // Закрываем модал при ошибке
            throw err; // Пробрасываем ошибку дальше
        }
    };
    // --- End Logic functions ---


    // Determine if a general error message should be displayed
    const displayError = error;

    // Определяем, идет ли общая загрузка (либо расходов, либо категорий)
    const isOverallLoading = loading || categoriesLoading;


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
                    <TextButton onClick={handleAddClick} disabled={isOverallLoading || !categories || categories.length === 0}>
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
                {isOverallLoading ? (
                    <div className="text-center p-4">
                        <Text variant="body">Загрузка {spendings === null ? 'расходов' : ''} {categories === null ? 'категорий' : ''}...</Text> {/* Уточняем, что грузится */}
                    </div>
                ) : (
                    // Content container: either empty list message or the list/table
                    <div
                        className="bg-background shadow-md rounded-md overflow-hidden"> {/* White background container for list/table */}
                        {/* Если не загрузка, нет ошибки, данные расходов загружены, но список пуст */}
                        {spendings !== null && spendings.length === 0 ? (
                            // Message when the list is empty
                            <div className="p-4 text-center">
                                <Text variant="body">У вас пока нет добавленных
                                    расходов.</Text> {/* Empty list message */}
                            </div>
                        ) : (
                            // Если не загрузка, нет ошибки, и список расходов не пуст
                            // Также убедимся, что категории загружены, чтобы отобразить их названия
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
                                    {spendings.map((spending, index) => {
                                        // Находим название категории для текущего расхода
                                        // Ищем только если categories не null
                                        const category = categories?.find(cat => cat.id === spending.category_id);
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
                        {/* Show a general loading/updating indicator if loading but we already have data (spendings !== null) */}
                        {/* Этот блок теперь внутри основного блока, чтобы не показываться при полной загрузке */}
                        {/* Нет, лучше оставить его снаружи, чтобы показывать обновление списка при активной загрузке */}
                        {/* Loading индикатор при перезагрузке данных расходов */}
                        {loading && spendings !== null && !categoriesLoading && ( // Показываем только если грузятся расходы, категории уже есть
                            <div className="text-center p-4">
                                <Text variant="body">Обновление данных расходов...</Text>
                            </div>
                        )}
                        {/* Loading индикатор при перезагрузке данных категорий */}
                        {categoriesLoading && categories !== null && !loading && ( // Показываем только если грузятся категории, расходы уже есть
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