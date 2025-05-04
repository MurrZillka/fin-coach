// src/pages/CategoriesPage.jsx
import {useState, useEffect, useMemo} from 'react';
import {PencilIcon, TrashIcon} from '@heroicons/react/24/outline';
import TextButton from '../components/ui/TextButton';
import IconButton from '../components/ui/IconButton';
import Text from '../components/ui/Text';
// Импортируем обновленный стор категорий
import useCategoryStore from '../stores/categoryStore';
// Импортируем универсальный компонент модального окна формы
import Modal from '../components/ui/Modal.jsx';
// Импортируем новый компонент модального окна подтверждения
import ConfirmModal from '../components/ui/ConfirmModal.jsx';


// Определяем структуру полей для формы категории.
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
    // Получаем состояние и действия из стора категорий
    const {
        categories, // Список категорий
        loading, // Статус загрузки (из стора)
        error, // Ошибка (из стора)
        fetchCategories, // Действие загрузки категорий
        deleteCategory, // Действие удаления категории
        addCategory, // Действие добавления категории
        updateCategory, // Действие обновления категории
        clearError // Действие сброса ошибки в сторе
    } = useCategoryStore();

    // --- СОСТОЯНИЕ ДЛЯ Modal (добавление/редактирование) ---
    const [isAddModalOpen, setIsAddModalOpen] = useState(false); // Открыт ли модал добавления/редактирования
    const [editCategory, setEditCategory] = useState(null); // Данные категории для редактирования (null для добавления)
    // const [modalError, setModalError] = useState(null); // Локальная ошибка модала форм - БОЛЬШЕ НЕ НУЖНА ДЛЯ ОТОБРАЖЕНИЯ ВВЕРХУ
    // --- Конец СОСТОЯНИЯ ДЛЯ Modal ---

    // --- СОСТОЯНИЕ ДЛЯ ConfirmModal (подтверждение удаления) ---
    const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false); // Открыт ли модал подтверждения
    const [categoryToDeleteId, setCategoryToDeleteId] = useState(null); // ID категории для удаления
    // --- Конец СОСТОЯНИЯ ДЛЯ ConfirmModal ---


    // useEffect для первоначальной загрузки категорий при монтировании компонента
    useEffect(() => {
        fetchCategories();
    }, [fetchCategories]);


    // Обработчик клика по кнопке "Добавить категорию"
    const handleAdd = () => {
        setEditCategory(null); // Устанавливаем null, чтобы модал открылся в режиме добавления
        setIsAddModalOpen(true); // Открываем модал
        // setModalError(null); // Очищаем локальную ошибку модала (она больше не используется для отображения вверху)
        clearError(); // Сбрасываем общую ошибку стора
    }

    // Обработчик клика по иконке "Редактировать"
    const handleEdit = (category) => {
        setEditCategory(category); // Устанавливаем данные категории для редактирования
        setIsAddModalOpen(true); // Открываем модал
        // setModalError(null); // Очищаем локальную ошибку модала
        clearError(); // Сбрасываем общую ошибку стора
    };

    // --- ОБРАБОТЧИК КЛИКА ПО ИКОНКЕ "Удалить" ---
    const handleDelete = (id) => {
        setCategoryToDeleteId(id); // Сохраняем ID категории
        setIsConfirmModalOpen(true); // Открываем модал подтверждения
        clearError(); // Сбрасываем общую ошибку стора
    };
    // --- Конец ИЗМЕНЕННОГО ОБРАБОТЧИКА ---


    // --- ОБРАБОТЧИК: Подтверждение удаления в ConfirmModal ---
    const handleConfirmDelete = async () => {
        if (categoryToDeleteId === null) return;

        // Закрываем модал подтверждения сразу при клике на "Удалить"
        setIsConfirmModalOpen(false);

        try {
            await deleteCategory(categoryToDeleteId);

            // Если удаление успешно, сбрасываем ID для удаления
            setCategoryToDeleteId(null);

        } catch (err) {
            // Если deleteCategory выбросил ошибку, она уже в store.error
            console.error('Ошибка при удалении категории (из ConfirmModal):', err);
            // При ошибке модал уже закрыт, ID сбрасываем.
            setCategoryToDeleteId(null);
            // Ошибка из стора будет отображена в displayError вверху страницы.
        }
    };
    // --- Конец ОБРАБОТЧИКА ПОДТВЕРЖДЕНИЯ ---

    // --- ОБРАБОТЧИК: Отмена удаления в ConfirmModal ---
    const handleCancelDelete = () => {
        setIsConfirmModalOpen(false);
        setCategoryToDeleteId(null);
        clearError(); // Сбрасываем общую ошибку стора при отмене
    };
    // --- Конец ОБРАБОТЧИКА ОТМЕНЫ ---


    // --- ОБРАБОТЧИК: Отправка формы в Modal (добавление/редактирование) ---
    const handleModalSubmit = async (formData) => {
        // formData - это данные из формы модала { name: ..., description: ... }

        // setModalError(null); // Эта локальная ошибка больше не используется для отображения вверху
        clearError(); // Сбрасываем общую ошибку стора перед новой попыткой

        try {
            if (editCategory) {
                // Режим редактирования
                await updateCategory(editCategory.id, formData);
            } else {
                // Режим добавления
                await addCategory(formData);
            }

            // Если вызов API успешен (не выбросил ошибку), закрываем модальное окно формы
            setIsAddModalOpen(false);
            setEditCategory(null); // Сбрасываем категорию для редактирования

        } catch (err) {
            // Если addCategory или updateCategory выбросили ошибку (из стора)
            // Ошибка из стора уже доступна через store.error и отобразится вверху страницы.
            console.error('Ошибка при добавлении/обновлении категории:', err);

            // --- ИЗМЕНЕНИЕ: Закрываем модал при ошибке ---
            setIsAddModalOpen(false);
            setEditCategory(null); // Сбрасываем категорию для редактирования даже при ошибке
            // --- Конец ИЗМЕНЕНИЯ ---

            // Ошибка из стора (store.error) будет отображена в displayError вверху страницы.
            // setModalError(err.error || { message: 'Произошла ошибка при сохранении категории.' }); // Эта локальная ошибка больше не нужна
        }
    };
    // --- Конец ОБРАБОТЧИКА Modal ---


    // useEffect для сброса ошибки стора при размонтировании компонента
    useEffect(() => {
        return () => clearError();
    }, [clearError]);

    // Отображаем только общую ошибку из стора (store.error).
    // Локальная ошибка модала больше не используется для отображения вверху.
    const displayError = error;

    // Находим название категории для сообщения в ConfirmModal. Используем useMemo для оптимизации.
    const categoryNameToDelete = useMemo(() => {
        return categories.find(cat => cat.id === categoryToDeleteId)?.name;
    }, [categories, categoryToDeleteId]);


    return (
        <div className="min-h-screen bg-secondary-50">
            <main className="max-w-7xl mx-auto p-4">
                {/* Заголовок страницы и кнопка "Добавить категорию" */}
                <div className="flex justify-between items-center mb-4">
                    <Text variant="h2">Категории</Text>
                    <TextButton onClick={handleAdd}>
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
                                                {/* Кнопка Редактировать - открывает Modal в режиме редактирования */}
                                                <IconButton
                                                    icon={PencilIcon}
                                                    tooltip="Редактировать"
                                                    className="text-primary-600 hover:bg-primary-600/10 hover:text-primary-500"
                                                    onClick={() => handleEdit(category)}
                                                />
                                                {/* Кнопка Удалить - открывает ConfirmModal */}
                                                <IconButton
                                                    icon={TrashIcon}
                                                    tooltip="Удалить"
                                                    className="text-accent-error hover:bg-accent-error/10 hover:text-accent-error/80"
                                                    onClick={() => handleDelete(category.id)}
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

                {isAddModalOpen && (
                    <Modal
                        isOpen={isAddModalOpen}
                        onClose={() => {
                            setIsAddModalOpen(false);
                            setEditCategory(null);
                            // setModalError(null); // Локальная ошибка модала форм больше не нужна для отображения вверху
                            clearError(); // Сбрасываем общую ошибку стора
                        }}
                        title={editCategory ? 'Редактировать категорию' : 'Добавить категорию'}
                        fields={categoryFields}
                        initialData={editCategory || {}}
                        onSubmit={handleModalSubmit}
                        submitText={editCategory ? 'Сохранить изменения' : 'Добавить'}
                    />
                )}

                {isConfirmModalOpen && (
                    <ConfirmModal
                        isOpen={isConfirmModalOpen}
                        onClose={handleCancelDelete}
                        onConfirm={handleConfirmDelete}
                        title="Подтверждение удаления"
                        message={`Вы уверены, что хотите удалить категорию "${categoryNameToDelete || ''}"?`}
                        confirmText="Удалить"
                    />
                )}

            </main>
        </div>
    );
}