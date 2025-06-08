// 03_Pages/CreditsPage/config/tableColumns.ts
import React from 'react';
import CreditAmountCell from '../../../04_components/ui/cells/CreditAmountCell';
import SimpleTextCell from '../../../04_components/ui/cells/SimpleTextCell';
import DateCell from '../../../04_components/ui/cells/DateCell';
import CreditStatusCell from '../../../04_components/ui/cells/CreditStatusCell';
import ActionsCell from '../../../04_components/ui/cells/ActionsCell';
import type { Credit } from '../../../01_api/credit/types';

// Типы для пропсов ячеек с индексной сигнатурой
export interface CellProps extends Record<string, unknown> {
    field: string;
    variant: 'empty' | 'base';
}

export interface ActionsCellProps extends Record<string, unknown> {
    actions: Array<'edit' | 'delete'>;
    onEdit: (credit: Credit) => void;
    onDelete: (credit: Credit) => void;
}

// Типы для колонок таблицы
export interface TableColumn {
    key: string;
    header: string;
    component: React.ComponentType<any>;
    props?: CellProps | ActionsCellProps;
    cellClassName: string;
}

// Типы для обработчиков
export type HandleEditClick = (credit: Credit) => void;
export type HandleDeleteClick = (credit: Credit) => void;

export const getCreditColumns = (
        handleEditClick: HandleEditClick,
    handleDeleteClick: HandleDeleteClick
): TableColumn[] => [
    {
        key: 'amount',
        header: 'Сумма',
        component: CreditAmountCell,
        cellClassName: 'px-2 py-4'
    },
    {
        key: 'description',
        header: 'Описание',
        component: SimpleTextCell,
        props: { field: 'description', variant: 'empty' },
        cellClassName: 'px-2 py-4'
    },
    {
        key: 'date',
        header: 'Дата начала',
        component: DateCell,
        props: { field: 'date', variant: 'empty' },
        cellClassName: 'px-2 py-4'
    },
    {
        key: 'status',
        header: 'Статус',
        component: CreditStatusCell,
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
