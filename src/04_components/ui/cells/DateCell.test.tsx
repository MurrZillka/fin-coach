// src/04_components/ui/cells/DateCell.test.tsx
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import DateCell from './DateCell';

describe('DateCell', () => {
    it('рендерит форматированную дату, если дата валидная', () => {
        render(
            <DateCell data={{ dt: '2023-02-01T12:00:00Z' }} field="dt" />
        );
        // 01.02.2023 в ru-RU
        expect(screen.getByText('01.02.2023')).toBeInTheDocument();
    });

    it('рендерит "-" если дата пустая', () => {
        render(
            <DateCell data={{ dt: '' }} field="dt" />
        );
        expect(screen.getByText('-')).toBeInTheDocument();
    });

    it('рендерит "-" если дата "0001-01-01T00:00:00Z"', () => {
        render(
            <DateCell data={{ dt: '0001-01-01T00:00:00Z' }} field="dt" />
        );
        expect(screen.getByText('-')).toBeInTheDocument();
    });

    it('рендерит "-" если дата "0001-01-01"', () => {
        render(
            <DateCell data={{ dt: '0001-01-01' }} field="dt" />
        );
        expect(screen.getByText('-')).toBeInTheDocument();
    });

    it('поддерживает кастомный variant и className', () => {
        render(
            <DateCell
                data={{ dt: '2024-01-01' }}
                field="dt"
                variant="caption"
                className="my-class"
            />
        );
        const text = screen.getByText('01.01.2024');
        expect(text).toHaveClass('my-class');
    });
});
