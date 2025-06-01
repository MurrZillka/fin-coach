// src/utils/handleMainPageApiError.js
export const handleMainPageApiError = (error) => {
    const translations = {
        'no_recommendations_available': 'Рекомендации пока недоступны',
        'insufficient_data': 'Недостаточно данных для формирования рекомендаций',
    };

    const userMessage = translations[error.message] ||
        (error.status >= 400 && error.status < 500
            ? 'Ошибка получения рекомендаций. Попробуйте позже.'
            : 'Ошибка связи или сервера. Попробуйте позже.');

    return { message: userMessage, status: error.status || 500 };
};
