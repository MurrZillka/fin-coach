// src/04_components/ui/cells/ActionsCell.tsx
import IconButton from '../IconButton';
import { PencilIcon, TrashIcon } from '@heroicons/react/24/outline';
import React, {ComponentType, SVGProps} from 'react';

export interface CustomAction<T = any> {
    icon: ComponentType<SVGProps<SVGSVGElement>>;
    tooltip: string;
    className?: string;
    onClick: (data: T) => void;
}

export interface ActionsCellProps<T = any> {
    data: T;
    actions?: Array<'edit' | 'delete'>;
    onEdit?: (data: T) => void;
    onDelete?: (data: T) => void;
    customActions?: Array<CustomAction<T>>;
}

export default function ActionsCell<T = any>({
                                                 data,
                                                 actions = ['edit', 'delete'],
                                                 onEdit,
                                                 onDelete,
                                                 customActions = []
                                             }: ActionsCellProps<T>) {
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
