// src/api/reminders/index.test.ts
import { describe, it, expect, vi, afterEach } from 'vitest'
import { getTodayReminder } from './index'
import apiClient from '../client'

vi.mock('../client')

const mockedApiClient = apiClient as any

describe('reminders API', () => {
    afterEach(() => {
        vi.clearAllMocks()
    })

    it('should return reminder data on successful request', async () => {
        const mockData = {
            TodayRemind: { need_remind: true }
        }
        mockedApiClient.get.mockResolvedValue({ data: mockData })

        const result = await getTodayReminder()

        expect(result).toEqual(mockData)
        expect(mockedApiClient.get).toHaveBeenCalledWith('/Reminder')
    })

    it('should return reminder data with false', async () => {
        const mockData = {
            TodayRemind: { need_remind: false }
        }
        mockedApiClient.get.mockResolvedValue({ data: mockData })

        const result = await getTodayReminder()

        expect(result).toEqual(mockData)
    })

    it('should throw error on server error', async () => {
        mockedApiClient.get.mockRejectedValue(new Error('Server error'))

        await expect(getTodayReminder()).rejects.toThrow('Server error')
    })

    it('should throw error on network error', async () => {
        mockedApiClient.get.mockRejectedValue(new Error('Network Error'))

        await expect(getTodayReminder()).rejects.toThrow('Network Error')
    })
})
