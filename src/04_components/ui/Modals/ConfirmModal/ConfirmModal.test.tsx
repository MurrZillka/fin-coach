// src/04_components/ui/ConfirmModal/ConfirmModal.test.tsx
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { render, fireEvent, screen } from '@testing-library/react';
import ConfirmModal from './ConfirmModal';

describe('ConfirmModal', () => {
    const defaultProps = {
        isOpen: true,
        onClose: vi.fn(),
        onConfirm: vi.fn(),
        title: 'Тестовый заголовок',
        message: 'Тестовое сообщение',
        confirmText: 'Да',
    };

    afterEach(() => {
        vi.clearAllMocks();
    });

    it('не рендерится, если isOpen === false', () => {
        const { queryByTestId } = render(<ConfirmModal {...defaultProps} isOpen={false} />);
        expect(queryByTestId('confirm-modal-overlay')).toBeNull();
    });

    it('рендерит заголовок, сообщение и кнопки', () => {
        const { getByText, getByTestId } = render(<ConfirmModal {...defaultProps} />);
        expect(getByText('Тестовый заголовок')).toBeInTheDocument();
        expect(getByText('Тестовое сообщение')).toBeInTheDocument();
        expect(getByTestId('cancel-btn')).toBeInTheDocument();
        expect(getByTestId('confirm-btn')).toBeInTheDocument();
    });

    it('вызывает onClose при клике вне окна', () => {
        const { getByTestId } = render(<ConfirmModal {...defaultProps} />);
        fireEvent.click(getByTestId('confirm-modal-overlay'));
        expect(defaultProps.onClose).toHaveBeenCalled();
    });

    it('вызывает onClose при клике на крестик', () => {
        const { getByTestId } = render(<ConfirmModal {...defaultProps} />);
        fireEvent.click(getByTestId('close-modal-btn'));
        expect(defaultProps.onClose).toHaveBeenCalled();
    });

    it('вызывает onClose при клике на кнопку "Отмена"', () => {
        const { getByTestId } = render(<ConfirmModal {...defaultProps} />);
        fireEvent.click(getByTestId('cancel-btn'));
        expect(defaultProps.onClose).toHaveBeenCalled();
    });

    it('вызывает onConfirm при клике на кнопку подтверждения', () => {
        const { getByTestId } = render(<ConfirmModal {...defaultProps} />);
        fireEvent.click(getByTestId('confirm-btn'));
        expect(defaultProps.onConfirm).toHaveBeenCalled();
    });

    it('вызывает onClose при нажатии Escape', () => {
        const { getByTestId } = render(<ConfirmModal {...defaultProps} />);
        fireEvent.keyDown(document, { key: 'Escape' });
        expect(defaultProps.onClose).toHaveBeenCalled();
    });

    it('вызывает onConfirm при нажатии Enter', () => {
        const { getByTestId } = render(<ConfirmModal {...defaultProps} />);
        fireEvent.keyDown(document, { key: 'Enter' });
        expect(defaultProps.onConfirm).toHaveBeenCalled();
    });
});
