// src/04_components/ui/cells/ActionsCell.test.tsx
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, fireEvent, screen } from '@testing-library/react';
import ActionsCell, { CustomAction } from './ActionsCell';
import { PencilIcon, TrashIcon } from '@heroicons/react/24/outline';

describe('ActionsCell', () => {
    const data = { id: 1, name: 'Test' };
    const onEdit = vi.fn();
    const onDelete = vi.fn();

    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('рендерит кнопки "Редактировать" и "Удалить" и вызывает колбэки', () => {
        render(
            <ActionsCell
                data={data}
                onEdit={onEdit}
                onDelete={onDelete}
            />
        );
        // Кнопка "Редактировать"
        const editBtn = screen.getByRole('button', { name: /редактировать/i });
        fireEvent.click(editBtn);
        expect(onEdit).toHaveBeenCalledWith(data);

        // Кнопка "Удалить"
        const deleteBtn = screen.getByRole('button', { name: /удалить/i });
        fireEvent.click(deleteBtn);
        expect(onDelete).toHaveBeenCalledWith(data);
    });

    it('не рендерит кнопку, если действия нет в actions', () => {
        render(
            <ActionsCell
                data={data}
                actions={['edit']}
                onEdit={onEdit}
                onDelete={onDelete}
            />
        );
        expect(screen.getByRole('button', { name: /редактировать/i })).toBeInTheDocument();
        expect(screen.queryByRole('button', { name: /удалить/i })).toBeNull();
    });

    it('рендерит и вызывает кастомные действия', () => {
        const customAction: CustomAction = {
            icon: PencilIcon,
            tooltip: 'Кастом',
            className: 'custom',
            onClick: vi.fn(),
        };
        render(
            <ActionsCell
                data={data}
                actions={[]}
                customActions={[customAction]}
            />
        );
        const customBtn = screen.getByRole('button', { name: /кастом/i });
        fireEvent.click(customBtn);
        expect(customAction.onClick).toHaveBeenCalledWith(data);
    });

    it('не вызывает onEdit/onDelete, если их не передали', () => {
        render(
            <ActionsCell
                data={data}
                actions={['edit', 'delete']}
            />
        );
        // Кнопки не должны быть в DOM, если нет обработчиков
        expect(screen.queryByRole('button', { name: /редактировать/i })).toBeNull();
        expect(screen.queryByRole('button', { name: /удалить/i })).toBeNull();
    });

    it('корректно работает с пустым customActions', () => {
        render(
            <ActionsCell
                data={data}
                actions={[]}
                customActions={[]}
            />
        );
        expect(screen.queryAllByRole('button').length).toBe(0);
    });

    it('корректно пробрасывает className кастомной кнопки', () => {
        const customAction: CustomAction = {
            icon: TrashIcon,
            tooltip: 'Удалить всё',
            className: 'my-custom-class',
            onClick: vi.fn(),
        };
        render(
            <ActionsCell
                data={data}
                actions={[]}
                customActions={[customAction]}
            />
        );
        const customBtn = screen.getByRole('button', { name: /удалить всё/i });
        expect(customBtn.className).toMatch(/my-custom-class/);
    });
});
