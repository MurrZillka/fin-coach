// src/api/balance/index.test.ts
import { describe, it, expect, vi, afterEach } from 'vitest'
import { getBalance } from './index'
import apiClient from '../client'

vi.mock('../client')

const mockedApiClient = apiClient as any

describe('balance API', () => {
    afterEach(() => {
        vi.clearAllMocks()
    })

    describe('getBalance', () => {
        it('should return balance data on successful request', async () => {
            const mockData = { balance: 100500 }
            mockedApiClient.get.mockResolvedValue({ data: mockData })

            const result = await getBalance()

            expect(result).toEqual(mockData)
            expect(mockedApiClient.get).toHaveBeenCalledWith('/Balance')
        })

        it('should return balance when balance is zero', async () => {
            const mockData = { balance: 0 }
            mockedApiClient.get.mockResolvedValue({ data: mockData })

            const result = await getBalance()

            expect(result).toEqual(mockData)
            expect(result.balance).toBe(0)
        })

        it('should return balance when balance is negative', async () => {
            const mockData = { balance: -250 }
            mockedApiClient.get.mockResolvedValue({ data: mockData })

            const result = await getBalance()

            expect(result).toEqual(mockData)
            expect(result.balance).toBe(-250)
        })

        it('should throw error on 401 unauthorized', async () => {
            mockedApiClient.get.mockRejectedValue(new Error('Unauthorized'))

            await expect(getBalance()).rejects.toThrow('Unauthorized')
            expect(mockedApiClient.get).toHaveBeenCalledWith('/Balance')
        })

        it('should throw error on 403 forbidden', async () => {
            mockedApiClient.get.mockRejectedValue(new Error('Forbidden'))

            await expect(getBalance()).rejects.toThrow('Forbidden')
        })

        it('should throw error on server error', async () => {
            mockedApiClient.get.mockRejectedValue(new Error('Internal Server Error'))

            await expect(getBalance()).rejects.toThrow('Internal Server Error')
        })

        it('should throw error on network error', async () => {
            mockedApiClient.get.mockRejectedValue(new Error('Network Error'))

            await expect(getBalance()).rejects.toThrow('Network Error')
        })

        it('should throw error on timeout', async () => {
            mockedApiClient.get.mockRejectedValue(new Error('Timeout'))

            await expect(getBalance()).rejects.toThrow('Timeout')
        })
    })
})
