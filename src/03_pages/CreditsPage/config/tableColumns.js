//03_Pages/CreditsPage/config/tableColumns.ts
import CreditAmountCell from '../../../04_components/ui/cells/CreditAmountCell.js';
import SimpleTextCell from '../../../04_components/ui/cells/SimpleTextCell.js';
import DateCell from '../../../04_components/ui/cells/DateCell.js';
import CreditStatusCell from '../../../04_components/ui/cells/CreditStatusCell.js';
import ActionsCell from '../../../04_components/ui/cells/ActionsCell.js';

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
