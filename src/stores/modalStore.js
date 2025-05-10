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

    // --- НОВОЕ: Состояние для общей ошибки отправки формы в модальном окне ---
    // Будет содержать текст ошибки, если она произошла при сабмите формы в модалке.
    submissionError: null,
    // --- Конец НОВОГО ---


    // --- ДЕЙСТВИЯ ---
    /**
     * Открывает указанное модальное окно с заданными свойствами.
     * @param {string} type - Тип открываемого модального окна (строковый идентификатор).
     * @param {object} props - Свойства, которые будут переданы компоненту модального окна.
     */
    openModal: (type, props = {}) => set({
        modalType: type,
        modalProps: props,
        submissionError: null, // --- ИЗМЕНЕНИЕ: Сбрасываем ошибку при открытии нового модала ---
    }),

    /**
     * Закрывает текущее модальное окно и сбрасывает его состояние.
     */
    closeModal: () => set({
        modalType: null,
        modalProps: {},
        submissionError: null, // --- ИЗМЕНЕНИЕ: Сбрасываем ошибку при закрытии ---
    }),

    // --- НОВОЕ ДЕЙСТВИЕ: Установка ошибки отправки формы ---
    /**
     * Устанавливает сообщение об ошибке отправки формы для текущего модального окна.
     * Это действие будет вызываться из компонента страницы (CreditsPage) при ошибке сабмита.
     * @param {string | null} message - Сообщение об ошибке, или null для очистки.
     */
    setModalSubmissionError: (message) => set({ submissionError: message }),
    // --- Конец НОВОГО ДЕЙСТВИЯ ---

    // Дополнительные действия, если нужны специфичные для типов модалов (например, openConfirm, openFormModal)
    // но для начала универсальных open/close достаточно.
}));

export default useModalStore;