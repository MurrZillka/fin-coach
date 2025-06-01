export const handleCreditApiError = (error) => {
    const translations = {
        'credit end_date must be greater than credit date': 'Дата окончания дохода должна быть больше или равна дате начала.',
        'credit date must be less than current date': 'Дата дохода должна быть не больше текущей',
        'spending end_date must be less than current date': 'Дата окончания дохода должна быть не больше текущей даты.',
    };
    const userMessage = translations[error.message] || (error.status >= 400 && error.status < 500 ? 'Ошибка в данных формы. Проверьте введенные значения.' : 'Ошибка связи или сервера. Попробуйте позже.');
    console.error('handleCreditApiError: Processed error -', {
        original: error.message,
        translated: userMessage,
        status: error.status || 500
    });
    return {message: userMessage, status: error.status || 500};
};