// src/components/RecommendationsModal.tsx
import React, { useEffect } from 'react';
import { XMarkIcon } from '@heroicons/react/24/outline';
import IconButton from './IconButton'; // Предполагаем, что IconButton находится в папке ui
import Text from './Text'; // Предполагаем, что Text находится в папке ui

interface RecommendationsModalProps {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    children?: React.ReactNode;
}

const RecommendationsModal = ({
                                  isOpen,
                                  onClose,
                                  title,
                                  children = null,
                              }: RecommendationsModalProps) => {

    // Эффект для закрытия модалки по нажатию клавиши Escape
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

    if (!isOpen) return null; // Если модалка не открыта, ничего не рендерим

    return (
        // Оверлей: фиксированное позиционирование, покрывает весь экран, полупрозрачный фон, z-index
        <div
            className="fixed inset-0 flex justify-center z-50 items-start pt-[10vh] backdrop-blur-xs bg-white/20"
            // Закрываем модалку при клике по оверлею (но не по содержимому модалки)
            onClick={(event) => {
                if (event.target === event.currentTarget) {
                    onClose();
                }
            }}
        >
            {/* Контейнер содержимого модалки: центрирован, скругленные углы, тени, фон, отступы */}
            {/* max-w-md для средней ширины, max-h-[80vh] для ограничения высоты и overflow-y-auto для прокрутки */}
            <div className="p-4 rounded-lg shadow-2xl w-full max-w-xl bg-white border border-gray-300 relative max-h-[80vh] overflow-y-auto">
                {/* Заголовок и кнопка закрытия */}
                <div className="flex justify-between items-center mb-4">
                    {/* Заголовок модалки */}
                    <Text variant="h3" className="mr-4">{title}</Text>
                    {/* Кнопка закрытия */}
                    <IconButton
                        icon={XMarkIcon}
                        onClick={onClose}
                        className="text-gray-500 hover:text-gray-700"
                    />
                </div>
                {/* Область для содержимого */}
                <div className="space-y-4">
                    {children}
                </div>
            </div>
        </div>
    );
};

export default RecommendationsModal;
