//03_pages/SpendingsPage/config/modalFields.ts
import type { Spending, SpendingRequest } from '../../../01_api/spendings/types';
import type { Category } from '../../../01_api/categories/types';

// Типы для полей формы
export type FieldType = 'text' | 'number' | 'date' | 'checkbox' | 'select';

export interface FormField {
    name: keyof SpendingFormData;
    label: string;
    required: boolean;
    type: FieldType;
    options?: Array<{ value: string | number; label: string }>;
}

// Интерфейс для данных формы расхода (расширяет SpendingRequest)
export interface SpendingFormData extends SpendingRequest {
    is_finished?: boolean;
}

export const getSpendingFields = (
        formData: Partial<SpendingFormData>,
    categories: Category[] | null
): FormField[] => {
    const fields: FormField[] = [
        {
            name: 'description',
            label: 'Описание расхода',
            required: true,
            type: 'text',
        },
        {
            name: 'amount',
            label: 'Сумма',
            required: true,
            type: 'number',
        },
        {
            name: 'category_id',
            label: 'Категория',
            required: true,
            type: 'select',
            options: categories?.map(cat => ({
                value: cat.id,
                label: cat.name
            })) || [],
        },
        {
            name: 'date',
            label: 'Дата начала',
            required: true,
            type: 'date',
        },
        {
            name: 'is_permanent',
            label: 'Это постоянный расход?',
            required: false,
            type: 'checkbox',
        }
    ];

    if (formData.is_permanent) {
        fields.push({
            name: 'is_finished',
            label: 'Этот расход завершён?',
            required: false,
            type: 'checkbox',
        });

        if (formData.is_finished) {
            fields.push({
                name: 'end_date',
                label: 'Дата окончания',
                required: false,
                type: 'date',
            });
        }
    }

    return fields;
};
