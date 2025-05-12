// src/components/ui/ConfirmModal.jsx
import Text from './Text';
import TextButton from './TextButton';
import {useEffect, useRef} from "react";
import IconButton from "./IconButton.jsx";
import { XMarkIcon } from '@heroicons/react/24/outline'; // Добавлен импорт XMarkIcon

// Компонент модального окна подтверждения
const ConfirmModal = ({isOpen, onClose, onConfirm, title, message, confirmText = 'Подтвердить'}) => {

    const confirmButtonRef = useRef(null);

    useEffect(() => {
        const handleEscapeKey = (event) => {
            if (event.key === 'Escape') {
                onClose(); // Вызываем функцию закрытия модалки
            }
        };

        // Добавляем слушатель события keydown при открытии модалки
        if (isOpen) {
            document.addEventListener('keydown', handleEscapeKey);
        }

        // Функция очистки: удаляем слушатель события при закрытии модалки или размонтировании компонента
        return () => {
            document.removeEventListener('keydown', handleEscapeKey);
        };
    }, [isOpen, onClose]); // Зависимости: isOpen и onClose

    // НОВЫЙ Эффект для обработки подтверждения по Enter
    useEffect(() => {
        const handleEnterKey = (event) => {
            // Проверяем, если нажата клавиша Enter И модалка открыта
            // Добавляем проверку isOpen на всякий случай, хотя эффект активен только при isOpen === true
            if (isOpen && event.key === 'Enter') {
                event.preventDefault(); // Можно предотвратить стандартное действие, если оно мешает
                onConfirm(); // Вызываем функцию подтверждения
            }
        };

        // Добавляем слушатель события keydown при открытии модалки
        if (isOpen) {
            document.addEventListener('keydown', handleEnterKey);
        }

        // Функция очистки: удаляем слушатель события
        return () => {
            document.removeEventListener('keydown', handleEnterKey);
        };
    }, [isOpen, onConfirm]); // Зависимости: isOpen и onConfirm

    useEffect(() => {
        if (isOpen && confirmButtonRef.current) {
            confirmButtonRef.current.focus(); // Устанавливаем фокус на элемент, на который ссылается реф
        }
    }, [isOpen]); // Зависимость: isOpen - эффект должен сработать при открытии модалки

    if (!isOpen) return null;

    return (
        // Подложка модала (используем стили, которые обсуждали)
        <div className="fixed inset-0 flex items-start justify-center pt-[25vh] z-50 backdrop-blur-xs bg-white/20"
             onClick={(event) => {
                 // Проверяем, был ли клик именно по этому элементу (оверлею),
                 // а не по одному из его дочерних элементов (содержимому модалки).
                 if (event.target === event.currentTarget) {
                     onClose(); // Вызываем функцию закрытия модалки
                 }
             }}
        > {/* Здесь ты можешь поправить bg-opacity, когда разберешься со стилями */}
            <div className="p-3 rounded-lg shadow-2xl w-full max-w-md bg-green-100 border border-gray-300"
            >
                <div className="flex justify-between items-center mb-4"> {/* Используем mb-4 для отступа после заголовка/кнопки */}
                    {/* Заголовок модала */}
                    {/* Убираем text-center и mb-4 у самого заголовка, их управляет flex-контейнер */}
                    <Text variant="h3" className="">
                        {title || 'Подтверждение действия'}
                    </Text>
                    {/* Кнопка закрытия */}
                    <IconButton
                        icon={XMarkIcon} // Иконка крестика
                        onClick={onClose} // Вызывает функцию закрытия модалки
                        className="text-gray-500 hover:text-gray-700" // Стили цвета для кнопки
                        tooltip="Закрыть" // Подсказка при наведении
                    />
                </div>
                {/* Текст сообщения */}
                <Text variant="body" className="mb-6 text-center text-secondary-800">
                    {message || 'Вы уверены?'} {/* Если сообщение не передано, используем дефолтное */}
                </Text>

                {/* Кнопки Отмена и Подтвердить */}
                <div className="flex justify-center mt-4 gap-4">
                    <TextButton
                        onClick={onClose}
                        variant="secondary" // Используем вторичный вариант (серый)
                        className="rounded-md px-4 py-2" // Оставим только общие стили, если нужны
                    >
                        Отмена
                    </TextButton>
                    <TextButton
                        ref={confirmButtonRef}
                        onClick={onConfirm}
                        variant="error" // Используем вариант ошибки (красный)
                        className="rounded-md px-4 py-2" // Оставим только общие стили, если нужны
                    >
                        {confirmText}
                    </TextButton>
                </div>
            </div>
        </div>
    );
};

export default ConfirmModal;