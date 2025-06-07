// src/utils/reminderModal.ts
import type { ReminderModalProps } from './types';

type NavigateFn = (path: string) => void;

export const createReminderModalProps = (navigate: NavigateFn): ReminderModalProps['modalProps'] => ({
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
        // Просто закрываем модалку (ничего не делаем, closeModal вызовется в ReminderModal)
    }
})