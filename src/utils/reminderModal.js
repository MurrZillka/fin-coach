// src/utils/reminderModal.js
export const createReminderModalProps = (navigate) => ({
    title: 'Важное напоминание!',
    message: 'Пора обновить доходы и расходы, иначе может нарушиться точность учета финансов.',
    confirmText: 'Внести расходы',
    cancelText: 'Внести доходы',
    onConfirm: () => {
        navigate('/spendings');
    },
    onCancel: () => {
        navigate('/credits');
    },
    thirdButtonText: 'Закрыть',
    onThirdButtonClick: () => {
        // Просто закрываем модалку
    }
});
