// CreditsPage/config/modalFields.js
export const getCreditFields = (formData) => {
    const fields = [
        {
            name: 'description',
            label: 'Описание дохода',
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
            name: 'date',
            label: 'Дата начала',
            required: true,
            type: 'date',
        },
        {
            name: 'is_permanent',
            label: 'Это постоянный доход?',
            required: false,
            type: 'checkbox',
        }
    ];

    if (formData.is_permanent) {
        fields.push({
            name: 'is_exhausted',
            label: 'Этот источник иссяк?',
            required: false,
            type: 'checkbox',
        });

        if (formData.is_exhausted) {
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
