// src/04_components/ui/cells/CreditStatusCell.tsx
import React from 'react';
import Text from '../Text';
import { CheckCircleIcon, XCircleIcon } from '@heroicons/react/24/solid';
import { isDateTodayOrEarlier } from '../../../07_utils/dateUtils';

export interface CreditStatusCellProps {
    data: {
        is_permanent: boolean;
        end_date?: string | null;
    };
}

export default function CreditStatusCell({ data }: CreditStatusCellProps) {
    const isEndedDisplay = data.is_permanent && isDateTodayOrEarlier(data.end_date);

    if (data.is_permanent) {
        return (
            <div className="flex items-center gap-1">
                {isEndedDisplay ? (
                    <>
                        <CheckCircleIcon className="h-5 w-5 min-h-[1.25rem] min-w-[1.25rem] text-gray-400" />
                        <Text variant="body" className="text-gray-600">
                            до {data.end_date && data.end_date !== '0001-01-01T00:00:00Z' && data.end_date !== '0001-01-01'
                            ? new Date(data.end_date).toLocaleDateString('ru-RU')
                            : '-'}
                        </Text>
                    </>
                ) : (
                    <>
                        <CheckCircleIcon className="h-5 w-5 min-h-[1.25rem] min-w-[1.25rem] text-blue-500" />
                        <Text variant="body" className="text-blue-700">
                            выплаты продолжаются
                        </Text>
                    </>
                )}
            </div>
        );
    }

    return (
        <div className="flex items-center gap-1">
            <XCircleIcon className="h-5 w-5 min-h-[1.25rem] min-w-[1.25rem] text-red-300" />
            <Text variant="empty">Разовый</Text>
        </div>
    );
}
