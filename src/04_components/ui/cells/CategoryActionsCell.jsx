// src/components/ui/cells/CategoryActionsCell.jsx
import IconButton from '../IconButton.js';
import Tooltip from '../Tooltip.js';
import { PencilIcon, TrashIcon, InformationCircleIcon } from '@heroicons/react/24/outline';

export default function CategoryActionsCell({
                                                data,
                                                onEdit,
                                                onDelete,
                                                defaultCategoryName
                                            }) {
    if (data.name === defaultCategoryName) {
        return (
            <div className="w-fit"> {/* Ширина по содержимому */}
                <Tooltip text="Эту категорию нельзя удалить.">
                    <InformationCircleIcon className="h-6 w-6 text-gray-500 cursor-help"/>
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
