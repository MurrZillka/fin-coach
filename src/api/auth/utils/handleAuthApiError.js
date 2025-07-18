// utils/handleAuthApiError.js
export const handleAuthApiError = (error) => {
    let userMessage;

    if (error.status === 403) {
        userMessage = 'Неверный логин или пароль. Пожалуйста, проверьте введенные данные.';
    } else if (error.status === 409) {
        userMessage = 'Извините, пользователь с таким логином уже существует.';
    } else {
        userMessage = 'Ошибка связи или сервера. Пожалуйста, повторите попытку позже.';
    }

    return { message: userMessage, status: error.status || 500 };
};