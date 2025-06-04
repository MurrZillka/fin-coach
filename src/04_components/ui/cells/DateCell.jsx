// src/components/ui/cells/DateCell.jsx
import Text from '../Text';

export default function DateCell({
                                     data,
                                     field,
                                     variant = 'tdSecondary',
                                     className = ''
                                 }) {
    const date = data[field];
    const formatted = date && date !== '0001-01-01T00:00:00Z' && date !== '0001-01-01'
        ? new Date(date).toLocaleDateString('ru-RU')
        : '-';

    return (
        <Text variant={variant} className={className}>
            {formatted}
        </Text>
    );
}
