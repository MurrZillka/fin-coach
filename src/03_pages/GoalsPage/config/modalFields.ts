// 03_pages/GoalsPage/config/modalFields.ts
import type {GoalRequest} from '../../../01_api/goals/types';

// Типы для полей формы
export type FieldType = 'text' | 'number' | 'date' | 'checkbox' | 'select';

export interface FormField {
    name: keyof GoalRequest;
    label: string;
    required: boolean;
    type: FieldType;
    placeholder?: string;
    options?: Array<{ value: string | number; label: string }>;
    min?: number;
    max?: number;
    step?: number;
}

// Поля формы цели
export const goalFields: FormField[] = [
    {
        name: 'description',
        label: 'Описание цели',
        required: true,
        type: 'text',
        placeholder: 'Например: Накопить на отпуск'
    },
    {
        name: 'amount',
        label: 'Целевая сумма',
        required: true,
        type: 'number',
        placeholder: 'Например: 150000'
    },
    {
        name: 'wish_date',
        label: 'Желаемая дата',
        required: true,
        type: 'date'
    },
];
