// src/utils/handleCategoryApiError.ts

import {ApiError, ApiErrorWithMessage} from "../../apiTypes";

export const handleCategoryApiError = (error: ApiError): ApiErrorWithMessage => {
    const translations: Record<string, string> = {
        'category_not_found': 'Категория не найдена',
        'Category name must be unique': 'Категория с таким названием уже существует, выберите, пожалуйста, другое',
        'category_in_use': 'Нельзя удалить категорию, которая используется в расходах',
    };

    const userMessage =
        translations[error.message] ||
        (error.status && error.status >= 400 && error.status < 500
            ? 'Ошибка в данных категории. Проверьте введённую информацию.'
            : 'Ошибка связи или сервера. Попробуйте позже.');

    return { message: userMessage, status: error.status || 500 };
};