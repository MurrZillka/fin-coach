// src/api/reminders/index.ts

import apiClient from '../client';
import { TodayReminderResponse } from './types';

export const getTodayReminder = async (): Promise<TodayReminderResponse> => {
    const response = await apiClient.get<TodayReminderResponse>('/Reminder');
    return response.data;
};
