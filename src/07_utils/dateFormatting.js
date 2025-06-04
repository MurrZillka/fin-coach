// src/utils/dateFormatting.js
export const dateFormatting = () => {
    const formatDateForForm = (dateString) => {
        if (!dateString || dateString === '0001-01-01T00:00:00Z' || dateString === '0001-01-01') {
            return '';
        }
        return new Date(dateString).toISOString().split('T')[0];
    };

    const isValidEndDate = (endDate) => {
        return endDate && endDate !== '0001-01-01T00:00:00Z' && endDate !== '0001-01-01';
    };

    const prepareInitialData = (item, isFinishedField) => {
        return {
            ...item,
            date: formatDateForForm(item.date),
            end_date: formatDateForForm(item.end_date),
            [isFinishedField]: isValidEndDate(item.end_date),
        };
    };

    return { formatDateForForm, isValidEndDate, prepareInitialData };
};
