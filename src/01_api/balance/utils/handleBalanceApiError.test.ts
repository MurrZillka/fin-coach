// src/api/balance/utils/handleBalanceApiError.test.ts
import { describe, it, expect } from 'vitest'
import { handleBalanceApiError } from './handleBalanceApiError'

describe('handleBalanceApiError', () => {
    describe('known error messages', () => {
        it('should handle "insufficient_funds" error', () => {
            const error = {
                message: 'insufficient_funds',
                status: 400
            }

            const result = handleBalanceApiError(error)

            expect(result).toEqual({
                message: 'Недостаточно средств на счете',
                status: 400
            })
        })

        it('should handle "account_blocked" error', () => {
            const error = {
                message: 'account_blocked',
                status: 403
            }

            const result = handleBalanceApiError(error)

            expect(result).toEqual({
                message: 'Счет заблокирован',
                status: 403
            })
        })

        it('should handle "balance_unavailable" error', () => {
            const error = {
                message: 'balance_unavailable',
                status: 503
            }

            const result = handleBalanceApiError(error)

            expect(result).toEqual({
                message: 'Баланс временно недоступен',
                status: 503
            })
        })
    })

    describe('unknown error messages', () => {
        it('should handle client errors (4xx) with generic message', () => {
            const error = {
                message: 'Some unknown client error',
                status: 422
            }

            const result = handleBalanceApiError(error)

            expect(result).toEqual({
                message: 'Ошибка получения баланса. Проверьте подключение.',
                status: 422
            })
        })

        it('should handle client error 400 with generic message', () => {
            const error = {
                message: 'Bad request',
                status: 400
            }

            const result = handleBalanceApiError(error)

            expect(result).toEqual({
                message: 'Ошибка получения баланса. Проверьте подключение.',
                status: 400
            })
        })

        it('should handle client error 401 with generic message', () => {
            const error = {
                message: 'Unauthorized',
                status: 401
            }

            const result = handleBalanceApiError(error)

            expect(result).toEqual({
                message: 'Ошибка получения баланса. Проверьте подключение.',
                status: 401
            })
        })

        it('should handle client error 499 with generic message', () => {
            const error = {
                message: 'Client closed request',
                status: 499
            }

            const result = handleBalanceApiError(error)

            expect(result).toEqual({
                message: 'Ошибка получения баланса. Проверьте подключение.',
                status: 499
            })
        })

        it('should handle server errors (5xx) with generic message', () => {
            const error = {
                message: 'Internal server error',
                status: 500
            }

            const result = handleBalanceApiError(error)

            expect(result).toEqual({
                message: 'Ошибка связи или сервера. Попробуйте позже.',
                status: 500
            })
        })

        it('should handle server error 502 with generic message', () => {
            const error = {
                message: 'Bad gateway',
                status: 502
            }

            const result = handleBalanceApiError(error)

            expect(result).toEqual({
                message: 'Ошибка связи или сервера. Попробуйте позже.',
                status: 502
            })
        })

        it('should handle errors with status 0 as server error', () => {
            const error = {
                message: 'Network error',
                status: 0
            }

            const result = handleBalanceApiError(error)

            expect(result).toEqual({
                message: 'Ошибка связи или сервера. Попробуйте позже.',
                status: 500
            })
        })

        it('should handle errors with status 399 as server error', () => {
            const error = {
                message: 'Some 3xx error',
                status: 399
            }

            const result = handleBalanceApiError(error)

            expect(result).toEqual({
                message: 'Ошибка связи или сервера. Попробуйте позже.',
                status: 399
            })
        })

        it('should handle errors without status with default 500', () => {
            const error = {
                message: 'Network error',
                status: undefined as any
            }

            const result = handleBalanceApiError(error)

            expect(result).toEqual({
                message: 'Ошибка связи или сервера. Попробуйте позже.',
                status: 500
            })
        })
    })

    describe('edge cases', () => {
        it('should handle empty error message', () => {
            const error = {
                message: '',
                status: 400
            }

            const result = handleBalanceApiError(error)

            expect(result).toEqual({
                message: 'Ошибка получения баланса. Проверьте подключение.',
                status: 400
            })
        })

        it('should handle null error message', () => {
            const error = {
                message: null as any,
                status: 500
            }

            const result = handleBalanceApiError(error)

            expect(result).toEqual({
                message: 'Ошибка связи или сервера. Попробуйте позже.',
                status: 500
            })
        })

        it('should handle undefined error message', () => {
            const error = {
                message: undefined as any,
                status: 400
            }

            const result = handleBalanceApiError(error)

            expect(result).toEqual({
                message: 'Ошибка получения баланса. Проверьте подключение.',
                status: 400
            })
        })

        it('should handle case-sensitive error messages', () => {
            const error = {
                message: 'INSUFFICIENT_FUNDS',
                status: 400
            }

            const result = handleBalanceApiError(error)

            expect(result).toEqual({
                message: 'Ошибка получения баланса. Проверьте подключение.',
                status: 400
            })
        })
    })
})
