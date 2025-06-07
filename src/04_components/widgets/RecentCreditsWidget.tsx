// src/04_components/RecentCreditsWidget.tsx
import React from 'react';
import Text from '../ui/Text';
import { ChevronRightIcon } from '@heroicons/react/24/outline';
import Tooltip from '../ui/Tooltip';
import {Credit} from "../../01_api/credit/types";

// Вспомогательная функция для форматирования суммы
const formatAmount = (amount: number | string | undefined): string => {
    if (typeof amount === 'number') {
        return amount.toLocaleString('ru-RU', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + '\u00A0₽';
    }
    return amount ? amount + '\u00A0₽' : '--.--\u00A0₽';
};

// Вспомогательная функция для форматирования даты
const formatDate = (dateString: string | undefined): string => {
    if (dateString) {
        try {
            if (dateString === "0001-01-01T00:00:00Z" || dateString === "0001-01-01") return '-';
            const date = new Date(dateString);
            if (!isNaN(date.getTime())) {
                return date.toLocaleDateString('ru-RU');
            }
        } catch (e) {
            console.error("Error formatting date:", dateString, e);
        }
    }
    return '-';
};

interface RecentIncomeWidgetProps {
    recentCredits: Credit[] | null;
    loading: boolean;
    onViewCategoryClick?: () => void;
    categoryName?: string;
}

const RecentCreditsWidget: React.FC<RecentIncomeWidgetProps> = ({
                                                                   recentCredits,
                                                                   loading,
                                                                   onViewCategoryClick,
                                                                   categoryName = 'Раздел'
                                                               }) => {
    const isEmpty = recentCredits === null || recentCredits.length === 0;
    const showList = !loading && !isEmpty;
    const showEmptyState = !loading && isEmpty;
    const showLoading = loading;

    const itemsToDisplay = showList ? recentCredits.slice(0, 3) : [];

    return (
        <div>
            {/* Область заголовка виджета - теперь кликабельная */}
            <div
                className="flex justify-between items-center mb-2 cursor-pointer hover:text-primary-700"
                onClick={onViewCategoryClick}
                title={`Перейти в ${categoryName}`}
            >
                {/* Текст заголовка */}
                <Text variant="h3" className="flex-grow mr-2 opacity-70">Последние доходы</Text>
                {/* Иконка стрелки */}
                <Tooltip text={`Перейти в ${categoryName}`}>
                    <ChevronRightIcon className="h-5 w-5 text-gray-400 group-hover:text-primary-700" />
                </Tooltip>
            </div>

            {showLoading && (
                <div className="text-center">
                    <Text variant="body">Загрузка последних доходов...</Text>
                </div>
            )}

            {showEmptyState && (
                <div className="text-center p-4 bg-gray-100 rounded-md">
                    <Text variant="body" className="text-gray-600">
                        У вас пока нет записанных доходов.
                    </Text>
                </div>
            )}

            {showList && (
                <div className="flex flex-col gap-2">
                    {itemsToDisplay.map((income) => (
                        <div key={income.id} className="flex justify-between items-center border-b border-secondary-200 pb-2 last:border-b-0 last:pb-0">
                            <div className="flex flex-col flex-grow pr-2 truncate">
                                <Text variant="empty" className="text-sm font-semibold truncate">
                                    {income.description || 'Без описания'}
                                </Text>
                                <Text variant="empty" className="text-xs text-gray-500">
                                    {formatDate(income.date)}
                                </Text>
                            </div>
                            <div className="flex-shrink-0 text-right">
                                <Text variant="empty" className="text-sm font-semibold text-accent-success">
                                    {formatAmount(income.amount)}
                                </Text>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default RecentCreditsWidget;
