// src/utils/handleRemindersApiError.ts

import { ApiError, ApiErrorWithMessage } from '../../apiTypes';

export const handleRemindersApiError = (error: ApiError): ApiErrorWithMessage => {
    const translations: Record<string, string> = {
        'no_reminders_found': 'Напоминания не найдены',
        'reminder_not_available': 'Напоминания временно недоступны',
    };

    const userMessage = translations[error.message] ||
        (error.status != null && error.status >= 400 && error.status < 500
            ? 'Ошибка получения напоминаний. Попробуйте позже.'
            : 'Ошибка связи или сервера. Попробуйте позже.');

    return { message: userMessage, status: error.status || 500 };
};

