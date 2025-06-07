// src/01_credit/utils/handleCreditApiError.js
import { ApiError } from '../../apiTypes';
import {CreditFieldError} from "../types";

export const handleCreditApiError = (error: ApiError): CreditFieldError => {
    const errorMappings: Record<string, { message: string; field: string }> = {
        'credit end_date must be greater than credit date': {
            message: 'Дата окончания дохода должна быть больше или равна дате начала.',
            field: 'end_date'
        },
        'credit date must be less than current date': {
            message: 'Дата дохода должна быть не больше текущей',
            field: 'date'
        },
        'spending end_date must be less than current date': {
            message: 'Дата окончания дохода должна быть не больше текущей даты.',
            field: 'end_date'
        }
    };

    const mapping = errorMappings[error.message];

    if (mapping) {
        console.error('handleCreditApiError: Processed error -', {
            original: error.message,
            translated: mapping.message,
            field: mapping.field,
            status: error.status || 400
        });

        return {
            message: mapping.message,
            field: mapping.field,
            status: error.status || 400
        };
    }

    // Общие ошибки без привязки к полю
    const userMessage =
        error.status && error.status >= 400 && error.status < 500
            ? 'Ошибка в данных формы. Проверьте введенные значения.'
            : 'Ошибка связи или сервера. Попробуйте позже.';

    console.error('handleCreditApiError: Processed error -', {
        original: error.message,
        translated: userMessage,
        field: null,
        status: error.status || 500
    });

    return {
        message: userMessage,
        field: null,
        status: error.status || 500
    };
};
