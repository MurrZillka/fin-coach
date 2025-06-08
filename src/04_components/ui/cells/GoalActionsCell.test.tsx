// src/04_components/ui/cells/GoalActionsCell.test.tsx
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import GoalActionsCell from './GoalActionsCell';

describe('GoalActionsCell', () => {
    const goal = { id: 1, is_achieved: false };
    const achievedGoal = { id: 2, is_achieved: true };
    const currentGoal = { id: 1, is_achieved: false };
    const onEdit = vi.fn();
    const onDelete = vi.fn();
    const onSetCurrent = vi.fn();

    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('рендерит все кнопки для обычной цели', () => {
        render(
            <GoalActionsCell
                data={goal}
                currentGoal={null}
                onEdit={onEdit}
                onDelete={onDelete}
                onSetCurrent={onSetCurrent}
            />
        );
        expect(screen.getByRole('button', { name: /редактировать цель/i })).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /установить как текущую/i })).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /удалить цель/i })).toBeInTheDocument();
    });

    it('не рендерит кнопку "установить как текущую", если цель уже текущая', () => {
        render(
            <GoalActionsCell
                data={currentGoal}
                currentGoal={currentGoal}
                onEdit={onEdit}
                onDelete={onDelete}
                onSetCurrent={onSetCurrent}
            />
        );
        expect(screen.getByRole('button', { name: /редактировать цель/i })).toBeInTheDocument();
        expect(screen.queryByRole('button', { name: /установить как текущую/i })).toBeNull();
        expect(screen.getByRole('button', { name: /удалить цель/i })).toBeInTheDocument();
    });

    it('рендерит зеленую кнопку и правильный тултип для достигнутой цели', () => {
        render(
            <GoalActionsCell
                data={achievedGoal}
                currentGoal={null}
                onEdit={onEdit}
                onDelete={onDelete}
                onSetCurrent={onSetCurrent}
            />
        );
        const setCurrentBtn = screen.getByRole('button', { name: /установить достигнутую цель как текущую/i });
        expect(setCurrentBtn).toBeInTheDocument();
        expect(setCurrentBtn.className).toMatch(/text-green-500/);
    });

    it('вызывает onEdit, onDelete, onSetCurrent с правильными данными', () => {
        render(
            <GoalActionsCell
                data={goal}
                currentGoal={null}
                onEdit={onEdit}
                onDelete={onDelete}
                onSetCurrent={onSetCurrent}
            />
        );
        fireEvent.click(screen.getByRole('button', { name: /редактировать цель/i }));
        expect(onEdit).toHaveBeenCalledWith(goal);

        fireEvent.click(screen.getByRole('button', { name: /удалить цель/i }));
        expect(onDelete).toHaveBeenCalledWith(goal);

        fireEvent.click(screen.getByRole('button', { name: /установить как текущую/i }));
        expect(onSetCurrent).toHaveBeenCalledWith(goal);
    });
});
