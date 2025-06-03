// src/api/reminders/index.js
import apiClient from '../client.ts';

export const getTodayReminder = async () => {
    return apiClient.get('/Reminder');
};
