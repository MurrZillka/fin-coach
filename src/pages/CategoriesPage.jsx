import { useState } from 'react';
import { PencilIcon, TrashIcon } from '@heroicons/react/24/outline';

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
            {/* Хедер */}
            <header className="bg-secondary-800 text-background p-4 shadow-md">
                <div className="max-w-7xl mx-auto flex justify-between items-center">
                    <h1 className="text-2xl font-semibold">Financial Coach</h1>
                    <nav>
                        <a href="#" className="text-secondary-200 hover:text-primary-500 mx-4">Главная</a>
                        <a href="#" className="text-secondary-200 hover:text-primary-500 mx-4">Категории</a>
                        <a href="#" className="text-secondary-200 hover:text-primary-500 mx-4">Баланс</a>
                    </nav>
                </div>
            </header>

            {/* Основной контент */}
            <main className="max-w-7xl mx-auto p-4">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-semibold text-secondary-800">Категории</h2>
                    <button
                        onClick={() => setIsModalOpen(true)}
                        className="bg-primary-600 text-background px-4 py-2 rounded-md hover:bg-primary-500 transition"
                    >
                        Добавить категорию
                    </button>
                </div>

                {/* Таблица */}
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
                                    <button
                                        className="p-2 rounded-md text-primary-600 hover:bg-primary-100 hover:text-primary-500 cursor-pointer transition"
                                        title="Редактировать"
                                    >
                                        <PencilIcon className="w-5 h-5" />
                                    </button>
                                    <button
                                        className="p-2 rounded-md text-accent-error hover:bg-accent-error/10 hover:text-accent-error/80 cursor-pointer transition"
                                        title="Удалить"
                                    >
                                        <TrashIcon className="w-5 h-5" />
                                    </button>
                                </td>
                            </tr>
                        ))}
                        </tbody>
                    </table>
                </div>
            </main>

            {/* Модальное окно */}
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
                                <button
                                    type="submit"
                                    className="px-4 py-2 bg-primary-600 text-background rounded-md hover:bg-primary-500"
                                >
                                    Сохранить
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Уведомление */}
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