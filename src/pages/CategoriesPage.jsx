// src/pages/CategoriesPage.jsx
import {useEffect} from 'react';
import {PencilIcon, TrashIcon} from '@heroicons/react/24/outline';
import TextButton from '../components/ui/TextButton';
import IconButton from '../components/ui/IconButton';
import Text from '../components/ui/Text';
import useCategoryStore from '../stores/categoryStore';
// --- УДАЛЯЕМ ЛОКАЛЬНЫЕ ИМПОРТЫ МОДАЛОВ, ТАК КАК ОНИ РЕНДЕРЯТСЯ ВЫШЕ ---
// import Modal from '../components/ui/Modal.jsx'; // Эти компоненты теперь импортируются в LayoutWithHeader
// import ConfirmModal from '../components/ui/ConfirmModal.jsx'; // Эти компоненты теперь импортируются в LayoutWithHeader
// --- Конец УДАЛЕНИЯ ---
// --- НОВЫЙ ИМПОРТ ---
import useModalStore from '../stores/modalStore.js'; // Импортируем стор модалов
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

    // --- УДАЛЯЕМ ЛОКАЛЬНОЕ СОСТОЯНИЕ МОДАЛОВ ---
    // Мы больше не управляем видимостью и данными модалов локально на этой странице
    // const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    // const [editCategory, setEditCategory] = useState(null);
    // const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
    // const [categoryToDeleteId, setCategoryToDeleteId] = useState(null);
    // --- Конец УДАЛЕНИЯ ---

    // --- ПОЛУЧАЕМ ДЕЙСТВИЕ ОТКРЫТИЯ/ЗАКРЫТИЯ МОДАЛА ИЗ СТОРА ---
    const {openModal, closeModal} = useModalStore(); // Получаем openModal и closeModal для использования
    // --- Конец ПОЛУЧЕНИЯ ДЕЙСТВИЯ ---


    useEffect(() => {
        // Вызываем fetchCategories только если данные еще не загружены (null) и загрузка не идет
        if (categories === null && !loading) {
            console.log('CategoriesPage: useEffect triggered, fetching categories.'); // Лог
            fetchCategories();
        } else {
            console.log('CategoriesPage: useEffect triggered, fetch skipped. Categories:', categories === null ? 'null' : 'loaded', 'Loading:', loading); // Лог
        }
        // clearError(); // Ошибка стора будет сброшена при размонтировании компонента ниже
    }, [fetchCategories, categories, loading]); // Добавлены зависимости


    // --- НОВЫЕ/ИЗМЕНЕННЫЕ ОБРАБОТЧИКИ КЛИКОВ (Используют openModal из стора) ---

    // Обработчик клика по кнопке "Добавить категорию"
    const handleAddClick = () => {
        clearError(); // Сбрасываем ошибку стора перед открытием нового модала
        // Вызываем действие openModal, указывая тип модала и необходимые пропсы для компонента Modal
        openModal('addCategory', {
            title: 'Добавить категорию',
            fields: categoryFields, // Передаем поля формы
            initialData: {}, // Начальные данные (пустой объект для добавления)
            onSubmit: handleAddSubmit, // Передаем функцию, которая обрабатывает отправку формы модала
            submitText: 'Добавить',
        });
        console.log('CategoriesPage: Add Category button clicked, openModal called.'); // Лог
    }

    // Обработчик клика по иконке "Редактировать"
    const handleEditClick = (category) => {
        clearError(); // Сбрасываем ошибку стора
        // Вызываем действие openModal, указывая тип модала и необходимые пропсы для компонента Modal
        openModal('editCategory', {
            title: 'Редактировать категорию',
            fields: categoryFields,
            initialData: category, // Передаем данные выбранной категории
            // Передаем функцию, которая будет вызвана при отправке формы редактирования
            // Захватываем category.id, чтобы знать, какую категорию обновлять
            onSubmit: (formData) => handleEditSubmit(category.id, formData),
            submitText: 'Сохранить изменения',
        });
        console.log('CategoriesPage: Edit button clicked for category ID:', category.id, ', openModal called.'); // Лог
    };

    // Обработчик клика по иконке "Удалить"
    const handleDeleteClick = (id) => {
        clearError(); // Сбрасываем ошибку стора

        // Находим название категории для сообщения в модале подтверждения
        // Это нужно сделать здесь, так как компонент ConfirmModal получит только сообщение и колбэк onConfirm
        // Добавлена проверка categories !== null перед find
        const category = categories !== null ? categories.find(cat => cat.id === id) : null;
        const categoryName = category ? category.name : 'эту категорию'; // Fallback текст, если категория не найдена (не должно случаться)

        // Вызываем действие openModal, указывая тип модала и необходимые пропсы для компонента ConfirmModal
        openModal('confirmDelete', {
            title: 'Подтверждение удаления',
            message: `Вы уверены, что хотите удалить "${categoryName}"?`, // Формируем сообщение с названием
            // Передаем функцию, которая будет вызвана при подтверждении удаления
            // Захватываем id, чтобы знать, какую категорию удалять
            onConfirm: () => handleDeleteConfirm(id),
            confirmText: 'Удалить',
        });
        console.log('CategoriesPage: Delete button clicked for category ID:', id, ', openModal called.'); // Лог
    };
    // --- Конец НОВЫХ/ИЗМЕНЕННЫХ ОБРАБОТЧИКОВ КЛИКОВ ---


    // --- НОВЫЕ ФУНКЦИИ ЛОГИКИ ПОСЛЕ ОТПРАВКИ/ПОДТВЕРЖДЕНИЯ (ВЫЗЫВАЮТСЯ ИЗ МОДАЛОВ ЧЕРЕЗ PROPS) ---
    // Эти функции выполняют основную логику (вызов стора категорий) и после успеха/ошибки
    // вызывают closeModal() из useModalStore.

    // Логика отправки формы ДОБАВЛЕНИЯ категории (вызывается из Modal через onSubmit)
    const handleAddSubmit = async (formData) => {
        console.log('CategoriesPage Logic: handleAddSubmit called with data:', formData); // Лог
        try {
            // Вызываем действие добавления из стора категорий
            await addCategory(formData);
            // Если успешно, закрываем модал через действие стора модалов
            closeModal();
            console.log('CategoriesPage Logic: addCategory successful, modal closed.'); // Лог

        } catch (err) {
            // Если при добавлении произошла ошибка (из стора категорий),
            // ошибка уже установлена в store.error и отобразится в LayoutWithHeader.
            // Мы также должны закрыть модал при ошибке.
            console.error('CategoriesPage Logic: Error during add category (after form submit):', err); // Лог ошибки
            closeModal(); // Закрываем модал при ошибке
            throw err; // Пробрасываем ошибку дальше (хотя она уже в сторе, для консистентности)
        }
        console.log('CategoriesPage Logic: handleAddSubmit finished.'); // Лог
    };

    // Логика отправки формы РЕДАКТИРОВАНИЯ категории (вызывается из Modal через onSubmit)
    const handleEditSubmit = async (id, formData) => {
        console.log(`CategoriesPage Logic: handleEditSubmit called for ID: ${id} with data:`, formData); // Лог
        try {
            // Вызываем действие обновления из стора категорий
            await updateCategory(id, formData);
            // Если успешно, закрываем модал
            closeModal();
            console.log(`CategoriesPage Logic: updateCategory ID ${id} successful, modal closed.`); // Лог

        } catch (err) {
            console.error(`CategoriesPage Logic: Error during edit category ID ${id} (after form submit):`, err); // Лог ошибки
            closeModal(); // Закрываем модал при ошибке
            throw err;
        }
        console.log(`CategoriesPage Logic: handleEditSubmit finished for ID: ${id}.`); // Лог
    };

    // Логика подтверждения УДАЛЕНИЯ категории (вызывается из ConfirmModal через onConfirm)
    const handleDeleteConfirm = async (id) => {
        console.log(`CategoriesPage Logic: handleDeleteConfirm called for ID: ${id}`); // Лог
        try {
            // Вызываем действие удаления из стора категорий
            await deleteCategory(id);
            // Если успешно, закрываем модал
            console.log(`CategoriesPage Logic: Категория ${id} успешно удалена.`); // Лог
            closeModal(); // Закрываем модал после успешного удаления

        } catch (err) {
            console.error(`CategoriesPage Logic: Error during delete category ID ${id} (after confirmation):`, err); // Лог ошибки
            closeModal(); // Закрываем модал при ошибке
            throw err;
        }
        console.log(`CategoriesPage Logic: handleDeleteConfirm finished for ID: ${id}.`); // Лог
    };
    // --- Конец НОВЫХ ФУНКЦИЙ ЛОГИКИ ---


    // useEffect для сброса ошибки стора при размонтировании компонента
    useEffect(() => {
        return () => {
            console.log('CategoriesPage: useEffect cleanup, clearing error.'); // Лог cleanup
            clearError();
        }
    }, [clearError]);

    // useMemo categoryNameToDelete больше не нужен, т.к. название формируется и передается в openModal

    // Отображаем только общую ошибку из стора (store.error).
    // Локальная ошибка модала больше не используется.
    const displayError = error;

    // Проверяем, идет ли первая загрузка (loading: true и categories: null)
    const isInitialLoading = loading && categories === null;
    // Проверяем, нужно ли показывать сообщение "нет категорий" (categories: не null, и пустой массив, и не идет фоновая загрузка)
    const showEmptyMessage = categories !== null && categories.length === 0 && !loading;
    // Проверяем, нужно ли показывать таблицу (categories: не null, и не пустой массив)
    const showTable = categories !== null && categories.length > 0;
    // Проверяем, идет ли фоновая загрузка (loading: true, но categories уже не null)
    const isBackgroundLoading = loading && categories !== null;


    return (
        <div className="bg-secondary-50">
            <main className="max-w-7xl mx-auto p-4">
                {/* Заголовок страницы и кнопка "Добавить категорию" */}
                <div className="flex justify-between items-center mb-4">
                    <Text variant="h2">Категории</Text>
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

                {/* Индикатор загрузки, сообщение об отсутствии категорий или таблица */}

                {/* Если идет первичная загрузка */}
                {isInitialLoading ? (
                    <div className="text-center p-4">
                        <Text variant="body">Загрузка категорий...</Text>
                    </div>
                ) : showEmptyMessage ? ( // Если не первичная загрузка, и нужно показать сообщение об отсутствии
                    // Сообщение, если нет категорий
                    <div className="bg-background shadow-md rounded-md overflow-hidden p-4 text-center">
                        <Text variant="body">У вас пока нет категорий. Создайте первую!</Text>
                    </div>
                ) : showTable ? ( // Если не первичная загрузка, не пусто, и нужно показать таблицу
                    // Таблица со списком категорий
                    <div className="bg-background shadow-md rounded-md overflow-hidden"> {/* Контейнер для таблицы */}
                        <table className="min-w-full">
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
                            {/* Можно безопасно мапить, т.к. showTable гарантирует categories !== null && categories.length > 0 */}
                            {categories.map((category, index) => (
                                <tr key={category.id}
                                    className={index % 2 === 0 ? 'bg-background' : 'bg-secondary-50'}>
                                    <td className="p-4"><Text variant="tdPrimary">{index + 1}</Text></td>
                                    <td className="p-4"><Text variant="tdPrimary">{category.name}</Text></td>
                                    <td className="p-4"><Text
                                        variant="tdSecondary">{category.description}</Text></td>
                                    <td className="p-4 flex gap-2">
                                        {/* Кнопка Редактировать - вызывает handleEditClick */}
                                        <IconButton
                                            icon={PencilIcon}
                                            tooltip="Редактировать"
                                            className="text-primary-600 hover:bg-primary-600/10 hover:text-primary-500"
                                            onClick={() => handleEditClick(category)} // Передаем всю категорию
                                        />
                                        {/* Кнопка Удалить - вызывает handleDeleteClick */}
                                        <IconButton
                                            icon={TrashIcon}
                                            tooltip="Удалить"
                                            className="text-accent-error hover:bg-accent-error/10 hover:text-accent-error/80"
                                            onClick={() => handleDeleteClick(category.id)} // Передаем ID
                                        />
                                    </td>
                                </tr>
                            ))}
                            </tbody>
                        </table>
                    </div>
                ) : null /* Ничего не рендерим, если ни одно из условий не выполнено */
                }

                {/* Если идет фоновая загрузка (обновление списка) */}
                {isBackgroundLoading && (
                    <div className="text-center p-4">
                        <Text variant="body">Обновление списка категорий...</Text> {/* Индикатор обновления */}
                    </div>
                )}


                {/* --- УДАЛЯЕМ РЕНДЕРИНГ МОДАЛОВ ОТСЮДА --- */}
                {/* Компоненты Modal и ConfirmModal теперь рендерятся в LayoutWithHeader.jsx */}
                {/* {isAddModalOpen && ( ... )} */}
                {/* {isConfirmModalOpen && ( ... )} */}
                {/* --- Конец УДАЛЕНИЯ --- */}

            </main>
        </div>
    );
}