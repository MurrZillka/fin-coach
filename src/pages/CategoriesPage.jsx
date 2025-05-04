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
        fetchCategories();
        // clearError(); // Ошибка стора будет сброшена при размонтировании компонента ниже
    }, [fetchCategories]);


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
    };

    // Обработчик клика по иконке "Удалить"
    const handleDeleteClick = (id) => {
        clearError(); // Сбрасываем ошибку стора

        // Находим название категории для сообщения в модале подтверждения
        // Это нужно сделать здесь, так как компонент ConfirmModal получит только сообщение и колбэк onConfirm
        const category = categories.find(cat => cat.id === id);
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
    };
    // --- Конец НОВЫХ/ИЗМЕНЕННЫХ ОБРАБОТЧИКОВ КЛИКОВ ---


    // --- НОВЫЕ ФУНКЦИИ ЛОГИКИ ПОСЛЕ ОТПРАВКИ/ПОДТВЕРЖДЕНИЯ (ВЫЗЫВАЮТСЯ ИЗ МОДАЛОВ ЧЕРЕЗ PROPS) ---
    // Эти функции выполняют основную логику (вызов стора категорий) и после успеха/ошибки
    // вызывают closeModal() из useModalStore.

    // Логика отправки формы ДОБАВЛЕНИЯ категории (вызывается из Modal через onSubmit)
    const handleAddSubmit = async (formData) => {
        try {
            // Вызываем действие добавления из стора категорий
            await addCategory(formData);
            // Если успешно, закрываем модал через действие стора модалов
            closeModal();

        } catch (err) {
            // Если при добавлении произошла ошибка (из стора категорий),
            // ошибка уже установлена в store.error и отобразится в LayoutWithHeader.
            // Мы также должны закрыть модал при ошибке.
            console.error('Ошибка при добавлении категории (после отправки формы):', err);
            closeModal(); // Закрываем модал при ошибке
            throw err; // Пробрасываем ошибку дальше (хотя она уже в сторе, для консистентности)
        }
    };

    // Логика отправки формы РЕДАКТИРОВАНИЯ категории (вызывается из Modal через onSubmit)
    const handleEditSubmit = async (id, formData) => {
        try {
            // Вызываем действие обновления из стора категорий
            await updateCategory(id, formData);
            // Если успешно, закрываем модал
            closeModal();

        } catch (err) {
            console.error('Ошибка при редактировании категории (после отправки формы):', err);
            closeModal(); // Закрываем модал при ошибке
            throw err;
        }
    };

    // Логика подтверждения УДАЛЕНИЯ категории (вызывается из ConfirmModal через onConfirm)
    const handleDeleteConfirm = async (id) => {
        try {
            // Вызываем действие удаления из стора категорий
            await deleteCategory(id);
            // Если успешно, закрываем модал
            console.log(`Логика: Категория ${id} успешно удалена.`);
            closeModal(); // Закрываем модал после успешного удаления

        } catch (err) {
            console.error('Ошибка при удалении категории (после подтверждения):', err);
            closeModal(); // Закрываем модал при ошибке
            throw err;
        }
    };
    // --- Конец НОВЫХ ФУНКЦИЙ ЛОГИКИ ---


    // useEffect для сброса ошибки стора при размонтировании компонента
    useEffect(() => {
        return () => clearError();
    }, [clearError]);

    // useMemo categoryNameToDelete больше не нужен, т.к. название формируется и передается в openModal

    // Отображаем только общую ошибку из стора (store.error).
    // Локальная ошибка модала больше не используется.
    const displayError = error;


    return (
        <div className="bg-secondary-50">
            <main className="max-w-7xl mx-auto p-4">
                {/* Заголовок страницы и кнопка "Добавить категорию" */}
                <div className="flex justify-between items-center mb-4">
                    <Text variant="h2">Категории</Text>
                    {/* Кнопка теперь вызывает handleAddClick */}
                    <TextButton onClick={handleAddClick}>
                        <Text variant="button">Добавить категорию</Text>
                    </TextButton>
                </div>

                {/* Отображаем общую ошибку из стора */}
                {displayError && (
                    <div className="mb-4 p-3 bg-red-100 border border-red-300 text-gray-800 rounded-md">
                        {displayError.message}
                    </div>
                )}

                {/* Индикатор загрузки или контент страницы */}
                {/* Показываем загрузку, если стор загружается И у нас еще нет категорий */}
                {loading && categories.length === 0 ? (
                    <div className="text-center p-4">
                        <Text variant="body">Загрузка...</Text>
                    </div>
                ) : (
                    // Контейнер для таблицы или сообщения об отсутствии категорий
                    <div className="bg-background shadow-md rounded-md overflow-hidden">
                        {/* ИСПРАВЛЕНА СИНТАКСИЧЕСКАЯ ОШИБКА ЗДЕСЬ */}
                        {categories.length === 0 && !loading ? (
                            // Сообщение, если нет категорий
                            <div className="p-4 text-center">
                                <Text variant="body">У вас пока нет категорий. Создайте первую!</Text>
                            </div>
                        ) : (
                            // Таблица со списком категорий (показываем только если есть категории)
                            categories.length > 0 && (
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
                            )
                        )}
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