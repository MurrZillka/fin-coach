// src/pages/CreditsPage.jsx
import React, { useEffect } from 'react';
import Text from '../components/ui/Text';
import TextButton from '../components/ui/TextButton';
import IconButton from '../components/ui/IconButton';
import { PencilIcon, TrashIcon } from '@heroicons/react/24/outline';
import { CheckCircleIcon, XCircleIcon } from '@heroicons/react/24/solid';
import useCreditStore from '../stores/creditStore';
import useModalStore from '../stores/modalStore.js';
import Loader from "../components/ui/Loader.jsx";
import {isDateTodayOrEarlier} from "../utils/dateUtils.js"; // Импортируем useModalStore

// Динамическое формирование полей
function getCreditFields(formData) {
    const isPermanent = !!formData.is_permanent;
    const isExhausted = !!formData.is_exhausted;

    const fields = [
        { name: 'amount', label: 'Сумма', required: true, type: 'number', placeholder: 'Например: 50000' },
        { name: 'description', label: 'Описание', required: false, type: 'text', placeholder: 'Например: Зарплата за месяц' },
        { name: 'is_permanent', label: 'Постоянный доход?', required: false, type: 'checkbox' },
        { name: 'date', label: isPermanent ? 'Дата начала получения дохода' : 'Дата получения дохода', required: true, type: 'date' }, // date всегда required: true
    ];

    if (isPermanent) {
        fields.push({
            name: 'is_exhausted',
            label: 'Этот источник иссяк?',
            required: false, // is_exhausted не обязателен
            type: 'checkbox',
        });
        fields.push({
            name: 'end_date',
            label: 'Дата окончания доходов из этого источника',
            required: false, // end_date не обязателен
            type: 'date',
            disabled: !isExhausted, // disabled если чекбокс не отмечен
        });
    }

    return fields;
}

