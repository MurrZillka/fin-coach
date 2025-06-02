// src/components/ui/cells/GoalDescriptionCell.jsx
import Text from '../Text';
import { StarIcon, CheckCircleIcon } from '@heroicons/react/24/outline';

export default function GoalDescriptionCell({
                                                data,
                                                currentGoal,
                                                balance
                                            }) {
    const isCurrent = currentGoal && currentGoal.id === data.id;
    const isAchieved = data.is_achieved;

    // Если цель достигнута - показываем CheckCircleIcon зеленым
    if (isAchieved) {
        return (
            <div className="flex items-center">
                <CheckCircleIcon className="w-5 h-5 mr-1 text-green-600" />
                <Text variant="tdPrimary" className="text-green-700">
                    {data.description}
                </Text>
            </div>
        );
    }

    // Если цель не достигнута, но текущая - показываем звезду с цветом прогресса
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
                <Text variant="tdPrimary">{data.description}</Text>
            </div>
        );
    }

    // Обычная цель без иконки
    return (
        <div className="flex items-center">
            <Text variant="tdPrimary">{data.description}</Text>
        </div>
    );
}
