// src/pages/CreditsPage.jsx
import React, {useEffect} from 'react';
// Import necessary components and stores
import Text from '../components/ui/Text';
import TextButton from '../components/ui/TextButton';
import IconButton from '../components/ui/IconButton';
// Import icons
import {PlusIcon, PencilIcon, TrashIcon} from '@heroicons/react/24/outline';

// --- Use Credit Store ---
import useCreditStore from '../stores/creditStore';
// --- Use Modal Store ---
import useModalStore from '../stores/modalStore.js';


// Define fields for the Credit form (similar to categoryFields but for Credits)
// Based on Postman AddCredit body: { "amount": number, "description": string, "is_permanent": boolean }
const creditFields = [
    {name: 'amount', label: 'Сумма', required: true, type: 'number', placeholder: 'Например: 50000'},
    {name: 'description', label: 'Описание', required: false, type: 'text', placeholder: 'Например: Зарплата за месяц'},
    // is_permanent is a boolean, might need a checkbox input type
    // Assuming a checkbox input type for boolean in a generic form component
    {name: 'is_permanent', label: 'Постоянный доход?', required: false, type: 'checkbox'},
    // Note: The API also expects 'date' for UpdateCredit, but not AddCredit body in Postman?
    // Let's add date to the fields, making it optional for add, required for edit potentially.
    // For simplicity now, let's add it as an optional text field and handle formatting later.
    {name: 'date', label: 'Дата получения дохода', required: false, type: 'date'}, // Using type="date" might simplify things if using a date input
];


