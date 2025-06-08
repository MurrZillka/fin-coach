// src/04_components/ui/cells/SpendingAmountCell.test.tsx
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import SpendingAmountCell from './SpendingAmountCell';

const textMatcher = (expectedText: string) => {
    return (content: string) => {
        const normalize = (str: string) => str.replace(/\s|\u00A0/g, '');
        return normalize(content).includes(normalize(expectedText));
    };
};

describe('SpendingAmountCell', () => {
    it('рендерит разовый платеж и всего для is_permanent=true', () => {
        render(
            <SpendingAmountCell
                data={{
                    is_permanent: true,
                    amount: 12345.67,
                    full_amount: 54321.99
                }}
            />
        );
        expect(screen.getByText(/разовый платеж:/i)).toBeInTheDocument();
        expect(screen.getByText(textMatcher('12 345,67 ₽'))).toBeInTheDocument();
        expect(screen.getByText(/всего:/i)).toBeInTheDocument();
        expect(screen.getByText(textMatcher('54 321,99 ₽'))).toBeInTheDocument();
    });

    it('рендерит только сумму для is_permanent=false', () => {
        render(
            <SpendingAmountCell
                data={{
                    is_permanent: false,
                    amount: 1000
                }}
            />
        );
        expect(screen.getByText(/сумма:/i)).toBeInTheDocument();
        expect(screen.getByText(textMatcher('1 000,00 ₽'))).toBeInTheDocument();
        expect(screen.queryByText(/разовый платеж:/i)).toBeNull();
        expect(screen.queryByText(/всего:/i)).toBeNull();
    });

    it('корректно отображает amount и full_amount, если это строки', () => {
        render(
            <SpendingAmountCell
                data={{
                    is_permanent: true,
                    amount: 'abc',
                    full_amount: 'def'
                }}
            />
        );
        expect(screen.getByText(textMatcher('abc ₽'))).toBeInTheDocument();
        expect(screen.getByText(textMatcher('def ₽'))).toBeInTheDocument();
    });
});
