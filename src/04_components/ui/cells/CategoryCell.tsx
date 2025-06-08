// src/04_components/ui/cells/CategoryCell.tsx
import React from 'react';
import Text from '../Text';

export interface Category {
    id: string | number;
    name: string;
}

export interface CategoryCellProps {
    data: { category_id: string | number };
    categories?: Category[];
}

export default function CategoryCell({ data, categories }: CategoryCellProps) {
    const category = categories?.find(cat => cat.id === data.category_id);
    const categoryName = category ? category.name : 'Неизвестно';

    return <Text variant="body">{categoryName}</Text>;
}
