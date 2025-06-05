// src/api/auth/utils/handleAuthApiError.test.ts
import { describe, it, expect } from 'vitest'
import { handleAuthApiError } from './handleAuthApiError'

describe('handleAuthApiError', () => {
    describe('specific error statuses', () => {
        it('should handle 403 Forbidden error', () => {
            const error = {
                message: 'Invalid credentials',
                status: 403
            }

            const result = handleAuthApiError(error)

            expect(result).toEqual({
                message: 'Неверный логин или пароль. Пожалуйста, проверьте введенные данные.',
                status: 403
            })
        })

        it('should handle 409 Conflict error', () => {
            const error = {
                message: 'User already exists',
                status: 409
            }

            const result = handleAuthApiError(error)

            expect(result).toEqual({
                message: 'Извините, пользователь с таким логином уже существует.',
                status: 409
            })
        })
    })

    describe('other error statuses', () => {
        it('should handle 400 Bad Request with generic message', () => {
            const error = {
                message: 'Bad request',
                status: 400
            }

            const result = handleAuthApiError(error)

            expect(result).toEqual({
                message: 'Ошибка связи или сервера. Пожалуйста, повторите попытку позже.',
                status: 400
            })
        })

        it('should handle 401 Unauthorized with generic message', () => {
            const error = {
                message: 'Unauthorized',
                status: 401
            }

            const result = handleAuthApiError(error)

            expect(result).toEqual({
                message: 'Ошибка связи или сервера. Пожалуйста, повторите попытку позже.',
                status: 401
            })
        })

        it('should handle 404 Not Found with generic message', () => {
            const error = {
                message: 'Not found',
                status: 404
            }

            const result = handleAuthApiError(error)

            expect(result).toEqual({
                message: 'Ошибка связи или сервера. Пожалуйста, повторите попытку позже.',
                status: 404
            })
        })

        it('should handle 422 Unprocessable Entity with generic message', () => {
            const error = {
                message: 'Validation error',
                status: 422
            }

            const result = handleAuthApiError(error)

            expect(result).toEqual({
                message: 'Ошибка связи или сервера. Пожалуйста, повторите попытку позже.',
                status: 422
            })
        })

        it('should handle 500 Internal Server Error with generic message', () => {
            const error = {
                message: 'Internal server error',
                status: 500
            }

            const result = handleAuthApiError(error)

            expect(result).toEqual({
                message: 'Ошибка связи или сервера. Пожалуйста, повторите попытку позже.',
                status: 500
            })
        })

        it('should handle 502 Bad Gateway with generic message', () => {
            const error = {
                message: 'Bad gateway',
                status: 502
            }

            const result = handleAuthApiError(error)

            expect(result).toEqual({
                message: 'Ошибка связи или сервера. Пожалуйста, повторите попытку позже.',
                status: 502
            })
        })

        it('should handle 503 Service Unavailable with generic message', () => {
            const error = {
                message: 'Service unavailable',
                status: 503
            }

            const result = handleAuthApiError(error)

            expect(result).toEqual({
                message: 'Ошибка связи или сервера. Пожалуйста, повторите попытку позже.',
                status: 503
            })
        })

        it('should handle network errors (status 0) with generic message', () => {
            const error = {
                message: 'Network error',
                status: 0
            }

            const result = handleAuthApiError(error)

            expect(result).toEqual({
                message: 'Ошибка связи или сервера. Пожалуйста, повторите попытку позже.',
                status: 500
            })
        })
    })

    describe('errors without status', () => {
        it('should handle errors without status with default 500', () => {
            const error = {
                message: 'Network error',
                status: undefined as any
            }

            const result = handleAuthApiError(error)

            expect(result).toEqual({
                message: 'Ошибка связи или сервера. Пожалуйста, повторите попытку позже.',
                status: 500
            })
        })

        it('should handle errors with null status with default 500', () => {
            const error = {
                message: 'Unknown error',
                status: null as any
            }

            const result = handleAuthApiError(error)

            expect(result).toEqual({
                message: 'Ошибка связи или сервера. Пожалуйста, повторите попытку позже.',
                status: 500
            })
        })
    })

    describe('edge cases', () => {
        it('should handle empty error message with 403 status', () => {
            const error = {
                message: '',
                status: 403
            }

            const result = handleAuthApiError(error)

            expect(result).toEqual({
                message: 'Неверный логин или пароль. Пожалуйста, проверьте введенные данные.',
                status: 403
            })
        })

        it('should handle empty error message with 409 status', () => {
            const error = {
                message: '',
                status: 409
            }

            const result = handleAuthApiError(error)

            expect(result).toEqual({
                message: 'Извините, пользователь с таким логином уже существует.',
                status: 409
            })
        })

        it('should handle null error message', () => {
            const error = {
                message: null as any,
                status: 403
            }

            const result = handleAuthApiError(error)

            expect(result).toEqual({
                message: 'Неверный логин или пароль. Пожалуйста, проверьте введенные данные.',
                status: 403
            })
        })

        it('should handle undefined error message', () => {
            const error = {
                message: undefined as any,
                status: 409
            }

            const result = handleAuthApiError(error)

            expect(result).toEqual({
                message: 'Извините, пользователь с таким логином уже существует.',
                status: 409
            })
        })
    })
})