export default function CreditsPage() {
    // Get state and actions from the Credit store
    // credits can be null initially
    const {credits, loading, error, fetchCredits, addCredit, updateCredit, deleteCredit, clearError} = useCreditStore();
    // Get actions from the Modal store
    const {openModal, closeModal} = useModalStore();

    // --- useEffect for initial data fetching ---
    // Trigger fetch when component mounts or when dependencies change relevant to initial load state
    useEffect(() => {
        // Fetch if not currently loading AND data hasn't been loaded yet (credits is null) AND no previous error
        if (!loading && credits === null && !error) {
            console.log('CreditsPage: Triggering fetchCredits...');
            fetchCredits(); // Call the fetch action
        }

        // Cleanup effect: clear error state in the store when unmounts
        return () => {
            clearError();
        };
        // Dependencies: fetchCredits action, and state values that determine if fetch is needed
    }, [fetchCredits, loading, credits, error, clearError]);


    // --- Handlers for UI actions (opening modals) ---
    // These use openModal from the modal store

    // Handle click on "Add Credit" button
    const handleAddClick = () => {
        clearError(); // Clear store error before opening modal
        // Open the generic Modal component (handled by LayoutWithHeader)
        openModal('addCredit', { // 'addCredit' is a type string to identify the modal/form content
            title: 'Добавить доход',
            fields: creditFields, // Pass the form fields definition
            initialData: {}, // Empty object for add form
            onSubmit: handleAddSubmit, // Function to call when modal form is submitted
            submitText: 'Добавить',
        });
    };

    // Handle click on "Edit" icon button for a specific credit
    // Receives the credit object to pre-fill the form
    const handleEditClick = (credit) => {
        clearError(); // Clear store error
        // Open the generic Modal component for editing
        openModal('editCredit', { // 'editCredit' is a type string
            title: 'Редактировать доход',
            fields: creditFields,
            // --- Prepare initialData, formatting date for the input type="date" ---
            initialData: {
                ...credit, // Include all other fields from the credit object
                // Format the date: if credit.date exists from API (likely ISO), convert it to a Date object,
                // then get the ISO string and take only the "YYYY-MM-DD" part for the input type="date".
                // If credit.date is null/undefined, provide an empty string.
                // Это исправит проблему, когда поле даты в модале редактирования было пустым.
                date: credit.date ? new Date(credit.date).toISOString().split('T')[0] : '',
            },
            // --- End initialData preparation ---
            // onSubmit handler that captures the credit.id
            onSubmit: (formData) => handleEditSubmit(credit.id, formData),
            submitText: 'Сохранить изменения',
        });
    };

    // Handle click on "Delete" icon button for a specific credit
    // Receives the credit object to get name/description for confirmation message
    const handleDeleteClick = (credit) => {
        clearError(); // Clear store error

        // Formulate confirmation message using credit details
        const creditDescription = credit.description || `с ID ${credit.id}`; // Use description or ID as fallback

        // --- НОВОЕ: Форматируем сумму для отображения в сообщении ---
        const formattedAmount = typeof credit.amount === 'number'
            // Используем toLocaleString для форматирования с разделителями разрядов и 2 знаками после запятой
            ? credit.amount.toLocaleString('ru-RU', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
            : credit.amount; // На случай, если amount не число (хотя по API должно быть)
        const message = `Вы уверены, что хотите удалить доход "${creditDescription}" на сумму ${formattedAmount} ₽?`;
        // --- КОНЕЦ НОВОГО ---

        // Open the ConfirmModal component (handled by LayoutWithHeader)
        openModal('confirmDelete', { // 'confirmDelete' is a type string
            title: 'Подтверждение удаления',
            message: message, // Сообщение с отформатированной суммой
            // onConfirm handler that captures the credit.id
            onConfirm: () => handleDeleteConfirm(credit.id),
            confirmText: 'Удалить',
        });
    };
    // --- End Handlers for UI actions ---


    // --- Logic functions called by Modal/ConfirmModal components after user interaction ---
    // These functions call the store actions and then close the modal

    // Logic for adding a credit (called by Modal component via onSubmit)
    const handleAddSubmit = async (formData) => {
        try {
            // Call the addCredit action from the store
            await addCredit(formData);
            // If successful, close the modal
            closeModal();
            // No need to refetch here, addCredit action already does it

        } catch (err) {
            // If an error occurred during addCredit (handled and set in store.error),
            // the error message will be displayed by LayoutWithHeader.
            // We still need to close the modal on error.
            console.error('Error during add credit (after form submit):', err);
            closeModal(); // Close modal on error
            throw err; // Re-throw error if needed by the modal handling logic (optional depending on Modal implementation)
        }
    };

    // Logic for editing a credit (called by Modal component via onSubmit)
    // This function sends the date in the "YYYY-MM-DD" format if API needs only that.
    const handleEditSubmit = async (id, formData) => {
        try {
            console.log(`CreditsPage Logic: handleEditSubmit called for ID: ${id} with data:`, formData); // formData.date is "YYYY-MM-DD" string from modal

            const dataToUpdate = { ...formData }; // Create a copy of form data

            // Find the date field definition (optional, but good for reference)
            const dateField = creditFields.find(field => field.name === 'date');

            // If the date field is defined in creditFields
            if (dateField) {
                if (dataToUpdate.date) {
                    // If date is present in formData (as "YYYY-MM-DD" string from input)
                    // If API strictly needs "YYYY-MM-DD", we just pass the string as is.
                    const dateStringFromForm = dataToUpdate.date;
                    dataToUpdate.date = dateStringFromForm; // Send the "YYYY-MM-DD" string
                    console.log(`CreditsPage Logic: Passing date string to API:`, dataToUpdate.date);
                } else {
                    // If date field was empty in the form (null, undefined, or '')
                    console.log('CreditsPage Logic: Date field was empty in form. Setting date to null for API.');
                    dataToUpdate.date = null; // Send null if API accepts it for optional date
                }
            } else {
                // If the date field is NOT defined in creditFields (defensive check)
                // Ensure 'date' is removed if it somehow exists in formData but isn't expected.
                // --- ИСПРАВЛЕНИЕ ESLint ошибки на .hasOwnProperty ---
                if (Object.prototype.hasOwnProperty.call(dataToUpdate, 'date')) { // <-- Исправленная строка
                    // --- КОНЕЦ ИСПРАВЛЕНИЯ ---
                    delete dataToUpdate.date; // Or dataToUpdate.date = null; если API ожидает ключ, но со значением null
                    console.log('CreditsPage Logic: Date field not defined in fields, ensuring it is not included in API data.');
                }
            }


            // Примечание: Валидация (проверка на будущие даты) происходит ДО вызова этой функции, в handleSubmit Modal.jsx.
            // Так что мы предполагаем, что dataToUpdate.date, если он присутствует, не является датой в будущем.


            await updateCredit(id, dataToUpdate); // Отправляем подготовленные dataToUpdate
            closeModal();
            console.log('CreditsPage Logic: handleEditSubmit successful, modal closed.');

        } catch (err) {
            console.error('CreditsPage Logic: Error during edit credit (after form submit):', err);
            closeModal();
            // Сообщение об ошибке от API отображается Layout'ом через store.error
            // throw err;
        }
    };


    // Logic for confirming deletion of a credit (called by ConfirmModal component via onConfirm)
    const handleDeleteConfirm = async (id) => {
        try {
            // Call the deleteCredit action from the store
            await deleteCredit(id);
            // If successful, close the modal
            console.log(`Logic: Credit ${id} successfully deleted.`);
            closeModal(); // Close modal after successful deletion
            // No need to refetch here, deleteCredit action already does it

        } catch (err) {
            console.error('Error during delete credit (after confirmation):', err);
            closeModal(); // Close modal on error
            throw err;
        }
    };
    // --- End Logic functions ---


    // Determine if a general error message should be displayed
    const displayError = error;


    // --- Rendering ---
    return (
        // Main page container, replicating CategoriesPage styling
        <div className="bg-secondary-50"> {/* Light grey background */}
            <main className="max-w-7xl mx-auto p-4"> {/* Centered container with padding */}

                {/* Header section: Title and Add Button */}
                <div className="flex justify-between items-center mb-4"> {/* Flex container for title and button */}
                    <Text variant="h2">Мои Доходы</Text> {/* Page Title */}
                    {/* Add Credit Button - using TextButton without icon, replicating CategoriesPage */}
                    <TextButton onClick={handleAddClick}>
                        Добавить доход
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
                {/* Show initial loading spinner if loading AND no data loaded yet */}
                {loading && credits === null ? (
                    <div className="text-center p-4">
                        <Text variant="body">Загрузка доходов...</Text>
                    </div>
                ) : (
                    // Content container: either empty list message or the list/table
                    <div
                        className="bg-background shadow-md rounded-md overflow-hidden"> {/* White background container for list/table */}
                        {/* If not loading and data is loaded but empty */}
                        {credits !== null && credits.length === 0 ? (
                            // Message when the list is empty
                            <div className="p-4 text-center">
                                <Text variant="body">У вас пока нет добавленных
                                    доходов.</Text> {/* Empty list message */}
                            </div>
                        ) : (
                            // If not loading, no error, and data is loaded and not empty
                            // (implicitly: credits !== null && credits.length > 0)
                            credits !== null && credits.length > 0 && ( // Explicit check just to be safe
                                // Table to display the list of credits
                                <table className="min-w-full">
                                    <thead className="bg-secondary-200">
                                    <tr>
                                        <th className="text-left p-4"><Text variant="th">№</Text></th>
                                        <th className="text-left p-4"><Text variant="th">Сумма</Text></th>
                                        <th className="text-left p-4"><Text variant="th">Описание</Text></th>
                                        <th className="text-left p-4"><Text variant="th">Дата</Text></th>
                                        <th className="text-left p-4"><Text variant="th">Постоянный</Text></th>
                                        <th className="text-left p-4"><Text variant="th">Действия</Text></th>
                                    </tr>
                                    </thead>
                                    <tbody>
                                    {/* Mapping over the credits array to create table rows */}
                                    {credits.map((credit, index) => (
                                        <tr key={credit.id}
                                            className={index % 2 === 0 ? 'bg-background' : 'bg-secondary-50'}>
                                            <td className="p-4"><Text variant="tdPrimary">{index + 1}</Text></td>
                                            <td className="p-4"><Text variant="tdPrimary"
                                                                      className="text-accent-success font-semibold">
                                                {/* --- НОВОЕ: Форматирование суммы с разделителями --- */}
                                                {typeof credit.amount === 'number'
                                                    // Используем toLocaleString с русской локалью для разделителей и 2 знаками после запятой
                                                    ? credit.amount.toLocaleString('ru-RU', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
                                                    : credit.amount} ₽
                                                {/* --- КОНЕЦ НОВОГО --- */}
                                            </Text></td>
                                            <td className="p-4"><Text
                                                variant="tdSecondary">{credit.description || '-'}</Text></td>
                                            <td className="p-4"><Text variant="tdSecondary">
                                                {credit.date ? new Date(credit.date).toLocaleDateString() : '-'}
                                            </Text></td>
                                            <td className="p-4"><Text variant="tdSecondary">
                                                {credit.is_permanent ? 'Да' : 'Нет'}
                                            </Text></td>
                                            <td className="p-4 flex gap-2">
                                                <IconButton
                                                    icon={PencilIcon}
                                                    tooltip="Редактировать"
                                                    className="text-primary-600 hover:bg-primary-600/10 hover:text-primary-500"
                                                    onClick={() => handleEditClick(credit)}
                                                />
                                                <IconButton
                                                    icon={TrashIcon}
                                                    tooltip="Удалить"
                                                    className="text-accent-error hover:bg-accent-error/10 hover:text-accent-error/80"
                                                    onClick={() => handleDeleteClick(credit)}
                                                />
                                            </td>
                                        </tr>
                                    ))}
                                    </tbody>
                                </table>
                            )
                        )}
                        {/* Show a general loading/updating indicator if loading but we already have data (credits !== null) */}
                        {loading && credits !== null && (
                            <div className="text-center p-4">
                                <Text variant="body">Обновление данных...</Text>
                            </div>
                        )}
                    </div>
                )}

                {/* Modal components are rendered by LayoutWithHeader */}

            </main>
        </div>
    );
}