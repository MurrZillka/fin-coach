// src/04_components/ui/cells/CurrencyCell.test.tsx
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import CurrencyCell from './CurrencyCell';

const textMatcher = (expectedText: string) => {
    return (content: string) => {
        const normalize = (str: string) => str.replace(/\s|\u00A0/g, '');
        return normalize(content).includes(normalize(expectedText));
    };
};

describe('CurrencyCell', () => {
    it('рендерит число с форматированием и ₽', () => {
        render(
            <CurrencyCell data={{ amount: 1234.5 }} field="amount" />
        );
        expect(screen.getByText(textMatcher('1 234,50 ₽'))).toBeInTheDocument();
    });

    it('рендерит строку и ₽', () => {
        render(
            <CurrencyCell data={{ amount: 'abc' }} field="amount" />
        );
        expect(screen.getByText(textMatcher('abc ₽'))).toBeInTheDocument();
    });

    it('рендерит пустое значение и ₽, если данных нет', () => {
        render(
            <CurrencyCell data={{}} field="amount" />
        );
        expect(screen.getByText(textMatcher('₽'))).toBeInTheDocument();
    });

    it('поддерживает валидный кастомный variant и className', () => {
        render(
            <CurrencyCell
                data={{ amount: 50 }}
                field="amount"
                variant="bodySecondary"
                className="my-class"
            />
        );
        const text = screen.getByText(textMatcher('50,00 ₽'));
        expect(text).toHaveClass('my-class');
    });
});
