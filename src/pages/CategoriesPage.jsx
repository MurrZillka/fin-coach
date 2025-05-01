import { useState } from 'react';
import { PencilIcon, TrashIcon } from '@heroicons/react/24/outline';
import TextButton from '../components/ui/TextButton';
import IconButton from '../components/ui/IconButton';
import Header from '../components/Header';

export default function CategoriesPage() {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [notification, setNotification] = useState(null);

    const categories = [
        { id: 1, name: 'Еда', description: 'Расходы на продукты' },
        { id: 2, name: 'Транспорт', description: 'Общественный транспорт' },
        { id: 3, name: 'Одежда', description: 'Покупка одежды' },
    ];

    const handleAddCategory = () => {
        setNotification({ type: 'success', message: 'Категория добавлена!' });
        setIsModalOpen(false);
        setTimeout(() => setNotification(null), 3000);
    };

    return (
        <div className="min-h-screen bg-secondary-50">
            <Header />

            <main className="max-w-7xl mx-auto p-4">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-semibold text-secondary-800">Категории</h2>
                    <TextButton onClick={() => setIsModalOpen(true)}>
                        Добавить категорию
                    </TextButton>
                </div>

                <div className="bg-background shadow-md rounded-md overflow-hidden">
                    <table className="min-w-full">
                        <thead className="bg-secondary-200">
                        <tr>
                            <th className="text-left p-4 text-secondary-800 font-semibold">ID</th>
                            <th className="text-left p-4 text-secondary-800 font-semibold">Название</th>
                            <th className="text-left p-4 text-secondary-800 font-semibold">Описание</th>
                            <th className="text-left p-4 text-secondary-800 font-semibold">Действия</th>
                        </tr>
                        </thead>
                        <tbody>
                        {categories.map((category, index) => (
                            <tr key={category.id} className={index % 2 === 0 ? 'bg-background' : 'bg-secondary-50'}>
                                <td className="p-4 text-secondary-800">{category.id}</td>
                                <td className="p-4 text-secondary-800">{category.name}</td>
                                <td className="p-4 text-secondary-500">{category.description}</td>
                                <td className="p-4 flex gap-2">
                                    <IconButton
                                        icon={PencilIcon}
                                        tooltip="Редактировать"
                                        className="text-primary-600 hover:bg-primary-600/10 hover:text-primary-500"
                                    />
                                    <IconButton
                                        icon={TrashIcon}
                                        tooltip="Удалить"
                                        className="text-accent-error hover:bg-accent-error/10 hover:text-accent-error/80"
                                    />
                                </td>
                            </tr>
                        ))}
                        </tbody>
                    </table>
                </div>
            </main>

            {isModalOpen && (
                <div className="fixed inset-0 bg-secondary-800 bg-opacity-50 flex items-center justify-center">
                    <div className="bg-background p-6 rounded-md shadow-md w-full max-w-md">
                        <h3 className="text-lg font-semibold text-secondary-800 mb-4">Добавить категорию</h3>
                        <form onSubmit={(e) => { e.preventDefault(); handleAddCategory(); }}>
                            <div className="mb-4">
                                <label className="block text-secondary-800 mb-1">Название</label>
                                <input
                                    type="text"
                                    className="w-full p-2 border border-secondary-200 rounded-md focus:outline-none focus:border-primary-600"
                                    placeholder="Название категории"
                                />
                            </div>
                            <div className="mb-4">
                                <label className="block text-secondary-800 mb-1">Описание</label>
                                <textarea
                                    className="w-full p-2 border border-secondary-200 rounded-md focus:outline-none focus:border-primary-600"
                                    placeholder="Описание категории"
                                />
                            </div>
                            <div className="flex justify-end gap-2">
                                <button
                                    type="button"
                                    onClick={() => setIsModalOpen(false)}
                                    className="px-4 py-2 text-secondary-500 hover:text-secondary-800"
                                >
                                    Отмена
                                </button>
                                <TextButton type="submit">
                                    Сохранить
                                </TextButton>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {notification && (
                <div className={`fixed bottom-4 right-4 p-4 rounded-md text-background ${
                    notification.type === 'success' ? 'bg-accent-success' : 'bg-accent-error'
                }`}>
                    {notification.message}
                </div>
            )}
        </div>
    );
}