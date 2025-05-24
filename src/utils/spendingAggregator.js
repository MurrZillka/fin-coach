// src/utils/spendingAggregator.js
import {
    parseLocalDateStartOfDay,
    parseLocalEndOfDayDate,
    hasDateOverlap
} from './dateUtils'; // Импортируем только нужные функции из dateUtils

/**
 * Агрегирует расходы по категориям для заданного периода.
 * Учитывает разовые и регулярные расходы.
 *
 * @param {Array<Object>} spendings - Массив объектов расходов.
 * @param {Array<Object>} categories - Массив объектов категорий (для сопоставления ID с именем).
 * @param {string} selectedPeriod - Выбранный период ('last30Days', 'lastYear', 'allTime').
 * @returns {Object} Объект, где ключи - названия категорий, а значения - общая сумма расходов.
 */
export const aggregateSpendingsByCategory = (spendings, categories, selectedPeriod) => {
    const summary = {};

    // Создаем карту категорий для быстрого поиска по category_id
    // Это критически важно, так как в spendings нет category_name
    const categoryMap = categories.reduce((map, category) => {
        map[category.id] = category.name;
        return map;
    }, {});

    const now = new Date();
    now.setHours(0, 0, 0, 0); // Обнуляем время для точного сравнения (начало текущего дня)

    let periodStartDate = null;
    let periodEndDate = now; // Конец периода всегда "сегодня" (начало текущего дня)

    switch (selectedPeriod) {
        case 'last30Days':
            periodStartDate = new Date(now);
            periodStartDate.setDate(now.getDate() - 29); // 30 дней, включая сегодня
            periodStartDate.setHours(0, 0, 0, 0);
            break;
        case 'lastYear':
            periodStartDate = new Date(now.getFullYear() - 1, now.getMonth(), now.getDate());
            periodStartDate.setHours(0, 0, 0, 0);
            break;
        case 'allTime':
            // Для "allTime" находим самую раннюю дату из всех расходов
            let minDate = new Date(2100, 0, 1); // Инициализируем очень далеким будущим
            if (spendings && spendings.length > 0) {
                spendings.forEach(s => {
                    const spendingDate = parseLocalDateStartOfDay(s.date);
                    if (spendingDate && spendingDate.getTime() < minDate.getTime()) {
                        minDate = spendingDate;
                    }
                });
                if (minDate.getFullYear() !== 2100) { // Если нашли реальную дату
                    periodStartDate = new Date(minDate.getFullYear(), minDate.getMonth(), minDate.getDate());
                    periodStartDate.setHours(0, 0, 0, 0);
                } else { // Если расходов нет, или все даты некорректны, используем текущий день как начало
                    periodStartDate = now;
                }
            } else {
                periodStartDate = now; // Если расходов нет вообще, период начинается сегодня
            }
            break;
        default:
            console.warn(`aggregateSpendingsByCategory: Unknown period selected: ${selectedPeriod}`);
            return {};
    }

    // Если данные о расходах или категориях отсутствуют, возвращаем пустой объект
    if (!spendings || !categories || spendings.length === 0 || categories.length === 0) {
        return {};
    }

    // Агрегация расходов
    spendings.forEach(spending => {
        const spendingDate = parseLocalDateStartOfDay(spending.date);
        // Для регулярных расходов, если end_date "нулевая", parseLocalEndOfDayDate вернет очень далекое будущее
        const spendingEndDate = parseLocalEndOfDayDate(spending.end_date);

        if (!spendingDate || typeof spending.amount !== 'number') {
            console.warn("Skipping spending due to invalid date or amount:", spending);
            return;
        }

        // Получаем имя категории по ID из categoryMap
        const categoryName = categoryMap[spending.category_id];
        if (!categoryName) {
            console.warn(`Skipping spending with unknown category_id: ${spending.category_id}. Spending details:`, spending);
            return;
        }

        if (spending.is_permanent) {
            // Если расход регулярный, распределяем его по дням внутри пересекающегося периода
            // Создаем временную дату для итерации, чтобы не менять periodStartDate
            let currentDay = new Date(periodStartDate);
            // Итерируем по дням от начала выбранного периода до его конца
            while (currentDay.getTime() <= periodEndDate.getTime()) {
                const currentDayEnd = new Date(currentDay.getFullYear(), currentDay.getMonth(), currentDay.getDate(), 23, 59, 59, 999);

                // Проверяем, пересекается ли текущий день с полным периодом действия регулярного расхода
                if (hasDateOverlap(currentDay, currentDayEnd, spendingDate, spendingEndDate)) {
                    // И если текущий день совпадает с днем месяца, когда происходит регулярный расход
                    // (например, если расход 15 числа каждого месяца, учитываем его только 15 числа)
                    if (currentDay.getDate() === spendingDate.getDate()) {
                        summary[categoryName] = (summary[categoryName] || 0) + spending.amount;
                    }
                }
                currentDay.setDate(currentDay.getDate() + 1); // Переходим к следующему дню
            }
        } else {
            // Для разовых расходов
            // Проверяем, попадает ли дата расхода в выбранный период
            if (spendingDate.getTime() >= periodStartDate.getTime() && spendingDate.getTime() <= periodEndDate.getTime()) {
                summary[categoryName] = (summary[categoryName] || 0) + spending.amount;
            }
        }
    });

    console.log(`Aggregated spendings by category for ${selectedPeriod}:`, summary);
    return summary;
};