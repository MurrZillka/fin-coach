// CategoriesPage/config/tableColumns.js
import SimpleTextCell from '../../../04_components/ui/cells/SimpleTextCell.js';
import CategoryActionsCell from '../../../04_components/ui/cells/CategoryActionsCell.js';

export const getCategoryColumns = (handleEditClick, handleDeleteClick, defaultCategoryName) => [
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
