// src/components/ModalManager.jsx
import { useMemo } from 'react';
import useModalStore from '../stores/modalStore';
import Modal from './ui/Modal';
import ConfirmModal from './ui/ConfirmModal';
import { shallow } from 'zustand/shallow';

/**
 * Компонент для рендеринга модалок на основе modalType из modalStore.
 */
export default function ModalManager() {
    // Получаем modalType отдельно
    const modalType = useModalStore((state) => state.modalType);
    // Получаем modalProps отдельно
    const modalProps = useModalStore((state) => state.modalProps);
    // Получаем closeModal отдельно
    const closeModal = useModalStore((state) => state.closeModal, shallow);

    // Логируем для отладки
    console.log('ModalManager: Rendering with modalType:', modalType, 'modalProps:', modalProps);

    // Стабилизируем modalProps с помощью useMemo
    const stabilizedProps = useMemo(() => modalProps, [modalProps]);

    if (!modalType) {
        console.log('ModalManager: No modalType, returning null');
        return null;
    }

    // Маппинг типов модалок на компоненты
    const modalComponents = {
        addCategory: Modal,
        editCategory: Modal,
        addCredit: Modal,
        editCredit: Modal,
        addSpending: Modal,
        editSpending: Modal,
        addGoal: Modal,
        editGoal: Modal,
        confirmDelete: ConfirmModal,
        confirmDeleteGoal: ConfirmModal,
        confirmSetCurrentGoal: ConfirmModal,
    };

    const Component = modalComponents[modalType];
    if (!Component) {
        console.log('ModalManager: No component found for modalType:', modalType);
        return null;
    }

    return <Component isOpen={true} onClose={closeModal} {...stabilizedProps} />;
}