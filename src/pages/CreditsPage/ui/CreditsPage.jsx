// CreditsPage/ui/CreditsPage.jsx
import React from 'react';
import useCreditStore from '../../../stores/creditStore';
import useModalStore from '../../../stores/modalStore';
import Text from '../../../components/ui/Text';
import TextButton from '../../../components/ui/TextButton';
import Table from '../../../components/ui/Table';
import CreditCardList from '../../../components/mobile/CreditCardList';
import Modal from '../../../components/ui/Modals/Modal';
import { useCreditsPageHandlers } from '../hooks/useCreditsPageHandlers';
import { getCreditColumns } from '../config/tableColumns';
import ConfirmModal from "../../../components/ui/Modals/ConfirmModal.jsx";

export default function CreditsPage() {
    // Хуки сторов
    const { credits, loading, error, clearError } = useCreditStore();
    const { modalType, modalProps, openModal, closeModal, setModalSubmissionError } = useModalStore();

    // Получаем хендлеры из кастомного хука
    const { handleAddClick, handleEditClick, handleDeleteClick } = useCreditsPageHandlers({
        clearError,
        openModal,
        closeModal,
        setModalSubmissionError
    });

    // Конфигурация колонок таблицы
    const creditColumns = getCreditColumns(handleEditClick, handleDeleteClick);

    // Вычисляемые значения
    const displayError = error;

    // Функция рендеринга контента
    const renderContent = () => {
        if (loading && credits === null) {
            return (
                <div className="text-center p-4">
                    <Text variant="body">Загрузка доходов...</Text>
                </div>
            );
        }

        if (credits !== null && credits.length === 0) {
            return (
                <div className="p-4 text-center">
                    <Text variant="body">У вас пока нет добавленных доходов.</Text>
                </div>
            );
        }

        if (credits !== null && credits.length > 0) {
            return (
                <>
                    <Table
                        data={credits}
                        columns={creditColumns}
                        loading={loading}
                        emptyMessage="У вас пока нет добавленных доходов."
                        className="hidden md:table"
                    />
                    <CreditCardList
                        className="block md:hidden"
                        credits={credits}
                        handleEditClick={handleEditClick}
                        handleDeleteClick={handleDeleteClick}
                    />
                    {loading && credits !== null && (
                        <div className="text-center mt-4">
                            <Text variant="body">Обновление списка доходов...</Text>
                        </div>
                    )}
                </>
            );
        }

        return null;
    };

    return (
        <div className="bg-secondary-50">
            <main className="max-w-7xl mx-auto p-4">
                <div className="flex justify-between items-center">
                    <Text variant="h2">Мои доходы</Text>
                    <TextButton onClick={handleAddClick}>
                        Добавить доход
                    </TextButton>
                </div>

                {displayError && modalType === null && (
                    <div className="mb-4 p-3 bg-red-100 border border-red-300 text-gray-800 rounded-md">
                        {displayError.message}
                    </div>
                )}

                <div className="p-4">
                    {renderContent()}
                </div>
            </main>

            {modalType && modalType !== 'confirmDelete' && <Modal {...modalProps} />}
            {modalType === 'confirmDelete' && (
                <ConfirmModal
                    isOpen={true}
                    title={modalProps.title}
                    message={modalProps.message}
                    confirmText={modalProps.confirmText}
                    onConfirm={modalProps.onConfirm}
                    onClose={closeModal}
                />
            )}
        </div>
    );
}
