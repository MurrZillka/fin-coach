// src/components/ui/cells/SpendingStatusCell.test.tsx
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import SpendingStatusCell from './SpendingStatusCell';

// Мокаем утилиту, чтобы управлять датой
vi.mock('../../../07_utils/dateUtils', () => ({
    isDateTodayOrEarlier: vi.fn(),
}));

const { isDateTodayOrEarlier } = await import('../../../07_utils/dateUtils');

describe('SpendingStatusCell', () => {
    it('показывает завершённый статус и дату, если is_permanent и дата завершения в прошлом', () => {
        (isDateTodayOrEarlier as any).mockReturnValue(true);
        render(
            <SpendingStatusCell
                data={{
                    is_permanent: true,
                    end_date: '2023-01-01'
                }}
            />
        );
        expect(screen.getByText(/до/i)).toBeInTheDocument();
        expect(screen.getByText((content) => content.includes('01.01.2023'))).toBeInTheDocument();
        expect(document.querySelector('.text-gray-400')).toBeInTheDocument();
    });

    it('показывает "расходы продолжаются", если is_permanent и дата не в прошлом', () => {
        (isDateTodayOrEarlier as any).mockReturnValue(false);
        render(
            <SpendingStatusCell
                data={{
                    is_permanent: true,
                    end_date: '2099-12-31'
                }}
            />
        );
        expect(screen.getByText(/расходы продолжаются/i)).toBeInTheDocument();
        expect(document.querySelector('.text-blue-500')).toBeInTheDocument();
    });

    it('показывает "Разовый", если is_permanent=false', () => {
        render(
            <SpendingStatusCell
                data={{
                    is_permanent: false,
                    end_date: '2023-01-01'
                }}
            />
        );
        expect(screen.getByText(/разовый/i)).toBeInTheDocument();
        expect(document.querySelector('.text-red-300')).toBeInTheDocument();
    });

    it('показывает "-" если дата некорректная', () => {
        (isDateTodayOrEarlier as any).mockReturnValue(true);
        render(
            <SpendingStatusCell
                data={{
                    is_permanent: true,
                    end_date: '0001-01-01'
                }}
            />
        );
        expect(screen.getByText(/до/i)).toBeInTheDocument();
        expect(screen.getByText(/-/)).toBeInTheDocument();
    });
});
