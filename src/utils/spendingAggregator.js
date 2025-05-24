// src/utils/spendingAggregator.js
import {
    parseLocalDateStartOfDay,
    parseLocalEndOfDayDate,
    hasDateOverlap
} from './dateUtils';

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

    const categoryMap = categories.reduce((map, category) => {
        map[category.id] = category.name;
        return map;
    }, {});

    const now = new Date();
    now.setHours(0, 0, 0, 0);

    let periodStartDate = null;
    let periodEndDate = now;

    switch (selectedPeriod) {
        case 'last30Days': { // ДОБАВЛЕНЫ ФИГУРНЫЕ СКОБКИ
            periodStartDate = new Date(now);
            periodStartDate.setDate(now.getDate() - 29);
            periodStartDate.setHours(0, 0, 0, 0);
            break;
        } // ДОБАВЛЕНЫ ФИГУРНЫЕ СКОБКИ
        case 'lastYear': { // ДОБАВЛЕНЫ ФИГУРНЫЕ СКОБКИ
            periodStartDate = new Date(now.getFullYear() - 1, now.getMonth(), now.getDate());
            periodStartDate.setHours(0, 0, 0, 0);
            break;
        } // ДОБАВЛЕНЫ ФИГУРНЫЕ СКОБКИ
        case 'allTime': { // ДОБАВЛЕНЫ ФИГУРНЫЕ СКОБКИ
            let minDate = new Date(2100, 0, 1);
            if (spendings && spendings.length > 0) {
                spendings.forEach(s => {
                    const spendingDate = parseLocalDateStartOfDay(s.date);
                    if (spendingDate && spendingDate.getTime() < minDate.getTime()) {
                        minDate = spendingDate;
                    }
                });
                if (minDate.getFullYear() !== 2100) {
                    periodStartDate = new Date(minDate.getFullYear(), minDate.getMonth(), minDate.getDate());
                    periodStartDate.setHours(0, 0, 0, 0);
                } else {
                    periodStartDate = now;
                }
            } else {
                periodStartDate = now;
            }
            break;
        } // ДОБАВЛЕНЫ ФИГУРНЫЕ СКОБКИ
        default: { // ДОБАВЛЕНЫ ФИГУРНЫЕ СКОБКИ
            console.warn(`aggregateSpendingsByCategory: Unknown period selected: ${selectedPeriod}`);
            return {};
        } // ДОБАВЛЕНЫ ФИГУРНЫЕ СКОБКИ
    }

    if (!spendings || !categories || spendings.length === 0 || categories.length === 0) {
        return {};
    }

    spendings.forEach(spending => {
        const spendingDate = parseLocalDateStartOfDay(spending.date);
        const spendingEndDate = parseLocalEndOfDayDate(spending.end_date);

        if (!spendingDate || typeof spending.amount !== 'number') {
            console.warn("Skipping spending due to invalid date or amount:", spending);
            return;
        }

        const categoryName = categoryMap[spending.category_id];
        if (!categoryName) {
            console.warn(`Skipping spending with unknown category_id: ${spending.category_id}. Spending details:`, spending);
            return;
        }

        if (spending.is_permanent) {
            let currentDay = new Date(periodStartDate);
            while (currentDay.getTime() <= periodEndDate.getTime()) {
                const currentDayEnd = new Date(currentDay.getFullYear(), currentDay.getMonth(), currentDay.getDate(), 23, 59, 59, 999);

                if (hasDateOverlap(currentDay, currentDayEnd, spendingDate, spendingEndDate)) {
                    if (currentDay.getDate() === spendingDate.getDate()) {
                        summary[categoryName] = (summary[categoryName] || 0) + spending.amount;
                    }
                }
                currentDay.setDate(currentDay.getDate() + 1);
            }
        } else {
            if (spendingDate.getTime() >= periodStartDate.getTime() && spendingDate.getTime() <= periodEndDate.getTime()) {
                summary[categoryName] = (summary[categoryName] || 0) + spending.amount;
            }
        }
    });

    console.log(`Aggregated spendings by category for ${selectedPeriod}:`, summary);
    return summary;
};