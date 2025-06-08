// src/04_components/ui/cells/CurrencyCell.tsx
import React from 'react';
import Text, {Variant} from '../Text';

export interface CurrencyCellProps {
    data: Record<string, number | string | undefined | null>;
    field: string;
    variant?: Variant;
    className?: string;
}

export default function CurrencyCell({
                                         data,
                                         field,
                                         variant = 'body',
                                         className = ''
                                     }: CurrencyCellProps) {
    const value = data[field];
    const formatted =
        typeof value === 'number'
            ? value.toLocaleString('ru-RU', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
            : value;

    return (
        <Text variant={variant} className={className}>
            {formatted}
            {'\u00A0'}₽
        </Text>
    );
}
