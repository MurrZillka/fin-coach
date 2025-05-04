// src/pages/CategoriesPage.jsx
import { useState, useEffect, useMemo } from 'react'; // Добавил useMemo для оптимизации, если нужно
import { PencilIcon, TrashIcon } from '@heroicons/react/24/outline'; // Иконки для действий
import TextButton from '../components/ui/TextButton'; // Кнопка с текстом
import IconButton from '../components/ui/IconButton'; // Кнопка с иконкой
import Text from '../components/ui/Text'; // Компонент для типографики
// Импортируем обновленный стор категорий
import useCategoryStore from '../stores/categoryStore';
// Импортируем универсальный компонент модального окна формы
import Modal from '../components/ui/Modal.jsx';
// Импортируем новый компонент модального окна подтверждения
import ConfirmModal from '../components/ui/ConfirmModal.jsx';


// Определяем структуру полей для формы категории.
// Вынесено вне компонента, так как не зависит от пропсов или состояния компонента.
const categoryFields = [
    { name: 'name', label: 'Название', required: true, type: 'text', placeholder: 'Например: Еда' },
    { name: 'description', label: 'Описание', required: false, type: 'text', placeholder: 'Необязательно: на что тратится категория' },
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
    const [modalError, setModalError] = useState(null); // Локальная ошибка формы в модале (если нужна)
    // --- Конец СОСТОЯНИЯ ДЛЯ Modal ---

    // --- СОСТОЯНИЕ ДЛЯ ConfirmModal (подтверждение удаления) ---
    const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false); // Открыт ли модал подтверждения
    const [categoryToDeleteId, setCategoryToDeleteId] = useState(null); // ID категории для удаления
    // --- Конец СОСТОЯНИЯ ДЛЯ ConfirmModal ---


    // useEffect для первоначальной загрузки категорий при монтировании компонента
    useEffect(() => {
        fetchCategories();
        // Зависимости: fetchCategories из стора. React рекомендует включать функции из хуков.
    }, [fetchCategories]);


    // Обработчик клика по кнопке "Добавить категорию"
    const handleAdd = () => {
        setEditCategory(null); // Устанавливаем null, чтобы модал открылся в режиме добавления
        setIsAddModalOpen(true); // Открываем модал
        setModalError(null); // Очищаем локальную ошибку модала при открытии
    }

    // Обработчик клика по иконке "Редактировать"
    const handleEdit = (category) => {
        setEditCategory(category); // Устанавливаем данные категории для редактирования
        setIsAddModalOpen(true); // Открываем модал
        setModalError(null); // Очищаем локальную ошибку модала при открытии
    };

    // --- ИЗМЕНЕННЫЙ ОБРАБОТЧИК КЛИКА ПО ИКОНКЕ "Удалить" ---
    const handleDelete = (id) => {
        // Вместо window.confirm, сохраняем ID и открываем ConfirmModal
        setCategoryToDeleteId(id); // Сохраняем ID категории, которую хотим удалить
        setIsConfirmModalOpen(true); // Открываем модал подтверждения
    };
    // --- Конец ИЗМЕНЕННОГО ОБРАБОТЧИКА ---


    // --- НОВЫЙ ОБРАБОТЧИК: Подтверждение удаления в ConfirmModal ---
    const handleConfirmDelete = async () => {
        if (categoryToDeleteId === null) return; // Проверяем, что ID для удаления установлен

        // Закрываем модал подтверждения сразу или после успешного удаления, в зависимости от UX.
        // Давайте закроем сразу, чтобы пользователь не ждал с открытым модалом.
        setIsConfirmModalOpen(false);
        // setCategoryToDeleteId(null); // Сбросим после вызова стора

        try {
            // Вызываем действие удаления из стора.
            // Стор сам обрабатывает loading/error и перезагружает список.
            await deleteCategory(categoryToDeleteId);

            // Если удаление успешно в сторе, то список обновится.
            // Сброс ID для удаления после успешного вызова стора.
            setCategoryToDeleteId(null);

        } catch (err) {
            // Если deleteCategory выбросил ошибку (например, из-за проблем с сетью или API)
            console.error('Ошибка при удалении категории (из ConfirmModal):', err);
            // Ошибка уже должна быть установлена в store.error и отобразится вверху страницы.
            // Можно добавить локальную обработку, если нужно (например, setModalError)
            // Но для простоты отображаем только общую ошибку из стора.
            setCategoryToDeleteId(null); // Сбрасываем ID даже при ошибке
        }
    };
    // --- Конец НОВОГО ОБРАБОТЧИКА ПОДТВЕРЖДЕНИЯ ---

    // --- НОВЫЙ ОБРАБОТЧИК: Отмена удаления в ConfirmModal ---
    const handleCancelDelete = () => {
        setIsConfirmModalOpen(false); // Закрываем модал подтверждения
        setCategoryToDeleteId(null); // Сбрасываем ID для удаления
    };
    // --- Конец НОВОГО ОБРАБОТЧИКА ОТМЕНЫ ---


    // --- ОБРАБОТЧИК: Отправка формы в Modal (добавление/редактирование) ---
    const handleModalSubmit = async (formData) => {
        // formData - это данные из формы модала { name: ..., description: ... }

        setModalError(null); // Сбрасываем предыдущую локальную ошибку модала форм

        try {
            if (editCategory) {
                // Режим редактирования
                // updateCategory ожидает id и данные. Стор сам обрабатывает токен, loading, error и перезагружает список.
                await updateCategory(editCategory.id, formData);
            } else {
                // Режим добавления
                // addCategory ожидает данные. Стор сам обрабатывает токен, loading, error и перезагружает список.
                await addCategory(formData);
            }

            // Если вызов API успешен (не выбросил ошибку), закрываем модальное окно формы
            setIsAddModalOpen(false);
            setEditCategory(null); // Сбрасываем категорию для редактирования

        } catch (err) {
            // Если addCategory или updateCategory выбросили ошибку (из стора)
            console.error('Ошибка при добавлении/обновлении категории:', err);
            // Ошибка из стора уже доступна через store.error и отобразится вверху страницы.
            // Можно установить локальную ошибку модала, если нужно показывать ее прямо в модале.
            setModalError(err.error || { message: 'Произошла ошибка при сохранении категории.' }); // Используем ошибку из стора, если она есть
            // Оставляем модал открытым, чтобы пользователь мог исправить данные
        }
    };
    // --- Конец ОБРАБОТЧИКА Modal ---


    // useEffect для сброса ошибки стора при размонтировании компонента
    useEffect(() => {
        // Эта очистка относится к ошибке из стора (store.error)
        return () => clearError();
    }, [clearError]);

    // Объединяем ошибки из стора и локальную ошибку модала форм для отображения
    // Если есть ошибка в сторе, показываем ее. Иначе, если есть локальная ошибка модала форм, показываем ее.
    const displayError = error || modalError;

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
                    {/* Кнопка открывает модал в режиме добавления */}
                    <TextButton onClick={handleAdd}>
                        <Text variant="button">Добавить категорию</Text>
                    </TextButton>
                </div>

                {/* Отображаем общую ошибку (из стора или локальную ошибку модала форм) */}
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
                        {categories.length === 0 ? (
                            // Сообщение, если нет категорий (отобразится, если загрузка завершена и список пуст)
                            <div className="p-4 text-center">
                                <Text variant="body">У вас пока нет категорий. Создайте первую!</Text>
                            </div>
                        ) : (
                            // Таблица со списком категорий
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
                                    <tr key={category.id} className={index % 2 === 0 ? 'bg-background' : 'bg-secondary-50'}>
                                        <td className="p-4"><Text variant="tdPrimary">{index + 1}</Text></td>
                                        <td className="p-4"><Text variant="tdPrimary">{category.name}</Text></td>
                                        <td className="p-4"><Text variant="tdSecondary">{category.description}</Text></td>
                                        <td className="p-4 flex gap-2">
                                            {/* Кнопка Редактировать - открывает Modal в режиме редактирования */}
                                            <IconButton
                                                icon={PencilIcon}
                                                tooltip="Редактировать"
                                                className="text-primary-600 hover:bg-primary-600/10 hover:text-primary-500"
                                                onClick={() => handleEdit(category)} // Передаем всю категорию в обработчик
                                            />
                                            {/* Кнопка Удалить - открывает ConfirmModal */}
                                            <IconButton
                                                icon={TrashIcon}
                                                tooltip="Удалить"
                                                className="text-accent-error hover:bg-accent-error/10 hover:text-accent-error/80"
                                                onClick={() => handleDelete(category.id)} // Передаем ID в обработчик удаления
                                            />
                                        </td>
                                    </tr>
                                ))}
                                </tbody>
                            </table>
                        )}
                    </div>
                )}


                {/* Рендер Modal для добавления/редактирования */}
                {isAddModalOpen && (
                    <Modal
                        isOpen={isAddModalOpen} // Состояние видимости
                        onClose={() => { // Обработчик закрытия (при клике на Отмена или после успешной отправки)
                            setIsAddModalOpen(false); // Закрываем модал форм
                            setEditCategory(null); // Сбрасываем категорию для редактирования
                            setModalError(null); // Очищаем локальную ошибку модала форм
                        }}
                        // Заголовок модала зависит от того, редактируем мы или добавляем
                        title={editCategory ? 'Редактировать категорию' : 'Добавить категорию'}
                        fields={categoryFields} // Передаем описание полей формы
                        // Передаем начальные данные для формы (для редактирования - данные категории, для добавления - пустой объект)
                        initialData={editCategory || {}}
                        // Передаем функцию, которая будет вызвана при отправке формы модала
                        onSubmit={handleModalSubmit}
                        // Текст кнопки отправки также зависит от режима
                        submitText={editCategory ? 'Сохранить изменения' : 'Добавить'}
                    />
                )}


                {/* --- НОВЫЙ РЕНДЕР ConfirmModal для подтверждения удаления --- */}
                {isConfirmModalOpen && (
                    <ConfirmModal
                        isOpen={isConfirmModalOpen} // Состояние видимости ConfirmModal
                        onClose={handleCancelDelete} // Обработчик для кнопки "Отмена"
                        onConfirm={handleConfirmDelete} // Обработчик для кнопки "Удалить"
                        title="Подтверждение удаления" // Заголовок ConfirmModal
                        // Сообщение для ConfirmModal, включающее название удаляемой категории
                        message={`Вы уверены, что хотите удалить категорию "${categoryNameToDelete || ''}"?`}
                        confirmText="Удалить" // Текст на кнопке подтверждения
                    />
                )}
                {/* --- Конец НОВОГО РЕНДЕРА ConfirmModal --- */}

            </main>
        </div>
    );
}