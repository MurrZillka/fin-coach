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
        console.error("Error processing date in isDateTodayOrEarlier:", date, e); // Оставляем лог для ошибок парсинга, но убираем отладочные
        return false;
    }
}