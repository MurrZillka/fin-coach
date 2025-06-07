// src/04_components/ui/ReminderModal.types.ts

export interface ReminderModalProps {
    modalProps: {
        title?: string;
        message?: string;
        confirmText?: string;
        cancelText?: string;
        thirdButtonText?: string;
        onConfirm?: () => void;
        onCancel?: () => void;
        onThirdButtonClick?: () => void;
    };
}
