import React from 'react';
import Text from '../components/ui/Text';
import TextButton from '../components/ui/TextButton';
import IconButton from '../components/ui/IconButton';
import {PencilIcon, TrashIcon} from '@heroicons/react/24/outline';
import {CheckCircleIcon, XCircleIcon} from '@heroicons/react/24/solid';
import useSpendingsStore from '../stores/spendingsStore';
import useCategoryStore from '../stores/categoryStore';
import useModalStore from '../stores/modalStore.js';
import {isDateTodayOrEarlier} from '../utils/dateUtils.js';
import SpendingCardList from '../components/mobile/SpendingCardList.jsx';
import {dataCoordinator} from '../dataCoordinator.js';

// Формируем динамические поля для модалки расходов
function getSpendingFields(formData, categories) {
    const isPermanent = !!formData.is_permanent;
    const isFinished = !!formData.is_finished;

    const categoryOptions = (categories || []).map(category => ({
        value: category.id,
        label: category.name,
    }));

    const fields = [
        {name: 'amount', label: 'Сумма', required: true, type: 'number', placeholder: 'Например: 1500'},
        {
            name: 'description',
            label: 'Описание',
            required: false,
            type: 'text',
            placeholder: 'Например: Продукты из магазина'
        },
        {name: 'category_id', label: 'Категория', required: true, type: 'select', options: categoryOptions},
        {name: 'is_permanent', label: 'Регулярный расход?', required: false, type: 'checkbox'},
        {name: 'date', label: isPermanent ? 'Дата начала расхода' : 'Дата расхода', required: true, type: 'date'},
    ];

    if (isPermanent) {
        fields.push({
            name: 'is_finished',
            label: 'Этот расход завершён?',
            required: false,
            type: 'checkbox',
        });
        fields.push({
            name: 'end_date',
            label: 'Дата окончания расхода',
            required: false,
            type: 'date',
            disabled: !isFinished,
        });
    }
    return fields;
}

