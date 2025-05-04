// src/stores/modalStore.js
import { create } from 'zustand';

const useModalStore = create((set) => ({
    // --- СОСТОЯНИЕ ---
    // type: Определяет, какой тип модального окна сейчас открыт.
    // null - если модальное окно закрыто.
    // Примеры: 'addCategory', 'editCategory', 'confirmDelete', 'someOtherModalType', etc.
    modalType: null,

    // props: Объект с данными и колбэками, которые нужно передать открываемому модальному окну.
    // Например: { initialData: {...}, onSubmit: () => {}, message: '...' }
    modalProps: {},

    // --- ДЕЙСТВИЯ ---
    /**
     * Открывает указанное модальное окно с заданными свойствами.
     * @param {string} type - Тип открываемого модального окна (строковый идентификатор).
     * @param {object} props - Свойства, которые будут переданы компоненту модального окна.
     */
    openModal: (type, props = {}) => set({
        modalType: type,
        modalProps: props,
    }),

    /**
     * Закрывает текущее модальное окно и сбрасывает его состояние.
     */
    closeModal: () => set({
        modalType: null,
        modalProps: {},
    }),

    // Дополнительные действия, если нужны специфичные для типов модалов (например, openConfirm, openFormModal)
    // но для начала универсальных open/close достаточно.
}));

export default useModalStore;