// src/hooks/useFinancialData.js
export const useFinancialData = () => {
    const prepareDataForSubmit = (formData, isFinishedField) => {
        const dataToSend = {...formData};
        if (dataToSend.is_permanent) {
            if (!dataToSend[isFinishedField]) {
                dataToSend.end_date = '0001-01-01';
            }
        } else {
            dataToSend.end_date = '0001-01-01';
        }
        return dataToSend;
    };

    return { prepareDataForSubmit };
};
