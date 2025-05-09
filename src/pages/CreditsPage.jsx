// src/pages/CreditsPage.jsx
import React, {useEffect} from 'react';
// Import necessary components and stores
import Text from '../components/ui/Text';
import TextButton from '../components/ui/TextButton';
import IconButton from '../components/ui/IconButton';
// Import icons
import {PlusIcon, PencilIcon, TrashIcon} from '@heroicons/react/24/outline';
import { CheckCircleIcon, XCircleIcon } from '@heroicons/react/24/solid';

// --- Use Credit Store ---
import useCreditStore from '../stores/creditStore';
// --- Use Modal Store ---
import useModalStore from '../stores/modalStore.js';


// Define fields for the Credit form (similar to categoryFields but for Credits)
const creditFields = [
    {name: 'amount', label: 'Сумма', required: true, type: 'number', placeholder: 'Например: 50000'},
    {name: 'description', label: 'Описание', required: false, type: 'text', placeholder: 'Например: Зарплата за месяц'},
    {name: 'is_permanent', label: 'Постоянный доход?', required: false, type: 'checkbox'},
    {name: 'date', label: 'Дата начала получения дохода', required: true, type: 'date'},
    {name: 'end_date', label: 'Дата окончания (для постоянных)', required: false, type: 'date'},
];


