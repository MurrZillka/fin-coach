//src/04_components/ui/ReminderModal/ReminderModal.tsx

import React, { useRef, useEffect } from 'react';
import useModalStore from '../../../../02_stores/modalStore/modalStore';
import Text from '../../Text';
import TextButton from '../../TextButton';
import IconButton from '../../IconButton';
import { XMarkIcon } from '@heroicons/react/24/outline';
import type { ReminderModalProps } from './types';

const ReminderModal: React.FC<ReminderModalProps> = ({ modalProps }) => {
    const { closeModal } = useModalStore();
    const {
        title,
        message,
        confirmText,
        cancelText,
        onConfirm,
        onCancel,
        thirdButtonText,
        onThirdButtonClick
    } = modalProps;

    const confirmButtonRef = useRef<HTMLButtonElement>(null);

    const handleConfirm = () => {
        if (onConfirm) onConfirm();
        closeModal();
    };

    const handleCancel = () => {
        if (onCancel) onCancel();
        closeModal();
    };

    const handleThirdButton = () => {
        if (onThirdButtonClick) onThirdButtonClick();
        closeModal();
    };

    const handleOverlayClick = (event: React.MouseEvent<HTMLDivElement>) => {
        if (event.target === event.currentTarget) {
            closeModal();
        }
    };

    useEffect(() => {
        const handleEscapeKey = (event: KeyboardEvent) => {
            if (event.key === 'Escape') {
                closeModal();
            }
        };
        document.addEventListener('keydown', handleEscapeKey);
        return () => {
            document.removeEventListener('keydown', handleEscapeKey);
        };
    }, [closeModal]);

    useEffect(() => {
        if (confirmText && confirmButtonRef.current) {
            confirmButtonRef.current.focus();
        }
    }, [modalProps, confirmText]);

    return (
        <div
            className="fixed inset-0 flex items-start justify-center pt-[25vh] z-50 backdrop-blur-xs bg-black/20"
            onClick={handleOverlayClick}
            data-testid="reminder-modal-overlay"
        >
            <div className="p-3 rounded-lg shadow-2xl w-full max-w-md bg-red-100 border border-gray-300 mx-4">
                <div className="flex justify-between items-center md:mb-2">
                    <span className="md:text-xl text-red-800 font-semibold">
                        {title || 'Напоминание'}
                    </span>
                    <IconButton
                        icon={XMarkIcon}
                        onClick={closeModal}
                        className="text-gray-500 hover:text-gray-700"
                        tooltip="Закрыть"
                        data-testid="close-reminder-btn"
                    />
                </div>
                <Text className="mb-6 text-center text-sm md:text-lg text-secondary-800">
                    {message || 'Тут будет важное сообщение.'}
                </Text>
                <div className="flex justify-center mt-4 gap-4">
                    {confirmText && (
                        <TextButton
                            ref={confirmButtonRef}
                            onClick={handleConfirm}
                            variant="primary"
                            className="rounded-md px-2 py-1"
                            data-testid="reminder-confirm-btn"
                        >
                            {confirmText}
                        </TextButton>
                    )}
                    {cancelText && (
                        <TextButton
                            onClick={handleCancel}
                            variant="primary"
                            className="rounded-md px-2 py-1"
                            data-testid="reminder-cancel-btn"
                        >
                            {cancelText}
                        </TextButton>
                    )}
                    {thirdButtonText && (
                        <TextButton
                            onClick={handleThirdButton}
                            variant="secondary"
                            className="rounded-md px-2 py-1 text-gray-600 hover:text-gray-900"
                            data-testid="reminder-third-btn"
                        >
                            {thirdButtonText}
                        </TextButton>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ReminderModal;
