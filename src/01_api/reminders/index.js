// src/api/reminders/apiTypes.ts
import apiClient from '../client.ts';

export const getTodayReminder = async () => {
    return apiClient.get('/Reminder');
};
