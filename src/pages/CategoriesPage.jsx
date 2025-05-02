import {PencilIcon, TrashIcon} from '@heroicons/react/24/outline';
import TextButton from '../components/ui/TextButton';
import IconButton from '../components/ui/IconButton';
import Text from '../components/ui/Text';

export default function CategoriesPage() {
    const categories = [
        { id: 1, name: 'Еда', description: 'Расходы на продукты' },
        { id: 2, name: 'Транспорт', description: 'Общественный транспорт' },
        { id: 3, name: 'Одежда', description: 'Покупка одежды' },
    ];

    return (
        <div className="min-h-screen bg-secondary-50">
            <main className="max-w-7xl mx-auto p-4">
                <div className="flex justify-between items-center mb-4">
                    <Text variant="h2">Категории</Text>
                    <TextButton>
                        <Text variant="button">Добавить категорию</Text>
                    </TextButton>
                </div>

                <div className="bg-background shadow-md rounded-md overflow-hidden">
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
        </div>
    );
}