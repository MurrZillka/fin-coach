// src/api/spending/utils/handleSpendingApiError.js (или где у тебя теперь лежит)
export const handleSpendingApiError = (error) => {
    const errorMappings = {
        'spending end_date must be greater than spending date': {
            message: 'Дата окончания расхода должна быть больше или равна дате начала расхода.',
            field: 'end_date'
        },
        'spending date must be less than current date': {
            message: 'Дата расхода должна быть не больше текущей.',
            field: 'date'
        },
        'spending end_date must be less than current date': {
            message: 'Дата окончания расхода должна быть не больше текущей даты.',
            field: 'end_date'
        }
    };

    const mapping = errorMappings[error.message];

    if (mapping) {
        console.error('handleSpendingApiError: Processed error -', {
            original: error.message,
            translated: mapping.message,
            field: mapping.field,
            status: error.status || 400
        });

        return {
            message: mapping.message,
            field: mapping.field,
            status: error.status || 400
        };
    }

    // Общие ошибки без привязки к полю
    const userMessage = error.status >= 400 && error.status < 500
        ? 'Ошибка в данных формы. Проверьте введенные значения.'
        : 'Ошибка связи или сервера. Попробуйте позже.';

    console.error('handleSpendingApiError: Processed error -', {
        original: error.message,
        translated: userMessage,
        field: null,
        status: error.status || 500
    });

    return {
        message: userMessage,
        field: null,
        status: error.status || 500
    };
};
