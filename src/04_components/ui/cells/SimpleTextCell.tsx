// src/04_components/ui/cells/SimpleTextCell.tsx
import React from 'react';
import Text, { Variant } from '../Text';

export interface SimpleTextCellProps {
    data: Record<string, string | number | undefined | null>;
    field: string;
    variant?: Variant;
    className?: string;
}

export default function SimpleTextCell({
                                           data,
                                           field,
                                           variant = 'bodySecondary',
                                           className = ''
                                       }: SimpleTextCellProps) {
    const value = data[field];
    return (
        <Text variant={variant} className={className}>
            {value === undefined || value === null || value === '' ? '-' : value}
        </Text>
    );
}

