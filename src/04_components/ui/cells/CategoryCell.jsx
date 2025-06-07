// src/components/ui/cells/CategoryCell.jsx
import Text from '../Text.js';

export default function CategoryCell({ data, categories }) {
    const category = categories?.find(cat => cat.id === data.category_id);
    const categoryName = category ? category.name : 'Неизвестно';

    return <Text variant="tdSecondary">{categoryName}</Text>;
}
