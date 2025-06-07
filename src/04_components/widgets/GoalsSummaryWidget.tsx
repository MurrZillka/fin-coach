// src/components/GoalsSummaryWidget.tsx
import React from 'react';
import Text from '../ui/Text';
import { ChevronRightIcon } from '@heroicons/react/24/outline';
import Tooltip from '../ui/Tooltip';
import { Goal } from '../../01_api/goals/types';

interface GoalsSummaryWidgetProps {
    goals: Goal[] | null;
    currentGoal: Goal | null;
    loading: boolean;
    onViewCategoryClick?: () => void;
    categoryName?: string;
}

const GoalsSummaryWidget: React.FC<GoalsSummaryWidgetProps> = ({
                                                                   goals,
                                                                   currentGoal,
                                                                   loading,
                                                                   onViewCategoryClick,
                                                                   categoryName = 'Раздел'
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
                onClick={onViewCategoryClick}
                title={`Перейти в ${categoryName}`}
            >
                {/* Текст заголовка */}
                <Text variant="h3" className="flex-grow mr-2 opacity-70">Финансовые цели</Text>
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
                <div className="text-center p-4 bg-gray-100 rounded-md">
                    <Text variant="body" className="text-gray-600">
                        У вас пока нет финансовых целей.
                    </Text>
                </div>
            )}

            {showSummary && (
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
                </div>
            )}
        </div>
    );
};

export default GoalsSummaryWidget;
