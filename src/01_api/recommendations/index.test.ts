import { describe, it, expect, vi, afterEach } from 'vitest'
import { getRecommendations } from './index'
import apiClient from '../client'

vi.mock('../client')

const mockedApiClient = apiClient as any

describe('recommendations API', () => {
    afterEach(() => {
        vi.clearAllMocks()
    })

    it('should return recommendations data on successful request', async () => {
        const mockData = {
            Recommendations: [
                {
                    id: 1,
                    name: "Повысились расходы в категории «Разное»",
                    description: "Я вижу, что в этом месяце твои траты по категории «Разное» выросли аж на 105% по сравнению с прошлым месяцем. Давай попробуем разобраться: это было осознанное решение или импульсивные траты? Может, тебе пришлось взять что-то срочное или просто расслабился и позволил себе больше обычного? Если это что-то важное — отлично! Но если эти расходы могли подождать или были вызваны эмоциями, возможно, стоит пересмотреть подход. В долгосрочной перспективе контроль над повторяющимися расходами поможет сохранить баланс и достичь твоих целей."
                },
                {
                    id: 4,
                    name: "Постоянное превышение расходов над доходами",
                    description: "Кажется, что твои расходы стабильно превышают доходы. В этом месяце ты потратил 45345, а накопил 0. Это тревожный звоночек! Если так продолжать, можно быстро оказаться в ситуации, где придется брать в долг. Давай вместе посмотрим, как можно сбалансировать бюджет. Может, есть ненужные подписки, которые можно отменить? Или привычки, которые забирают больше денег, чем ты осознавал? Контролировать траты — это не про ограничения, а про осознанный выбор!"
                }
            ]
        }
        mockedApiClient.get.mockResolvedValue({ data: mockData })

        const result = await getRecommendations()

        expect(result).toEqual(mockData)
        expect(mockedApiClient.get).toHaveBeenCalledWith('/Recommendations')
    })

    it('should return empty array if no recommendations', async () => {
        mockedApiClient.get.mockResolvedValue({ data: { Recommendations: [] } })

        const result = await getRecommendations()

        expect(result).toEqual({ Recommendations: [] })
    })

    it('should throw error on server error', async () => {
        mockedApiClient.get.mockRejectedValue(new Error('Server error'))

        await expect(getRecommendations()).rejects.toThrow('Server error')
    })

    it('should throw error on network error', async () => {
        mockedApiClient.get.mockRejectedValue(new Error('Network Error'))

        await expect(getRecommendations()).rejects.toThrow('Network Error')
    })
})
