// src/utils/fieldErrorMapping.js
export const FIELD_ERROR_MESSAGES = {
    'date': 'Проверьте дату',
    'end_date': 'Проверьте дату',
    'name': 'Измените имя',
    'amount': 'Проверьте сумму',
    'category_id': 'Выберите категорию',
    'description': 'Проверьте описание'
};

export const mapServerErrorToFieldError = (submissionError) => {
    if (!submissionError?.field) return null;

    return {
        field: submissionError.field,
        message: FIELD_ERROR_MESSAGES[submissionError.field] || 'Проверьте значение'
    };
};

export const clearServerFieldErrors = (errors) => {
    const newErrors = { ...errors };

    // Убираем только серверные ошибки (по известным сообщениям)
    Object.entries(FIELD_ERROR_MESSAGES).forEach(([field, message]) => {
        if (newErrors[field] === message) {
            delete newErrors[field];
        }
    });

    return newErrors;
};
