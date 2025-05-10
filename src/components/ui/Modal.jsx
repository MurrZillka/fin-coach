// src/components/ui/Modal.jsx
import { useState, useEffect } from 'react';
import Text from './Text';
import Input from './Input';
import TextButton from './TextButton';
import Tooltip from './Tooltip';
import PropTypes from 'prop-types';
import { XMarkIcon } from '@heroicons/react/24/outline';
import IconButton from './IconButton';
// --- Корректный путь импорта и перенос в начало файла ---
import useModalStore from '../../stores/modalStore';
// --- Конец ИСПРАВЛЕНИЯ ---

// --- Определяем propTypes для опций выпадающего списка (такое же определение, как в Input.jsx) ---
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
                   submissionError = null, // --- Проп для общей ошибки отправки формы ---
               }) => {
    const [formData, setFormData] = useState(initialData);
    const [errors, setErrors] = useState({});
    const [currentFields, setCurrentFields] = useState(fields);

    // Эффект для сброса formData, errors и currentFields при изменении initialData, fields или при открытии модала
    useEffect(() => {
        // --- Получаем сегодняшнюю дату в формате veritable-MM-DD ---
        const today = new Date();
        const fullYear = today.getFullYear();
        const month = String(today.getMonth() + 1).padStart(2, '0'); // Month is 0-indexed, add 1
        const day = String(today.getDate()).padStart(2, '0');
        const todayString = `${fullYear}-${month}-${day}`;
        // --- Конец получения даты ---


        const initialFormData = fields.reduce((acc, field) => {
            const initialValue = initialData[field.name];
            if (field.type === 'checkbox') {
                acc[field.name] = initialValue === undefined || initialValue === null ? false : !!initialValue;
            } else if (field.type === 'select') {
                acc[field.name] = initialValue === undefined || initialValue === null ? '' : String(initialValue);
            } else if (field.type === 'date') { // --- Обработка начального значения для полей даты ---
                // Если начальное значение пустое ('', null, undefined) или '0001-01-01'/'0001-01-01T00:00:00Z',
                // устанавливаем его как сегодняшнюю дату. Иначе используем текущее значение.
                if (initialValue === '' || initialValue === null || initialValue === undefined || initialValue === '0001-01-01' || initialValue === '0001-01-01T00:00:00Z') {
                    acc[field.name] = todayString; // Устанавливаем сегодняшнюю дату
                } else {
                    // Убедимся, что это строка в нужном формате, если пришло из API (может быть ISO)
                    try {
                        // Попробуем распарсить как дату, если это не очевидноY-MM-DD
                        const date = new Date(initialValue);
                        if (!isNaN(date.getTime())) {
                            const y = date.getFullYear();
                            const m = String(date.getMonth() + 1).padStart(2, '0');
                            const d = String(date.getDate()).padStart(2, '0');
                            acc[field.name] = `${y}-${m}-${d}`; // Преобразуем вY-MM-DD
                        } else {
                            acc[field.name] = String(initialValue); // Если не удалось распарсить, используем как есть (возможно, ужеY-MM-DD)
                        }
                    } catch (e) {
                        acc[field.name] = String(initialValue); // В случае ошибки парсинга, используем как есть
                    }
                }
            }
            else { // Other types
                acc[field.name] = initialValue === undefined || initialValue === null ? '' : initialValue;
            }
            return acc;
        }, {});
        setFormData(initialFormData);
        setErrors({}); // Сбрасываем локальные ошибки при инициализации или открытии
        setCurrentFields(fields); // Сбрасываем поля
    }, [initialData, fields]); // Зависимости: initialData и fields


    // --- Эффект для обработки submissionError и установки локальных ошибок полей (без изменений) ---
    useEffect(() => {
        // Точное сообщение об ошибке валидации дат, которое приходит с сервера
        const dateValidationError = 'Дата окончания кредита должна быть больше или равна дате начала.';

        if (submissionError) {
            // Если есть submissionError, проверяем, является ли он ошибкой валидации дат
            if (submissionError === dateValidationError) {
                // Если да, устанавливаем ошибки для полей даты в локальном состоянии errors
                setErrors(prevErrors => ({
                    ...prevErrors,
                    date: 'Проверьте даты', // Сообщение об ошибке для поля date
                    end_date: 'Проверьте даты', // Сообщение об ошибке для поля end_date
                }));
            } else {
                // Если это какая-то другая submissionError, убедимся, что предыдущие ошибки дат сброшены
                setErrors(prevErrors => {
                    const newErrors = { ...prevErrors };
                    // Удаляем ошибки для полей даты, если они были установлены этим эффектом
                    // Проверяем по тексту сообщения, чтобы не удалить ошибки обязательных полей
                    if (newErrors.date === 'Проверьте даты') delete newErrors.date;
                    if (newErrors.end_date === 'Проверьте даты') delete newErrors.end_date;
                    return newErrors;
                });
            }
        } else {
            // Если submissionError стал null (например, модалка закрылась или успешный сабмит),
            // очищаем ошибки для полей даты, если они были установлены этим эффектом.
            setErrors(prevErrors => {
                const newErrors = { ...prevErrors };
                if (newErrors.date === 'Проверьте даты') delete newErrors.date;
                if (newErrors.end_date === 'Проверьте даты') delete newErrors.end_date;
                return newErrors;
            });
        }
    }, [submissionError]); // Запускать эффект при изменении submissionError
    // --- Конец эффекта ---


    if (!isOpen) return null;

    // Универсальный обработчик для всех Input (ожидает name, value)
    // --- ИСПРАВЛЕНИЕ: Убеждаемся, что здесь нет параметра 'e' ---
    const handleChange = (name, value) => { // --- ИСПРАВЛЕННАЯ СИГНАТУРА ---
        // console.log(`Modal: handleChange - Field "${name}" changed to value:`, value); // Можно оставить для отладки

        // --- Обработка для полей даты - установка сегодняшней даты при очистке ---
        let fieldValue = value; // Начинаем с полученного значения
        const fieldDefinition = currentFields.find(f => f.name === name); // Находим определение поля

        // Если это поле даты и значение стало пустой строкой (пользователь очистил его)
        if (fieldDefinition && fieldDefinition.type === 'date' && value === '') {
            // Генерируем строку с сегодняшней датой в формате veritable-MM-DD
            const today = new Date();
            const fullYear = today.getFullYear();
            const month = String(today.getMonth() + 1).padStart(2, '0');
            const day = String(today.getDate()).padStart(2, '0');
            fieldValue = `${fullYear}-${month}-${day}`; // Устанавливаем сегодняшнюю дату как новое значение
        }
        // Если это не поле даты ИЛИ значение не стало пустой строкой, fieldValue остается value
        // --- Конец обработки даты при изменении ---


        setFormData(prev => {
            // Используем fieldValue (которое может быть скорректировано для дат)
            const newFormData = { ...prev, [name]: fieldValue };
            if (onFieldChange) {
                // onFieldChange ожидает name, value (оригинальное value от Input), и весь объект formData
                // Здесь мы передаем оригинальное value из Input, т.к. onFieldChange может зависеть от него (как is_exhausted меняет end_date)
                const newFields = onFieldChange(name, value, newFormData); // Передаем оригинальное `value` из Input!
                if (newFields && Array.isArray(newFields)) {
                    setCurrentFields(newFields);
                }
            }
            return newFormData; // Обновляем formData с fieldValue
        });

        setErrors(prev => {
            const newErrors = { ...prev };
            delete newErrors[name]; // Удаляем ошибку для поля, которое изменилось
            return newErrors;
        });

        // --- Откладываем сброс submissionError в сторе ---
        queueMicrotask(() => {
            useModalStore.getState().setModalSubmissionError(null);
        });
        // --- Конец ---

    };


    const handleSubmit = (e) => {
        e.preventDefault();
        const newErrors = {};
        const dataToSend = { ...formData }; // Берем данные из состояния formData

        // Преобразование и локальная валидация
        currentFields.forEach((field) => {
            const fieldName = field.name;
            const fieldType = field.type || 'text';
            const fieldValue = dataToSend[fieldName]; // Берем значение уже из dataToSend


            // Required (без изменений)
            if (field.required) {
                // Simplified check for required fields
                if (fieldValue === undefined || fieldValue === null || String(fieldValue).trim() === '') {
                    // For date type, fieldValue is set to today if empty in handleChange,
                    // so this specific check might not be needed for date fields after handleChange.
                    // But keep it generic for all types based on field.required prop.
                    newErrors[fieldName] = `${field.label} обязателен`;
                }
            }


            // Преобразование типов (выполняется всегда для подготовки данных к отправке)
            // --- Корректировка логики форматирования дат для отправки ---
            if (fieldType === 'number') {
                const valueAsString = String(fieldValue);
                if (valueAsString.trim() !== '') {
                    const parsedAmount = parseFloat(valueAsString);
                    dataToSend[fieldName] = isNaN(parsedAmount) ? 0 : parsedAmount;
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
                    dataToSend[fieldName] = isNaN(parsedValue) ? String(fieldValue) : parsedValue;
                }
            } else if (fieldType === 'date') {
                // Значение fieldValue уже либо "YYYY-MM-DD", либо "0001-01-01" (из handleChange или инициализации)
                // Если оно "0001-01-01", оставляем его как есть. Если "YYYY-MM-DD", оставляем как есть.
                // Если вдруг сюда пришло пустая строка "" (что не должно происходить после handleChange),
                // то на сервер все равно нужно отправить "0001-01-01".
                const dateValue = String(fieldValue).trim();
                dataToSend[fieldName] = dateValue === '' ? '0001-01-01' : dateValue;

            } else {
                // Для text и других - всегда строка. Если необязательное и пустое, отправляем null.
                if (String(fieldValue).trim() === '' || fieldValue === null || fieldValue === undefined) {
                    dataToSend[fieldName] = null;
                } else {
                    dataToSend[fieldName] = String(fieldValue);
                }
            }
            // --- Конец ИЗМЕНЕНИЯ ---
        });


        setErrors(newErrors); // Устанавливаем локальные ошибки формы

        // При сабмите формы, если были локальные ошибки, сбрасываем submissionError.
        // Если локальных ошибок нет, вызываем onSubmit, который обработает серверные ошибки и установит submissionError.
        if (Object.keys(newErrors).length > 0) {
            useModalStore.getState().setModalSubmissionError(null); // Сбрасываем submissionError при локальных ошибках
        }


        // Если нет локальных ошибок валидации, вызываем onSubmit с подготовленными данными
        if (Object.keys(newErrors).length === 0) {
            // onSubmit теперь должен самостоятельно обрабатывать ошибки API и передавать их обратно в Modal через submissionError
            onSubmit(dataToSend);
        }
        // Если есть локальные ошибки, onSubmit не вызывается, а ошибки отображаются Input компонентами.
    };

    return (
        <div className="fixed inset-0 flex justify-center z-50 items-start pt-[20vh]"
             style={{ backgroundColor: 'rgba(229, 231, 235, 0.7)' }}>
            <div className="p-6 rounded-lg shadow-lg w-full max-w-md bg-green-100 border border-gray-300 relative max-h-[80vh] overflow-y-auto">
                <IconButton
                    icon={XMarkIcon}
                    onClick={onClose} // <-- Этот onClick вызывает onClose проп из Modal.jsx (который закрывает модалку и сбрасывает submissionError)
                    className="absolute top-2 right-2 text-gray-500 hover:text-gray-700"
                    tooltip="Закрыть"
                />
                <Text variant="h2" className="mb-4 text-center">
                    {title}
                </Text>
                <form onSubmit={handleSubmit} className="space-y-4">
                    {/* --- Место для отображения общей ошибки отправки, используем цвета из темы --- */}
                    {submissionError && (
                        <div className="mb-4 p-3 bg-red-100 border rounded-md text-[var(--color-form-error)] border-[var(--color-form-error)]">
                            {submissionError}
                        </div>
                    )}
                    {/* --- Конец блока ошибки --- */}

                    {currentFields.map((field) => (
                        <div key={field.name} className="relative">
                            <Input
                                label={field.label}
                                name={field.name}
                                type={field.type || 'text'}
                                // Для чекбокса передаем value как булево, для остальных - value как строку/число/null
                                // Input.jsx теперь ожидает value как булево для checkbox в пропе value
                                // Value для полей даты теперь всегдаY-MM-DD или 0001-01-01 из состояния formData
                                value={field.type === 'checkbox' ? !!formData[field.name] : formData[field.name] || ''} // Передаем булево для чекбокса
                                // checked проп в Input.jsx больше не нужен или используется внутренне
                                onChange={handleChange} // <-- Input вызовет ее с (name, value)
                                error={errors[field.name]} // Здесь показываем локальные ошибки Modal И ошибки для дат, установленные useEffect
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
                            onClick={onClose} // <-- Этот onClick вызывает onClose проп из Modal.jsx (который закрывает модалку и сбрасывает submissionError)
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
                for (let i = 0; i < props[propName].length; i++) {
                    // Use optionShape directly
                    const error = optionShape(props[propName], i, componentName, location, `${propFullName}[${i}]`);
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
    submissionError: PropTypes.string, // --- PropType для ошибки отправки ---
};

Modal.defaultProps = {
    initialData: {},
    submitText: 'Сохранить',
    submissionError: null, // --- Значение по умолчанию ---
};


export default Modal;