export default function CreditsPage() {
    // Get state and actions from the Credit store
    const {credits, loading, error, fetchCredits, addCredit, updateCredit, deleteCredit, clearError} = useCreditStore();
    // Get actions from the Modal store
    const {openModal, closeModal} = useModalStore();

    // --- useEffect for initial data fetching ---
    useEffect(() => {
        if (!loading && credits === null && !error) {
            console.log('CreditsPage: Triggering fetchCredits...');
            fetchCredits();
        }

        return () => {
            clearError();
        };
    }, [fetchCredits, loading, credits, error, clearError]);


    // --- Вспомогательная функция для клиентской валидации дат ---
    const validateCreditDates = (formData) => {
        if (formData.is_permanent) {
            const startDate = new Date(formData.date);
            if (formData.end_date) {
                const endDate = new Date(formData.end_date);
                if (endDate < startDate) {
                    throw new Error('Дата окончания должна быть больше или равна дате начала.');
                }
            }
        }
    };
    // --- КОНЕЦ Вспомогательной функции ---


    // --- Handlers for UI actions (opening modals) ---
    const handleAddClick = () => {
        clearError();
        openModal('addCredit', {
            title: 'Добавить доход',
            fields: creditFields,
            initialData: { is_permanent: false },
            onSubmit: handleAddSubmit,
            submitText: 'Добавить',
        });
    };

    const handleEditClick = (credit) => {
        clearError();
        openModal('editCredit', {
            title: 'Редактировать доход',
            fields: creditFields,
            initialData: {
                ...credit,
                date: credit.date ? new Date(credit.date).toISOString().split('T')[0] : '',
                end_date: (credit.end_date && credit.end_date !== '0001-01-01T00:00:00Z')
                    ? new Date(credit.end_date).toISOString().split('T')[0]
                    : '',
            },
            onSubmit: (formData) => handleEditSubmit(credit.id, formData),
            submitText: 'Сохранить изменения',
        });
    };

    const handleDeleteClick = (credit) => {
        clearError();

        const creditDescription = credit.description || `с ID ${credit.id}`;
        const amountToFormat = credit.is_permanent && typeof credit.full_amount === 'number'
            ? credit.full_amount
            : credit.amount;

        const formattedAmount = typeof amountToFormat === 'number'
            ? amountToFormat.toLocaleString('ru-RU', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
            : amountToFormat;
        const message = `Вы уверены, что хотите удалить доход "${creditDescription}" на сумму ${formattedAmount} ₽?`;

        openModal('confirmDelete', {
            title: 'Подтверждение удаления',
            message: message,
            onConfirm: () => handleDeleteConfirm(credit.id),
            confirmText: 'Удалить',
        });
    };
    // --- End Handlers for UI actions ---


    // --- Logic functions called by Modal/ConfirmModal components after user interaction ---
    const handleAddSubmit = async (formData) => {
        try {
            validateCreditDates(formData);

            await addCredit(formData);
            closeModal();
        } catch (err) {
            if (err.message === 'Дата окончания должна быть больше или равна дате начала.') {
                useCreditStore.getState().set({ error: { message: err.message } });
            } else {
                console.error('Error during add credit (after form submit):', err);
            }
            closeModal();
            throw err;
        }
    };

    const handleEditSubmit = async (id, formData) => {
        try {
            console.log(`CreditsPage Logic: handleEditSubmit called for ID: ${id} with data:`, formData);

            validateCreditDates(formData);

            const dataToUpdate = { ...formData };

            if (dataToUpdate.is_permanent && dataToUpdate.end_date === '') {
                dataToUpdate.end_date = '0001-01-01T00:00:00Z';
            }

            await updateCredit(id, dataToUpdate);
            closeModal();
            console.log('CreditsPage Logic: handleEditSubmit successful, modal closed.');

        } catch (err) {
            if (err.message === 'Дата окончания должна быть больше или равна дате начала.') {
                useCreditStore.getState().set({ error: { message: err.message } });
            } else {
                console.error('CreditsPage Logic: Error during edit credit (after form submit):', err);
            }
            closeModal();
        }
    };


    const handleDeleteConfirm = async (id) => {
        try {
            await deleteCredit(id);
            console.log(`Logic: Credit ${id} успешно удален.`);
            closeModal();

        } catch (err) {
            console.error('Error during delete credit (after confirmation):', err);
            closeModal();
            throw err;
        }
    };
    // --- End Logic functions ---


    const displayError = error;


    // --- Rendering ---
    return (
        <div className="bg-secondary-50">
            <main className="max-w-7xl mx-auto p-4">

                {/* Header section: Title and Add Button */}
                <div className="flex justify-between items-center mb-4">
                    <Text variant="h2">Мои Доходы</Text>
                    <TextButton onClick={handleAddClick}>
                        Добавить доход
                    </TextButton>
                </div>

                {/* Display general error message from the store */}
                {displayError && (
                    <div
                        className="mb-4 p-3 bg-red-100 border border-red-300 text-gray-800 rounded-md">
                        {displayError.message}
                    </div>
                )}

                {/* Conditional Rendering based on Loading State, Errors, and Data availability */}
                {loading && credits === null ? (
                    <div className="text-center p-4">
                        <Text variant="body">Загрузка доходов...</Text>
                    </div>
                ) : (
                    <div
                        className="bg-background shadow-md rounded-md overflow-hidden">
                        {credits !== null && credits.length === 0 ? (
                            <div className="p-4 text-center">
                                <Text variant="body">У вас пока нет добавленных
                                    доходов.</Text>
                            </div>
                        ) : (
                            credits !== null && credits.length > 0 && (
                                <table className="min-w-full">
                                    <thead className="bg-secondary-200">
                                    <tr>
                                        <th className="text-left p-4"><Text variant="th">№</Text></th>
                                        <th className="text-left p-4"><Text variant="th">Сумма</Text></th>
                                        <th className="text-left p-4"><Text variant="th">Описание</Text></th>
                                        <th className="text-left p-4"><Text variant="th">Дата начала</Text></th>
                                        <th className="text-left p-4"><Text variant="th">Регулярный</Text></th>
                                        <th className="text-left p-4"><Text variant="th">Действия</Text></th>
                                    </tr>
                                    </thead>
                                    <tbody>
                                    {credits.map((credit, index) => (
                                        <tr key={credit.id}
                                            className={index % 2 === 0 ? 'bg-background' : 'bg-secondary-50'}>
                                            <td className="p-4"><Text variant="tdPrimary">{index + 1}</Text></td>
                                            <td className="p-4">
                                                {credit.is_permanent ? (
                                                    <>
                                                        <div className="flex items-center mb-1">
                                                            <Text variant="tdSecondary" className="font-normal text-gray-600 mr-1">Периодическая:</Text>
                                                            <Text variant="tdPrimary" className="text-accent-success font-semibold">
                                                                {typeof credit.amount === 'number' ? credit.amount.toLocaleString('ru-RU', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : credit.amount} ₽
                                                            </Text>
                                                        </div>
                                                        <div className="flex items-center">
                                                            <Text variant="tdSecondary" className="font-normal text-gray-600 mr-1">Общая:</Text>
                                                            <Text variant="tdPrimary" className="text-accent-success font-semibold">
                                                                {typeof credit.full_amount === 'number' ? credit.full_amount.toLocaleString('ru-RU', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : credit.full_amount} ₽
                                                            </Text>
                                                        </div>
                                                    </>
                                                ) : (
                                                    <div className="flex items-center">
                                                        <Text variant="tdSecondary" className="font-normal text-gray-600 mr-1">Сумма:</Text>
                                                        <Text variant="tdPrimary" className="text-accent-success font-semibold">
                                                            {typeof credit.amount === 'number' ? credit.amount.toLocaleString('ru-RU', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : credit.amount} ₽
                                                        </Text>
                                                    </div>
                                                )}
                                            </td>
                                            <td className="p-4"><Text
                                                variant="tdSecondary">{credit.description || '-'}</Text></td>
                                            <td className="p-4"><Text variant="tdSecondary">
                                                {credit.date ? new Date(credit.date).toLocaleDateString('ru-RU') : '-'}
                                            </Text></td>
                                            <td className="p-4">
                                                {credit.is_permanent ? (
                                                    <div className="flex items-center gap-1">
                                                        {/* Проверяем, закончились ли выплаты */}
                                                        {credit.end_date && credit.end_date !== '0001-01-01T00:00:00Z' && new Date(credit.end_date) < new Date() ? (
                                                            // Завершенные платежи (серая галочка)
                                                            <>
                                                                <CheckCircleIcon className="h-5 w-5 text-gray-400" />
                                                                <Text variant="tdSecondary" className="text-gray-600">
                                                                    до {new Date(credit.end_date).toLocaleDateString('ru-RU')}
                                                                </Text>
                                                            </>
                                                        ) : (
                                                            // Текущие или бессрочные платежи (синяя галочка)
                                                            <>
                                                                <CheckCircleIcon className="h-5 w-5 text-blue-500" />
                                                                <Text variant="tdSecondary" className="text-blue-700">
                                                                    выплаты продолжаются
                                                                </Text>
                                                            </>
                                                        )}
                                                    </div>
                                                ) : (
                                                    // --- ИЗМЕНЕНИЕ: Бледно-красная иконка для разовых доходов ---
                                                    <div className="flex items-center gap-1">
                                                        <XCircleIcon className="h-5 w-5 text-red-300" /> {/* ИЗМЕНЕНО: text-red-500 на text-red-300 */}
                                                        <Text variant="tdSecondary">Разовый</Text>
                                                    </div>
                                                    // --- КОНЕЦ ИЗМЕНЕНИЯ ---
                                                )}
                                            </td>
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
                        {loading && credits !== null && (
                            <div className="text-center p-4">
                                <Text variant="body">Обновление данных...</Text>
                            </div>
                        )}
                    </div>
                )}

            </main>
        </div>
    );
}