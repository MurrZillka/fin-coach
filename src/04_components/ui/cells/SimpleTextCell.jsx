// src/components/ui/cells/SimpleTextCell.jsx
import Text from '../Text';

export default function SimpleTextCell({
                                           data,
                                           field,
                                           variant = 'tdSecondary',
                                           className = ''
                                       }) {
    return (
        <Text variant={variant} className={className}>
            {data[field] || '-'}
        </Text>
    );
}
