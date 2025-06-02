// src/pages/CategoriesPage.jsx
import TextButton from '../components/ui/TextButton';
import Text from '../components/ui/Text';
import useCategoryStore from '../stores/categoryStore';
import useModalStore from '../stores/modalStore.js';
import CategoriesCardList from '../components/mobile/CategoriesCardList.jsx';
import {DEFAULT_CATEGORY_NAME} from "../constants/categories.js";
import {dataCoordinator} from '../dataCoordinator.js';
import SimpleTextCell from "../components/ui/cells/SimpleTextCell.jsx";
import CategoryActionsCell from "../components/ui/cells/CategoryActionsCell.jsx";
import Table from "../components/ui/Table.jsx";

const categoryFields = [
    {name: 'name', label: 'Название', required: true, type: 'text', placeholder: 'Например: Еда'},
    {
        name: 'description',
        label: 'Описание',
        required: false,
        type: 'text',
        placeholder: 'Необязательно: на что тратится категория'
    },
];

export default function CategoriesPage() {
    const {
        categories,
        loading,
        error,
        clearError
    } = useCategoryStore();

    const {openModal, closeModal, setModalSubmissionError, modalType} = useModalStore(); // <-- ДОБАВЛЕНО setModalSubmissionError, modalType


    const handleAddClick = () => {
        clearError();
        openModal('addCategory', {
            title: 'Добавить категорию',
            fields: categoryFields,
            initialData: {},
            onSubmit: handleAddSubmit,
            submitText: 'Добавить',
            submissionError: error ? error.message : null,
            onClose: () => {
                closeModal(); // Закрываем модалку через useModalStore
                useCategoryStore.getState().clearError(); // Очищаем ошибку в categoryStore
            }
        });
        // console.log('CategoriesPage: Add Category button clicked, openModal called.');
    }

    const handleEditClick = (category) => {
        clearError();
        openModal('editCategory', {
            title: 'Редактировать категорию',
            fields: categoryFields,
            initialData: category,
            onSubmit: (formData) => handleEditSubmit(category.id, formData),
            submitText: 'Сохранить изменения',
            onClose: () => {
                closeModal(); // Закрываем модалку через useModalStore
                useCategoryStore.getState().clearError(); // Очищаем ошибку в categoryStore
            }
        });
    };

    const handleDeleteClick = (id) => {
        clearError();
        const category = categories !== null ? categories.find(cat => cat.id === id) : null;
        const categoryName = category ? category.name : 'эту категорию';

        openModal('confirmDelete', {
            title: 'Подтверждение удаления',
            message: `Вы уверены, что хотите удалить "${categoryName}"?`,
            onConfirm: () => handleDeleteConfirm(id),
            confirmText: 'Удалить',
        });
    };


    const handleAddSubmit = async (formData) => {
        // console.log('CategoriesPage Logic: handleAddSubmit called with data:', formData);
        try {
            await dataCoordinator.addCategory(formData);
            closeModal();
            // console.log('CategoriesPage Logic: addCategory successful, modal closed.');
        } catch (err) {
            console.error('CategoriesPage Logic: Error during add category (after form submit):', err);
            // --- НАЧАЛО ИЗМЕНЕНИЙ В handleAddSubmit ---
            // Сообщение об ошибке уже будет понятным благодаря изменению в categoryStore
            setModalSubmissionError(err.message || 'Произошла ошибка при добавлении категории.');
            // Важно: closeModal() здесь не вызывается, чтобы модалка осталась открытой
            // console.log('CategoriesPage Logic: addCategory failed, setting modal error.');
            // --- КОНЕЦ ИЗМЕНЕНИЙ ---
        }
        // console.log('CategoriesPage Logic: handleAddSubmit finished.');
    };

    const handleEditSubmit = async (id, formData) => {
        // console.log(`CategoriesPage Logic: handleEditSubmit called for ID: ${id} with data:`, formData);
        try {
            await dataCoordinator.updateCategory(id, formData);
            closeModal();
            // console.log(`CategoriesPage Logic: updateCategory ID ${id} successful, modal closed.`);
        } catch (err) {
            // --- НАЧАЛО ИЗМЕНЕНИЙ В handleEditSubmit ---
            // Сообщение об ошибке уже будет понятным благодаря изменению в categoryStore
            setModalSubmissionError(err.message || 'Произошла ошибка при сохранении изменений.');
            // Важно: closeModal() здесь не вызывается, чтобы модалка осталась открытой
            // console.log(`CategoriesPage Logic: updateCategory ID ${id} failed, setting modal error.`);
            // --- КОНЕЦ ИЗМЕНЕНИЙ ---
        }
        // console.log(`CategoriesPage Logic: handleEditSubmit finished for ID: ${id}.`);
    };

    const handleDeleteConfirm = async (id) => {
        // console.log(`CategoriesPage Logic: handleDeleteConfirm called for ID: ${id}`);
        try {
            await dataCoordinator.deleteCategory(id);
            // console.log(`CategoriesPage Logic: Категория ${id} успешно удалена.`);
            closeModal();
        } catch (err) {
            console.error(`CategoriesPage Logic: Error during delete category ID ${id} (after confirmation):', err);`);
            closeModal();
            throw err;
        }
        // console.log(`CategoriesPage Logic: handleDeleteConfirm finished for ID: ${id}.`);
    };

    const displayError = error;

    // Проверяем, идет ли первая загрузка (loading: true и categories: null)
    const isInitialLoading = loading && categories === null;
    // Проверяем, нужно ли показывать сообщение "нет категорий" (categories: не null, и пустой массив, и не идет фоновая загрузка)
    const showEmptyMessage = categories !== null && categories.length === 0 && !loading;
    // Проверяем, нужно ли показывать список (таблицу или карточки) (categories: не null, и не пустой массив)
    const showList = categories !== null && categories.length > 0;
    // Проверяем, идет ли фоновая загрузка (loading: true, но categories уже не null)
    const isBackgroundLoading = loading && categories !== null;


    const categoryColumns = [
        {
            key: 'name',
            header: 'Название',
            component: SimpleTextCell,
            props: {field: 'name', variant: 'tdPrimary'},
            cellClassName: 'p-4'
        },
        {
            key: 'description',
            header: 'Описание',
            component: SimpleTextCell,
            props: {field: 'description', variant: 'tdSecondary'},
            cellClassName: 'p-4'
        },
        {
            key: 'actions',
            header: 'Действия',
            component: CategoryActionsCell,
            props: {
                onEdit: handleEditClick,
                onDelete: handleDeleteClick,
                defaultCategoryName: DEFAULT_CATEGORY_NAME
            },
            cellClassName: 'px-2 py-4'
        }
    ];

    const renderContent = () => {
        // Early return для первичной загрузки
        if (isInitialLoading) {
            return (
                <div className="text-center p-4">
                    <Text variant="body">Загрузка категорий...</Text>
                </div>
            );
        }

        // Early return для пустого списка
        if (showEmptyMessage) {
            return (
                <div className="text-center">
                    <Text variant="body">У вас пока нет категорий. Создайте первую!</Text>
                </div>
            );
        }

        // Рендер списка категорий
        if (showList) {
            return (
                <>
                    {/* Десктопная таблица */}
                    <Table
                        data={categories}
                        columns={categoryColumns}
                        loading={loading}
                        emptyMessage="У вас пока нет категорий. Создайте первую!"
                        className="hidden md:table"
                    />

                    {/* Мобильный список карточек */}
                    <CategoriesCardList
                        className="block md:hidden"
                        categories={categories}
                        loading={loading}
                        handleEditClick={handleEditClick}
                        handleDeleteClick={handleDeleteClick}
                        defaultCategoryName={DEFAULT_CATEGORY_NAME}
                    />

                    {/* Индикатор фоновой загрузки */}
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
                {/* Заголовок страницы и кнопка "Добавить категорию" */}
                <div className="flex justify-between items-center">
                    <Text variant="h2">Категории расходов</Text>
                    <TextButton onClick={handleAddClick} disabled={loading}>
                        <Text variant="button">Добавить категорию</Text>
                    </TextButton>
                </div>

                {/* Отображаем общую ошибку из стора */}
                {displayError && modalType === null && (
                    <div className="mb-4 p-3 bg-red-100 border border-red-300 text-gray-800 rounded-md">
                        {displayError.message}
                    </div>
                )}

                {/* Основная область контента */}
                <div className="p-4">
                    {renderContent()}
                </div>
            </main>
        </div>
    );
}