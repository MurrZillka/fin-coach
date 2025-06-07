// src/04_components/ui/ConfirmModal/types.ts

import { RefObject } from 'react';

export interface ConfirmModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    title?: string;
    message?: string;
    confirmText?: string;
    // Для тестов можно добавить ref, если потребуется
    confirmButtonRef?: RefObject<HTMLButtonElement>;
}
