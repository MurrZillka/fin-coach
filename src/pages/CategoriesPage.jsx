// src/pages/CategoriesPage.jsx
import { useState, useEffect } from 'react';
import { PencilIcon, TrashIcon } from '@heroicons/react/24/outline';
import TextButton from '../components/ui/TextButton';
import IconButton from '../components/ui/IconButton';
import Text from '../components/ui/Text';
import useCategoryStore from '../stores/categoryStore';
import CategoryModal from '../components/ui/CategoryModal';

export default function CategoriesPage() {
    const {
        categories,
        loading,
        error,
        fetchCategories,
        deleteCategory,
        clearError
    } = useCategoryStore();

    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [editCategory, setEditCategory] = useState(null);

    // Загружаем категории при монтировании компонента
    useEffect(() => {
        fetchCategories();
    }, [fetchCategories]);

    const handleEdit = (category) => {
        setEditCategory(category);
        setIsAddModalOpen(true);
    };

    const handleDelete = async (id) => {
        if (window.confirm('Вы уверены, что хотите удалить эту категорию?')) {
            try {
                await deleteCategory(id);
            } catch (err) {
                console.error('Ошибка при удалении категории:', err);

                // Ошибка уже обработана в store и доступна через error
            }
        }
    };

    // Сбрасываем ошибку при размонтировании
    useEffect(() => {
        return () => clearError();
    }, [clearError]);

    return (
        <div className="min-h-screen bg-secondary-50">
            <main className="max-w-7xl mx-auto p-4">
                <div className="flex justify-between items-center mb-4">
                    <Text variant="h2">Категории</Text>
                    <TextButton onClick={() => setIsAddModalOpen(true)}>
                        <Text variant="button">Добавить категорию</Text>
                    </TextButton>
                </div>

                {error && (
                    <div className="mb-4 p-3 bg-red-100 border border-red-300 text-gray-800 rounded-md">
                        {error.message}
                    </div>
                )}

                {loading ? (
                    <div className="text-center p-4">
                        <Text variant="body">Загрузка...</Text>
                    </div>
                ) : (
                    <div className="bg-background shadow-md rounded-md overflow-hidden">
                        {categories.length === 0 ? (
                            <div className="p-4 text-center">
                                <Text variant="body">У вас пока нет категорий. Создайте первую!</Text>
                            </div>
                        ) : (
                            <table className="min-w-full">
                                <thead className="bg-secondary-200">
                                <tr>
                                    <th className="text-left p-4">
                                        <Text variant="th">№</Text>
                                    </th>
                                    <th className="text-left p-4">
                                        <Text variant="th">Название</Text>
                                    </th>
                                    <th className="text-left p-4">
                                        <Text variant="th">Описание</Text>
                                    </th>
                                    <th className="text-left p-4">
                                        <Text variant="th">Действия</Text>
                                    </th>
                                </tr>
                                </thead>
                                <tbody>
                                {categories.map((category, index) => (
                                    <tr key={category.id} className={index % 2 === 0 ? 'bg-background' : 'bg-secondary-50'}>
                                        <td className="p-4">
                                            <Text variant="tdPrimary">{index + 1}</Text>
                                        </td>
                                        <td className="p-4">
                                            <Text variant="tdPrimary">{category.name}</Text>
                                        </td>
                                        <td className="p-4">
                                            <Text variant="tdSecondary">{category.description}</Text>
                                        </td>
                                        <td className="p-4 flex gap-2">
                                            <IconButton
                                                icon={PencilIcon}
                                                tooltip="Редактировать"
                                                className="text-primary-600 hover:bg-primary-600/10 hover:text-primary-500"
                                                onClick={() => handleEdit(category)}
                                            />
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
                        )}
                    </div>
                )}
                {isAddModalOpen && (
                    <CategoryModal
                        category={editCategory}
                        onClose={() => {
                            setIsAddModalOpen(false);
                            setEditCategory(null);
                        }}
                    />
                )}
            </main>
        </div>
    );
}