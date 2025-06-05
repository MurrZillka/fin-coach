// src/api/auth/index.test.ts
import { describe, it, expect, vi, afterEach } from 'vitest'
import { signup, login, logout, validateToken } from './index'
import apiClient from '../client'

vi.mock('../client')

const mockedApiClient = apiClient as any

// Расширяем интерфейс Error для тестов
interface TestError extends Error {
    status?: number;
}

describe('auth API', () => {
    afterEach(() => {
        vi.clearAllMocks()
    })

    describe('signup', () => {
        it('should return data on successful signup', async () => {
            const mockData = { ok: true }
            mockedApiClient.post.mockResolvedValue({ data: mockData })

            const result = await signup({
                user_name: 'testuser',
                login: 'testlogin',
                password: 'password123'
            })

            expect(result).toEqual(mockData)
            expect(mockedApiClient.post).toHaveBeenCalledWith('/signup', {
                user_name: 'testuser',
                login: 'testlogin',
                password: 'password123'
            })
        })

        it('should throw error when signup fails', async () => {
            const errorMessage = 'User already exists'
            mockedApiClient.post.mockRejectedValue(new Error(errorMessage))

            await expect(signup({
                user_name: 'existing',
                login: 'existing',
                password: 'pass'
            })).rejects.toThrow(errorMessage)
        })

        it('should throw error on server error', async () => {
            mockedApiClient.post.mockRejectedValue(new Error('Server error'))

            await expect(signup({
                user_name: 'test',
                login: 'test',
                password: 'pass'
            })).rejects.toThrow('Server error')
        })
    })

    describe('login', () => {
        it('should return data on successful login', async () => {
            const mockData = {
                expires_in: 3600,
                access_token: 'token123',
                token_type: 'Bearer',
                role: 1,
                userName: 'testuser',
                userid: 1
            }
            mockedApiClient.post.mockResolvedValue({ data: mockData })

            const result = await login({ login: 'testlogin', password: 'password123' })

            expect(result).toEqual(mockData)
            expect(mockedApiClient.post).toHaveBeenCalledWith('/login', {
                login: 'testlogin',
                password: 'password123'
            })
        })

        it('should throw error on invalid credentials', async () => {
            const errorMessage = 'Invalid credentials'
            mockedApiClient.post.mockRejectedValue(new Error(errorMessage))

            await expect(login({
                login: 'wrong',
                password: 'wrong'
            })).rejects.toThrow(errorMessage)
        })

        it('should throw error on 401 unauthorized', async () => {
            const error: TestError = new Error('Unauthorized')
            error.status = 401
            mockedApiClient.post.mockRejectedValue(error)

            await expect(login({
                login: 'test',
                password: 'test'
            })).rejects.toThrow('Unauthorized')
        })
    })

    describe('logout', () => {
        it('should call apiClient.get with /logout on successful logout', async () => {
            mockedApiClient.get.mockResolvedValue({})

            await logout()

            expect(mockedApiClient.get).toHaveBeenCalledWith('/logout')
        })

        it('should handle server errors', async () => {
            mockedApiClient.get.mockRejectedValue(new Error('Server error'))

            await expect(logout()).rejects.toThrow('Server error')
        })
    })

    describe('validateToken', () => {
        it('should return true if balance is a valid number', async () => {
            mockedApiClient.get.mockResolvedValue({ data: { balance: 100 } })

            const result = await validateToken()

            expect(result).toBe(true)
            expect(mockedApiClient.get).toHaveBeenCalledWith('/Balance')
        })

        it('should return true if balance is zero', async () => {
            mockedApiClient.get.mockResolvedValue({ data: { balance: 0 } })

            const result = await validateToken()

            expect(result).toBe(true)
        })

        it('should return false if balance is not a number', async () => {
            mockedApiClient.get.mockResolvedValue({ data: { balance: 'not a number' } })

            const result = await validateToken()

            expect(result).toBe(false)
        })

        it('should return false if no balance field in response', async () => {
            mockedApiClient.get.mockResolvedValue({ data: {} })

            const result = await validateToken()

            expect(result).toBe(false)
        })

        it('should return false on 401 unauthorized error', async () => {
            const error: TestError = new Error('Unauthorized')
            error.status = 401
            mockedApiClient.get.mockRejectedValue(error)

            const result = await validateToken()

            expect(result).toBe(false)
        })

        it('should return false on network error', async () => {
            mockedApiClient.get.mockRejectedValue(new Error('Network Error'))

            const result = await validateToken()

            expect(result).toBe(false)
        })

        it('should log error when validation fails', async () => {
            const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
            const error = new Error('Test error')
            mockedApiClient.get.mockRejectedValue(error)

            const result = await validateToken()

            expect(result).toBe(false)
            expect(consoleSpy).toHaveBeenCalledWith('api_auth, validateToken:', error)

            consoleSpy.mockRestore()
        })
    })
})
