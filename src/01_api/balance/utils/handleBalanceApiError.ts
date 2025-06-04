// src/utils/handleBalanceApiError.ts
import {ApiError, ApiErrorWithMessage} from "../../apiTypes";

export const handleBalanceApiError = (error: ApiError): ApiErrorWithMessage => {
    const translations: Record<string, string> = {
        'insufficient_funds': 'Недостаточно средств на счете',
        'account_blocked': 'Счет заблокирован',
        'balance_unavailable': 'Баланс временно недоступен',
    };

    const userMessage = translations[error.message] ||
        (error.status && error.status >= 400 && error.status < 500
            ? 'Ошибка получения баланса. Проверьте подключение.'
            : 'Ошибка связи или сервера. Попробуйте позже.');

    return { message: userMessage, status: error.status || 500 };
};