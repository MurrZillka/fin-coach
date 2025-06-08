//03_pages/CategoriesPage/config/tableColumns.ts
import React from 'react';
import SimpleTextCell from '../../../04_components/ui/cells/SimpleTextCell';
import CategoryActionsCell from '../../../04_components/ui/cells/CategoryActionsCell';

// Типы для пропсов ячеек с индексной сигнатурой
export interface CellProps extends Record<string, unknown> {
    field: string;
    variant: 'tdPrimary' | 'tdSecondary';
}

// Типы для конфигурации CategoryActionsCell с индексной сигнатурой
export interface CategoryActionsCellConfig extends Record<string, unknown> {
    onEdit: (data: { id: string | number; name: string }) => void;
    onDelete: (id: string | number) => void;
    defaultCategoryName: string;
}

// Типы для колонок таблицы
export interface TableColumn {
    key: string;
    header: string;
    component: React.ComponentType<any>;
    props: CellProps | CategoryActionsCellConfig;
    cellClassName: string;
}

// Типы для обработчиков
export type HandleEditClick = (data: { id: string | number; name: string }) => void;
export type HandleDeleteClick = (id: string | number) => void;

export const getCategoryColumns = (
    handleEditClick: HandleEditClick,
    handleDeleteClick: HandleDeleteClick,
    defaultCategoryName: string
): TableColumn[] => [
    {
        key: 'name',
        header: 'Название',
        component: SimpleTextCell,
        props: { field: 'name', variant: 'tdPrimary' },
        cellClassName: 'p-4'
    },
    {
        key: 'description',
        header: 'Описание',
        component: SimpleTextCell,
        props: { field: 'description', variant: 'tdSecondary' },
        cellClassName: 'p-4'
    },
    {
        key: 'actions',
        header: 'Действия',
        component: CategoryActionsCell,
        props: {
            onEdit: handleEditClick,
            onDelete: handleDeleteClick,
            defaultCategoryName
        },
        cellClassName: 'px-2 py-4'
    }
];
