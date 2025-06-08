//03_pages/CategoriesPage/config/modalFields.ts
import type { CategoryRequest } from '../../../01_api/categories/types';

// Типы для полей формы
export type FieldType = 'text' | 'number' | 'date' | 'checkbox' | 'select';

export interface FormField {
    name: keyof CategoryRequest;
    label: string;
    required: boolean;
    type: FieldType;
    placeholder?: string;
}

// Поля формы категории
export const categoryFields: FormField[] = [
    {
        name: 'name',
        label: 'Название',
        required: true,
        type: 'text',
        placeholder: 'Например: Еда'
    },
    {
        name: 'description',
        label: 'Описание',
        required: false,
        type: 'text',
        placeholder: 'Необязательно: на что тратится категория'
    },
];
