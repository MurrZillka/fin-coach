// src/components/ui/Modal.jsx
import { useState, useEffect } from 'react';
import Text from './Text';
import Input from './Input';
import TextButton from './TextButton';
import Tooltip from './Tooltip';
import PropTypes from 'prop-types';
import { XMarkIcon } from '@heroicons/react/24/outline';
import IconButton from './IconButton';

const optionShape = PropTypes.shape({
    value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
    label: PropTypes.string.isRequired,
});

const Modal = ({
                   isOpen,
                   onClose,
                   title,
                   fields,
                   initialData = {},
                   onSubmit,
                   submitText = 'Сохранить',
                   onFieldChange,
               }) => {
    const [formData, setFormData] = useState(initialData);
    const [errors, setErrors] = useState({});
    const [currentFields, setCurrentFields] = useState(fields);

    useEffect(() => {
        const initialFormData = fields.reduce((acc, field) => {
            const initialValue = initialData[field.name];
            if (field.type === 'checkbox') {
                acc[field.name] = initialValue === undefined || initialValue === null ? false : !!initialValue;
            } else if (field.type === 'select') {
                acc[field.name] = initialValue === undefined || initialValue === null ? '' : String(initialValue);
            } else {
                acc[field.name] = initialValue === undefined || initialValue === null ? '' : initialValue;
            }
            return acc;
        }, {});
        setFormData(initialFormData);
        setErrors({});
        setCurrentFields(fields);
    }, [initialData, fields]);

    if (!isOpen) return null;

    // Ожидает e.target с name/value
    const handleChange = (e) => {
        const { name, value, checked, type } = e.target;
        const fieldValue = type === 'checkbox' ? checked : value;

        setFormData(prev => {
            const newFormData = { ...prev, [name]: fieldValue };
            if (onFieldChange) {
                const newFields = onFieldChange(name, fieldValue, newFormData);
                if (newFields && Array.isArray(newFields)) {
                    setCurrentFields(newFields);
                }
            }
            return newFormData;
        });

        setErrors(prev => {
            const newErrors = { ...prev };
            delete newErrors[name];
            return newErrors;
        });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        const newErrors = {};
        const dataToSend = { ...formData };

        currentFields.forEach((field) => {
            const fieldName = field.name;
            const fieldType = field.type || 'text';
            let fieldValue = dataToSend[fieldName];

            // Required
            if (field.required) {
                let isFieldMissing = false;
                if (fieldValue === undefined || fieldValue === null) {
                    isFieldMissing = true;
                } else if (fieldType === 'checkbox') {
                    if (fieldValue === false) isFieldMissing = true;
                } else if (fieldType === 'number' || fieldType === 'text' || fieldType === 'date') {
                    if (String(fieldValue).trim() === '') isFieldMissing = true;
                } else if (fieldType === 'select') {
                    if (String(fieldValue) === '') isFieldMissing = true;
                }
                if (isFieldMissing) {
                    newErrors[fieldName] = `${field.label} обязателен`;
                }
            }

            // Преобразование типов
            if (!newErrors[fieldName]) {
                if (fieldType === 'number') {
                    const valueAsString = String(fieldValue);
                    if (valueAsString.trim() !== '') {
                        const parsedAmount = parseFloat(valueAsString);
                        if (!isNaN(parsedAmount)) {
                            dataToSend[fieldName] = parsedAmount;
                        } else {
                            newErrors[fieldName] = `${field.label} должен быть числом`;
                            dataToSend[fieldName] = 0;
                        }
                    } else {
                        dataToSend[fieldName] = 0;
                    }
                } else if (fieldType === 'checkbox') {
                    dataToSend[fieldName] = !!fieldValue;
                } else if (fieldType === 'select') {
                    if (String(fieldValue).trim() === '' || fieldValue === null || fieldValue === undefined) {
                        dataToSend[fieldName] = null;
                    } else {
                        const parsedValue = Number(fieldValue);
                        if (!isNaN(parsedValue)) {
                            dataToSend[fieldName] = parsedValue;
                        } else {
                            dataToSend[fieldName] = null;
                        }
                    }
                } else if (fieldType === 'date') {
                    // ГАРАНТИРУЕМ СТРОКУ "YYYY-MM-DD"
                    if (typeof fieldValue === 'string') {
                        dataToSend[fieldName] = fieldValue;
                    } else if (fieldValue instanceof Date) {
                        const y = fieldValue.getFullYear();
                        const m = String(fieldValue.getMonth() + 1).padStart(2, '0');
                        const d = String(fieldValue.getDate()).padStart(2, '0');
                        dataToSend[fieldName] = `${y}-${m}-${d}`;
                    } else {
                        dataToSend[fieldName] = '';
                    }
                }
            }
        });

        setErrors(newErrors);

        if (Object.keys(newErrors).length === 0) {
            onSubmit(dataToSend);
        }
    };

    return (
        <div className="fixed inset-0 flex justify-center z-50 items-start pt-[20vh]"
             style={{ backgroundColor: 'rgba(229, 231, 235, 0.7)' }}>
            <div className="p-6 rounded-lg shadow-lg w-full max-w-md bg-green-100 border border-gray-300 relative max-h-[80vh] overflow-y-auto">
                <IconButton
                    icon={XMarkIcon}
                    onClick={onClose}
                    className="absolute top-2 right-2 text-gray-500 hover:text-gray-700"
                    tooltip="Закрыть"
                />
                <Text variant="h2" className="mb-4 text-center">
                    {title}
                </Text>
                <form onSubmit={handleSubmit} className="space-y-4">
                    {currentFields.map((field) => (
                        <div key={field.name} className="relative">
                            <Input
                                label={field.label}
                                name={field.name}
                                type={field.type || 'text'}
                                value={formData[field.name]}
                                onChange={handleChange}
                                error={errors[field.name]}
                                placeholder={field.placeholder}
                                disabled={field.disabled}
                                required={field.required}
                                options={field.options}
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
                            type="button"
                            style={{ backgroundColor: `rgb(var(--color-secondary-500))`, color: 'white' }}
                            className="hover:[background-color:rgb(var(--color-secondary-800))] rounded-md px-4 py-2"
                        >
                            Отмена
                        </TextButton>
                        <TextButton
                            type="submit"
                            style={{ backgroundColor: `rgb(var(--color-primary-500))`, color: 'white' }}
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

Modal.propTypes = {
    isOpen: PropTypes.bool.isRequired,
    onClose: PropTypes.func.isRequired,
    title: PropTypes.string.isRequired,
    fields: PropTypes.arrayOf(PropTypes.shape({
        name: PropTypes.string.isRequired,
        label: PropTypes.string.isRequired,
        required: PropTypes.bool,
        type: PropTypes.string,
        placeholder: PropTypes.string,
        tooltip: PropTypes.string,
        disabled: PropTypes.bool,
        options: (props, propName, componentName, location, propFullName) => {
            if (props.type === 'select') {
                if (!props[propName] || !Array.isArray(props[propName])) {
                    return new Error(
                        `Invalid prop \`${propFullName}\` supplied to \`${componentName}\`. ` +
                        `\`options\` is required and must be an array of objects when \`type\` is 'select'.`
                    );
                }
                const optionShapeChecker = optionShape;
                for (let i = 0; i < props[propName].length; i++) {
                    const error = optionShapeChecker(props[propName], i, componentName, location, `${propFullName}[${i}]`);
                    if (error) return error;
                }
            }
            return null;
        },
    })).isRequired,
    initialData: PropTypes.object,
    onSubmit: PropTypes.func.isRequired,
    submitText: PropTypes.string,
    onFieldChange: PropTypes.func,
};

Modal.defaultProps = {
    initialData: {},
    submitText: 'Сохранить',
};

export default Modal;
