// src/pages/CreditsPage.jsx
import React, { useEffect } from 'react'; // --- ИЗМЕНЕНИЕ: Удален useState ---
import Text from '../components/ui/Text';
import TextButton from '../components/ui/TextButton';
import IconButton from '../components/ui/IconButton';
import { PencilIcon, TrashIcon } from '@heroicons/react/24/outline';
import { CheckCircleIcon, XCircleIcon } from '@heroicons/react/24/solid';
import useCreditStore from '../stores/creditStore';
// --- ИЗМЕНЕНИЕ: Добавлен setModalSubmissionError в деструктуризацию ---
import useModalStore from '../stores/modalStore.js';

// Динамическое формирование полей
function getCreditFields(formData) {
    const isPermanent = !!formData.is_permanent;
    const isExhausted = !!formData.is_exhausted;

    const fields = [
        { name: 'amount', label: 'Сумма', required: true, type: 'number', placeholder: 'Например: 50000' },
        { name: 'description', label: 'Описание', required: false, type: 'text', placeholder: 'Например: Зарплата за месяц' },
        { name: 'is_permanent', label: 'Постоянный доход?', required: false, type: 'checkbox' },
        { name: 'date', label: isPermanent ? 'Дата начала получения дохода' : 'Дата получения дохода', required: true, type: 'date' },
    ];

    if (isPermanent) {
        fields.push({
            name: 'is_exhausted',
            label: 'Этот источник иссяк?',
            required: false,
            type: 'checkbox',
        });
        fields.push({
            name: 'end_date',
            label: 'Дата окончания доходов из этого источника',
            required: false,
            type: 'date',
            disabled: !isExhausted, // disabled если чекбокс не отмечен
        });
    }

    return fields;
}

