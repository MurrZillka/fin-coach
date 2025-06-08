// SpendingsPage/config/tableColumns.ts
import SpendingAmountCell from '../../../04_components/ui/cells/SpendingAmountCell.js';
import SimpleTextCell from '../../../04_components/ui/cells/SimpleTextCell.js';
import CategoryCell from '../../../04_components/ui/cells/CategoryCell.js';
import DateCell from '../../../04_components/ui/cells/DateCell.js';
import SpendingStatusCell from '../../../04_components/ui/cells/SpendingStatusCell.js';
import ActionsCell from '../../../04_components/ui/cells/ActionsCell.js';

export const getSpendingColumns = (categories, handleEditClick, handleDeleteClick) => [
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
