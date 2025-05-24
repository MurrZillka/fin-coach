// src/utils/dateUtils.js

/**
 * Определяет, является ли дата сегодня или в прошлом, игнорируя время.
 * Сравнивает только календарные дни, игнорируя время.
 * Специально обрабатывает placeholder-значения '0001-01-01T00:00:00Z' и '0001-01-01'.
 * @param {string | Date | null | undefined} date - Дата для сравнения (строка, Date-объект, null или undefined).
 * @returns {boolean} - True, если дата сегодня или раньше И НЕ является placeholder-значением, false иначе.
 */
export function isDateTodayOrEarlier(date) {
    // Явная проверка на известные placeholder-значения бэкенда
    if (date === '0001-01-01T00:00:00Z' || date === '0001-01-01') {
        return false; // Placeholder означает, что транзакция продолжается (не завершена)
    }

    // Если дата отсутствует (null, undefined, пустая строка, 0 и т.п.,
    // кроме тех placeholder'ов, что мы уже проверили)
    if (!date) {
        return false; // Отсутствие даты тоже означает, что транзакция продолжается
    }

    try {
        const comparisonDate = new Date(date);

        // Проверяем, является ли comparisonDate валидным объектом Date после попытки парсинга
        // isNaN(date.getTime()) - надежный способ проверки
        if (isNaN(comparisonDate.getTime())) {
            // Если Date невалидный (например, из некорректной строки), считаем, что транзакция продолжается
            return false;
        }

        const today = new Date();

        // Сбрасываем время до полуночи для обеих дат, чтобы сравнивать только календарные дни
        const comparisonDay = new Date(comparisonDate.getFullYear(), comparisonDate.getMonth(), comparisonDate.getDate());
        const todayDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());

        // Сравниваем дни: если дата транзакции сегодня или раньше, она считается завершенной
        return comparisonDay <= todayDay;

    } catch (e) {
        // Ловим другие возможные ошибки при создании Date
        // В случае ошибки парсинга даты считаем, что транзакция продолжается
        console.error("Error processing date in isDateTodayOrEarlier:", date, e);
        return false;
    }
}

/**
 * Возвращает строковое представление даты в формате YYYY-MM-DD для локального времени.
 * @param {Date} date - Объект даты.
 * @returns {string|null} Строка даты или null.
 */
export const getLocalISODateString = (date) => {
    if (!date) return null;
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
};

/**
 * Возвращает строковое представление года и месяца в формате YYYY-MM для локального времени.
 * @param {Date} date - Объект даты.
 * @returns {string|null} Строка года-месяца или null.
 */
export const getLocalYearMonthString = (date) => {
    if (!date) return null;
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    return `${year}-${month}`;
};

/**
 * Парсит строковое представление даты и возвращает объект Date, установленный на конец дня.
 * Специально обрабатывает "нулевую" дату как очень далекое будущее.
 * @param {string} dateString - Строка даты.
 * @returns {Date} Объект Date с временем 23:59:59:999.
 */
export const parseLocalEndOfDayDate = (dateString) => {
    if (!dateString || dateString.startsWith('0001-01-01')) {
        return new Date(2100, 0, 1, 23, 59, 59, 999); // Очень далекое будущее для "нулевой" даты
    }
    try {
        const date = new Date(dateString);
        if (!isNaN(date.getTime())) {
            date.setHours(23, 59, 59, 999);
            return date;
        }
    } catch (e) {
        console.error("Failed to parse end date:", dateString, e);
    }
    return new Date(2100, 0, 1, 23, 59, 59, 999);
};

/**
 * Парсит строковое представление даты и возвращает объект Date, установленный на начало дня.
 * @param {string} dateString - Строка даты.
 * @returns {Date|null} Объект Date с временем 00:00:00:000 или null.
 */
export const parseLocalDateStartOfDay = (dateString) => {
    if (!dateString) return null;

    try {
        const date = new Date(dateString);
        if (!isNaN(date.getTime())) {
            // Приводим к началу дня в локальном времени, чтобы избежать смещений UTC
            const localDate = new Date(date.getFullYear(), date.getMonth(), date.getDate(), 0, 0, 0, 0);
            return localDate;
        }
    } catch (e) {
        console.error("Failed to parse start date:", dateString, e);
    }
    return null;
};

/**
 * Проверяет, пересекаются ли два временных интервала.
 * @param {Date} start1 - Начало первого интервала.
 * @param {Date} end1 - Конец первого интервала.
 * @param {Date} start2 - Начало второго интервала.
 * @param {Date} end2 - Конец второго интервала.
 * @returns {boolean} True, если интервалы пересекаются, иначе false.
 */
export const hasDateOverlap = (start1, end1, start2, end2) => {
    return start1.getTime() <= end2.getTime() && end1.getTime() >= start2.getTime();
};