export default function CreditsPage() {
    const { credits, loading, error, fetchCredits, addCredit, updateCredit, deleteCredit, clearError } = useCreditStore();
    // --- ИЗМЕНЕНИЕ: Получаем setModalSubmissionError из modalStore ---
    const { openModal, closeModal, setModalSubmissionError } = useModalStore();
    // --- ИЗМЕНЕНИЕ: Удалено локальное состояние submissionError ---
    // const [submissionError, setSubmissionError] = useState(null);


    useEffect(() => {
        if (!loading && credits === null && !error) {
            fetchCredits();
        }
        // Cleanup function to clear the main page error when component unmounts or dependencies change
        return () => {
            clearError();
        };
    }, [fetchCredits, loading, credits, error, clearError]);

    const handleAddClick = () => {
        clearError(); // Очищаем общую ошибку стора при открытии модалки
        // --- ИЗМЕНЕНИЕ: Удалено setSubmissionError(null); - теперь этим занимается openModal в сторе ---

        const initialData = { is_permanent: false, is_exhausted: false };
        openModal('addCredit', {
            title: 'Добавить доход',
            fields: getCreditFields(initialData),
            initialData,
            onSubmit: handleAddSubmit,
            submitText: 'Добавить',
            onFieldChange: (name, value, prevFormData) => {
                const newFormData = { ...prevFormData, [name]: value };
                if (name === 'is_exhausted' && !value) newFormData.end_date = '';
                if (name === 'is_permanent' && !value) {
                    newFormData.is_exhausted = false;
                    newFormData.end_date = '';
                }
                return getCreditFields(newFormData);
            },
            // --- ИЗМЕНЕНИЕ: Удалена передача submissionError: submissionError - теперь его читает LayoutWithHeader напрямую из стора ---
            // --- ИЗМЕНЕНИЕ: Упрощен обработчик закрытия модалки пользователем ---
            onClose: () => {
                closeModal();
                // --- ИЗМЕНЕНИЕ: Удалено setSubmissionError(null); ---
                useCreditStore.getState().clearError(); // Также очищаем общую ошибку стора на всякий случай
            }
            // --- Конец ИЗМЕНЕНИЙ ---
        });
    };

    const handleEditClick = (credit) => {
        clearError(); // Очищаем общую ошибку стора при открытии модалки
        // --- ИЗМЕНЕНИЕ: Удалено setSubmissionError(null); - теперь этим занимается openModal в сторе ---

        const initialData = {
            ...credit,
            date: credit.date ? new Date(credit.date).toISOString().split('T')[0] : '',
            end_date: (credit.end_date && credit.end_date !== '0001-01-01T00:00:00Z' && credit.end_date !== '0001-01-01')
                ? new Date(credit.end_date).toISOString().split('T')[0]
                : '',
            is_exhausted: !!credit.end_date && credit.end_date !== '0001-01-01T00:00:00Z' && credit.end_date !== '0001-01-01',
        };
        openModal('editCredit', {
            title: 'Редактировать доход',
            fields: getCreditFields(initialData),
            initialData,
            onSubmit: (formData) => handleEditSubmit(credit.id, formData),
            submitText: 'Сохранить изменения',
            onFieldChange: (name, value, prevFormData) => {
                const newFormData = { ...prevFormData, [name]: value };
                if (name === 'is_exhausted' && !value) newFormData.end_date = '';
                if (name === 'is_permanent' && !value) {
                    newFormData.is_exhausted = false;
                    newFormData.end_date = '';
                }
                return getCreditFields(newFormData);
            },
            // --- ИЗМЕНЕНИЕ: Удалена передача submissionError: submissionError ---
            // --- ИЗМЕНЕНИЕ: Упрощен обработчик закрытия модалки пользователем ---
            onClose: () => {
                closeModal();
                // --- ИЗМЕНЕНИЕ: Удалено setSubmissionError(null); ---
                useCreditStore.getState().clearError(); // Также очищаем общую ошибку стора на всякий случай
            }
            // --- Конец ИЗМЕНЕНИЙ ---
        });
    };

    const handleDeleteClick = (credit) => {
        clearError(); // Очищаем общую ошибку стора при открытии модалки
        // --- ИЗМЕНЕНИЕ: Удалено setSubmissionError(null); ---

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
            message,
            onConfirm: () => handleDeleteConfirm(credit.id),
            confirmText: 'Удалить',
            // Для модалки подтверждения удаления submissionError не нужен, и onClose может быть другим или отсутствовать,
            // если эта модалка не управляет ошибками так же, как форма.
        });
    };

    const handleAddSubmit = async (formData) => {
        // --- ИЗМЕНЕНИЕ: Удален вызов локальной валидации или убеждаемся, что она не выбрасывает ошибку ---
        // validateCreditDates(formData); // Убираем или убеждаемся, что не выбрасывает

        const dataToSend = { ...formData };
        if (dataToSend.is_permanent) {
            if (!dataToSend.is_exhausted) {
                dataToSend.end_date = '0001-01-01';
            } else if (!dataToSend.end_date) {
                dataToSend.end_date = '0001-01-01';
            }
        }

        try {
            await addCredit(dataToSend); // Вызываем action стора
            closeModal(); // Закрываем модалку только в случае УСПЕХА
            // --- ИЗМЕНЕНИЕ: Удалено setSubmissionError(null); - теперь этим занимается closeModal в сторе ---
        } catch (err) {
            console.error('Error during add credit (after form submit):', err);
            // --- ИЗМЕНЕНИЕ: Используем setModalSubmissionError из useModalStore ---
            setModalSubmissionError(err.message || 'Произошла непредвиденная ошибка при добавлении дохода.');
            // --- Конец ИЗМЕНЕНИЯ ---

            // --- ИЗМЕНЕНИЕ: Очищаем общую ошибку стора (creditStore) ---
            // Убеждаемся, что ошибка формы не отображается на главной странице.
            useCreditStore.getState().clearError();
            // --- Конец ИЗМЕНЕНИЯ ---

            // Модалка остается открытой, чтобы показать ошибку.
            // throw err; // Больше не выбрасываем ошибку дальше после ее обработки здесь
        }
    };

    const handleEditSubmit = async (id, formData) => {
        // --- ИЗМЕНЕНИЕ: Удален вызов локальной валидации или убеждаемся, что она не выбрасывает ошибку ---
        // validateCreditDates(formData); // Убираем или убеждаемся, что не выбрасывает

        const dataToUpdate = { ...formData };
        if (dataToUpdate.is_permanent) {
            if (!dataToUpdate.is_exhausted) {
                dataToUpdate.end_date = '0001-01-01';
            } else if (!dataToUpdate.end_date) {
                dataToUpdate.end_date = '0001-01-01';
            }
        }

        try {
            await updateCredit(id, dataToUpdate); // Вызываем action стора
            closeModal(); // Закрываем модалку только в случае УСПЕХА
            // --- ИЗМЕНЕНИЕ: Удалено setSubmissionError(null); - теперь этим занимается closeModal в сторе ---
        } catch (err) {
            console.error('CreditsPage Logic: Error during edit credit (after form submit):', err);
            // --- ИЗМЕНЕНИЕ: Используем setModalSubmissionError из useModalStore ---
            setModalSubmissionError(err.message || 'Произошла непредвиденная ошибка при сохранении изменений.');
            // --- Конец ИЗМЕНЕНИЯ ---

            // --- ИЗМЕНЕНИЕ: Очищаем общую ошибку стора (creditStore) ---
            useCreditStore.getState().clearError();
            // --- Конец ИЗМЕНЕНИЯ ---

            // Модалка остается открытой, чтобы показать ошибку.
            // throw err; // Больше не выбрасываем ошибку дальше после ее обработки здесь
        }
    };

    const handleDeleteConfirm = async (id) => {
        try {
            await deleteCredit(id);
            closeModal();
        } catch (err) {
            console.error('Error during delete credit (after confirmation):', err);
            closeModal(); // Модалка подтверждения закрывается и при ошибке удаления
            // Ошибка удаления покажет на главной странице через store.error
            // Явно устанавливаем store error, так как модалка закрывается.
            useCreditStore.getState().set({ error: { message: err.message || 'Произошла ошибка при удалении.' } });
            // throw err; // Убираем для простоты, полагаемся на отображение store.error на главной.
        }
    };


    // Ошибка для отображения на главной странице (из стора creditStore)
    const displayError = error;

    // --- Rendering ---
    return (
        <div className="bg-secondary-50">
            <main className="max-w-7xl mx-auto p-4">
                <div className="flex justify-between items-center mb-4">
                    <Text variant="h2">Мои Доходы</Text>
                    <TextButton onClick={handleAddClick}>
                        Добавить доход
                    </TextButton>
                </div>

                {/* Этот блок показывает общие ошибки из стора (например, ошибка загрузки) */}
                {displayError && (
                    <div className="mb-4 p-3 bg-red-100 border border-red-300 text-gray-800 rounded-md">
                        {displayError.message}
                    </div>
                )}

                {loading && credits === null ? (
                    <div className="text-center p-4">
                        <Text variant="body">Загрузка доходов...</Text>
                    </div>
                ) : (
                    <div className="bg-background shadow-md rounded-md overflow-hidden">
                        {credits !== null && credits.length === 0 ? (
                            <div className="p-4 text-center">
                                <Text variant="body">У вас пока нет добавленных доходов.</Text>
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
                                                        {credit.end_date && credit.end_date !== '0001-01-01T00:00:00Z' && credit.end_date !== '0001-01-01' && new Date(credit.end_date) < new Date() ? (
                                                            <>
                                                                <CheckCircleIcon className="h-5 w-5 text-gray-400" />
                                                                <Text variant="tdSecondary" className="text-gray-600">
                                                                    до {new Date(credit.end_date).toLocaleDateString('ru-RU')}
                                                                </Text>
                                                            </>
                                                        ) : (
                                                            <>
                                                                <CheckCircleIcon className="h-5 w-5 text-blue-500" />
                                                                <Text variant="tdSecondary" className="text-blue-700">
                                                                    выплаты продолжаются
                                                                </Text>
                                                            </>
                                                        )}
                                                    </div>
                                                ) : (
                                                    <div className="flex items-center gap-1">
                                                        <XCircleIcon className="h-5 w-5 text-red-300" />
                                                        <Text variant="tdSecondary">Разовый</Text>
                                                    </div>
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