export default function CreditsPage() {
    const { credits, loading, error, fetchCredits, addCredit, updateCredit, deleteCredit, clearError } = useCreditStore();
    const { openModal, closeModal, setModalSubmissionError, modalType } = useModalStore(); // Получаем setModalSubmissionError из modalStore

    useEffect(() => {
        if (!loading && credits === null && !error) {
            fetchCredits();
        }
        // Cleanup function to clear the main page error when component unmounts or dependencies change
    }, [fetchCredits, loading, credits, error, clearError]);

    // Удалена неиспользуемая функция validateCreditDates


    const handleAddClick = () => {
        clearError(); // Очищаем общую ошибку стора при открытии модалки
        // openModal теперь сбрасывает submissionError в сторе
        // Инициализируем даты пустыми строками, как их выдает input type="date"
        const initialData = { is_permanent: false, is_exhausted: false, date: '', end_date: '' };
        openModal('addCredit', {
            title: 'Добавить доход',
            fields: getCreditFields(initialData),
            initialData,
            onSubmit: handleAddSubmit,
            submitText: 'Добавить',
            onFieldChange: (name, value, prevFormData) => {
                const newFormData = { ...prevFormData, [name]: value };
                // Логика для is_exhausted и end_date при изменении чекбоксов или is_permanent
                if (name === 'is_permanent') {
                    if (!value) { // Если стало не постоянным
                        newFormData.is_exhausted = false; // Сбрасываем иссякший статус
                        newFormData.end_date = ''; // Сбрасываем дату окончания
                    }
                    // Если стало постоянным, is_exhausted и end_date сохраняют свои текущие значения или ""
                } else if (name === 'is_exhausted' && !value) { // Если is_exhausted стал false
                    newFormData.end_date = ''; // Сбрасываем дату окончания
                }
                return getCreditFields(newFormData); // Обновляем поля, включая disabled состояние end_date
            },
            // Обработчик закрытия модалки пользователем
            onClose: () => {
                closeModal(); // Закрывает модалку и сбрасывает submissionError в сторе
                useCreditStore.getState().clearError(); // Также очищаем общую ошибку стора на всякий случай
            }
        });
    };

    const handleEditClick = (credit) => {
        clearError(); // Очищаем общую ошибку стора при открытии модалки
        // openModal теперь сбрасывает submissionError в сторе

        // Подготавливаем initialData для формы. Даты приводим к "YYYY-MM-DD" или ""
        // Если credit.date/end_date приходят как '0001-01-01T00:00:00Z' или '0001-01-01', преобразуем в ""
        const initialData = {
            ...credit,
            date: (credit.date && credit.date !== '0001-01-01T00:00:00Z' && credit.date !== '0001-01-01')
                ? new Date(credit.date).toISOString().split('T')[0]
                : '', // "" для 0001-01-01 или null
            end_date: (credit.end_date && credit.end_date !== '0001-01-01T00:00:00Z' && credit.end_date !== '0001-01-01')
                ? new Date(credit.end_date).toISOString().split('T')[0]
                : '', // "" для 0001-01-01 или null
            is_exhausted: !!credit.end_date && credit.end_date !== '0001-01-01T00:00:00Z' && credit.end_date !== '0001-01-01', // Чекбокс иссякший от даты (true если дата есть и не 0001-01-01)
        };
        openModal('editCredit', {
            title: 'Редактировать доход',
            fields: getCreditFields(initialData),
            initialData,
            onSubmit: (formData) => handleEditSubmit(credit.id, formData),
            submitText: 'Сохранить изменения',
            onFieldChange: (name, value, prevFormData) => {
                const newFormData = { ...prevFormData, [name]: value };
                // Логика для is_exhausted и end_date при изменении чекбоксов или is_permanent
                if (name === 'is_permanent') {
                    if (!value) { // Если стало не постоянным
                        newFormData.is_exhausted = false; // Сбрасываем иссякший статус
                        newFormData.end_date = ''; // Сбрасываем дату окончания
                    }
                    // Если стало постоянным, is_exhausted и end_date сохраняют свои текущие значения или ""
                } else if (name === 'is_exhausted' && !value) { // Если is_exhausted стал false
                    newFormData.end_date = ''; // Сбрасываем дату окончания
                }
                return getCreditFields(newFormData); // Обновляем поля
            },
            // Обработчик закрытия модалки пользователем
            onClose: () => {
                closeModal(); // Закрывает модалку и сбрасывает submissionError в сторе
                useCreditStore.getState().clearError(); // Также очищаем общую ошибку стора на всякий случай
            }
        });
    };

    const handleDeleteClick = (credit) => {
        clearError(); // Очищаем общую ошибку стора при открытии модалки

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

    // --- Удалена функция formatDatesForStore ---


    const handleAddSubmit = async (formData) => {
        // validateCreditDates(formData); // Убираем или убеждаемся, что не выбрасывает

        // --- Логика обработки end_date в зависимости от is_permanent/is_exhausted остается здесь ---
        const dataToSend = { ...formData };
        if (dataToSend.is_permanent) {
            if (!dataToSend.is_exhausted) {
                // Если постоянный, но не иссякший, end_date всегда 0001-01-01
                dataToSend.end_date = '0001-01-01';
            }
            // Если постоянный и иссякший (is_exhausted = true), используем значение end_date из формы (будет YYYY-MM-DD или 0001-01-01)
        } else {
            // Если не постоянный, end_date всегда 0001-01-01
            dataToSend.end_date = '0001-01-01';
        }
        // date поле required, поэтому оно должно прийти либо YYYY-MM-DD, либо 0001-01-01 из формы.
        // Дальнейшее форматирование дат в Modal.jsx теперь гарантирует, что сюда придет либо YYYY-MM-DD, либо 0001-01-01.


        try {
            // --- Теперь addCredit получает данные с датами либо YYYY-MM-DD, либо 0001-01-01 ---
            await addCredit(dataToSend);
            closeModal(); // Закрываем модалку только в случае УСПЕХА
            // closeModal сбрасывает submissionError в сторе
        } catch (err) {
            console.error('Error during add credit (after form submit):', err);
            const errorMessage = err.message === 'Failed to add credit'
                ? 'Ошибка связи или сервера. Попробуйте, пожалуйста, позже.'
                : err.message || 'Произошла непредвиденная ошибка при добавлении дохода.';
            setModalSubmissionError(errorMessage);
            useCreditStore.getState().clearError();
        }
    };

    const handleEditSubmit = async (id, formData) => {
        // validateCreditDates(formData); // Убираем или убеждаемся, что не выбрасывает

        // --- Логика обработки end_date в зависимости от is_permanent/is_exhausted остается здесь ---
        const dataToUpdate = { ...formData };
        if (dataToUpdate.is_permanent) {
            if (!dataToUpdate.is_exhausted) {
                // Если постоянный, но не иссякший, end_date всегда 0001-01-01
                dataToUpdate.end_date = '0001-01-01';
            }
            // Если постоянный и иссякший (is_exhausted = true), используем значение end_date из формы (будет YYYY-MM-DD или 0001-01-01)
        } else {
            // Если не постоянный, end_date всегда 0001-01-01
            dataToUpdate.end_date = '0001-01-01';
        }
        // date поле required, поэтому оно должно прийти либо YYYY-MM-DD, либо 0001-01-01 из формы.


        try {
            // --- Теперь updateCredit получает данные с датами либо YYYY-MM-DD, либо 0001-01-01 ---
            await updateCredit(id, dataToUpdate);
            closeModal(); // Закрываем модалку только в случае УСПЕХА
            // closeModal сбрасывает submissionError в сторе
        } catch (err) {
            console.error('CreditsPage Logic: Error during edit credit (after form submit):', err);
            const errorMessage = err.message === 'Failed to update credit' || err.message === 'Failed to add credit'
                ? 'Ошибка связи или сервера. Попробуйте, пожалуйста, позже.'
                : err.message || 'Произошла непредвиденная ошибка при сохранении изменений.';
            setModalSubmissionError(errorMessage);
            useCreditStore.getState().clearError();
        }
    };

    const handleDeleteConfirm = async (id) => {
        try {
            await deleteCredit(id);
            closeModal();
        } catch (err) {
            console.error('Error during delete credit (after confirmation):', err);
            console.log('Setting error in store:', { message: err.message || 'Произошла ошибка при удалении дохода.' });
            const errorMessage = err.message === 'Failed to delete credit'
                ? 'Ошибка связи или сервера. Попробуйте, пожалуйста, позже.'
                : err.message || 'Произошла ошибка при удалении дохода.';
            useCreditStore.getState().setError({ message: errorMessage });
            console.log('Error set in store, current state:', useCreditStore.getState().error);
            closeModal();
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
                {console.log('Rendering error:', displayError, 'modalType:', modalType) || (displayError && modalType === null && (
                    <div className="mb-4 p-3 bg-red-100 border border-red-300 text-gray-800 rounded-md">
                        {displayError.message}
                    </div>
                ))}

                {loading && credits === null ? (
                   <Loader/>
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
                                        <th className="text-left p-4"><Text variant="th">Статус</Text></th>
                                        <th className="text-left p-4"><Text variant="th">Действия</Text></th>
                                    </tr>
                                    </thead>
                                    <tbody>
                                    {credits.map((credit, index) => { // Начало колбэка map
                                        console.log('Checking credit:', credit); // <-- Добавь эту строку
                                        console.log('credit.end_date:', credit.end_date, 'Type:', typeof credit.end_date); // <-- И эту
                                        const isEndedDisplay = credit.is_permanent && isDateTodayOrEarlier(credit.end_date);
                                        console.log('isEndedDisplay calculated as:', isEndedDisplay); // <-- И эту
                                        // --- Теперь возвращаем JSX для строки таблицы ---
                                        return (
                                            <tr key={credit.id}
                                                className={index % 2 === 0 ? 'bg-background' : 'bg-secondary-50'}>
                                                {/* Ячейка "№" */}
                                                <td className="p-4"><Text variant="tdPrimary">{index + 1}</Text></td>

                                                {/* Ячейка "Сумма" */}
                                                <td className="p-4">
                                                    {credit.is_permanent ? (
                                                        <>
                                                            <div className="flex items-center mb-1">
                                                                <Text variant="tdSecondary" className="font-normal text-gray-600 mr-1">Разовый платеж:</Text>
                                                                <Text variant="tdPrimary" className="text-accent-success font-semibold">
                                                                    {typeof credit.amount === 'number' ? credit.amount.toLocaleString('ru-RU', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : credit.amount} ₽
                                                                </Text>
                                                            </div>
                                                            <div className="flex items-center">
                                                                <Text variant="tdSecondary" className="font-normal text-gray-600 mr-1">Всего:</Text>
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

                                                {/* Ячейка "Описание" */}
                                                <td className="p-4"><Text
                                                    variant="tdSecondary">{credit.description || '-'}</Text></td>

                                                {/* Ячейка "Дата начала" */}
                                                <td className="p-4"><Text variant="tdSecondary">
                                                    {credit.date ? new Date(credit.date).toLocaleDateString('ru-RU') : '-'}
                                                </Text></td>

                                                {/* Ячейка "Регулярный" - Здесь используем isEndedDisplay */}
                                                <td className="p-4">
                                                    {credit.is_permanent ? (
                                                        <div className="flex items-center gap-1">
                                                            {/* Если доход постоянный И по нашей логике отображения он завершен */}
                                                            {isEndedDisplay ? (
                                                                <>
                                                                    {/* Иконка и текст для завершенного статуса */}
                                                                    <CheckCircleIcon className="h-5 w-5 text-gray-400" />
                                                                    <Text variant="tdSecondary" className="text-gray-600">
                                                                        {/* Показываем дату окончания, только если она есть и валидна */}
                                                                        до {credit.end_date && credit.end_date !== '0001-01-01T00:00:00Z' && credit.end_date !== '0001-01-01' ? new Date(credit.end_date).toLocaleDateString('ru-RU') : '-'}
                                                                    </Text>
                                                                </>
                                                            ) : (
                                                                // Иначе (доход постоянный, но по логике отображения еще продолжается)
                                                                <>
                                                                    {/* Иконка и текст для продолжающегося статуса */}
                                                                    <CheckCircleIcon className="h-5 w-5 text-blue-500" />
                                                                    <Text variant="tdSecondary" className="text-blue-700">
                                                                        выплаты продолжаются
                                                                    </Text>
                                                                </>
                                                            )}
                                                        </div>
                                                    ) : (
                                                        // Логика для разового дохода (остается без изменений)
                                                        <div className="flex items-center gap-1">
                                                            <XCircleIcon className="h-5 w-5 text-red-300" />
                                                            <Text variant="tdSecondary">Разовый</Text>
                                                        </div>
                                                    )}
                                                </td>

                                                {/* Ячейка "Действия" */}
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
                                        );
                                    })}
                                    </tbody>
                                </table>
                            )
                        )}
                        {loading && credits !== null && (
                            <Loader/>
                        )}
                    </div>
                )}
            </main>
        </div>
    );
}