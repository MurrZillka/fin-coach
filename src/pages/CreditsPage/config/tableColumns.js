// CreditsPage/config/tableColumns.js
import CreditAmountCell from '../../../components/ui/cells/CreditAmountCell';
import SimpleTextCell from '../../../components/ui/cells/SimpleTextCell';
import DateCell from '../../../components/ui/cells/DateCell';
import CreditStatusCell from '../../../components/ui/cells/CreditStatusCell';
import ActionsCell from '../../../components/ui/cells/ActionsCell';

export const getCreditColumns = (handleEditClick, handleDeleteClick) => [
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
        props: { field: 'description', variant: 'tdSecondary' },
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
