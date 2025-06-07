// src/components/ui/cells/SpendingStatusCell.jsx
import Text from '../Text.js';
import { CheckCircleIcon, XCircleIcon } from '@heroicons/react/24/solid';
import { isDateTodayOrEarlier } from '../../../07_utils/dateUtils';

export default function SpendingStatusCell({ data }) {
    const isEndedDisplay = data.is_permanent && isDateTodayOrEarlier(data.end_date);

    if (data.is_permanent) {
        return (
            <div className="flex items-center gap-1">
                {isEndedDisplay ? (
                    <>
                        <CheckCircleIcon className="h-5 w-5 min-h-[1.25rem] min-w-[1.25rem] text-gray-400" />
                        <Text variant="tdSecondary" className="text-gray-600">
                            до {data.end_date && data.end_date !== '0001-01-01T00:00:00Z' && data.end_date !== '0001-01-01'
                            ? new Date(data.end_date).toLocaleDateString('ru-RU')
                            : '-'}
                        </Text>
                    </>
                ) : (
                    <>
                        <CheckCircleIcon className="h-5 w-5 min-h-[1.25rem] min-w-[1.25rem] text-blue-500" />
                        <Text variant="tdSecondary" className="text-blue-700">
                            расходы продолжаются
                        </Text>
                    </>
                )}
            </div>
        );
    }

    return (
        <div className="flex items-center gap-1">
            <XCircleIcon className="h-5 w-5 min-h-[1.25rem] min-w-[1.25rem] text-red-300" />
            <Text variant="tdSecondary">Разовый</Text>
        </div>
    );
}
