// src/components/ui/ConfirmModal.jsx
import Text from './Text';
import TextButton from './TextButton';

// Компонент модального окна подтверждения
const ConfirmModal = ({ isOpen, onClose, onConfirm, title, message, confirmText = 'Подтвердить' }) => {

    if (!isOpen) return null;

    return (
        // Подложка модала (используем стили, которые обсуждали)
        <div className="fixed inset-0 bg-gray-200 bg-opacity-40 flex items-center justify-center z-50"> {/* Здесь ты можешь поправить bg-opacity, когда разберешься со стилями */}
            <div style={{ backgroundColor: `rgb(var(--color-background))` }} className="p-6 rounded-lg shadow-lg w-full max-w-md">
                {/* Заголовок модала */}
                <Text variant="h3" className="mb-4 text-center">
                    {title || 'Подтверждение действия'} {/* Если заголовок не передан, используем дефолтный */}
                </Text>

                {/* Текст сообщения */}
                <Text variant="body" className="mb-6 text-center text-secondary-800">
                    {message || 'Вы уверены?'} {/* Если сообщение не передано, используем дефолтное */}
                </Text>

                {/* Кнопки Отмена и Подтвердить */}
                <div className="flex justify-center gap-4">
                    <TextButton
                        onClick={onClose} // Кнопка Отмена просто закрывает модал
                        style={{
                            backgroundColor: `rgb(var(--color-secondary-500))`,
                            color: 'white',
                        }}
                        className="hover:[background-color:rgb(var(--color-secondary-800))] rounded-md px-4 py-2"
                    >
                        Отмена
                    </TextButton>
                    <TextButton
                        onClick={onConfirm} // Кнопка Подтвердить вызывает функцию onConfirm
                        style={{
                            backgroundColor: `rgb(var(--color-accent-error))`, // Обычно для удаления используют красный
                            color: 'white',
                        }}
                        className="hover:[background-color:rgb(var(--color-accent-error)/80)] rounded-md px-4 py-2" // Более темный красный при наведении
                    >
                        {confirmText} {/* Текст на кнопке Подтвердить */}
                    </TextButton>
                </div>
            </div>
        </div>
    );
};

export default ConfirmModal;