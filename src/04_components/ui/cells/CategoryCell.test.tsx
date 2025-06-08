// src/04_components/ui/cells/CategoryCell.test.tsx
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import CategoryCell from './CategoryCell';

describe('CategoryCell', () => {
    const categories = [
        { id: 1, name: 'Продукты' },
        { id: 2, name: 'Транспорт' }
    ];

    it('отображает имя категории, если категория найдена', () => {
        render(
            <CategoryCell data={{ category_id: 2 }} categories={categories} />
        );
        expect(screen.getByText('Транспорт')).toBeInTheDocument();
    });

    it('отображает "Неизвестно", если категория не найдена', () => {
        render(
            <CategoryCell data={{ category_id: 99 }} categories={categories} />
        );
        expect(screen.getByText('Неизвестно')).toBeInTheDocument();
    });

    it('отображает "Неизвестно", если categories не переданы', () => {
        render(
            <CategoryCell data={{ category_id: 1 }} />
        );
        expect(screen.getByText('Неизвестно')).toBeInTheDocument();
    });
});
