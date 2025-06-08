//src/04_components/Modals/utils/fieldErrorMapping.test.ts
import {describe, expect, it} from 'vitest';
import {
    clearServerFieldErrors,
    FIELD_ERROR_MESSAGES,
    mapServerErrorToFieldError,
    SubmissionError
} from './fieldErrorMapping';

describe('FIELD_ERROR_MESSAGES', () => {
    it('содержит ожидаемые поля', () => {
        expect(FIELD_ERROR_MESSAGES).toHaveProperty('date', 'Проверьте дату');
        expect(FIELD_ERROR_MESSAGES).toHaveProperty('amount', 'Проверьте сумму');
        expect(FIELD_ERROR_MESSAGES).toHaveProperty('category_id', 'Выберите категорию');
    });
});

describe('mapServerErrorToFieldError', () => {
    it('возвращает null, если submissionError не содержит field', () => {
        expect(mapServerErrorToFieldError(null)).toBeNull();
        expect(mapServerErrorToFieldError(undefined)).toBeNull();
        expect(mapServerErrorToFieldError({})).toBeNull();
        expect(mapServerErrorToFieldError({ message: 'Ошибка' })).toBeNull();
    });

    it('возвращает FieldError с правильным сообщением для известных полей', () => {
        const error: SubmissionError = { field: 'amount' };
        expect(mapServerErrorToFieldError(error)).toEqual({
            field: 'amount',
            message: FIELD_ERROR_MESSAGES.amount
        });
    });

    it('возвращает FieldError с дефолтным сообщением для неизвестных полей', () => {
        const error: SubmissionError = { field: 'unknown_field' };
        expect(mapServerErrorToFieldError(error)).toEqual({
            field: 'unknown_field',
            message: 'Проверьте значение'
        });
    });
});

describe('clearServerFieldErrors', () => {
    it('удаляет только ошибки с известными серверными сообщениями', () => {
        const errors = {
            date: FIELD_ERROR_MESSAGES.date,
            name: FIELD_ERROR_MESSAGES.name,
            custom: 'Своя ошибка',
            amount: 'Другая ошибка'
        };
        const cleared = clearServerFieldErrors(errors);
        expect(cleared).toEqual({
            custom: 'Своя ошибка',
            amount: 'Другая ошибка'
        });
    });

    it('не трогает ошибки с другими сообщениями', () => {
        const errors = {
            foo: 'Бар',
            bar: 'Баз'
        };
        expect(clearServerFieldErrors(errors)).toEqual(errors);
    });

    it('работает с пустым объектом ошибок', () => {
        expect(clearServerFieldErrors({})).toEqual({});
    });
});
