// src/components/ui/CategoryModal.jsx
import { useState, useEffect } from 'react';
import Text from './Text';
import Input from './Input';
import TextButton from './TextButton';
import useCategoryStore from '../../stores/categoryStore';

export default function CategoryModal({ category, onClose }) {
    const { addCategory, updateCategory } = useCategoryStore();
    const isEditing = !!category;

    const [formData, setFormData] = useState({
        name: '',
        description: '',
    });

    const [errors, setErrors] = useState({
        name: '',
        description: '',
    });

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    // Если редактируем, заполняем форму данными категории
    useEffect(() => {
        if (category) {
            setFormData({
                name: category.name || '',
                description: category.description || '',
            });
        }
    }, [category]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        setErrors(prev => ({ ...prev, [name]: '' }));
        if (error) setError(null);
    };

    const validateForm = () => {
        const newErrors = {};
        if (!formData.name.trim()) {
            newErrors.name = 'Название категории обязательно';
        }
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!validateForm()) return;

        setLoading(true);
        setError(null);

        try {
            if (isEditing) {
                await updateCategory(category.id, formData);
            } else {
                await addCategory(formData);
            }
            onClose();
        } catch (err) {
            setError('Не удалось сохранить категорию. Пожалуйста, попробуйте снова.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-secondary-800/50 flex items-center justify-center z-50">
            <div className="bg-background rounded-lg p-6 max-w-md w-full">
                <Text variant="h3" className="mb-4">
                    {isEditing ? 'Редактирование категории' : 'Добавление категории'}
                </Text>

                {error && (
                    <div className="mb-4 p-3 bg-red-100 border border-red-300 text-gray-800 rounded-md">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                    <Input
                        label="Название"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        error={errors.name}
                        placeholder="Введите название категории"
                    />

                    <Input
                        label="Описание"
                        name="description"
                        value={formData.description}
                        onChange={handleChange}
                        error={errors.description}
                        placeholder="Введите описание (не обязательно)"
                    />

                    <div className="flex justify-end space-x-2 pt-2">
                        <TextButton
                            type="button"
                            onClick={onClose}
                            className="bg-secondary-200 hover:bg-secondary-300"
                        >
                            Отмена
                        </TextButton>
                        <TextButton
                            type="submit"
                            className="bg-primary-500 text-background hover:bg-primary-600"
                            disabled={loading}
                        >
                            {loading ? 'Сохранение...' : 'Сохранить'}
                        </TextButton>
                    </div>
                </form>
            </div>
        </div>
    );
}