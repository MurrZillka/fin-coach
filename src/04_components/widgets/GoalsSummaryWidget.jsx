// src/components/GoalsSummaryWidget.jsx
import React from 'react';
import Text from '../ui/Text.tsx';
// import TextButton from './ui/TextButton'; // TextButton больше не нужен
import { ChevronRightIcon } from '@heroicons/react/24/outline'; // Импортируем иконку стрелки
import Tooltip from '../ui/Tooltip.tsx'; // Импортируем компонент Tooltip


const GoalsSummaryWidget = ({
                                goals,
                                currentGoal,
                                loading,
                                // onCreateGoalClick, // Этот пропс больше не используется
                                // onViewGoalsClick, // Этот пропс больше не используется, клик по заголовку
                                onViewCategoryClick, // Новый пропс для клика по заголовку/иконке
                                categoryName = 'Раздел', // Пропс для названия раздела для тултипа
                            }) => {

    const isEmpty = goals === null || goals.length === 0;
    const showSummary = !loading && !isEmpty;
    const showEmptyState = !loading && isEmpty;
    const showLoading = loading;

    const activeGoalsCount = goals ? goals.filter(goal => !goal.is_achieved).length : 0;


    return (
        <div>
            {/* Область заголовка виджета - теперь кликабельная */}
            <div
                className="flex justify-between items-center mb-2 cursor-pointer hover:text-primary-700"
                onClick={onViewCategoryClick} // Обработчик клика
                title={`Перейти в ${categoryName}`} // Стандартный HTML тултип
            >
                {/* Текст заголовка */}
                <Text variant="h3" className="flex-grow mr-2">Финансовые цели</Text>

                {/* Иконка стрелки */}
                <Tooltip text={`Перейти в ${categoryName}`}>
                    <ChevronRightIcon className="h-5 w-5 text-gray-400 group-hover:text-primary-700" />
                </Tooltip>
            </div>


            {showLoading && (
                <div className="text-center">
                    <Text variant="body">Загрузка целей...</Text>
                </div>
            )}

            {showEmptyState && (
                // Блок пустого состояния - кнопка "Поставить первую" убрана
                <div className="text-center p-4 bg-gray-100 rounded-md">
                    <Text variant="body" className="text-gray-600"> {/* Убран mb-3 */}
                        У вас пока нет финансовых целей.
                    </Text>
                    {/* Кнопка призыва к действию УБРАНА */}
                    {/* <TextButton onClick={onCreateGoalClick}> Поставить первую цель </TextButton> */}
                </div>
            )}

            {showSummary && (
                // Блок сводки целей - кнопки убраны, только информация
                <div className="flex flex-col gap-2">
                    {/* Общее количество целей */}
                    <Text variant="body" className="text-gray-700">
                        Всего целей: <span className="font-semibold">{goals.length}</span>
                    </Text>
                    {/* Количество активных целей */}
                    {activeGoalsCount > 0 && (
                        <Text variant="body" className="text-gray-700">
                            Активных целей: <span className="font-semibold">{activeGoalsCount}</span>
                        </Text>
                    )}
                    {/* Информация о текущей цели */}
                    {currentGoal && (
                        <Text variant="body" className="text-blue-700 mt-4">
                            Текущая цель: <span className="font-semibold">{currentGoal.description}</span>
                        </Text>
                    )}

                    {/* Кнопки "Посмотреть все" и "Поставить новую" УБРАНЫ */}
                    {/* Навигация происходит по клику на заголовок */}
                </div>
            )}
        </div>
    );
};

export default GoalsSummaryWidget; // Экспорт компонента