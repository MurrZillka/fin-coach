// src/pages/CategoriesPage.jsx
import {useEffect} from 'react';
import {PencilIcon, TrashIcon} from '@heroicons/react/24/outline';
import TextButton from '../components/ui/TextButton';
import IconButton from '../components/ui/IconButton';
import Text from '../components/ui/Text';
import useCategoryStore from '../stores/categoryStore';
import useModalStore from '../stores/modalStore.js';
// --- НОВЫЙ ИМПОРТ: Мобильный компонент для карточек категорий ---
import CategoriesCardList from '../components/CategoriesCardList';
// --- Конец НОВОГО ИМПОРТА ---


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
        fetchCategories,
        deleteCategory,
        addCategory,
        updateCategory,
        clearError
    } = useCategoryStore();

    const {openModal, closeModal} = useModalStore();


    useEffect(() => {
        if (categories === null && !loading) {
            // console.log('CategoriesPage: useEffect triggered, fetching categories.');
            fetchCategories();
        } else {
            // console.log('CategoriesPage: useEffect triggered, fetch skipped. Categories:', categories === null ? 'null' : 'loaded', 'Loading:', loading);
        }
    }, [fetchCategories, categories, loading]);


    const handleAddClick = () => {
        clearError();
        openModal('addCategory', {
            title: 'Добавить категорию',
            fields: categoryFields,
            initialData: {},
            onSubmit: handleAddSubmit,
            submitText: 'Добавить',
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
        });
        // console.log('CategoriesPage: Edit button clicked for category ID:', category.id, ', openModal called.');
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
        // console.log('CategoriesPage: Delete button clicked for category ID:', id, ', openModal called.');
    };


    const handleAddSubmit = async (formData) => {
        // console.log('CategoriesPage Logic: handleAddSubmit called with data:', formData);
        try {
            await addCategory(formData);
            closeModal();
            // console.log('CategoriesPage Logic: addCategory successful, modal closed.');
        } catch (err) {
            console.error('CategoriesPage Logic: Error during add category (after form submit):', err);
            closeModal();
            throw err;
        }
        // console.log('CategoriesPage Logic: handleAddSubmit finished.');
    };

    const handleEditSubmit = async (id, formData) => {
        // console.log(`CategoriesPage Logic: handleEditSubmit called for ID: ${id} with data:`, formData);
        try {
            await updateCategory(id, formData);
            closeModal();
            // console.log(`CategoriesPage Logic: updateCategory ID ${id} successful, modal closed.`);
        } catch (err) {
            console.error(`CategoriesPage Logic: Error during edit category ID ${id} (after form submit):', err);`);
            closeModal();
            throw err;
        }
        // console.log(`CategoriesPage Logic: handleEditSubmit finished for ID: ${id}.`);
    };

    const handleDeleteConfirm = async (id) => {
        // console.log(`CategoriesPage Logic: handleDeleteConfirm called for ID: ${id}`);
        try {
            await deleteCategory(id);
            // console.log(`CategoriesPage Logic: Категория ${id} успешно удалена.`);
            closeModal();
        } catch (err) {
            console.error(`CategoriesPage Logic: Error during delete category ID ${id} (after confirmation):', err);`);
            closeModal();
            throw err;
        }
        // console.log(`CategoriesPage Logic: handleDeleteConfirm finished for ID: ${id}.`);
    };

    useEffect(() => {
        return () => {
            // console.log('CategoriesPage: useEffect cleanup, clearing error.');
            clearError();
        }
    }, [clearError]);

    const displayError = error;

    // Проверяем, идет ли первая загрузка (loading: true и categories: null)
    const isInitialLoading = loading && categories === null;
    // Проверяем, нужно ли показывать сообщение "нет категорий" (categories: не null, и пустой массив, и не идет фоновая загрузка)
    const showEmptyMessage = categories !== null && categories.length === 0 && !loading;
    // Проверяем, нужно ли показывать список (таблицу или карточки) (categories: не null, и не пустой массив)
    const showList = categories !== null && categories.length > 0;
    // Проверяем, идет ли фоновая загрузка (loading: true, но categories уже не null)
    const isBackgroundLoading = loading && categories !== null;

    return (
        <div className="bg-secondary-50">
            <main className="max-w-7xl mx-auto p-4">
                {/* Заголовок страницы и кнопка "Добавить категорию" */}
                <div className="flex justify-between items-center">
                    <Text variant="h2">Категории расходов</Text>
                    {/* Кнопка теперь вызывает handleAddClick */}
                    {/* Отключаем кнопку, если идет загрузка (первичная или фоновая) */}
                    <TextButton onClick={handleAddClick} disabled={loading}>
                        <Text variant="button">Добавить категорию</Text>
                    </TextButton>
                </div>

                {/* Отображаем общую ошибку из стора */}
                {displayError && (
                    <div className="mb-4 p-3 bg-red-100 border border-red-300 text-gray-800 rounded-md">
                        {displayError.message}
                    </div>
                )}

                {/* Основная область контента: Индикатор загрузки, сообщение об отсутствии или список (таблица/карточки) */}

                {/* Если идет первичная загрузка */}
                {isInitialLoading ? (
                    <div className="text-center p-4">
                        <Text variant="body">Загрузка категорий...</Text>
                    </div>
                ) : (
                    // Контейнер для списка категорий (Таблица на десктопе, Карточки на мобильных)
                    // Убраны фоновые стили, остается только padding
                    <div className="p-4"> {/* Этот div теперь просто контейнер с внутренним отступом */}
                        {/* Если категории загружены и список не пуст */}
                        {showList && (
                            <>
                                {/* Десктопная Таблица (скрыта на мобильных) */}
                                <table className="min-w-full hidden md:table">
                                    <thead className="bg-secondary-200">
                                    <tr>
                                        <th className="text-left p-4"><Text variant="th">№</Text></th>
                                        <th className="text-left p-4"><Text variant="th">Название</Text></th>
                                        <th className="text-left p-4"><Text variant="th">Описание</Text></th>
                                        <th className="text-left p-4"><Text variant="th">Действия</Text></th>
                                    </tr>
                                    </thead>
                                    <tbody>
                                    {/* Маппинг по категориям для создания строк таблицы */}
                                    {/* Убраны пробелы между <td> */}
                                    {categories.map((category, index) => (
                                        <tr key={category.id}
                                            className={index % 2 === 0 ? 'bg-background' : 'bg-secondary-50'}>
                                            <td className="p-4"><Text variant="tdPrimary">{index + 1}</Text></td><td className="p-4"><Text variant="tdPrimary">{category.name}</Text></td><td className="p-4"><Text
                                            variant="tdSecondary">{category.description}</Text></td><td className="px-2 py-4 flex gap-1"> {/* Отступы и зазор как в финальной SpendingTable Actions */}
                                            <IconButton
                                                icon={PencilIcon}
                                                tooltip="Редактировать"
                                                className="p-1 text-primary-600 hover:bg-primary-600/10 hover:text-primary-500"
                                                onClick={() => handleEditClick(category)}
                                            />
                                            <IconButton
                                                icon={TrashIcon}
                                                tooltip="Удалить"
                                                className="p-1 text-accent-error hover:bg-accent-error/10 hover:text-accent-error/80"
                                                onClick={() => handleDeleteClick(category.id)}
                                            />
                                        </td>
                                        </tr>
                                    ))}
                                    </tbody>
                                </table>

                                {/* Мобильный список карточек (скрыт на десктопах) */}
                                <CategoriesCardList
                                    className="block md:hidden"
                                    categories={categories}
                                    loading={loading} // Передаем статус загрузки для индикатора обновления внутри
                                    handleEditClick={handleEditClick}
                                    handleDeleteClick={handleDeleteClick}
                                />
                            </>
                        )}

                        {/* Сообщение об отсутствии категорий */}
                        {showEmptyMessage && (
                            <div className="text-center"> {/* Без p-4, т.к. внешний div уже имеет p-4 */}
                                <Text variant="body">У вас пока нет категорий. Создайте первую!</Text>
                            </div>
                        )}

                        {/* Индикатор фоновой загрузки (обновление списка) */}
                        {isBackgroundLoading && (
                            <div className="text-center mt-4"> {/* Добавлен отступ сверху mt-4 */}
                                <Text variant="body">Обновление списка категорий...</Text> {/* Индикатор обновления */}
                            </div>
                        )}
                    </div>
                )}

                {/* Модальные окна теперь рендерятся в LayoutWithHeader */}

            </main>
        </div>
    );
}