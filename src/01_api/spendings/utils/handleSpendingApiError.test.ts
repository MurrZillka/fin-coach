// src/api/spending/utils/handleSpendingApiError.test.ts

import { describe, it, expect, vi, afterEach } from 'vitest'
import { handleSpendingApiError } from './handleSpendingApiError'
import { ApiError } from '../../apiTypes'

describe('handleSpendingApiError', () => {
    afterEach(() => {
        vi.clearAllMocks()
    })

    describe('known error messages with field', () => {
        it('should handle "spending end_date must be greater than spending date" error', () => {
            const error: ApiError = {
                message: 'spending end_date must be greater than spending date',
                status: 400
            }

            const result = handleSpendingApiError(error)

            expect(result).toEqual({
                message: 'Дата окончания расхода должна быть больше или равна дате начала расхода.',
                field: 'end_date',
                status: 400
            })
        })

        it('should handle "spending date must be less than current date" error', () => {
            const error: ApiError = {
                message: 'spending date must be less than current date',
                status: 400
            }

            const result = handleSpendingApiError(error)

            expect(result).toEqual({
                message: 'Дата расхода должна быть не больше текущей.',
                field: 'date',
                status: 400
            })
        })

        it('should handle "spending end_date must be less than current date" error', () => {
            const error: ApiError = {
                message: 'spending end_date must be less than current date',
                status: 400
            }

            const result = handleSpendingApiError(error)

            expect(result).toEqual({
                message: 'Дата окончания расхода должна быть не больше текущей даты.',
                field: 'end_date',
                status: 400
            })
        })

        it('should use default status 400 for known errors if status is not provided', () => {
            const error: ApiError = {
                message: 'spending end_date must be greater than spending date'
            }

            const result = handleSpendingApiError(error)

            expect(result.status).toBe(400)
        })
    })

    describe('unknown error messages', () => {
        it('should handle client errors (4xx) with generic message', () => {
            const error: ApiError = {
                message: 'Some unknown client error',
                status: 422
            }

            const result = handleSpendingApiError(error)

            expect(result).toEqual({
                message: 'Ошибка в данных формы. Проверьте введенные значения.',
                field: null,
                status: 422
            })
        })

        it('should handle server errors (5xx) with generic message', () => {
            const error: ApiError = {
                message: 'Internal server error',
                status: 500
            }

            const result = handleSpendingApiError(error)

            expect(result).toEqual({
                message: 'Ошибка связи или сервера. Попробуйте позже.',
                field: null,
                status: 500
            })
        })

        it('should handle errors with status 0 as server error', () => {
            const error: ApiError = {
                message: 'Network error',
                status: 0
            }

            const result = handleSpendingApiError(error)

            expect(result).toEqual({
                message: 'Ошибка связи или сервера. Попробуйте позже.',
                field: null,
                status: 500  // ← 0 || 500 = 500
            })
        })

        it('should handle errors without status with default 500', () => {
            const error = {
                message: 'Network error',
                status: undefined as any
            }

            const result = handleSpendingApiError(error)

            expect(result).toEqual({
                message: 'Ошибка связи или сервера. Попробуйте позже.',
                field: null,
                status: 500
            })
        })
    })

    describe('edge cases', () => {
        it('should handle empty error message', () => {
            const error: ApiError = {
                message: '',
                status: 400
            }

            const result = handleSpendingApiError(error)

            expect(result).toEqual({
                message: 'Ошибка в данных формы. Проверьте введенные значения.',
                field: null,
                status: 400
            })
        })

        it('should handle null error message', () => {
            const error = {
                message: null as any,
                status: 500
            }

            const result = handleSpendingApiError(error)

            expect(result).toEqual({
                message: 'Ошибка связи или сервера. Попробуйте позже.',
                field: null,
                status: 500
            })
        })

        it('should handle undefined error message', () => {
            const error = {
                message: undefined as any,
                status: 400
            }

            const result = handleSpendingApiError(error)

            expect(result).toEqual({
                message: 'Ошибка в данных формы. Проверьте введенные значения.',
                field: null,
                status: 400
            })
        })
    })

    describe('console logging', () => {
        it('should log known errors correctly', () => {
            const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
            const error: ApiError = {
                message: 'spending date must be less than current date',
                status: 400
            }

            handleSpendingApiError(error)

            expect(consoleSpy).toHaveBeenCalledWith('handleSpendingApiError: Processed error -', {
                original: 'spending date must be less than current date',
                translated: 'Дата расхода должна быть не больше текущей.',
                field: 'date',
                status: 400
            })

            consoleSpy.mockRestore()
        })

        it('should log unknown errors correctly', () => {
            const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
            const error: ApiError = {
                message: 'Unknown error',
                status: 500
            }

            handleSpendingApiError(error)

            expect(consoleSpy).toHaveBeenCalledWith('handleSpendingApiError: Processed error -', {
                original: 'Unknown error',
                translated: 'Ошибка связи или сервера. Попробуйте позже.',
                field: null,
                status: 500
            })

            consoleSpy.mockRestore()
        })
    })
})
