// src/components/ui/cells/ActionsCell.jsx
import IconButton from '../IconButton.js';
import { PencilIcon, TrashIcon } from '@heroicons/react/24/outline';

export default function ActionsCell({
                                        data,
                                        actions = ['edit', 'delete'],
                                        onEdit,
                                        onDelete,
                                        customActions = []
                                    }) {
    return (
        <div className="flex gap-1">
            {actions.includes('edit') && onEdit && (
                <IconButton
                    icon={PencilIcon}
                    tooltip="Редактировать"
                    className="text-primary-600 hover:bg-primary-600/10 hover:text-primary-500"
                    onClick={() => onEdit(data)}
                />
            )}
            {actions.includes('delete') && onDelete && (
                <IconButton
                    icon={TrashIcon}
                    tooltip="Удалить"
                    className="text-accent-error hover:bg-accent-error/10 hover:text-accent-error/80"
                    onClick={() => onDelete(data)}
                />
            )}
            {customActions.map((action, index) => (
                <IconButton
                    key={index}
                    icon={action.icon}
                    tooltip={action.tooltip}
                    className={action.className}
                    onClick={() => action.onClick(data)}
                />
            ))}
        </div>
    );
}
