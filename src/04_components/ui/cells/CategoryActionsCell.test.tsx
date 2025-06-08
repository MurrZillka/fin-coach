// src/04_components/ui/cells/CategoryActionsCell.test.tsx
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, fireEvent, screen } from '@testing-library/react';
import CategoryActionsCell from './CategoryActionsCell';

describe('CategoryActionsCell', () => {
    const defaultCategoryName = 'Основная';
    const data = { id: 42, name: 'Продукты' };
    const onEdit = vi.fn();
    const onDelete = vi.fn();

    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('рендерит иконку-информацию и тултип для дефолтной категории', () => {
        render(
            <CategoryActionsCell
                data={{ id: 1, name: defaultCategoryName }}
                onEdit={onEdit}
                onDelete={onDelete}
                defaultCategoryName={defaultCategoryName}
            />
        );
        // Проверяем, что тултип есть
        expect(screen.getByText(/эту категорию нельзя удалить/i)).toBeInTheDocument();
        // Проверяем, что SVG-иконка есть по классу (или ищем svg вообще)
        expect(document.querySelector('svg.h-6.w-6.text-gray-500.cursor-help')).toBeInTheDocument();
        // Кнопок нет
        expect(screen.queryByRole('button')).toBeNull();
    });

    it('рендерит кнопки "Редактировать" и "Удалить" для обычной категории', () => {
        render(
            <CategoryActionsCell
                data={data}
                onEdit={onEdit}
                onDelete={onDelete}
                defaultCategoryName={defaultCategoryName}
            />
        );
        expect(screen.getByRole('button', { name: /редактировать/i })).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /удалить/i })).toBeInTheDocument();
    });

    it('вызывает onEdit с данными при клике на "Редактировать"', () => {
        render(
            <CategoryActionsCell
                data={data}
                onEdit={onEdit}
                onDelete={onDelete}
                defaultCategoryName={defaultCategoryName}
            />
        );
        fireEvent.click(screen.getByRole('button', { name: /редактировать/i }));
        expect(onEdit).toHaveBeenCalledWith(data);
    });

    it('вызывает onDelete с id при клике на "Удалить"', () => {
        render(
            <CategoryActionsCell
                data={data}
                onEdit={onEdit}
                onDelete={onDelete}
                defaultCategoryName={defaultCategoryName}
            />
        );
        fireEvent.click(screen.getByRole('button', { name: /удалить/i }));
        expect(onDelete).toHaveBeenCalledWith(data.id);
    });
});
