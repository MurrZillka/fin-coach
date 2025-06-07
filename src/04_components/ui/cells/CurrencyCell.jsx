// src/components/ui/cells/CurrencyCell.jsx
import Text from '../Text.js';

export default function CurrencyCell({
                                         data,
                                         field,
                                         variant = 'tdSecondary',
                                         className = ''
                                     }) {
    const value = data[field];
    const formatted = typeof value === 'number'
        ? value.toLocaleString('ru-RU', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
        : value;

    return (
        <Text variant={variant} className={className}>
            {formatted}{'\u00A0'}₽
        </Text>
    );
}
