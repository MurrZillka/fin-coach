// SpendingsPage/ui/SpendingsPage.jsx
import React from 'react';
import useSpendingsStore from '../../../02_stores/spendingsStore';
import useCategoryStore from '../../../02_stores/categoryStore/categoryStore.ts';
import useModalStore from '../../../02_stores/modalStore';
import Text from '../../../04_components/ui/Text';
import TextButton from '../../../04_components/ui/TextButton';
import Table from '../../../04_components/ui/Table';
import SpendingCardList from '../../../04_components/mobile/SpendingCardList';
import {spendingsPageHandlers} from '../utils/spendingsPageHandlers.js';
import {getSpendingColumns} from '../config/tableColumns';

export default function SpendingsPage() {
    // Хуки сторов
    const { spendings, loading, error, clearError } = useSpendingsStore();
    const { categories, loading: categoriesLoading, error: categoriesError, clearError: clearCategoriesError } = useCategoryStore();
    const { modalType, openModal, closeModal, setModalSubmissionError } = useModalStore();

    // Получаем хендлеры из кастомного хука
    const { handleAddClick, handleEditClick, handleDeleteClick } = spendingsPageHandlers({
        categories,
        clearError,
        clearCategoriesError,
        openModal,
        closeModal,
        setModalSubmissionError
    });

    // Конфигурация колонок таблицы
    const spendingColumns = getSpendingColumns(categories, handleEditClick, handleDeleteClick);

    // Вычисляемые значения
    const displayError = error || categoriesError;

    // Функция рендеринга контента
    const renderContent = () => {
        if ((loading && spendings === null) || (categoriesLoading && categories === null)) {
            return (
                <div className="text-center p-4">
                    <Text variant="body">Загрузка данных...</Text>
                </div>
            );
        }

        if (spendings !== null && spendings.length === 0 && categories !== null) {
            return (
                <div className="p-4 text-center">
                    <Text variant="body">У вас пока нет добавленных расходов.</Text>
                </div>
            );
        }

        if (spendings !== null && spendings.length > 0 && categories !== null) {
            return (
                <>
                    <Table
                        data={spendings}
                        columns={spendingColumns}
                        loading={loading}
                        emptyMessage="У вас пока нет добавленных расходов."
                        className="hidden md:table"
                    />
                    <SpendingCardList
                        className="block md:hidden"
                        spendings={spendings}
                        handleEditClick={handleEditClick}
                        handleDeleteClick={handleDeleteClick}
                        categories={categories}
                    />
                    {(loading && spendings !== null) || (categoriesLoading && categories !== null) ? (
                        <div className="text-center mt-4">
                            <Text variant="body">Обновление данных...</Text>
                        </div>
                    ) : null}
                </>
            );
        }

        return null;
    };

    return (
        <div className="bg-secondary-50">
            <main className="max-w-7xl mx-auto p-4">
                <div className="flex justify-between items-center">
                    <Text variant="h2">Мои расходы</Text>
                    <TextButton onClick={handleAddClick}>
                        Добавить расход
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
        </div>
    );
}
