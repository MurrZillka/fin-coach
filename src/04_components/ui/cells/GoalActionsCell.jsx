// src/components/ui/cells/GoalActionsCell.jsx
import IconButton from '../IconButton.js';
import { PencilIcon, StarIcon, TrashIcon } from '@heroicons/react/24/outline';

export default function GoalActionsCell({
                                            data,
                                            currentGoal,
                                            onEdit,
                                            onDelete,
                                            onSetCurrent
                                        }) {
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
