// GoalsPage/config/tableColumns.js
import GoalDescriptionCell from '../../../components/ui/cells/GoalDescriptionCell';
import CurrencyCell from '../../../components/ui/cells/CurrencyCell';
import DateCell from '../../../components/ui/cells/DateCell';
import GoalActionsCell from '../../../components/ui/cells/GoalActionsCell';

export const getGoalColumns = (currentGoal, balance, handleEditClick, handleDeleteClick, handleSetCurrentClick) => [
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
