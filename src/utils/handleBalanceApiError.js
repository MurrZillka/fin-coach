// src/utils/handleBalanceApiError.js
export const handleBalanceApiError = (error) => {
    const translations = {
        'insufficient_funds': 'Недостаточно средств на счете',
        'account_blocked': 'Счет заблокирован',
        // другие специфичные для баланса ошибки
    };

    const userMessage = translations[error.message] ||
        (error.status >= 400 && error.status < 500
            ? 'Ошибка в данных. Проверьте запрос.'
            : 'Ошибка связи или сервера. Попробуйте позже.');

    return { message: userMessage, status: error.status || 500 };
};
