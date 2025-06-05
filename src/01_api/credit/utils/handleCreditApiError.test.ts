// src/utils/handleCreditApiError.test.ts
import { describe, it, expect, vi, afterEach } from 'vitest'
import { handleCreditApiError } from './handleCreditApiError'

describe('handleCreditApiError', () => {
    afterEach(() => {
        vi.clearAllMocks()
    })

    describe('known error messages', () => {
        it('should handle "credit end_date must be greater than credit date" error', () => {
            const error = {
                message: 'credit end_date must be greater than credit date',
                status: 400
            }

            const result = handleCreditApiError(error)

            expect(result).toEqual({
                message: 'Дата окончания дохода должна быть больше или равна дате начала.',
                field: 'end_date',
                status: 400
            })
        })

        it('should handle "credit date must be less than current date" error', () => {
            const error = {
                message: 'credit date must be less than current date',
                status: 400
            }

            const result = handleCreditApiError(error)

            expect(result).toEqual({
                message: 'Дата дохода должна быть не больше текущей',
                field: 'date',
                status: 400
            })
        })

        it('should handle "spending end_date must be less than current date" error', () => {
            const error = {
                message: 'spending end_date must be less than current date',
                status: 400
            }

            const result = handleCreditApiError(error)

            expect(result).toEqual({
                message: 'Дата окончания дохода должна быть не больше текущей даты.',
                field: 'end_date',
                status: 400
            })
        })

        it('should use default status 400 when status is not provided for known errors', () => {
            const error = {
                message: 'credit date must be less than current date'
            }

            const result = handleCreditApiError(error)

            expect(result.status).toBe(400)
        })
    })

    describe('unknown error messages', () => {
        it('should handle client errors (4xx) with generic message', () => {
            const error = {
                message: 'Some unknown client error',
                status: 422
            }

            const result = handleCreditApiError(error)

            expect(result).toEqual({
                message: 'Ошибка в данных формы. Проверьте введенные значения.',
                field: null,
                status: 422
            })
        })

        it('should handle server errors (5xx) with generic message', () => {
            const error = {
                message: 'Internal server error',
                status: 500
            }

            const result = handleCreditApiError(error)

            expect(result).toEqual({
                message: 'Ошибка связи или сервера. Попробуйте позже.',
                field: null,
                status: 500
            })
        })

        it('should handle errors without status with default server error message', () => {
            const error = {
                message: 'Network error'
            }

            const result = handleCreditApiError(error)

            expect(result).toEqual({
                message: 'Ошибка связи или сервера. Попробуйте позже.',
                field: null,
                status: 500
            })
        })

        it('should handle errors with status 0 as server error', () => {
            const error = {
                message: 'Connection failed',
                status: 0
            }

            const result = handleCreditApiError(error)

            expect(result).toEqual({
                message: 'Ошибка связи или сервера. Попробуйте позже.',
                field: null,
                status: 500
            })
        })
    })

    describe('console logging', () => {
        it('should log known errors correctly', () => {
            const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
            const error = {
                message: 'credit date must be less than current date',
                status: 400
            }

            handleCreditApiError(error)

            expect(consoleSpy).toHaveBeenCalledWith('handleCreditApiError: Processed error -', {
                original: 'credit date must be less than current date',
                translated: 'Дата дохода должна быть не больше текущей',
                field: 'date',
                status: 400
            })

            consoleSpy.mockRestore()
        })

        it('should log unknown errors correctly', () => {
            const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
            const error = {
                message: 'Unknown error',
                status: 500
            }

            handleCreditApiError(error)

            expect(consoleSpy).toHaveBeenCalledWith('handleCreditApiError: Processed error -', {
                original: 'Unknown error',
                translated: 'Ошибка связи или сервера. Попробуйте позже.',
                field: null,
                status: 500
            })

            consoleSpy.mockRestore()
        })
    })
})
