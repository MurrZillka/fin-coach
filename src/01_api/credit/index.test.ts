// src/api/credit/index.test.ts
import { describe, it, expect, vi, afterEach } from 'vitest'
import {
    getCredits,
    addCredit,
    updateCredit,
    deleteCredit
} from './index'
import apiClient from '../client'

vi.mock('../client')

const mockedApiClient = apiClient as any

describe('credit API', () => {
    afterEach(() => {
        vi.clearAllMocks()
    })

    describe('getCredits', () => {
        it('should return credits data on successful request', async () => {
            const mockData = {
                Credits: [
                    {
                        id: 31,
                        user_id: 3,
                        amount: 50000,
                        description: "Зарплата",
                        is_permanent: true,
                        date: "2024-03-07T00:00:00Z",
                        is_delete: false,
                        end_date: "0001-01-01T00:00:00Z",
                        full_amount: 750000
                    },
                    {
                        id: 33,
                        user_id: 3,
                        amount: 25000,
                        description: "Дивиденды",
                        is_permanent: true,
                        date: "2022-02-24T00:00:00Z",
                        is_delete: false,
                        end_date: "2025-02-24T00:00:00Z",
                        full_amount: 925000
                    }
                ]
            }
            mockedApiClient.get.mockResolvedValue({ data: mockData })

            const result = await getCredits()

            expect(result).toEqual(mockData)
            expect(mockedApiClient.get).toHaveBeenCalledWith('/Credits')
        })

        it('should return empty credits array', async () => {
            const mockData = { Credits: [] }
            mockedApiClient.get.mockResolvedValue({ data: mockData })

            const result = await getCredits()

            expect(result).toEqual(mockData)
            expect(result.Credits).toHaveLength(0)
        })

        it('should throw error on server error', async () => {
            mockedApiClient.get.mockRejectedValue(new Error('Server error'))

            await expect(getCredits()).rejects.toThrow('Server error')
        })

        it('should throw error on network error', async () => {
            mockedApiClient.get.mockRejectedValue(new Error('Network Error'))

            await expect(getCredits()).rejects.toThrow('Network Error')
        })
    })

    describe('addCredit', () => {
        it('should add credit successfully', async () => {
            const creditData = {
                description: "Новый доход",
                amount: 100000,
                date: "2025-06-05",
                is_permanent: false,
                end_date: "0001-01-01"
            }
            const mockResponse = { message: "Credit added successfully" }
            mockedApiClient.post.mockResolvedValue({ data: mockResponse })

            const result = await addCredit(creditData)

            expect(result).toEqual(mockResponse)
            expect(mockedApiClient.post).toHaveBeenCalledWith('/AddCredit', creditData)
        })

        it('should throw error when credit date is invalid', async () => {
            const creditData = {
                description: "Тест",
                amount: 50000,
                date: "2030-01-01",
                is_permanent: false,
                end_date: "0001-01-01"
            }
            mockedApiClient.post.mockRejectedValue(new Error('credit date must be less than current date'))

            await expect(addCredit(creditData)).rejects.toThrow('credit date must be less than current date')
        })

        it('should throw error when end_date is less than date', async () => {
            const creditData = {
                description: "Тест",
                amount: 50000,
                date: "2025-06-05",
                is_permanent: true,
                end_date: "2025-01-01"
            }
            mockedApiClient.post.mockRejectedValue(new Error('credit end_date must be greater than credit date'))

            await expect(addCredit(creditData)).rejects.toThrow('credit end_date must be greater than credit date')
        })

        it('should throw error when end_date is in future', async () => {
            const creditData = {
                description: "Тест",
                amount: 50000,
                date: "2025-01-01",
                is_permanent: true,
                end_date: "2030-01-01"
            }
            mockedApiClient.post.mockRejectedValue(new Error('spending end_date must be less than current date'))

            await expect(addCredit(creditData)).rejects.toThrow('spending end_date must be less than current date')
        })

        it('should throw error on server error', async () => {
            const creditData = {
                description: "Тест",
                amount: 50000,
                date: "2025-06-05",
                is_permanent: false,
                end_date: "0001-01-01"
            }
            mockedApiClient.post.mockRejectedValue(new Error('Server error'))

            await expect(addCredit(creditData)).rejects.toThrow('Server error')
        })
    })

    describe('updateCredit', () => {
        it('should update credit successfully', async () => {
            const creditData = {
                description: "Обновленная зарплата",
                amount: 60000,
                date: "2024-03-07",
                is_permanent: true,
                end_date: "0001-01-01"
            }
            const mockResponse = { message: "Credit updated successfully" }
            mockedApiClient.put.mockResolvedValue({ data: mockResponse })

            const result = await updateCredit(31, creditData)

            expect(result).toEqual(mockResponse)
            expect(mockedApiClient.put).toHaveBeenCalledWith('/Credit/31', creditData)
        })

        it('should throw error when credit not found', async () => {
            const creditData = {
                description: "Тест",
                amount: 50000,
                date: "2025-06-05",
                is_permanent: false,
                end_date: "0001-01-01"
            }
            mockedApiClient.put.mockRejectedValue(new Error('Credit not found'))

            await expect(updateCredit(999, creditData)).rejects.toThrow('Credit not found')
        })

        it('should throw error when credit date is invalid', async () => {
            const creditData = {
                description: "Тест",
                amount: 50000,
                date: "2030-01-01",
                is_permanent: false,
                end_date: "0001-01-01"
            }
            mockedApiClient.put.mockRejectedValue(new Error('credit date must be less than current date'))

            await expect(updateCredit(31, creditData)).rejects.toThrow('credit date must be less than current date')
        })

        it('should throw error when end_date is less than date', async () => {
            const creditData = {
                description: "Тест",
                amount: 50000,
                date: "2025-06-05",
                is_permanent: true,
                end_date: "2025-01-01"
            }
            mockedApiClient.put.mockRejectedValue(new Error('credit end_date must be greater than credit date'))

            await expect(updateCredit(31, creditData)).rejects.toThrow('credit end_date must be greater than credit date')
        })

        it('should throw error on server error', async () => {
            const creditData = {
                description: "Тест",
                amount: 50000,
                date: "2025-06-05",
                is_permanent: false,
                end_date: "0001-01-01"
            }
            mockedApiClient.put.mockRejectedValue(new Error('Server error'))

            await expect(updateCredit(31, creditData)).rejects.toThrow('Server error')
        })
    })

    describe('deleteCredit', () => {
        it('should delete credit successfully', async () => {
            const mockResponse = { message: "Credit deleted successfully" }
            mockedApiClient.delete.mockResolvedValue({ data: mockResponse })

            const result = await deleteCredit(31)

            expect(result).toEqual(mockResponse)
            expect(mockedApiClient.delete).toHaveBeenCalledWith('/Credit/31')
        })

        it('should throw error when credit not found', async () => {
            mockedApiClient.delete.mockRejectedValue(new Error('Credit not found'))

            await expect(deleteCredit(999)).rejects.toThrow('Credit not found')
        })

        it('should throw error on server error', async () => {
            mockedApiClient.delete.mockRejectedValue(new Error('Server error'))

            await expect(deleteCredit(31)).rejects.toThrow('Server error')
        })

        it('should throw error on network error', async () => {
            mockedApiClient.delete.mockRejectedValue(new Error('Network Error'))

            await expect(deleteCredit(31)).rejects.toThrow('Network Error')
        })
    })
})
