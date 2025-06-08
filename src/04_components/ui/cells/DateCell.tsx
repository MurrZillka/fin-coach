// src/04_components/ui/cells/DateCell.tsx
import React from 'react';
import Text, { Variant } from '../Text';

export interface DateCellProps {
    data: Record<string, string | undefined | null>;
    field: string;
    variant?: Variant;
    className?: string;
}

export default function DateCell({
                                     data,
                                     field,
                                     variant = 'bodySecondary', // используем существующий вариант
                                     className = ''
                                 }: DateCellProps) {
    const date = data[field];
    const formatted = date && date !== '0001-01-01T00:00:00Z' && date !== '0001-01-01'
        ? new Date(date).toLocaleDateString('ru-RU')
        : '-';

    return (
        <Text variant={variant} className={className}>
            {formatted}
        </Text>
    );
}
