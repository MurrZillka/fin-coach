import React, { useEffect } from 'react';
import Text from '../components/ui/Text';
import TextButton from '../components/ui/TextButton';
import IconButton from '../components/ui/IconButton';
import { PencilIcon, TrashIcon } from '@heroicons/react/24/outline';
import { CheckCircleIcon, XCircleIcon } from '@heroicons/react/24/solid';
import useSpendingsStore from '../stores/spendingsStore';
import useCategoryStore from '../stores/categoryStore';
import useModalStore from '../stores/modalStore.js'; // Импортируем useModalStore

// Формируем динамические поля для модалки расходов
function getSpendingFields(formData, categories) {
    const isPermanent = !!formData.is_permanent;
    const isFinished = !!formData.is_finished;

    const categoryOptions = (categories || []).map(category => ({
        value: category.id,
        label: category.name,
    }));

    const fields = [
        { name: 'amount', label: 'Сумма', required: true, type: 'number', placeholder: 'Например: 1500' },
        { name: 'description', label: 'Описание', required: false, type: 'text', placeholder: 'Например: Продукты из магазина' },
        { name: 'category_id', label: 'Категория', required: true, type: 'select', options: categoryOptions },
        { name: 'is_permanent', label: 'Регулярный расход?', required: false, type: 'checkbox' },
        { name: 'date', label: isPermanent ? 'Дата начала расхода' : 'Дата расхода', required: true, type: 'date' }, // date всегда required: true
    ];

    if (isPermanent) {
        fields.push({
            name: 'is_finished',
            label: 'Этот расход завершён?',
            required: false, // is_finished не обязателен
            type: 'checkbox',
        });
        fields.push({
            name: 'end_date',
            label: 'Дата окончания расхода',
            required: false, // end_date не обязателен
            type: 'date',
            disabled: !isFinished,
        });
    }

    return fields;
}

