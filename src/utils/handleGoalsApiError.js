// src/utils/handleGoalsApiError.js
export const handleGoalsApiError = (error) => {
    const translations = {
        'goal_not_found': 'Цель не найдена',
        'invalid_goal_amount': 'Некорректная сумма цели',
        'invalid_date': 'Некорректная дата',
        'no current goal found': 'У вас пока нет активной цели',
    };

    const userMessage = translations[error.message] ||
        (error.status >= 400 && error.status < 500
            ? 'Ошибка в данных цели. Проверьте введённую информацию.'
            : 'Ошибка связи или сервера. Попробуйте позже.');

    return { message: userMessage, status: error.status || 500 };
};
