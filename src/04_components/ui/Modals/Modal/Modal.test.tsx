// src/04_components/ui/Modals/Modal.test.tsx
import {beforeEach, describe, expect, it, vi} from 'vitest';
import {fireEvent, render, screen} from '@testing-library/react';
import Modal from './Modal';

const fields = [
    { name: 'name', label: 'Имя', required: true },
    { name: 'amount', label: 'Сумма', type: 'number', required: true },
    { name: 'category', label: 'Категория', type: 'select', options: [
            { value: 'food', label: 'Еда' },
            { value: 'travel', label: 'Путешествия' }
        ] }
];

describe('Modal', () => {
    const onClose = vi.fn();
    const onSubmit = vi.fn();

    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('не рендерится, если isOpen === false', () => {
        render(
            <Modal
                isOpen={false}
                onClose={onClose}
                title="Test"
                fields={fields}
                onSubmit={onSubmit}
            />
        );
        expect(screen.queryByText('Test')).toBeNull();
    });

    it('рендерит заголовок, поля и кнопки', () => {
        render(
            <Modal
                isOpen={true}
                onClose={onClose}
                title="Test Modal"
                fields={fields}
                onSubmit={onSubmit}
            />
        );
        expect(screen.getByText('Test Modal')).toBeInTheDocument();
        expect(screen.getByLabelText('Имя')).toBeInTheDocument();
        expect(screen.getByLabelText('Сумма')).toBeInTheDocument();
        expect(screen.getByLabelText('Категория')).toBeInTheDocument();
        expect(screen.getByText('Отмена')).toBeInTheDocument();
        expect(screen.getByText('Сохранить')).toBeInTheDocument();
    });

    it('вызывает onClose при клике на оверлей', () => {
        render(
            <Modal
                isOpen={true}
                onClose={onClose}
                title="Test"
                fields={fields}
                onSubmit={onSubmit}
            />
        );
        // ищем ближайший .fixed родитель для заголовка
        const overlay = screen.getByText('Test').closest('.fixed')!;
        fireEvent.click(overlay);
        expect(onClose).toHaveBeenCalled();
    });

    it('вызывает onClose при клике на кнопку "Отмена"', () => {
        render(
            <Modal
                isOpen={true}
                onClose={onClose}
                title="Test"
                fields={fields}
                onSubmit={onSubmit}
            />
        );
        fireEvent.click(screen.getByText('Отмена'));
        expect(onClose).toHaveBeenCalled();
    });

    it('вызывает onClose при клике на крестик', () => {
        render(
            <Modal
                isOpen={true}
                onClose={onClose}
                title="Test"
                fields={fields}
                onSubmit={onSubmit}
            />
        );
        // Крестик — это button без текста, ищем по роли и классу
        const closeBtn = screen.getByRole('button', { name: '' });
        fireEvent.click(closeBtn);
        expect(onClose).toHaveBeenCalled();
    });

    it('вызывает onClose при нажатии Escape', () => {
        render(
            <Modal
                isOpen={true}
                onClose={onClose}
                title="Test"
                fields={fields}
                onSubmit={onSubmit}
            />
        );
        fireEvent.keyDown(document, { key: 'Escape' });
        expect(onClose).toHaveBeenCalled();
    });

    it('фокусирует первый input при открытии', () => {
        render(
            <Modal
                isOpen={true}
                onClose={onClose}
                title="Test"
                fields={fields}
                onSubmit={onSubmit}
            />
        );
        const firstInput = screen.getByLabelText('Имя');
        expect(document.activeElement === firstInput).toBe(true);
    });

    it('валидация: не отправляет форму, если обязательные поля пусты', () => {
        render(
            <Modal
                isOpen={true}
                onClose={onClose}
                title="Test"
                fields={fields}
                onSubmit={onSubmit}
            />
        );
        fireEvent.click(screen.getByText('Сохранить'));
        expect(onSubmit).not.toHaveBeenCalled();
        expect(screen.getAllByText(/обязаны выбрать|Сумма должна быть больше нуля/i).length).toBeGreaterThan(0);
    });

    it('отправляет форму с валидными данными', () => {
        render(
            <Modal
                isOpen={true}
                onClose={onClose}
                title="Test"
                fields={fields}
                onSubmit={onSubmit}
            />
        );
        fireEvent.change(screen.getByLabelText('Имя'), { target: { value: 'Вася' } });
        fireEvent.change(screen.getByLabelText('Сумма'), { target: { value: '100' } });
        fireEvent.change(screen.getByLabelText('Категория'), { target: { value: 'food' } });
        fireEvent.click(screen.getByText('Сохранить'));
        expect(onSubmit).toHaveBeenCalledWith(expect.objectContaining({
            name: 'Вася',
            amount: 100,
            category: 'food'
        }));
    });

    it('показывает submissionError, если он передан', () => {
        render(
            <Modal
                isOpen={true}
                onClose={onClose}
                title="Test"
                fields={fields}
                onSubmit={onSubmit}
                submissionError="Ошибка сервера"
            />
        );
        expect(screen.getByText('Ошибка сервера')).toBeInTheDocument();
    });

    it('onFieldChange позволяет динамически менять поля', () => {
        const dynamicFields = [
            { name: 'name', label: 'Имя', required: true },
        ];
        const onFieldChangeMock = vi.fn((name, value) => {
            if (name === 'name' && value === 'show') {
                return [
                    ...dynamicFields,
                    { name: 'extra', label: 'Доп', required: false }
                ];
            }
        });

        render(
            <Modal
                isOpen={true}
                onClose={onClose}
                title="Test"
                fields={dynamicFields}
                onSubmit={onSubmit}
                onFieldChange={onFieldChangeMock}
            />
        );
        fireEvent.change(screen.getByLabelText('Имя'), { target: { value: 'show' } });
        expect(onFieldChangeMock).toHaveBeenCalledWith('name', 'show', expect.any(Object));
        expect(screen.getByLabelText('Доп')).toBeInTheDocument();
    });

    it('корректно работает с initialData', () => {
        render(
            <Modal
                isOpen={true}
                onClose={onClose}
                title="Test"
                fields={fields}
                onSubmit={onSubmit}
                initialData={{ name: 'Петя', amount: 50, category: 'travel' }}
            />
        );
        expect(screen.getByLabelText('Имя')).toHaveValue('Петя');
        expect(screen.getByLabelText('Сумма')).toHaveValue(50);
        expect(screen.getByLabelText('Категория')).toHaveValue('travel');
    });
});
