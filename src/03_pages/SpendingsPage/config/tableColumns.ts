// SpendingsPage/config/tableColumns.ts
import React from 'react';
import SpendingAmountCell from '../../../04_components/ui/cells/SpendingAmountCell';
import SimpleTextCell from '../../../04_components/ui/cells/SimpleTextCell';
import CategoryCell from '../../../04_components/ui/cells/CategoryCell';
import DateCell from '../../../04_components/ui/cells/DateCell';
import SpendingStatusCell from '../../../04_components/ui/cells/SpendingStatusCell';
import ActionsCell from '../../../04_components/ui/cells/ActionsCell';
import type { Spending } from '../../../01_api/spendings/types';
import type { Category } from '../../../01_api/categories/types';

// Типы для пропсов ячеек с индексной сигнатурой
export interface CellProps extends Record<string, unknown> {
    field: string;
    variant: 'tdPrimary' | 'tdSecondary';
}

export interface CategoryCellProps extends Record<string, unknown> {
    categories: Category[] | null;
}

export interface ActionsCellProps extends Record<string, unknown> {
    actions: Array<'edit' | 'delete'>;
    onEdit: (spending: Spending) => void;
    onDelete: (spending: Spending) => void;
}

// Типы для колонок таблицы
export interface TableColumn {
    key: string;
    header: string;
    component: React.ComponentType<any>;
    props?: CellProps | CategoryCellProps | ActionsCellProps;
    cellClassName: string;
}

// Типы для обработчиков
export type HandleEditClick = (spending: Spending) => void;
export type HandleDeleteClick = (spending: Spending) => void;

export const getSpendingColumns = (
        categories: Category[] | null,
    handleEditClick: HandleEditClick,
    handleDeleteClick: HandleDeleteClick
): TableColumn[] => [
    {
        key: 'amount',
        header: 'Сумма',
        component: SpendingAmountCell,
        cellClassName: 'px-2 py-4'
    },
    {
        key: 'description',
        header: 'Описание',
        component: SimpleTextCell,
        props: { field: 'description', variant: 'tdSecondary' },
        cellClassName: 'px-2 py-4'
    },
    {
        key: 'category',
        header: 'Категория',
        component: CategoryCell,
        props: { categories },
        cellClassName: 'px-2 py-4'
    },
    {
        key: 'date',
        header: 'Дата начала',
        component: DateCell,
        props: { field: 'date', variant: 'tdSecondary' },
        cellClassName: 'px-2 py-4'
    },
    {
        key: 'status',
        header: 'Статус',
        component: SpendingStatusCell,
        cellClassName: 'px-2 py-4 max-w-[100px]'
    },
    {
        key: 'actions',
        header: 'Действия',
        component: ActionsCell,
        props: {
            actions: ['edit', 'delete'],
            onEdit: handleEditClick,
            onDelete: handleDeleteClick
        },
        cellClassName: 'px-2 py-4'
    }
];
