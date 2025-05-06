// src/pages/CreditsPage.jsx
import React, {useEffect} from 'react'; // Need React import for JSX in older configs, good practice anyway
// Import necessary components and stores
import Text from '../components/ui/Text';
import TextButton from '../components/ui/TextButton';
import IconButton from '../components/ui/IconButton';
// Import icons
import {PencilIcon, TrashIcon} from '@heroicons/react/24/outline';

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
    {name: 'date', label: 'Дата (YYYY-MM-DD)', required: false, type: 'date'}, // Using type="date" might simplify things if using a date input
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

        // Cleanup effect: clear error state in the store when component unmounts
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
            initialData: credit, // Pass the credit data to pre-fill the form
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
        const message = `Вы уверены, что хотите удалить доход "${creditDescription}" на сумму ${credit.amount} ₽?`;

        // Open the ConfirmModal component (handled by LayoutWithHeader)
        openModal('confirmDelete', { // 'confirmDelete' is a type string
            title: 'Подтверждение удаления',
            message: message, // The confirmation message
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
    const handleEditSubmit = async (id, formData) => {
        try {
            // Call the updateCredit action from the store
            await updateCredit(id, formData);
            // If successful, close the modal
            closeModal();
            // No need to refetch here, updateCredit action already does it

        } catch (err) {
            console.error('Error during edit credit (after form submit):', err);
            closeModal(); // Close modal on error
            throw err;
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
                                                {typeof credit.amount === 'number' ? credit.amount.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ' ') : credit.amount} ₽
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