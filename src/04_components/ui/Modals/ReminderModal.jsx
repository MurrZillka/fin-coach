// src/components/ui/ReminderModal.jsx
import React from 'react';
import useModalStore from '../../../02_stores/modalStore.js'; // Путь к твоему store
import Text from '../Text.tsx'; // Путь к твоему Text компоненту
import TextButton from '../TextButton.tsx'; // Путь к твоему TextButton компоненту
import IconButton from '../IconButton.tsx'; // Путь к твоему IconButton
import { XMarkIcon } from '@heroicons/react/24/outline'; // Иконка крестика

export default function ReminderModal({ modalProps }) {
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

    const confirmButtonRef = React.useRef(null); // Добавляем реф для фокуса

    // Функции-обработчики для кнопок
    const handleConfirm = () => {
        if (onConfirm) onConfirm();
        closeModal();
    };

    const handleCancel = () => {
        if (onCancel) onCancel();
        closeModal();
    };

    const handleThirdButton = () => {
        if (onThirdButtonClick)
        closeModal();
    };

    // Закрытие модалки по клику на оверлее
    const handleOverlayClick = (event) => {
        if (event.target === event.currentTarget) {
            closeModal();
        }
    };

    // Закрытие по Escape
    React.useEffect(() => {
        const handleEscapeKey = (event) => {
            if (event.key === 'Escape') {
                closeModal();
            }
        };
        document.addEventListener('keydown', handleEscapeKey);
        return () => {
            document.removeEventListener('keydown', handleEscapeKey);
        };
    }, [closeModal]);

    // Фокус на кнопке подтверждения при открытии (если confirmText существует)
    React.useEffect(() => {
        if (confirmText && confirmButtonRef.current) { // Добавлено условие confirmText
            confirmButtonRef.current.focus();
        }
    }, [modalProps, confirmText]); // Добавлена зависимость confirmText

    return (
        <div className="fixed inset-0 flex items-start justify-center pt-[25vh] z-50 backdrop-blur-xs bg-black/20"
             onClick={handleOverlayClick}
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
                    />
                </div>
                <Text className="mb-6 text-center text-sm md:text-lg text-secondary-800">
                    {message || 'Тут будет важное сообщение.'}
                </Text>

                {/* ИЗМЕНЕНИЕ ЗДЕСЬ: контейнер кнопок и стили кнопок */}
                <div className="flex justify-center mt-4 gap-4"> {/* Используем justify-center и gap-4 для расположения рядом */}
                    {confirmText && (
                        <TextButton
                            ref={confirmButtonRef}
                            onClick={handleConfirm}
                            variant="primary"
                            className="rounded-md px-2 py-1" // Убрал w-full
                        >
                            {confirmText}
                        </TextButton>
                    )}
                    {cancelText && (
                        <TextButton
                            onClick={handleCancel}
                            variant="primary"
                            className="rounded-md px-2 py-1" // Убрал w-full
                        >
                            {cancelText}
                        </TextButton>
                    )}
                    {thirdButtonText && (
                        <TextButton
                            onClick={handleThirdButton}
                            variant="secondary"
                            className="rounded-md px-2 py-1 text-gray-600 hover:text-gray-900" // Убрал w-full
                        >
                            {thirdButtonText}
                        </TextButton>
                    )}
                </div>
            </div>
        </div>
    );
}

ReminderModal.displayName = 'ReminderModal';