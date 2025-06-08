// src/04_components/ui/cells/GoalActionsCell.tsx
import React from 'react';
import IconButton from '../IconButton';
import { PencilIcon, StarIcon, TrashIcon } from '@heroicons/react/24/outline';

export interface Goal {
    id: string | number;
    is_achieved?: boolean;
    [key: string]: any;
}

export interface GoalActionsCellProps {
    data: Goal;
    currentGoal?: Goal | null;
    onEdit: (goal: Goal) => void;
    onDelete: (goal: Goal) => void;
    onSetCurrent: (goal: Goal) => void;
}

export default function GoalActionsCell({
                                            data,
                                            currentGoal,
                                            onEdit,
                                            onDelete,
                                            onSetCurrent
                                        }: GoalActionsCellProps) {
    const isCurrent = currentGoal && currentGoal.id === data.id;
    const isAchieved = data.is_achieved;

    return (
        <div className="flex gap-1">
            <IconButton
                icon={PencilIcon}
                tooltip="Редактировать цель"
                className="text-primary-600 hover:bg-primary-600/10 hover:text-primary-500"
                onClick={() => onEdit(data)}
            />
            {!isCurrent && (
                <IconButton
                    icon={StarIcon}
                    tooltip={isAchieved
                        ? "Установить достигнутую цель как текущую"
                        : "Установить как текущую"
                    }
                    className={isAchieved
                        ? "text-green-500 hover:bg-green-500/10 hover:text-green-400"
                        : "text-yellow-500 hover:bg-yellow-500/10 hover:text-yellow-400"
                    }
                    onClick={() => onSetCurrent(data)}
                />
            )}
            <IconButton
                icon={TrashIcon}
                tooltip="Удалить цель"
                className="text-accent-error hover:bg-accent-error/10 hover:text-accent-error/80"
                onClick={() => onDelete(data)}
            />
        </div>
    );
}
