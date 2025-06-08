// SpendingsPage/config/modalFields.ts
export const getSpendingFields = (formData, categories) => {
    const fields = [
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
