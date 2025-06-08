// src/04_components/ui/cells/GoalDescriptionCell.tsx
import React from 'react';
import Text from '../Text';
import { StarIcon, CheckCircleIcon } from '@heroicons/react/24/outline';

export interface Goal {
    id: string | number;
    description: string;
    is_achieved?: boolean;
    amount?: number;
    [key: string]: any;
}

export interface GoalDescriptionCellProps {
    data: Goal;
    currentGoal?: Goal | null;
    balance?: number;
}

export default function GoalDescriptionCell({
                                                data,
                                                currentGoal,
                                                balance
                                            }: GoalDescriptionCellProps) {
    const isCurrent = currentGoal && currentGoal.id === data.id;
    const isAchieved = data.is_achieved;

    if (isAchieved) {
        return (
            <div className="flex items-center">
                <CheckCircleIcon className="w-5 h-5 mr-1 text-green-600" />
                <Text variant="empty" className="text-green-700">
                    {data.description}
                </Text>
            </div>
        );
    }

    if (isCurrent) {
        let starColorClass = 'text-gray-500';

        if (typeof balance === 'number' && typeof data.amount === 'number' && data.amount > 0) {
            const achieved = balance >= 0 ? balance : 0;
            const percentage = Math.min((achieved / data.amount) * 100, 100);

            if (percentage < 25) starColorClass = 'text-red-500';
            else if (percentage < 50) starColorClass = 'text-orange-500';
            else if (percentage < 75) starColorClass = 'text-yellow-500';
            else starColorClass = 'text-green-500';
            if (percentage >= 100) starColorClass = 'text-green-600';
        }

        return (
            <div className="flex items-center">
                <StarIcon className={`w-5 h-5 mr-1 ${starColorClass}`} />
                <Text variant="empty">{data.description}</Text>
            </div>
        );
    }

    return (
        <div className="flex items-center">
            <Text variant="empty">{data.description}</Text>
        </div>
    );
}
