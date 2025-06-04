// SpendingsPage/config/tableColumns.js
import SpendingAmountCell from '../../../04_components/ui/cells/SpendingAmountCell';
import SimpleTextCell from '../../../04_components/ui/cells/SimpleTextCell';
import CategoryCell from '../../../04_components/ui/cells/CategoryCell';
import DateCell from '../../../04_components/ui/cells/DateCell';
import SpendingStatusCell from '../../../04_components/ui/cells/SpendingStatusCell';
import ActionsCell from '../../../04_components/ui/cells/ActionsCell';

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
