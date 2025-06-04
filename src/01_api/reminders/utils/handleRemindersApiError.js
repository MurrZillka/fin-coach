// src/utils/handleRemindersApiError.js
export const handleRemindersApiError = (error) => {
    const translations = {
        'no_reminders_found': 'Напоминания не найдены',
        'reminder_not_available': 'Напоминания временно недоступны',
    };

    const userMessage = translations[error.message] ||
        (error.status >= 400 && error.status < 500
            ? 'Ошибка получения напоминаний. Попробуйте позже.'
            : 'Ошибка связи или сервера. Попробуйте позже.');

    return { message: userMessage, status: error.status || 500 };
};
