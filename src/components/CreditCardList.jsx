import React from 'react';
import Text from './ui/Text';
import IconButton from './ui/IconButton';
import {CheckCircleIcon, XCircleIcon, PencilIcon, TrashIcon} from '@heroicons/react/24/outline';
import {isDateTodayOrEarlier} from '../utils/dateUtils';

const CreditCardList = ({credits, handleEditClick, handleDeleteClick, className}) => {
    return (
        <div className={`grid grid-cols-[repeat(auto-fill,minmax(220px,1fr))] gap-4 p-4 md:hidden ${className}`}>
            {credits.map((credit, index) => {
                const isEndedDisplay = credit.is_permanent && isDateTodayOrEarlier(credit.end_date);
                return (
                    <div key={credit.id}
                         className="p-3 bg-background rounded-md shadow-2xl flex flex-col justify-between gap-1"> {/* min-w-[220px] min-h-[200px] удалены или оставлены в зависимости от желаемого поведения */}
                        {/* Note: Убрал min-w и min-h из карточки, т.к. grid-cols minmax уже управляет шириной, а grid Item по умолчанию растягивается по высоте. */}
                        {/* Описание */}
                        <Text variant="tdPrimary" className="text-sm font-semibold truncate">
                            {credit.description || `Доход #${index + 1}`}
                        </Text>
                        {/* Сумма */}
                        {credit.is_permanent ? (
                            <>
                                <div className="flex items-center gap-1">
                                    <Text variant="tdSecondary" className="text-sm font-normal text-gray-600">
                                        Разовый платеж:
                                    </Text>
                                    <Text variant="tdPrimary" className="text-sm text-accent-success font-semibold">
                                        {typeof credit.amount === 'number'
                                            ? credit.amount.toLocaleString('ru-RU', {
                                                minimumFractionDigits: 2,
                                                maximumFractionDigits: 2
                                            })
                                            : credit.amount}
                                        {'\u00A0'}₽ {/* Неразрывный пробел */}
                                    </Text>
                                </div>
                                <div className="flex items-center gap-1">
                                    <Text variant="tdSecondary" className="text-xs font-normal text-gray-600">
                                        Всего:
                                    </Text>
                                    <Text variant="tdPrimary" className="text-sm text-accent-success font-semibold">
                                        {typeof credit.full_amount === 'number'
                                            ? credit.full_amount.toLocaleString('ru-RU', {
                                                minimumFractionDigits: 2,
                                                maximumFractionDigits: 2
                                            })
                                            : credit.full_amount}
                                        {'\u00A0'}₽ {/* Неразрывный пробел */}
                                    </Text>
                                </div>
                            </>
                        ) : (
                            <div className="flex items-center gap-1">
                                <Text variant="tdSecondary" className="text-xs font-normal text-gray-600">
                                    Сумма:
                                </Text>
                                <Text variant="tdPrimary" className="text-sm text-accent-success font-semibold">
                                    {typeof credit.amount === 'number'
                                        ? credit.amount.toLocaleString('ru-RU', {
                                            minimumFractionDigits: 2,
                                            maximumFractionDigits: 2
                                        })
                                        : credit.amount}
                                    {'\u00A0'}₽ {/* Неразрывный пробел */}
                                </Text>
                            </div>
                        )}
                        {/* Дата */}
                        <div className="flex items-center gap-1">
                            <Text variant="tdSecondary" className="text-xs text-gray-600">
                                Дата:
                            </Text>
                            <Text variant="tdSecondary" className="text-xs">
                                {credit.date ? new Date(credit.date).toLocaleDateString('ru-RU') : '-'}
                            </Text>
                        </div>
                        {/* Статус */}
                        <div className="flex items-center gap-1">
                            {credit.is_permanent ? (
                                isEndedDisplay ? (
                                    <>
                                        <CheckCircleIcon className="h-3 w-3 text-gray-400"/>
                                        <Text variant="tdSecondary" className="text-xs text-gray-600">
                                            до {credit.end_date && credit.end_date !== '0001-01-01T00:00:00Z' && credit.end_date !== '0001-01-01'
                                            ? new Date(credit.date).toLocaleDateString('ru-RU')
                                            : '-'}
                                        </Text>
                                    </>
                                ) : (
                                    <>
                                        <CheckCircleIcon className="h-3 w-3 text-blue-500"/>
                                        <Text variant="tdSecondary" className="text-xs text-blue-700">
                                            выплаты продолжаются
                                        </Text>
                                    </>
                                )
                            ) : (
                                <>
                                    <XCircleIcon className="h-3 w-3 text-red-300"/>
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
                                onClick={() => handleEditClick(credit)}
                            />
                            <IconButton
                                icon={TrashIcon}
                                tooltip="Удалить"
                                className="p-1 text-accent-error hover:bg-accent-error/10 hover:text-accent-error/80"
                                onClick={() => handleDeleteClick(credit)}
                            />
                        </div>
                    </div>
                );
            })}
        </div>
    );
};

export default CreditCardList;