export default function SpendingsPage() {
    const {
        spendings, loading, error, // loading и error теперь для состояния страницы
        fetchSpendings, addSpending, updateSpending, deleteSpending, clearError
    } = useSpendingsStore();
    const {
        categories, loading: categoriesLoading, error: categoriesError,
        fetchCategories, clearError: clearCategoriesError
    } = useCategoryStore();
    // --- ИЗМЕНЕНИЕ: Получаем submissionError и setModalSubmissionError из modalStore ---
    const { openModal, closeModal, submissionError, setModalSubmissionError } = useModalStore();
    // --- Конец ИЗМЕНЕНИЯ ---


    useEffect(() => {
        if (!loading && spendings === null && !error) fetchSpendings();
        if (!categoriesLoading && categories === null && !categoriesError) fetchCategories();
        return () => {
            clearError(); // Очищаем ошибку стора расходов при размонтировании
            clearCategoriesError(); // Очищаем ошибку стора категорий при размонтировании
            // --- ИЗМЕНЕНИЕ: Очищаем ошибку модалки при размонтировании страницы ---
            setModalSubmissionError(null);
            // --- Конец ИЗМЕНЕНИЯ ---
        };
    }, [
        fetchSpendings, loading, spendings, error,
        fetchCategories, categoriesLoading, categories, categoriesError,
        clearError, clearCategoriesError,
        setModalSubmissionError // Добавляем в зависимости
    ]);

    // --- ИЗМЕНЕНИЕ: Удалена локальная функция validateSpendingDates ---
    // const validateSpendingDates = (formData) => { ... };
    // --- Конец ИЗМЕНЕНИЯ ---


    // --- Модалка: добавление ---
    const handleAddClick = () => {
        clearError(); // Очищаем общую ошибку стора расходов
        clearCategoriesError(); // Очищаем общую ошибку стора категорий
        // openModal теперь сбрасывает submissionError в modalStore
        const initialData = { is_permanent: false, is_finished: false, date: '', end_date: '' }; // Убедимся, что даты инициализированы
        openModal('addSpending', {
            title: 'Добавить расход',
            fields: getSpendingFields(initialData, categories),
            initialData,
            onSubmit: handleAddSubmit,
            submitText: 'Добавить',
            onFieldChange: (name, value, prevFormData) => {
                const newFormData = { ...prevFormData, [name]: value };
                // Логика для is_finished и end_date при изменении чекбоксов или is_permanent
                if (name === 'is_permanent') {
                    if (!value) { // Если стало не постоянным
                        newFormData.is_finished = false; // Сбрасываем завершённый статус
                        newFormData.end_date = ''; // Сбрасываем дату окончания
                    }
                    // Если стало постоянным, is_finished и end_date сохраняют свои текущие значения или ""
                } else if (name === 'is_finished' && !value) { // Если is_finished стал false
                    newFormData.end_date = ''; // Сбрасываем дату окончания
                }
                return getSpendingFields(newFormData, categories); // Обновляем поля, включая disabled состояние end_date
            },
            // --- ИЗМЕНЕНИЕ: Передаем submissionError из modalStore и добавляем onClose ---
            submissionError: submissionError, // Передаем ошибку модалки
            onClose: () => {
                closeModal(); // Закрывает модалку и сбрасывает submissionError в modalStore
                useSpendingsStore.getState().clearError(); // Очищаем общую ошибку стора расходов на всякий случай
            }
            // --- Конец ИЗМЕНЕНИЯ ---
        });
    };

    // --- Модалка: редактирование ---
    const handleEditClick = (spending) => {
        clearError(); // Очищаем общую ошибку стора расходов
        clearCategoriesError(); // Очищаем общую ошибку стора категорий
        // openModal теперь сбрасывает submissionError в modalStore
        const initialData = {
            ...spending,
            // Приводим даты из API к формату "YYYY-MM-DD" или "" для модалки
            date: (spending.date && spending.date !== '0001-01-01' && spending.date !== '0001-01-01T00:00:00Z')
                ? new Date(spending.date).toISOString().split('T')[0]
                : '', // "" для 0001-01-01 или null/undefined
            end_date: (spending.end_date && spending.end_date !== '0001-01-01' && spending.end_date !== '0001-01-01T00:00:00Z')
                ? new Date(spending.end_date).toISOString().split('T')[0]
                : '', // "" для 0001-01-01 или null/undefined
            is_finished: !!spending.end_date && spending.end_date !== '0001-01-01T00:00:00Z' && spending.end_date !== '0001-01-01', // Чекбокс завершён от даты
        };
        openModal('editSpending', {
            title: 'Редактировать расход',
            fields: getSpendingFields(initialData, categories),
            initialData,
            onSubmit: (formData) => handleEditSubmit(spending.id, formData),
            submitText: 'Сохранить изменения',
            onFieldChange: (name, value, prevFormData) => {
                const newFormData = { ...prevFormData, [name]: value };
                // Логика для is_finished и end_date при изменении чекбоксов или is_permanent
                if (name === 'is_permanent') {
                    if (!value) { // Если стало не постоянным
                        newFormData.is_finished = false; // Сбрасываем завершённый статус
                        newFormData.end_date = ''; // Сбрасываем дату окончания
                    }
                    // Если стало постоянным, is_finished и end_date сохраняют свои текущие значения или ""
                } else if (name === 'is_finished' && !value) { // Если is_finished стал false
                    newFormData.end_date = ''; // Сбрасываем дату окончания
                }
                return getSpendingFields(newFormData, categories); // Обновляем поля
            },
            // --- ИЗМЕНЕНИЕ: Передаем submissionError из modalStore и добавляем onClose ---
            submissionError: submissionError, // Передаем ошибку модалки
            onClose: () => {
                closeModal(); // Закрывает модалку и сбрасывает submissionError в modalStore
                useSpendingsStore.getState().clearError(); // Очищаем общую ошибку стора расходов на всякий случай
            }
            // --- Конец ИЗМЕНЕНИЯ ---
        });
    };

    // --- Модалка: удаление ---
    const handleDeleteClick = (spending) => {
        clearError(); // Очищаем общую ошибку стора расходов
        clearCategoriesError(); // Очищаем общую ошибку стора категорий
        const spendingDescription = spending.description || `с ID ${spending.id}`;
        const formattedAmount = typeof spending.amount === 'number'
            ? spending.amount.toLocaleString('ru-RU', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
            : spending.amount;
        const message = `Вы уверены, что хотите удалить расход "${spendingDescription}" на сумму ${formattedAmount} ₽?`;

        openModal('confirmDelete', {
            title: 'Подтверждение удаления',
            message,
            onConfirm: () => handleDeleteConfirm(spending.id),
            confirmText: 'Удалить',
            // Для модалки подтверждения удаления submissionError не нужен, onClose может быть другим
            onClose: () => {
                closeModal(); // Закрывает модалку
                // Ошибка стора расходов остается, если она была до открытия модалки
            }
        });
    };

    // --- Сабмит: добавление ---
    const handleAddSubmit = async (formData) => {
        // --- ИЗМЕНЕНИЕ: Убираем локальную валидацию и добавляем try...catch для обработки ошибок стора ---
        // validateSpendingDates(formData); // Убираем
        const dataToSend = { ...formData };
        // Логика обработки end_date в зависимости от is_permanent/is_finished остается здесь
        if (dataToSend.is_permanent) {
            if (!dataToSend.is_finished) {
                dataToSend.end_date = '0001-01-01'; // Сервер ждет 0001-01-01 для "нет даты"
            }
        } else {
            dataToSend.end_date = '0001-01-01'; // Если не постоянный, end_date всегда 0001-01-01
        }
        // date поле required, модалка подставит сегодня если пустое. Придет YYYY-MM-DD или 0001-01-01.

        try {
            await addSpending(dataToSend); // Вызываем action стора (который выбрасывает ошибку при API ошибке)
            closeModal(); // Закрываем модалку только в случае УСПЕХА
            // closeModal сбрасывает submissionError в modalStore
        } catch (err) {
            console.error('Error during add spending (after form submit):', err);
            // При ошибке отображаем ее в модалке через submissionError
            // setModalSubmissionError из useModalStore
            setModalSubmissionError(err.message || 'Произошла непредвиденная ошибка при добавлении расхода.');
            // Очищаем общую ошибку на странице расходов, если она была установлена стором до этого
            useSpendingsStore.getState().clearError();
            // Модалка НЕ закрывается, чтобы показать ошибку.
        } finally {
            // Можно добавить логику скрытия индикатора загрузки, если loading управляется страницей
        }
        // --- Конец ИЗМЕНЕНИЯ ---
    };

    // --- Сабмит: редактирование ---
    const handleEditSubmit = async (id, formData) => {
        // --- ИЗМЕНЕНИЕ: Убираем локальную валидацию и добавляем try...catch для обработки ошибок стора ---
        // validateSpendingDates(formData); // Убираем
        const dataToUpdate = { ...formData };
        // Логика обработки end_date в зависимости от is_permanent/is_finished остается здесь
        if (dataToUpdate.is_permanent) {
            if (!dataToUpdate.is_finished) {
                dataToUpdate.end_date = '0001-01-01'; // Сервер ждет 0001-01-01 для "нет даты"
            }
        } else {
            dataToUpdate.end_date = '0001-01-01'; // Если не постоянный, end_date всегда 0001-01-01
        }
        // date поле required, модалка подставит сегодня если пустое. Придет YYYY-MM-DD или 0001-01-01.

        try {
            await updateSpending(id, dataToUpdate); // Вызываем action стора (который выбрасывает ошибку при API ошибке)
            closeModal(); // Закрываем модалку только в случае УСПЕХА
            // closeModal сбрасывает submissionError в modalStore
        } catch (err) {
            console.error('Error during edit spending (after form submit):', err);
            // При ошибке отображаем ее в модалке через submissionError
            setModalSubmissionError(err.message || 'Произошла непредвиденная ошибка при сохранении изменений.');
            // Очищаем общую ошибку на странице расходов
            useSpendingsStore.getState().clearError();
            // Модалка НЕ закрывается.
        } finally {
            // Можно добавить логику скрытия индикатора загрузки
        }
        // --- Конец ИЗМЕНЕНИЯ ---
    };

    // --- Сабмит: удаление ---
    const handleDeleteConfirm = async (id) => {
        // --- ИЗМЕНЕНИЕ: Добавляем try...catch для обработки ошибок стора ---
        try {
            await deleteSpending(id); // Вызываем action стора (который выбрасывает ошибку)
            closeModal(); // Закрываем модалку только в случае УСПЕХА
        } catch (err) {
            console.error('Error during delete spending (after confirmation):', err);
            closeModal(); // Модалка подтверждения закрывается и при ошибке удаления
            // При ошибке удаления устанавливаем общую ошибку стора расходов (на странице)
            useSpendingsStore.getState().set({ error: { message: err.message || 'Произошла ошибка при удалении расхода.' } });
        }
        // --- Конец ИЗМЕНЕНИЯ ---
    };

    // Общая ошибка для отображения на главной странице (из сторов)
    const displayError = error || categoriesError;

    return (
        <div className="bg-secondary-50">
            <main className="max-w-7xl mx-auto p-4">
                <div className="flex justify-between items-center mb-4">
                    <Text variant="h2">Мои Расходы</Text>
                    <TextButton onClick={handleAddClick}>
                        Добавить расход
                    </TextButton>
                </div>

                {/* Этот блок показывает общие ошибки из сторов (например, ошибка загрузки) */}
                {displayError && (
                    <div className="mb-4 p-3 bg-red-100 border border-red-300 text-gray-800 rounded-md">
                        {displayError.message}
                    </div>
                )}

                {(loading && spendings === null) || (categoriesLoading && categories === null) ? (
                    <div className="text-center p-4">
                        <Text variant="body">Загрузка данных...</Text>
                    </div>
                ) : (
                    <div className="bg-background shadow-md rounded-md overflow-hidden">
                        {/* Убедимся, что категории загружены для отображения таблицы */}
                        {spendings !== null && spendings.length === 0 && categories !== null ? (
                            <div className="p-4 text-center">
                                <Text variant="body">У вас пока нет добавленных расходов.</Text>
                            </div>
                        ) : (
                            spendings !== null && spendings.length > 0 && categories !== null && (
                                <table className="min-w-full">
                                    <thead className="bg-secondary-200">
                                    <tr>
                                        <th className="text-left p-4"><Text variant="th">№</Text></th>
                                        <th className="text-left p-4"><Text variant="th">Сумма</Text></th>
                                        <th className="text-left p-4"><Text variant="th">Описание</Text></th>
                                        <th className="text-left p-4"><Text variant="th">Категория</Text></th>
                                        <th className="text-left p-4"><Text variant="th">Дата начала</Text></th>
                                        <th className="text-left p-4"><Text variant="th">Регулярный</Text></th>
                                        <th className="text-left p-4"><Text variant="th">Действия</Text></th>
                                    </tr>
                                    </thead>
                                    <tbody>
                                    {spendings.map((spending, index) => {
                                        const category = categories.find(cat => cat.id === spending.category_id);
                                        const categoryName = category ? category.name : 'Неизвестно';

                                        return (
                                            <tr key={spending.id}
                                                className={index % 2 === 0 ? 'bg-background' : 'bg-secondary-50'}>
                                                <td className="p-4"><Text variant="tdPrimary">{index + 1}</Text></td>
                                                <td className="p-4">
                                                    {spending.is_permanent ? (
                                                        <>
                                                            <div className="flex items-center mb-1">
                                                                <Text variant="tdSecondary" className="font-normal text-gray-600 mr-1">Периодическая:</Text>
                                                                <Text variant="tdPrimary" className="text-accent-error font-semibold">
                                                                    {typeof spending.amount === 'number'
                                                                        ? spending.amount.toLocaleString('ru-RU', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
                                                                        : spending.amount} ₽
                                                                </Text>
                                                            </div>
                                                            <div className="flex items-center">
                                                                <Text variant="tdSecondary" className="font-normal text-gray-600 mr-1">Общая:</Text>
                                                                <Text variant="tdPrimary" className="text-accent-error font-semibold">
                                                                    {typeof spending.full_amount === 'number'
                                                                        ? spending.full_amount.toLocaleString('ru-RU', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
                                                                        : spending.full_amount} ₽
                                                                </Text>
                                                            </div>
                                                        </>
                                                    ) : (
                                                        <div className="flex items-center">
                                                            <Text variant="tdSecondary" className="font-normal text-gray-600 mr-1">Сумма:</Text>
                                                            <Text variant="tdPrimary" className="text-accent-error font-semibold">
                                                                {typeof spending.amount === 'number'
                                                                    ? spending.amount.toLocaleString('ru-RU', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
                                                                    : spending.amount} ₽
                                                            </Text>
                                                        </div>
                                                    )}
                                                </td>
                                                <td className="p-4"><Text variant="tdSecondary">{spending.description || '-'}</Text></td>
                                                <td className="p-4"><Text variant="tdSecondary">{categoryName}</Text></td>
                                                <td className="p-4"><Text variant="tdSecondary">
                                                    {spending.date ? new Date(spending.date).toLocaleDateString('ru-RU') : '-'}
                                                </Text></td>
                                                <td className="p-4">
                                                    {spending.is_permanent ? (
                                                        <div className="flex items-center gap-1">
                                                            {spending.end_date && spending.end_date !== '0001-01-01T00:00:00Z' && spending.end_date !== '0001-01-01' && new Date(spending.end_date) < new Date() ? (
                                                                <>
                                                                    <CheckCircleIcon className="h-5 w-5 text-gray-400" />
                                                                    <Text variant="tdSecondary" className="text-gray-600">
                                                                        до {new Date(spending.end_date).toLocaleDateString('ru-RU')}
                                                                    </Text>
                                                                </>
                                                            ) : (
                                                                <>
                                                                    <CheckCircleIcon className="h-5 w-5 text-blue-500" />
                                                                    <Text variant="tdSecondary" className="text-blue-700">
                                                                        расходы продолжаются
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
                        {(loading && spendings !== null) || (categoriesLoading && categories !== null) ? (
                            <div className="text-center p-4">
                                <Text variant="body">Обновление данных...</Text>
                            </div>
                        ) : null}
                    </div>
                )}
            </main>
        </div>
    );
}