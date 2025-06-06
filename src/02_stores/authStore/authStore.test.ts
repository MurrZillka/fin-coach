// src/stores/authStore.test.ts

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { act } from '@testing-library/react'
import { useAuthStore } from './authStore'
import * as authApi from '../../01_api/auth/index'
import * as errorUtils from '../../01_api/auth/utils/handleAuthApiError'

// Мокаем localStorage
const localStorageMock = (() => {
    let store: Record<string, string> = {}
    return {
        getItem: (key: string) => store[key] || null,
        setItem: (key: string, value: string) => { store[key] = value },
        removeItem: (key: string) => { delete store[key] },
        clear: () => { store = {} }
    }
})()
Object.defineProperty(window, 'localStorage', { value: localStorageMock })

describe('useAuthStore', () => {
    beforeEach(() => {
        localStorage.clear()
        useAuthStore.setState({
            user: null,
            isAuthenticated: false,
            status: 'idle',
            error: null
        })
    })

    afterEach(() => {
        vi.clearAllMocks()
    })

    it('setToken и clearToken работают с localStorage', () => {
        useAuthStore.getState().setToken('abc123')
        expect(localStorage.getItem('token')).toBe('abc123')
        useAuthStore.getState().clearToken()
        expect(localStorage.getItem('token')).toBeNull()
    })

    it('setUserName и clearUserName работают с localStorage', () => {
        useAuthStore.getState().setUserName('vasya')
        expect(localStorage.getItem('userName')).toBe('vasya')
        useAuthStore.getState().clearUserName()
        expect(localStorage.getItem('userName')).toBeNull()
    })

    it('resetAuthState сбрасывает всё и чистит localStorage', () => {
        useAuthStore.setState({
            user: { access_token: 'token', userName: 'Vasya' } as any,
            isAuthenticated: true,
            status: 'succeeded',
            error: { message: 'err', status: 401 }
        })
        localStorage.setItem('token', 'token')
        localStorage.setItem('userName', 'Vasya')

        useAuthStore.getState().resetAuthState()

        expect(useAuthStore.getState().user).toBeNull()
        expect(useAuthStore.getState().isAuthenticated).toBe(false)
        expect(useAuthStore.getState().status).toBe('idle')
        expect(useAuthStore.getState().error).toBeNull()
        expect(localStorage.getItem('token')).toBeNull()
        expect(localStorage.getItem('userName')).toBeNull()
    })

    it('handleError вызывает обработчик и меняет статус/ошибку', () => {
        const error = new Error('fail')
        const processed = { message: 'Ошибка', status: 403 }
        const spy = vi.spyOn(errorUtils, 'handleAuthApiError').mockReturnValue(processed)

        useAuthStore.getState().handleError(error)

        expect(useAuthStore.getState().status).toBe('failed')
        expect(useAuthStore.getState().error).toEqual(processed)
        expect(spy).toHaveBeenCalledWith(error)
    })

    it('login: успешный логин', async () => {
        const loginResponse = {
            access_token: 'token123',
            userName: 'Vasya',
            expires_in: 3600,
            token_type: 'Bearer',
            role: 1,
            userid: 1
        }
        vi.spyOn(authApi, 'login').mockResolvedValue(loginResponse)

        await act(async () => {
            const data = await useAuthStore.getState().login({ login: 'vasya', password: 'pass' })
            expect(data).toEqual(loginResponse)
            expect(useAuthStore.getState().isAuthenticated).toBe(true)
            expect(useAuthStore.getState().user).toEqual(loginResponse)
            expect(localStorage.getItem('token')).toBe('token123')
            expect(localStorage.getItem('userName')).toBe('Vasya')
            expect(useAuthStore.getState().status).toBe('succeeded')
            expect(useAuthStore.getState().error).toBeNull()
        })
    })

    it('login: обработка ошибки и сброс состояния', async () => {
        const error = new Error('Invalid credentials')
        vi.spyOn(authApi, 'login').mockRejectedValue(error)
        const handleAuthApiErrorSpy = vi.spyOn(errorUtils, 'handleAuthApiError').mockReturnValue({ message: 'Ошибка', status: 403 })

        await expect(
            useAuthStore.getState().login({ login: 'fail', password: 'fail' })
        ).rejects.toThrow('Invalid credentials')

        expect(useAuthStore.getState().isAuthenticated).toBe(false)
        expect(useAuthStore.getState().user).toBeNull()
        expect(useAuthStore.getState().status).toBe('failed')
        expect(useAuthStore.getState().error).toEqual({ message: 'Ошибка', status: 403 })
        expect(handleAuthApiErrorSpy).toHaveBeenCalledWith(error)
    })

    it('signup: успешная регистрация', async () => {
        const signupResponse = { ok: true }
        vi.spyOn(authApi, 'signup').mockResolvedValue(signupResponse)

        await act(async () => {
            const data = await useAuthStore.getState().signup({ user_name: 'vasya', login: 'vasya', password: 'pass' })
            expect(data).toEqual(signupResponse)
            expect(useAuthStore.getState().status).toBe('succeeded')
            expect(useAuthStore.getState().error).toBeNull()
        })
    })

    it('signup: обработка ошибки', async () => {
        const error = new Error('Signup fail')
        vi.spyOn(authApi, 'signup').mockRejectedValue(error)
        const handleAuthApiErrorSpy = vi.spyOn(errorUtils, 'handleAuthApiError').mockReturnValue({ message: 'Ошибка', status: 409 })

        await expect(
            useAuthStore.getState().signup({ user_name: 'vasya', login: 'vasya', password: 'pass' })
        ).rejects.toThrow('Signup fail')

        expect(useAuthStore.getState().status).toBe('failed')
        expect(useAuthStore.getState().error).toEqual({ message: 'Ошибка', status: 409 })
        expect(handleAuthApiErrorSpy).toHaveBeenCalledWith(error)
    })

    it('logoutLocal: сбрасывает всё и чистит localStorage', () => {
        useAuthStore.setState({
            user: { access_token: 'token', userName: 'Vasya' } as any,
            isAuthenticated: true,
            status: 'succeeded',
            error: null
        })
        localStorage.setItem('token', 'token')
        localStorage.setItem('userName', 'Vasya')

        useAuthStore.getState().logoutLocal()

        expect(useAuthStore.getState().user).toBeNull()
        expect(useAuthStore.getState().isAuthenticated).toBe(false)
        expect(useAuthStore.getState().status).toBe('idle')
        expect(localStorage.getItem('token')).toBeNull()
        expect(localStorage.getItem('userName')).toBeNull()
    })

    it('logout: успешный выход', async () => {
        vi.spyOn(authApi, 'logout').mockResolvedValue(undefined)
        const setItemSpy = vi.spyOn(localStorage, 'setItem')
        const removeItemSpy = vi.spyOn(localStorage, 'removeItem')

        await act(async () => {
            await useAuthStore.getState().logout()
        })

        expect(useAuthStore.getState().user).toBeNull()
        expect(useAuthStore.getState().isAuthenticated).toBe(false)
        expect(useAuthStore.getState().status).toBe('idle')
        expect(setItemSpy).toHaveBeenCalledWith('logout_event', expect.any(String))
        expect(removeItemSpy).toHaveBeenCalledWith('logout_event')
    })

    it('logout: обработка ошибки', async () => {
        const error = new Error('Logout fail')
        vi.spyOn(authApi, 'logout').mockRejectedValue(error)
        const handleAuthApiErrorSpy = vi.spyOn(errorUtils, 'handleAuthApiError').mockReturnValue({ message: 'Ошибка', status: 500 })

        await act(async () => {
            await useAuthStore.getState().logout()
        })

        expect(useAuthStore.getState().user).toBeNull()
        expect(useAuthStore.getState().isAuthenticated).toBe(false)
        expect(useAuthStore.getState().status).toBe('idle')
        // Исправлено: error должен быть null, а не объект
        expect(useAuthStore.getState().error).toBeNull()
        expect(handleAuthApiErrorSpy).toHaveBeenCalledWith(error)
    })

    it('clearError: сбрасывает ошибку', () => {
        useAuthStore.setState({ error: { message: 'Ошибка', status: 400 } as any })
        useAuthStore.getState().clearError()
        expect(useAuthStore.getState().error).toBeNull()
    })

    it('initAuth: невалидный токен — сбрасывает всё', async () => {
        localStorage.setItem('token', 'token')
        localStorage.setItem('userName', 'vasya')
        vi.spyOn(authApi, 'validateToken').mockResolvedValue(false)

        await act(async () => {
            await useAuthStore.getState().initAuth()
        })

        expect(useAuthStore.getState().isAuthenticated).toBe(false)
        expect(useAuthStore.getState().user).toBeNull()
        expect(useAuthStore.getState().status).toBe('idle')
    })

    it('initAuth: валидный токен — восстанавливает пользователя', async () => {
        localStorage.setItem('token', 'token')
        localStorage.setItem('userName', 'vasya')
        vi.spyOn(authApi, 'validateToken').mockResolvedValue(true)

        await act(async () => {
            await useAuthStore.getState().initAuth()
        })

        expect(useAuthStore.getState().isAuthenticated).toBe(true)
        expect(useAuthStore.getState().user).toEqual({ access_token: 'token', userName: 'vasya' })
        expect(useAuthStore.getState().status).toBe('succeeded')
    })

    it('initAuth: без токена — сбрасывает всё', async () => {
        await act(async () => {
            await useAuthStore.getState().initAuth()
        })

        expect(useAuthStore.getState().isAuthenticated).toBe(false)
        expect(useAuthStore.getState().user).toBeNull()
        expect(useAuthStore.getState().status).toBe('idle')
    })

    it('initAuth: ошибка в validateToken — сбрасывает всё', async () => {
        localStorage.setItem('token', 'token')
        localStorage.setItem('userName', 'vasya')
        vi.spyOn(authApi, 'validateToken').mockRejectedValue(new Error('fail'))

        await act(async () => {
            await useAuthStore.getState().initAuth()
        })

        expect(useAuthStore.getState().isAuthenticated).toBe(false)
        expect(useAuthStore.getState().user).toBeNull()
        expect(useAuthStore.getState().status).toBe('idle')
    })
})
