// src/components/RecentIncomeWidget.jsx
import React from 'react';
import Text from '../ui/Text.jsx';
// import TextButton from './ui/TextButton'; // TextButton больше не нужен для добавления здесь
import { ChevronRightIcon } from '@heroicons/react/24/outline'; // Импортируем иконку стрелки
import Tooltip from '../ui/Tooltip.tsx'; // Импортируем компонент Tooltip

// Вспомогательная функция для форматирования суммы
const formatAmount = (amount) => {
    if (typeof amount === 'number') {
        return amount.toLocaleString('ru-RU', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + '\u00A0₽';
    }
    return amount || '--.--\u00A0₽';
};

// Вспомогательная функция для форматирования даты
const formatDate = (dateString) => {
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


const RecentIncomeWidget = ({
                                recentIncomes,
                                loading,
                                // onAddClick, // Этот пропс больше не используется для кнопки "Добавить"
                                onViewCategoryClick, // Новый пропс для клика по заголовку/иконке (перейти на страницу)
                                categoryName = 'Раздел', // Пропс для названия раздела для тултипа
                            }) => {

    const isEmpty = recentIncomes === null || recentIncomes.length === 0;
    const showList = !loading && !isEmpty;
    const showEmptyState = !loading && isEmpty;
    const showLoading = loading;

    const itemsToDisplay = showList ? recentIncomes.slice(0, 3) : [];


    return (
        <div>
            {/* Область заголовка виджета - теперь кликабельная */}
            {/* Используем div с flex для расположения заголовка и иконки */}
            {/* cursor-pointer и hover:text-primary-700 для визуальной индикации кликабельности */}
            {/* onClick вызывает функцию перехода на страницу раздела */}
            <div
                className="flex justify-between items-center mb-2 cursor-pointer hover:text-primary-700"
                onClick={onViewCategoryClick} // Обработчик клика
                title={`Перейти в ${categoryName}`} // Стандартный HTML тултип на всю область
            >
                {/* Текст заголовка */}
                <Text variant="h3" className="flex-grow mr-2">Последние доходы</Text>

                {/* Иконка стрелки */}
                {/* Tooltip оборачивает иконку */}
                <Tooltip text={`Перейти в ${categoryName}`}> {/* Тултип с названием раздела */}
                    <ChevronRightIcon className="h-5 w-5 text-gray-400 group-hover:text-primary-700" /> {/* Иконка */}
                </Tooltip>
            </div>


            {showLoading && (
                <div className="text-center">
                    <Text variant="body">Загрузка последних доходов...</Text>
                </div>
            )}

            {showEmptyState && (
                // Блок пустого состояния - кнопка "Добавить" убрана
                <div className="text-center p-4 bg-gray-100 rounded-md">
                    <Text variant="body" className="text-gray-600"> {/* Убран mb-3 т.к. нет кнопки */}
                        У вас пока нет записанных доходов.
                    </Text>
                    {/* Кнопка призыва к действию УБРАНА */}
                    {/* <TextButton onClick={onAddClick}> Добавить первый доход </TextButton> */}
                </div>
            )}

            {showList && (
                <div className="flex flex-col gap-2">
                    {itemsToDisplay.map((income) => (
                        <div key={income.id} className="flex justify-between items-center border-b border-secondary-200 pb-2 last:border-b-0 last:pb-0">
                            <div className="flex flex-col flex-grow pr-2 truncate">
                                <Text variant="tdPrimary" className="text-sm font-semibold truncate">{income.description || 'Без описания'}</Text>
                                <Text variant="tdSecondary" className="text-xs text-gray-500">{formatDate(income.date)}</Text>
                            </div>
                            <div className="flex-shrink-0 text-right">
                                <Text variant="tdPrimary" className="text-sm font-semibold text-accent-success">
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

export default RecentIncomeWidget;