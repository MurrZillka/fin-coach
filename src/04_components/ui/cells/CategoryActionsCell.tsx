// src/04_components/ui/cells/CategoryActionsCell.tsx
import React from 'react';
import IconButton from '../IconButton';
import Tooltip from '../Tooltip';
import { PencilIcon, TrashIcon, InformationCircleIcon } from '@heroicons/react/24/outline';

export interface CategoryActionsCellProps {
    data: {
        id: string | number;
        name: string;
    };
    onEdit: (data: { id: string | number; name: string }) => void;
    onDelete: (id: string | number) => void;
    defaultCategoryName: string;
}

export default function CategoryActionsCell({
                                                data,
                                                onEdit,
                                                onDelete,
                                                defaultCategoryName
                                            }: CategoryActionsCellProps) {
    if (data.name === defaultCategoryName) {
        return (
            <div className="w-fit">
                <Tooltip text="Эту категорию нельзя удалить.">
                    <InformationCircleIcon className="h-6 w-6 text-gray-500 cursor-help" />
                </Tooltip>
            </div>
        );
    }

    return (
        <div className="flex gap-1">
            <IconButton
                icon={PencilIcon}
                tooltip="Редактировать"
                className="p-1 text-primary-600 hover:bg-primary-600/10 hover:text-primary-500"
                onClick={() => onEdit(data)}
            />
            <IconButton
                icon={TrashIcon}
                tooltip="Удалить"
                className="p-1 text-accent-error hover:bg-accent-error/10 hover:text-accent-error/80"
                onClick={() => onDelete(data.id)}
            />
        </div>
    );
}
