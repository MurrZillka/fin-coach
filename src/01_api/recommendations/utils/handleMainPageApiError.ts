// src/utils/handleMainPageApiError.ts
import { ApiError, ApiErrorWithMessage } from '../../apiTypes';

export const handleMainPageApiError = (error: ApiError): ApiErrorWithMessage => {
    const translations: Record<string, string> = {
        'no_recommendations_available': 'Рекомендации пока недоступны',
        'insufficient_data': 'Недостаточно данных для формирования рекомендаций',
    };

    const userMessage = translations[error.message] ||
        (error.status != null && error.status >= 400 && error.status < 500
            ? 'Ошибка получения рекомендаций. Попробуйте позже.'
            : 'Ошибка связи или сервера. Попробуйте позже.');

    return { message: userMessage, status: error.status || 500 };
};