// Компонент таблицы для десктопов
const SpendingTable = ({spendings, categories, handleEditClick, handleDeleteClick}) => {
    return (
        <table className="min-w-full hidden md:table">
            <thead className="bg-secondary-200">
            <tr>
                <th className="text-left pl-4 pr-0 py-4"><Text variant="th">№</Text></th>
                <th className="text-left p-4"><Text variant="th">Сумма</Text></th>
                <th className="text-left p-4"><Text variant="th">Описание</Text></th>
                <th className="text-left px-2 py-4"><Text variant="th">Категория</Text></th>
                <th className="text-left px-2 py-4"><Text variant="th">Дата начала</Text></th>
                <th className="text-left px-2 py-4"><Text variant="th">Статус</Text></th>
                <th className="text-left px-2 py-4"><Text variant="th">Действия</Text></th>
            </tr>
            </thead>
            <tbody>
            {spendings.map((spending, index) => {
                const category = categories.find(cat => cat.id === spending.category_id);
                const categoryName = category ? category.name : 'Неизвестно';
                const isEndedDisplay = spending.is_permanent && isDateTodayOrEarlier(spending.end_date);
                return (
                    <tr key={spending.id} className={index % 2 === 0 ? 'bg-background' : 'bg-secondary-50'}>
                        {/* № */}
                        <td className="pl-4 pr-0 py-4"><Text variant="tdPrimary">{index + 1}</Text></td>

                        {/* Сумма (с автоматическим переносом, неразрывным пробелом и выравниванием по базовой линии) */}
                        <td className="px-2 py-4">
                            {spending.is_permanent ? (
                                <>
                                    {/*
                                Container div с flex-wrap для автоматического переноса.
                                Использован items-baseline для выравнивания по нижней линии текста.
                            */}
                                    <div
                                        className="flex flex-wrap items-baseline mb-1"> {/* Изменено items-start на items-baseline */}
                                        {/* Метка "Разовый платеж:" */}
                                        <Text variant="tdSecondary"
                                              className="text-xs text-gray-600 mr-1 mb-1 whitespace-nowrap">Разовый
                                            платеж:</Text>
                                        {/* Сумма с неразрывным пробелом перед знаком рубля */}
                                        <Text variant="tdPrimary" className="text-accent-error font-semibold">
                                            {typeof spending.amount === 'number'
                                                ? spending.amount.toLocaleString('ru-RU', {
                                                    minimumFractionDigits: 2,
                                                    maximumFractionDigits: 2
                                                })
                                                : spending.amount}
                                            {'\u00A0'}₽ {/* Используем \u00A0 для неразрывного пробела */}
                                        </Text>
                                    </div>
                                    {/* Часть "Всего:" (уже использует items-center, которое часто приводит к выравниванию по базовой линии для текста) */}
                                    <div className="flex items-center">
                                        <Text variant="tdSecondary"
                                              className="font-normal text-gray-600 mr-1">Всего:</Text>
                                        {/* Общая сумма с неразрывным пробелом перед знаком рубля */}
                                        <Text variant="tdPrimary" className="text-accent-error font-semibold">
                                            {typeof spending.full_amount === 'number'
                                                ? spending.full_amount.toLocaleString('ru-RU', {
                                                    minimumFractionDigits: 2,
                                                    maximumFractionDigits: 2
                                                })
                                                : spending.full_amount}
                                            {'\u00A0'}₽ {/* Используем \u00A0 для неразрывного пробела */}
                                        </Text>
                                    </div>
                                </>
                            ) : (
                                // Часть для нерегулярных расходов
                                <div className="flex items-center">
                                    <Text variant="tdSecondary" className="font-normal text-gray-600 mr-1">Сумма:</Text>
                                    {/* Сумма нерегулярного расхода с неразрывным пробелом */}
                                    <Text variant="tdPrimary" className="text-accent-error font-semibold">
                                        {typeof spending.amount === 'number'
                                            ? spending.amount.toLocaleString('ru-RU', {
                                                minimumFractionDigits: 2,
                                                maximumFractionDigits: 2
                                            })
                                            : spending.amount}
                                        {'\u00A0'}₽ {/* Используем \u00A0 для неразрывного пробела */}
                                    </Text>
                                </div>
                            )}
                        </td>

                        {/* Описание */}
                        <td className="px-2 py-4"><Text variant="tdSecondary">{spending.description || '-'}</Text></td>

                        {/* Категория */}
                        <td className="px-2 py-4"><Text variant="tdSecondary">{categoryName}</Text></td>

                        {/* Дата начала */}
                        <td className="px-2 py-4"><Text variant="tdSecondary">
                            {spending.date ? new Date(spending.date).toLocaleDateString('ru-RU') : '-'}
                        </Text></td>

                        {/* Статус */}
                        <td className="px-2 py-4 max-w-[100px]">
                            {spending.is_permanent ? (
                                <div className="flex items-center gap-1">
                                    {isEndedDisplay ? (
                                        <>
                                            <CheckCircleIcon
                                                className="h-5 w-5 min-h-[1.25rem] min-w-[1.25rem] text-gray-400"/>
                                            <Text variant="tdSecondary" className="text-gray-600">
                                                до {spending.end_date && spending.end_date !== '0001-01-01T00:00:00Z' && spending.end_date !== '0001-01-01'
                                                ? new Date(spending.end_date).toLocaleDateString('ru-RU')
                                                : '-'}
                                            </Text>
                                        </>
                                    ) : (
                                        <>
                                            <CheckCircleIcon
                                                className="h-5 w-5 min-h-[1.25rem] min-w-[1.25rem] text-blue-500"/>
                                            <Text variant="tdSecondary" className="text-blue-700">
                                                расходы продолжаются
                                            </Text>
                                        </>
                                    )}
                                </div>
                            ) : (
                                <div className="flex items-center gap-1">
                                    <XCircleIcon className="h-5 w-5 min-h-[1.25rem] min-w-[1.25rem] text-red-300"/>
                                    <Text variant="tdSecondary">Разовый</Text>
                                </div>
                            )}
                        </td>

                        {/* Действия */}
                        <td className="px-2 py-4 flex gap-1"> {/* Уменьшены горизонтальные отступы (px-2) и зазор между иконками (gap-1) */}
                            {/* ... кнопки иконок без изменений ... */}
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
    );
};

export default function SpendingsPage() {
    const {
        spendings, loading, error, clearError
    } = useSpendingsStore();
    const {
        categories, loading: categoriesLoading, error: categoriesError,
        clearError: clearCategoriesError
    } = useCategoryStore();
    const {openModal, closeModal, submissionError, setModalSubmissionError, modalType} = useModalStore();

    const handleAddClick = () => {
        clearError();
        clearCategoriesError();
        const initialData = {is_permanent: false, is_finished: false, date: '', end_date: ''};
        openModal('addSpending', {
            title: 'Добавить расход',
            fields: getSpendingFields(initialData, categories),
            initialData,
            onSubmit: handleAddSubmit,
            submitText: 'Добавить',
            onFieldChange: (name, value, prevFormData) => {
                const newFormData = {...prevFormData, [name]: value};
                if (name === 'is_permanent') {
                    if (!value) {
                        newFormData.is_finished = false;
                        newFormData.end_date = '';
                    }
                } else if (name === 'is_finished' && !value) {
                    newFormData.end_date = '';
                }
                return getSpendingFields(newFormData, categories);
            },
            submissionError,
            onClose: () => {
                closeModal();
                useSpendingsStore.getState().clearError();
            }
        });
    };

    const handleEditClick = (spending) => {
        clearError();
        clearCategoriesError();
        const initialData = {
            ...spending,
            date: (spending.date && spending.date !== '0001-01-01' && spending.date !== '0001-01-01T00:00:00Z')
                ? new Date(spending.date).toISOString().split('T')[0]
                : '',
            end_date: (spending.end_date && spending.end_date !== '0001-01-01' && spending.end_date !== '0001-01-01T00:00:00Z')
                ? new Date(spending.end_date).toISOString().split('T')[0]
                : '',
            is_finished: !!spending.end_date && spending.end_date !== '0001-01-01T00:00:00Z' && spending.end_date !== '0001-01-01',
        };
        openModal('editSpending', {
            title: 'Редактировать расход',
            fields: getSpendingFields(initialData, categories),
            initialData,
            onSubmit: (formData) => handleEditSubmit(spending.id, formData),
            submitText: 'Сохранить изменения',
            onFieldChange: (name, value, prevFormData) => {
                const newFormData = {...prevFormData, [name]: value};
                if (name === 'is_permanent') {
                    if (!value) {
                        newFormData.is_finished = false;
                        newFormData.end_date = '';
                    }
                } else if (name === 'is_finished' && !value) {
                    newFormData.end_date = '';
                }
                return getSpendingFields(newFormData, categories);
            },
            submissionError,
            onClose: () => {
                closeModal();
                useSpendingsStore.getState().clearError();
            }
        });
    };

    const handleDeleteClick = (spending) => {
        clearError();
        clearCategoriesError();
        const spendingDescription = spending.description || `с ID ${spending.id}`;
        const formattedAmount = typeof spending.amount === 'number'
            ? spending.amount.toLocaleString('ru-RU', {minimumFractionDigits: 2, maximumFractionDigits: 2})
            : spending.amount;
        const message = `Вы уверены, что хотите удалить расход "${spendingDescription}" на сумму ${formattedAmount} ₽?`;

        openModal('confirmDelete', {
            title: 'Подтверждение удаления',
            message,
            onConfirm: () => handleDeleteConfirm(spending.id),
            confirmText: 'Удалить',
            onClose: () => {
                closeModal();
            }
        });
    };

    const handleAddSubmit = async (formData) => {
        const dataToSend = {...formData};
        if (dataToSend.is_permanent) {
            if (!dataToSend.is_finished) {
                dataToSend.end_date = '0001-01-01';
            }
        } else {
            dataToSend.end_date = '0001-01-01';
        }

        try {
            await dataCoordinator.addSpending(dataToSend);
            closeModal();
        } catch (err) {
            console.error('Error during add spending:', err);

            // Используем новую структуру ошибок
            if (err.field) {
                setModalSubmissionError(err);
            } else {
                setModalSubmissionError({ message: err.message, field: null });
            }

            useSpendingsStore.getState().clearError();
        }
    };

    const handleEditSubmit = async (id, formData) => {
        const dataToUpdate = {...formData};
        if (dataToUpdate.is_permanent) {
            if (!dataToUpdate.is_finished) {
                dataToUpdate.end_date = '0001-01-01';
            }
        } else {
            dataToUpdate.end_date = '0001-01-01';
        }

        try {
            await dataCoordinator.updateSpending(id, dataToUpdate);
            closeModal();
        } catch (err) {
            console.error('Error during edit spending:', err);

            if (err.field) {
                setModalSubmissionError(err);
            } else {
                setModalSubmissionError({ message: err.message, field: null });
            }

            useSpendingsStore.getState().clearError();
        }
    };

    const handleDeleteConfirm = async (id) => {
        try {
            await dataCoordinator.deleteSpending(id);
            closeModal();
        } catch (err) {
            console.error('Error during delete spending:', err);
            useSpendingsStore.getState().setError({message: err.message || 'Ошибка при удалении расхода.'});
            closeModal();
        }
    };

    const displayError = error || categoriesError;

    return (
        <div className="bg-secondary-50">
            <main className="max-w-7xl mx-auto p-4">
                <div className="flex justify-between items-center">
                    <Text variant="h2">Мои расходы</Text>
                    <TextButton onClick={handleAddClick}>
                        Добавить расход
                    </TextButton>
                </div>

                {console.log('Rendering error:', displayError, 'modalType:', modalType) || (displayError && modalType === null && (
                    <div className="mb-4 p-3 bg-red-100 border border-red-300 text-gray-800 rounded-md">
                        {displayError.message}
                    </div>
                ))}

                {(loading && spendings === null) || (categoriesLoading && categories === null) ? (
                    <div className="text-center p-4">
                        <Text variant="body">Загрузка данных...</Text>
                    </div>
                ) : (
                    <div className="p-4">
                        {spendings !== null && spendings.length === 0 && categories !== null ? (
                            <div className="p-4 text-center">
                                <Text variant="body">У вас пока нет добавленных расходов.</Text>
                            </div>
                        ) : (
                            spendings !== null && spendings.length > 0 && categories !== null && (
                                <>
                                    <SpendingCardList
                                        className="block md:hidden"
                                        spendings={spendings}
                                        handleEditClick={handleEditClick}
                                        handleDeleteClick={handleDeleteClick}
                                        categories={categories}
                                    />
                                    <SpendingTable
                                        className="hidden md:table"
                                        spendings={spendings}
                                        categories={categories}
                                        handleEditClick={handleEditClick}
                                        handleDeleteClick={handleDeleteClick}
                                    />
                                </>
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