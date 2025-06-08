// 03_pages/GoalsPage/config/tableColumns.ts
import React from 'react';
import GoalDescriptionCell from '../../../04_components/ui/cells/GoalDescriptionCell';
import CurrencyCell from '../../../04_components/ui/cells/CurrencyCell';
import DateCell from '../../../04_components/ui/cells/DateCell';
import GoalActionsCell from '../../../04_components/ui/cells/GoalActionsCell';
import type { Goal } from '../../../01_api/goals/types';

// Типы для пропсов ячеек с индексной сигнатурой
export interface CellProps extends Record<string, unknown> {
    field: string;
    variant: 'tdPrimary' | 'tdSecondary';
}

export interface GoalDescriptionCellProps extends Record<string, unknown> {
    currentGoal: Goal | null;
    balance: number;
}

export interface GoalActionsCellProps extends Record<string, unknown> {
    currentGoal: Goal | null;
    onEdit: (goal: Goal) => void;
    onDelete: (goal: Goal) => void;
    onSetCurrent: (goal: Goal) => void;
}

// Типы для колонок таблицы
export interface TableColumn {
    key: string;
    header: string;
    component: React.ComponentType<any>;
    props: CellProps | GoalDescriptionCellProps | GoalActionsCellProps;
    cellClassName: string;
}

// Типы для обработчиков
export type HandleEditClick = (goal: Goal) => void;
export type HandleDeleteClick = (goal: Goal) => void;
export type HandleSetCurrentClick = (goal: Goal) => void;

export const getGoalColumns = (
    currentGoal: Goal | null,
    balance: number,
    handleEditClick: HandleEditClick,
    handleDeleteClick: HandleDeleteClick,
    handleSetCurrentClick: HandleSetCurrentClick
): TableColumn[] => [
    {
        key: 'description',
        header: 'Описание',
        component: GoalDescriptionCell,
        props: { currentGoal, balance },
        cellClassName: 'p-4'
    },
    {
        key: 'amount',
        header: 'Сумма',
        component: CurrencyCell,
        props: { field: 'amount', variant: 'tdSecondary' },
        cellClassName: 'p-4'
    },
    {
        key: 'wish_date',
        header: 'Желаемая дата',
        component: DateCell,
        props: { field: 'wish_date', variant: 'tdSecondary' },
        cellClassName: 'px-2 py-4'
    },
    {
        key: 'actions',
        header: 'Действия',
        component: GoalActionsCell,
        props: {
            currentGoal,
            onEdit: handleEditClick,
            onDelete: handleDeleteClick,
            onSetCurrent: handleSetCurrentClick
        },
        cellClassName: 'px-2 py-4'
    }
];
