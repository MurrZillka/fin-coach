// src/04_components/ui/cells/SimpleTextCell.test.tsx
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import SimpleTextCell from './SimpleTextCell';

describe('SimpleTextCell', () => {
    it('рендерит значение поля, если оно есть', () => {
        render(<SimpleTextCell data={{ foo: 'bar' }} field="foo" />);
        expect(screen.getByText('bar')).toBeInTheDocument();
    });

    it('рендерит "-" если значения поля нет', () => {
        render(<SimpleTextCell data={{}} field="foo" />);
        expect(screen.getByText('-')).toBeInTheDocument();
    });

    it('рендерит "-" если значение поля null', () => {
        render(<SimpleTextCell data={{ foo: null }} field="foo" />);
        expect(screen.getByText('-')).toBeInTheDocument();
    });

    it('рендерит "-" если значение поля пустая строка', () => {
        render(<SimpleTextCell data={{ foo: '' }} field="foo" />);
        expect(screen.getByText('-')).toBeInTheDocument();
    });

    it('поддерживает кастомный variant и className', () => {
        render(
            <SimpleTextCell
                data={{ foo: 'bar' }}
                field="foo"
                variant="caption"
                className="my-class"
            />
        );
        const text = screen.getByText('bar');
        expect(text).toHaveClass('my-class');
    });
});
