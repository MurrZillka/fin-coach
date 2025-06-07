// src/04_components/ui/ConfirmModal.tsx

import Text from '../../../../ui/Text';
import TextButton from '../../../../ui/TextButton';
import { useEffect, useRef } from 'react';
import IconButton from '../../../../ui/IconButton';
import { XMarkIcon } from '@heroicons/react/24/outline';
import type { ConfirmModalProps } from './types';

const ConfirmModal = ({
                          isOpen,
                          onClose,
                          onConfirm,
                          title,
                          message,
                          confirmText = 'Подтвердить',
                          confirmButtonRef: externalConfirmButtonRef,
                      }: ConfirmModalProps) => {
    const internalConfirmButtonRef = useRef<HTMLButtonElement>(null);
    const confirmButtonRef = externalConfirmButtonRef || internalConfirmButtonRef;

    useEffect(() => {
        const handleEscapeKey = (event: KeyboardEvent) => {
            if (event.key === 'Escape') {
                onClose();
            }
        };
        if (isOpen) {
            document.addEventListener('keydown', handleEscapeKey);
        }
        return () => {
            document.removeEventListener('keydown', handleEscapeKey);
        };
    }, [isOpen, onClose]);

    useEffect(() => {
        const handleEnterKey = (event: KeyboardEvent) => {
            if (isOpen && event.key === 'Enter') {
                event.preventDefault();
                onConfirm();
            }
        };
        if (isOpen) {
            document.addEventListener('keydown', handleEnterKey);
        }
        return () => {
            document.removeEventListener('keydown', handleEnterKey);
        };
    }, [isOpen, onConfirm]);

    useEffect(() => {
        if (isOpen && confirmButtonRef.current) {
            confirmButtonRef.current.focus();
        }
    }, [isOpen, confirmButtonRef]);

    if (!isOpen) return null;

    return (
        <div
            className="fixed inset-0 flex items-start justify-center pt-[25vh] z-50 backdrop-blur-xs bg-black/20"
            onClick={(event) => {
                if (event.target === event.currentTarget) {
                    onClose();
                }
            }}
            data-testid="confirm-modal-overlay"
        >
            <div className="p-3 rounded-lg shadow-2xl w-full max-w-md bg-green-100 border border-gray-300">
                <div className="flex justify-between items-center mb-4">
                    <Text variant="h3">{title || 'Подтверждение действия'}</Text>
                    <IconButton
                        icon={XMarkIcon}
                        onClick={onClose}
                        className="text-gray-500 hover:text-gray-700"
                        tooltip="Закрыть"
                        data-testid="close-modal-btn"
                    />
                </div>
                <Text variant="body" className="mb-6 text-center text-secondary-800">
                    {message || 'Вы уверены?'}
                </Text>
                <div className="flex justify-center mt-4 gap-4">
                    <TextButton
                        onClick={onClose}
                        variant="secondary"
                        className="rounded-md px-4 py-2"
                        data-testid="cancel-btn"
                    >
                        Отмена
                    </TextButton>
                    <TextButton
                        ref={confirmButtonRef}
                        onClick={onConfirm}
                        variant="error"
                        className="rounded-md px-4 py-2"
                        data-testid="confirm-btn"
                    >
                        {confirmText}
                    </TextButton>
                </div>
            </div>
        </div>
    );
};

export default ConfirmModal;
