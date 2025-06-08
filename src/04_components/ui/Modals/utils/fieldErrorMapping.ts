// src/utils/fieldErrorMapping.ts

export const FIELD_ERROR_MESSAGES: Record<string, string> = {
    'date': 'Проверьте дату',
    'end_date': 'Проверьте дату',
    'name': 'Измените имя',
    'amount': 'Проверьте сумму',
    'category_id': 'Выберите категорию',
    'description': 'Проверьте описание'
};

export interface SubmissionError {
    field?: string;
    message?: string;
    [key: string]: any;
}

export interface FieldError {
    field: string;
    message: string;
}

export const mapServerErrorToFieldError = (
    submissionError: SubmissionError | null | undefined
): FieldError | null => {
    if (!submissionError?.field) return null;

    return {
        field: submissionError.field,
        message: FIELD_ERROR_MESSAGES[submissionError.field] || 'Проверьте значение'
    };
};

export const clearServerFieldErrors = (
    errors: Record<string, string>
): Record<string, string> => {
    const newErrors = { ...errors };

    Object.entries(FIELD_ERROR_MESSAGES).forEach(([field, message]) => {
        if (newErrors[field] === message) {
            delete newErrors[field];
        }
    });

    return newErrors;
};
