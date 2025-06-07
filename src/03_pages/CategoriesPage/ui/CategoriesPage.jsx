// CategoriesPage/ui/CategoriesPage.jsx
import React from 'react';
import TextButton from '../../../04_components/ui/TextButton.js';
import Text from '../../../04_components/ui/Text.js';
import useCategoryStore from '../../../02_stores/categoryStore/categoryStore.ts';
import useModalStore from '../../../02_stores/modalStore/modalStore.ts';
import CategoriesCardList from '../../../04_components/mobile/CategoriesCardList';
import {DEFAULT_CATEGORY_NAME} from "../../../constants/categories";
import Table from "../../../04_components/ui/Table.js";
import {categoriesPageHandlers} from '../utils/categoriesPageHandlers.js';
import {getCategoryColumns} from '../config/tableColumns';

export default function CategoriesPage() {
    // Хуки сторов
    const { categories, loading, error, clearError } = useCategoryStore();
    const { openModal, closeModal, setModalSubmissionError, modalType } = useModalStore();

    // Получаем хендлеры из кастомного хука
    const { handleAddClick, handleEditClick, handleDeleteClick } = categoriesPageHandlers({
        categories,
        clearError,
        openModal,
        closeModal,
        setModalSubmissionError
    });

    // Конфигурация колонок таблицы
    const categoryColumns = getCategoryColumns(handleEditClick, handleDeleteClick, DEFAULT_CATEGORY_NAME);

    // Вычисляемые значения
    const displayError = error;
    const isInitialLoading = loading && categories === null;
    const showEmptyMessage = categories !== null && categories.length === 0 && !loading;
    const showList = categories !== null && categories.length > 0;
    const isBackgroundLoading = loading && categories !== null;

    // Функция рендеринга контента
    const renderContent = () => {
        if (isInitialLoading) {
            return (
                <div className="text-center p-4">
                    <Text variant="body">Загрузка категорий...</Text>
                </div>
            );
        }

        if (showEmptyMessage) {
            return (
                <div className="text-center">
                    <Text variant="body">У вас пока нет категорий. Создайте первую!</Text>
                </div>
            );
        }

        if (showList) {
            return (
                <>
                    <Table
                        data={categories}
                        columns={categoryColumns}
                        loading={loading}
                        emptyMessage="У вас пока нет категорий. Создайте первую!"
                        className="hidden md:table"
                    />
                    <CategoriesCardList
                        className="block md:hidden"
                        categories={categories}
                        loading={loading}
                        handleEditClick={handleEditClick}
                        handleDeleteClick={handleDeleteClick}
                        defaultCategoryName={DEFAULT_CATEGORY_NAME}
                    />
                    {isBackgroundLoading && (
                        <div className="text-center mt-4">
                            <Text variant="body">Обновление списка категорий...</Text>
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
                    <Text variant="h2">Категории расходов</Text>
                    <TextButton onClick={handleAddClick} disabled={loading}>
                        <Text variant="button">Добавить категорию</Text>
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
