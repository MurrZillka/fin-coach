import React, { useEffect } from 'react';
import Text from '../components/ui/Text';
import TextButton from '../components/ui/TextButton';
import IconButton from '../components/ui/IconButton';
import { PencilIcon, TrashIcon } from '@heroicons/react/24/outline';
import { CheckCircleIcon, XCircleIcon } from '@heroicons/react/24/solid';
import useCreditStore from '../stores/creditStore';
import useModalStore from '../stores/modalStore.js';
import Loader from "../components/ui/Loader.jsx";
import { isDateTodayOrEarlier } from "../utils/dateUtils.js";
import CreditCardList from '../components/CreditCardList'; // Новый импорт

// Динамическое формирование полей (без изменений)
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
            disabled: !isExhausted,
        });
    }

    return fields;
}

// Новый компонент CreditTable для таблицы
const CreditTable = ({ credits, handleEditClick, handleDeleteClick, className }) => (
    <table className={`min-w-full ${className}`}>
        <thead className="bg-secondary-200">
        <tr>
            <th className="text-left pl-4 pr-0 py-4"><Text variant="th">№</Text></th>
            <th className="text-left p-4"><Text variant="th">Сумма</Text></th>
            <th className="text-left p-4"><Text variant="th">Описание</Text></th>
            <th className="text-left px-2 py-4"><Text variant="th">Дата начала</Text></th>
            <th className="text-left px-2 py-4"><Text variant="th">Статус</Text></th>
            <th className="text-left px-2 py-4"><Text variant="th">Действия</Text></th>
        </tr>
        </thead>
        <tbody>
        {credits.map((credit, index) => {
            const isEndedDisplay = credit.is_permanent && isDateTodayOrEarlier(credit.end_date);
            return (
                <tr key={credit.id} className={index % 2 === 0 ? 'bg-background' : 'bg-secondary-50'}>
                    {/* № */}
                    <td className="pl-4 pr-0 py-4"><Text variant="tdPrimary">{index + 1}</Text></td>{/* Сумма: автоматический перенос, неразрывный пробел, выравнивание по базовой линии */}
                    <td className="px-2 py-4"> {/* Отступы согласованы с SpendingTable */}
                        {credit.is_permanent ? (
                            <>
                                {/* Container div с flex-wrap для автоматического переноса. */}
                                <div className="flex flex-wrap items-baseline mb-1"> {/* Изменено items-center на items-baseline, удален min-w */}
                                    {/* Метка "Разовый платеж:" */}
                                    {/* Note: text-[0.7rem] из оригинального кода сохранен */}
                                    <Text variant="tdSecondary" className="font-normal text-[0.7rem] text-gray-600 mr-1 mb-1 whitespace-nowrap">Разовый платеж:</Text><Text variant="tdPrimary" className="text-accent-success font-semibold">
                                        {typeof credit.amount === 'number' ? credit.amount.toLocaleString('ru-RU', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : credit.amount}
                                        {'\u00A0'}₽ {/* Добавлен неразрывный пробел */}
                                    </Text>
                                </div>
                                {/* Часть "Всего:": неразрывный пробел */}
                                <div className="flex items-center">
                                    <Text variant="tdSecondary" className="font-normal text-gray-600 mr-1">Всего:</Text><Text variant="tdPrimary" className="text-accent-success font-semibold">
                                    {typeof credit.full_amount === 'number' ? credit.full_amount.toLocaleString('ru-RU', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : credit.full_amount}
                                    {'\u00A0'}₽ {/* Добавлен неразрывный пробел */}
                                </Text>
                                </div>
                            </>
                        ) : (
                            // Часть для нерегулярных расходов: неразрывный пробел
                            <div className="flex items-center">
                                <Text variant="tdSecondary" className="font-normal text-gray-600 mr-1">Сумма:</Text><Text variant="tdPrimary" className="text-accent-success font-semibold">
                                {typeof credit.amount === 'number' ? credit.amount.toLocaleString('ru-RU', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : credit.amount}
                                {'\u00A0'}₽ {/* Добавлен неразрывный пробел */}
                            </Text>
                            </div>
                        )}
                    </td>{/* Описание: корректировка отступов */}
                    <td className="px-2 py-4"><Text variant="tdSecondary">{credit.description || '-'}</Text></td>{/* Дата начала: корректировка отступов */}
                    <td className="px-2 py-4"><Text variant="tdSecondary"> {/* Изменено с p-4 на px-2 py-4 */}
                        {credit.date ? new Date(credit.date).toLocaleDateString('ru-RU') : '-'}
                    </Text></td>{/* Статус: отступы и min-w как в SpendingTable */}
                    <td className="px-2 py-4 max-w-[100px]">
                        {credit.is_permanent ? (
                            <div className="flex items-center gap-1">
                                {isEndedDisplay ? (
                                    <>
                                        <CheckCircleIcon className="h-5 w-5 min-h-[1.25rem] min-w-[1.25rem] text-gray-400" />
                                        <Text variant="tdSecondary" className="text-gray-600">
                                            до {credit.end_date && credit.end_date !== '0001-01-01T00:00:00Z' && credit.end_date !== '0001-01-01' ? new Date(credit.end_date).toLocaleDateString('ru-RU') : '-'}
                                        </Text>
                                    </>
                                ) : (
                                    <>
                                        <CheckCircleIcon className="h-5 w-5 min-h-[1.25rem] min-w-[1.25rem] text-blue-500" />
                                        <Text variant="tdSecondary" className="text-blue-700">
                                            выплаты продолжаются {/* Текст из оригинального кода Credits */}
                                        </Text>
                                    </>
                                )}
                            </div>
                        ) : (
                            <div className="flex items-center gap-1">
                                <XCircleIcon className="h-5 w-5 min-h-[1.25rem] min-w-[1.25rem] text-red-300" />
                                <Text variant="tdSecondary">Разовый</Text>
                            </div>
                        )}
                    </td>
                    <td className="px-2 py-4 flex gap-1"> {/* Изменено с p-4 flex gap-2 на px-2 py-4 flex gap-1 */}
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
);
export default function CreditsPage() {
    const { credits, loading, error, fetchCredits, addCredit, updateCredit, deleteCredit, clearError } = useCreditStore();
    const { openModal, closeModal, setModalSubmissionError, modalType } = useModalStore();

    useEffect(() => {
        if (!loading && credits === null && !error) {
            fetchCredits();
        }
    }, [fetchCredits, loading, credits, error, clearError]);

    const handleAddClick = () => {
        clearError();
        const initialData = { is_permanent: false, is_exhausted: false, date: '', end_date: '' };
        openModal('addCredit', {
            title: 'Добавить доход',
            fields: getCreditFields(initialData),
            initialData,
            onSubmit: handleAddSubmit,
            submitText: 'Добавить',
            onFieldChange: (name, value, prevFormData) => {
                const newFormData = { ...prevFormData, [name]: value };
                if (name === 'is_permanent') {
                    if (!value) {
                        newFormData.is_exhausted = false;
                        newFormData.end_date = '';
                    }
                } else if (name === 'is_exhausted' && !value) {
                    newFormData.end_date = '';
                }
                return getCreditFields(newFormData);
            },
            onClose: () => {
                closeModal();
                useCreditStore.getState().clearError();
            }
        });
    };

    const handleEditClick = (credit) => {
        clearError();
        const initialData = {
            ...credit,
            date: (credit.date && credit.date !== '0001-01-01T00:00:00Z' && credit.date !== '0001-01-01')
                ? new Date(credit.date).toISOString().split('T')[0]
                : '',
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
                if (name === 'is_permanent') {
                    if (!value) {
                        newFormData.is_exhausted = false;
                        newFormData.end_date = '';
                    }
                } else if (name === 'is_exhausted' && !value) {
                    newFormData.end_date = '';
                }
                return getCreditFields(newFormData);
            },
            onClose: () => {
                closeModal();
                useCreditStore.getState().clearError();
            }
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
            message,
            onConfirm: () => handleDeleteConfirm(credit.id),
            confirmText: 'Удалить',
        });
    };

    const handleAddSubmit = async (formData) => {
        const dataToSend = { ...formData };
        if (dataToSend.is_permanent) {
            if (!dataToSend.is_exhausted) {
                dataToSend.end_date = '0001-01-01';
            }
        } else {
            dataToSend.end_date = '0001-01-01';
        }
        try {
            await addCredit(dataToSend);
            closeModal();
        } catch (err) {
            console.error('Error during add credit:', err);
            const errorMessage = err.message === 'Failed to add credit'
                ? 'Ошибка связи или сервера. Попробуйте позже.'
                : err.message || 'Ошибка при добавлении дохода.';
            setModalSubmissionError(errorMessage);
            useCreditStore.getState().clearError();
        }
    };

    const handleEditSubmit = async (id, formData) => {
        const dataToUpdate = { ...formData };
        if (dataToUpdate.is_permanent) {
            if (!dataToUpdate.is_exhausted) {
                dataToUpdate.end_date = '0001-01-01';
            }
        } else {
            dataToUpdate.end_date = '0001-01-01';
        }
        try {
            await updateCredit(id, dataToUpdate);
            closeModal();
        } catch (err) {
            console.error('Error during edit credit:', err);
            const errorMessage = err.message === 'Failed to update credit'
                ? 'Ошибка связи или сервера. Попробуйте позже.'
                : err.message || 'Ошибка при сохранении изменений.';
            setModalSubmissionError(errorMessage);
            useCreditStore.getState().clearError();
        }
    };

    const handleDeleteConfirm = async (id) => {
        try {
            await deleteCredit(id);
            closeModal();
        } catch (err) {
            console.error('Error during delete credit:', err);
            const errorMessage = err.message === 'Failed to delete credit'
                ? 'Ошибка связи или сервера. Попробуйте позже.'
                : err.message || 'Ошибка при удалении дохода.';
            useCreditStore.getState().setError({ message: errorMessage });
            closeModal();
        }
    };

    const displayError = error;

    return (
        <div className="bg-secondary-50">
            <main className="max-w-7xl mx-auto p-4">
                <div className="flex justify-between items-center mb-4">
                    <Text variant="h2">Мои Доходы</Text>
                    <TextButton onClick={handleAddClick}>
                        Добавить доход
                    </TextButton>
                </div>

                {console.log('Rendering error:', displayError, 'modalType:', modalType) || (displayError && modalType === null && (
                    <div className="mb-4 p-3 bg-red-100 border border-red-300 text-gray-800 rounded-md">
                        {displayError.message}
                    </div>
                ))}

                {loading && credits === null ? (
                    <Loader />
                ) : (
                    <div>
                        {credits !== null && credits.length === 0 ? (
                            <div className="p-4 text-center">
                                <Text variant="body">У вас пока нет добавленных доходов.</Text>
                            </div>
                        ) : (
                            credits !== null && credits.length > 0 && (
                                <>
                                    <CreditTable className="hidden md:table" credits={credits} handleEditClick={handleEditClick} handleDeleteClick={handleDeleteClick} />
                                    <CreditCardList className="block md:hidden" credits={credits} handleEditClick={handleEditClick} handleDeleteClick={handleDeleteClick} />
                                </>
                            )
                        )}
                        {loading && credits !== null && (
                            <Loader />
                        )}
                    </div>
                )}
            </main>
        </div>
    );
}