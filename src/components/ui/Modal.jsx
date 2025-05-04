import { useState } from 'react';
import Text from './Text';
import Input from './Input';
import TextButton from './TextButton';
import Tooltip from './Tooltip';

const Modal = ({ isOpen, onClose, title, fields, initialData = {}, onSubmit, submitText = 'Сохранить' }) => {
    const [formData, setFormData] = useState(initialData);
    const [errors, setErrors] = useState({});

    if (!isOpen) return null;

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
        setErrors({ ...errors, [name]: '' });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        const newErrors = {};

        fields.forEach((field) => {
            if (field.required && !formData[field.name]) {
                newErrors[field.name] = `${field.label} обязателен`;
            }
        });

        setErrors(newErrors);

        if (Object.keys(newErrors).length === 0) {
            onSubmit(formData);
        }
    };

    return (
        // --- Измененная строка здесь ---
        <div className="fixed inset-0 bg-gray-100 bg-opacity-40 flex items-center justify-center z-50">
            {/* --- Конец измененной строки --- */}
            <div style={{ backgroundColor: `rgb(var(--color-background))` }} className="p-6 rounded-lg shadow-lg w-full max-w-md">
                <Text variant="h2" className="mb-4 text-center">
                    {title}
                </Text>

                <form onSubmit={handleSubmit} className="space-y-4">
                    {fields.map((field) => (
                        <div key={field.name} className="relative">
                            <Input
                                label={field.label}
                                name={field.name}
                                type={field.type || 'text'}
                                value={formData[field.name] || ''}
                                onChange={handleChange}
                                error={errors[field.name]}
                                placeholder={field.placeholder}
                                errorClass={errors[field.name] ? 'error-visible' : 'error-hidden'}
                            />
                            {field.tooltip && (
                                <Tooltip content={field.tooltip} className="absolute right-2 top-2">
                                    <span>?</span>
                                </Tooltip>
                            )}
                        </div>
                    ))}

                    <div className="flex justify-end gap-2">
                        <TextButton
                            onClick={onClose}
                            style={{
                                backgroundColor: `rgb(var(--color-secondary-500))`,
                                color: 'white',
                            }}
                            className="hover:[background-color:rgb(var(--color-secondary-800))] rounded-md px-4 py-2"
                        >
                            Отмена
                        </TextButton>
                        <TextButton
                            type="submit"
                            style={{
                                backgroundColor: `rgb(var(--color-primary-500))`,
                                color: 'white',
                            }}
                            className="hover:[background-color:rgb(var(--color-primary-600))] rounded-md px-4 py-2"
                        >
                            {submitText}
                        </TextButton>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default Modal;