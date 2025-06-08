// src/components/ui/cells/GoalDescriptionCell.test.tsx
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import GoalDescriptionCell from './GoalDescriptionCell';

describe('GoalDescriptionCell', () => {
    const goal = { id: 1, description: 'Купить велосипед', amount: 1000, is_achieved: false };

    it('рендерит чек-иконку и зелёный текст для достигнутой цели', () => {
        render(
            <GoalDescriptionCell
                data={{ ...goal, is_achieved: true }}
                currentGoal={null}
                balance={500}
            />
        );
        expect(screen.getByText('Купить велосипед')).toHaveClass('text-green-700');
        expect(document.querySelector('.text-green-600')).toBeInTheDocument(); // Чек-иконка
    });

    it('рендерит звезду с правильным цветом для текущей цели (0%)', () => {
        render(
            <GoalDescriptionCell
                data={goal}
                currentGoal={goal}
                balance={0}
            />
        );
        expect(screen.getByText('Купить велосипед')).toBeInTheDocument();
        expect(document.querySelector('.text-red-500')).toBeInTheDocument();
    });

    it('рендерит звезду с оранжевым цветом (30%)', () => {
        render(
            <GoalDescriptionCell
                data={goal}
                currentGoal={goal}
                balance={300}
            />
        );
        expect(document.querySelector('.text-orange-500')).toBeInTheDocument();
    });

    it('рендерит звезду с жёлтым цветом (60%)', () => {
        render(
            <GoalDescriptionCell
                data={goal}
                currentGoal={goal}
                balance={600}
            />
        );
        expect(document.querySelector('.text-yellow-500')).toBeInTheDocument();
    });

    it('рендерит звезду с зелёным цветом (90%)', () => {
        render(
            <GoalDescriptionCell
                data={goal}
                currentGoal={goal}
                balance={900}
            />
        );
        expect(document.querySelector('.text-green-500')).toBeInTheDocument();
    });

    it('рендерит звезду с насыщенно-зелёным цветом (100%)', () => {
        render(
            <GoalDescriptionCell
                data={goal}
                currentGoal={goal}
                balance={1000}
            />
        );
        expect(document.querySelector('.text-green-600')).toBeInTheDocument();
    });

    it('рендерит только текст для обычной цели', () => {
        render(
            <GoalDescriptionCell
                data={goal}
                currentGoal={null}
                balance={0}
            />
        );
        expect(screen.getByText('Купить велосипед')).toBeInTheDocument();
        // svg вообще нет
        expect(document.querySelector('svg')).toBeNull();
    });
});
