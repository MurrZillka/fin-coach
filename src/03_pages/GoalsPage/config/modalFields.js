// GoalsPage/config/modalFields.ts
export const goalFields = [
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
