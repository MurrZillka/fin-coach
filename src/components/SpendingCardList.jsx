import React from 'react';
import Text from './ui/Text';
import IconButton from './ui/IconButton';
import { CheckCircleIcon, XCircleIcon, PencilIcon, TrashIcon } from '@heroicons/react/24/outline';
import { isDateTodayOrEarlier } from '../utils/dateUtils';

const SpendingCardList = ({ spendings, categories, handleEditClick, handleDeleteClick, className }) => {
    return (
        <div className={`flex flex-wrap justify-center gap-4 p-4 block md:hidden ${className}`}>
            {spendings.map((spending, index) => {
                const isEndedDisplay = spending.is_permanent && isDateTodayOrEarlier(spending.end_date);
                const category = categories ? categories.find(cat => cat.id === spending.category_id) : null;
                const categoryName = category ? category.name : 'Неизвестно';
                return (
                    <div key={spending.id} className="min-w-[220px] min-h-[200px] p-3 bg-background rounded-md shadow-sm flex flex-col justify-between gap-1">
                        {/* Описание */}
                        <Text variant="tdPrimary" className="text-sm font-semibold truncate">
                            {spending.description || `Расход #${index + 1}`}
                        </Text>
                        {/* Сумма */}
                        {spending.is_permanent ? (
                            <>
                                <div className="flex items-center gap-1">
                                    <Text variant="tdSecondary" className="text-sm font-normal text-gray-600">
                                        Разовый платеж:
                                    </Text>
                                    <Text variant="tdPrimary" className="text-sm text-accent-error font-semibold">
                                        {typeof spending.amount === 'number'
                                            ? spending.amount.toLocaleString('ru-RU', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
                                            : spending.amount} ₽
                                    </Text>
                                </div>
                                <div className="flex items-center gap-1">
                                    <Text variant="tdSecondary" className="text-xs font-normal text-gray-600">
                                        Всего:
                                    </Text>
                                    <Text variant="tdPrimary" className="text-sm text-accent-error font-semibold">
                                        {typeof spending.full_amount === 'number'
                                            ? spending.full_amount.toLocaleString('ru-RU', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
                                            : spending.full_amount} ₽
                                    </Text>
                                </div>
                            </>
                        ) : (
                            <div className="flex items-center gap-1">
                                <Text variant="tdSecondary" className="text-xs font-normal text-gray-600">
                                    Сумма:
                                </Text>
                                <Text variant="tdPrimary" className="text-sm text-accent-error font-semibold">
                                    {typeof spending.amount === 'number'
                                        ? spending.amount.toLocaleString('ru-RU', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
                                        : spending.amount} ₽
                                </Text>
                            </div>
                        )}
                        {/* Категория */}
                        <div className="flex items-center gap-1">
                            <Text variant="tdSecondary" className="text-xs text-gray-600">
                                Категория:
                            </Text>
                            <Text variant="tdSecondary" className="text-xs">
                                {categoryName}
                            </Text>
                        </div>
                        {/* Дата */}
                        <div className="flex items-center gap-1">
                            <Text variant="tdSecondary" className="text-xs text-gray-600">
                                Дата:
                            </Text>
                            <Text variant="tdSecondary" className="text-xs">
                                {spending.date ? new Date(spending.date).toLocaleDateString('ru-RU') : '-'}
                            </Text>
                        </div>
                        {/* Статус */}
                        <div className="flex items-center gap-1">
                            {spending.is_permanent ? (
                                isEndedDisplay ? (
                                    <>
                                        <CheckCircleIcon className="h-3 w-3 text-gray-400" />
                                        <Text variant="tdSecondary" className="text-xs text-gray-600">
                                            до {spending.end_date && spending.end_date !== '0001-01-01T00:00:00Z' && spending.end_date !== '0001-01-01'
                                            ? new Date(spending.end_date).toLocaleDateString('ru-RU')
                                            : '-'}
                                        </Text>
                                    </>
                                ) : (
                                    <>
                                        <CheckCircleIcon className="h-3 w-3 text-blue-500" />
                                        <Text variant="tdSecondary" className="text-xs text-blue-700">
                                            расходы продолжаются
                                        </Text>
                                    </>
                                )
                            ) : (
                                <>
                                    <XCircleIcon className="h-3 w-3 text-red-300" />
                                    <Text variant="tdSecondary" className="text-xs">
                                        Разовый
                                    </Text>
                                </>
                            )}
                        </div>
                        {/* Действия */}
                        <div className="flex gap-1 mt-1">
                            <IconButton
                                icon={PencilIcon}
                                tooltip="Редактировать"
                                className="p-1 text-primary-600 hover:bg-primary-600/10 hover:text-primary-500"
                                onClick={() => handleEditClick(spending)}
                            />
                            <IconButton
                                icon={TrashIcon}
                                tooltip="Удалить"
                                className="p-1 text-accent-error hover:bg-accent-error/10 hover:text-accent-error/80"
                                onClick={() => handleDeleteClick(spending)}
                            />
                        </div>
                    </div>
                );
            })}
        </div>
    );
};

export default SpendingCardList;