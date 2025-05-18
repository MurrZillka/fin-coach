import { forwardRef } from 'react';
import Text from './Text';

// Определяем стили для разных вариантов кнопки
const baseStyles = 'rounded-md px-2 py-1 md:px-3 md:py-2 transition focus:outline-none focus:ring-2 focus:ring-opacity-50 disabled:opacity-50 disabled:cursor-not-allowed' // Общие стили

// Определяем стили для фона и текста для каждого варианта
const variantStyles = {
    primary: 'bg-primary-600 text-background hover:bg-primary-500 focus:ring-primary-600', // Основной вариант (синий)
    secondary: 'bg-secondary-500 text-white hover:bg-secondary-800 focus:ring-secondary-500', // Вторичный вариант (серый)
    error: 'bg-accent-error text-white hover:bg-accent-error/80 focus:ring-accent-error', // Вариант ошибки/опасности (красный)
};

const TextButton = forwardRef(({ children, onClick, className = '', disabled = false, type = 'button', variant = 'primary' }, ref) => { // ДОБАВЛЕН проп variant = 'primary'

    // Выбираем стили в зависимости от варианта
    const stylesForVariant = variantStyles[variant] || variantStyles.primary; // Используем variantStyles объект

    return (
        <button
            ref={ref}
            onClick={onClick}
            disabled={disabled}
            type={type}
            // Объединяем базовые стили, стили варианта и дополнительные стили из пропса className
            className={`${baseStyles} ${stylesForVariant} ${className}`}
        >
            {/* Текст внутри компонента Text. Его цвет может быть переопределен классом text-white/text-background на button */}
            <Text variant="button" className="text-sm md:text-base ">{children}</Text>
        </button>
    );
});

TextButton.displayName = 'TextButton';

TextButton.defaultProps = {
    type: 'button',
    variant: 'primary', // Устанавливаем primary как вариант по умолчанию
};

export default TextButton;