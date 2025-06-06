// src/utils/handleGoalsApiError.ts
import { ApiError, ApiErrorWithMessage } from '../../apiTypes';

export const handleGoalsApiError = (error: ApiError): ApiErrorWithMessage => {
    const translations: Record<string, string> = {
        'goal_not_found': 'Цель не найдена',
        'invalid_goal_amount': 'Некорректная сумма цели',
        'invalid_date': 'Некорректная дата',
        'no current goal found': 'У вас пока нет активной цели',
    };

    const userMessage = translations[error.message] ||
        (error.status != null && error.status >= 400 && error.status < 500
            ? 'Ошибка в данных цели. Проверьте введённую информацию.'
            : 'Ошибка связи или сервера. Попробуйте позже.');

    return { message: userMessage, status: error.status || 500 };
};
