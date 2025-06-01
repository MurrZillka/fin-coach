// src/api/reminders/index.js
import apiClient from '../client.js';

export const getTodayReminder = async () => {
    return apiClient.get('/Reminder');
};
