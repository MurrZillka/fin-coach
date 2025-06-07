// src/02_stores/modalStore/modalStore.test.ts
import { describe, it, expect, beforeEach } from 'vitest';
import useModalStore from './modalStore';

describe('modalStore', () => {
    beforeEach(() => {
        useModalStore.getState().closeModal();
    });

    it('должен иметь начальное состояние', () => {
        const state = useModalStore.getState();
        expect(state.modalType).toBeNull();
        expect(state.modalProps).toEqual({});
        expect(state.submissionError).toBeNull();
    });

    it('openModal устанавливает modalType, modalProps и сбрасывает submissionError', () => {
        useModalStore.getState().openModal('addCategory', { foo: 1 });
        const state = useModalStore.getState();
        expect(state.modalType).toBe('addCategory');
        expect(state.modalProps).toEqual({ foo: 1 });
        expect(state.submissionError).toBeNull();
    });

    it('openModal работает без modalProps', () => {
        useModalStore.getState().openModal('editCategory');
        const state = useModalStore.getState();
        expect(state.modalType).toBe('editCategory');
        expect(state.modalProps).toEqual({});
        expect(state.submissionError).toBeNull();
    });

    it('closeModal сбрасывает все поля', () => {
        useModalStore.getState().openModal('editCategory', { a: 1 });
        useModalStore.getState().setModalSubmissionError('Ошибка!');
        useModalStore.getState().closeModal();
        const state = useModalStore.getState();
        expect(state.modalType).toBeNull();
        expect(state.modalProps).toEqual({});
        expect(state.submissionError).toBeNull();
    });

    it('setModalSubmissionError устанавливает ошибку', () => {
        useModalStore.getState().setModalSubmissionError('Ошибка!');
        expect(useModalStore.getState().submissionError).toBe('Ошибка!');
        useModalStore.getState().setModalSubmissionError(null);
        expect(useModalStore.getState().submissionError).toBeNull();
    });
});