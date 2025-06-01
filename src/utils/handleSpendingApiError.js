export const handleSpendingApiError = (error) => {
    const translations = {
        'spending end_date must be greater than spending date': 'Дата окончания расхода должна быть больше или равна дате начала расхода.',
        'spending date must be less than current date': 'Дата расхода должна быть не больше текущей.',
        'spending end_date must be less than current date': 'Дата окончания расхода должна быть не больше текущей даты.',
    };
    const userMessage = translations[error.message] || (error.status >= 400 && error.status < 500 ? 'Ошибка в данных формы. Проверьте введенные значения.' : 'Ошибка связи или сервера. Попробуйте позже.');
    console.error('handleSpendingApiError: Processed error -', {
        original: error.message,
        translated: userMessage,
        status: error.status || 500,
    });
    return { message: userMessage, status: error.status || 500 };
};