// src/components/ui/Modal.jsx
import {useEffect, useRef, useState} from 'react';
import Text from './Text';
import Input from './Input';
import TextButton from './TextButton';
import Tooltip from './Tooltip';
import {XMarkIcon} from '@heroicons/react/24/outline';
import IconButton from './IconButton';
import useModalStore from '../../stores/modalStore';
import {clearServerFieldErrors, mapServerErrorToFieldError} from "../../utils/fieldErrorMapping.js";

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
    const firstInputRef = useRef(null);

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
                    } catch {
                        acc[field.name] = String(initialValue); // В случае ошибки парсинга, используем как есть
                    }
                }
            } else { // Other types
                acc[field.name] = initialValue === undefined || initialValue === null ? '' : initialValue;
            }
            return acc;
        }, {});
        setFormData(initialFormData);
        setErrors({}); // Сбрасываем локальные ошибки при инициализации или открытии
        setCurrentFields(fields); // Сбрасываем поля
    }, [initialData, fields]); // Зависимости: initialData и fields

    useEffect(() => {
        if (isOpen && firstInputRef.current) {
            firstInputRef.current.focus();
        }
    }, [isOpen])

    // --- ЭФФЕКТ ДЛЯ ОБРАБОТКИ submissionError И УСТАНОВКИ ЛОКАЛЬНЫХ ОШИБОК ПОЛЕЙ ---
    useEffect(() => {
        if (submissionError?.field) {
            const fieldError = mapServerErrorToFieldError(submissionError);
            if (fieldError) {
                setErrors(prev => ({
                    ...prev,
                    [fieldError.field]: fieldError.message
                }));
            }
        } else if (submissionError === null) {
            // Очищаем только серверные ошибки полей
            setErrors(prev => clearServerFieldErrors(prev));
        }
    }, [submissionError]);

    useEffect(() => {
        const handleEscapeKey = (event) => {
            if (event.key === 'Escape') {
                onClose(); // Вызываем функцию закрытия модалки
            }
        };

        // Добавляем слушатель события keydown при открытии модалки
        if (isOpen) {
            document.addEventListener('keydown', handleEscapeKey);
        }

        // Функция очистки: удаляем слушатель события при закрытии модалки или размонтировании компонента
        return () => {
            document.removeEventListener('keydown', handleEscapeKey);
        };
    }, [isOpen, onClose]); // Зависимости: isOpen (чтобы активировать/деактивировать слушатель) и onClose (чтобы использовать его в обработчике)

    if (!isOpen) return null;
    // Универсальный обработчик для всех Input (ожидает name, value)
    // --- Убеждаемся, что здесь нет параметра 'e' ---
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
            const newFormData = {...prev, [name]: fieldValue};
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
            const newErrors = {...prev};
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
        const dataToSend = {...formData}; // Берем данные из состояния formData

        // Преобразование и локальная валидация
        currentFields.forEach((field) => {
            const fieldName = field.name;
            const fieldType = field.type || 'text';
            const fieldValue = dataToSend[fieldName]; // Берем значение уже из dataToSend


            // --- Локальная Валидация ---

            // 1. Required Check (работает для Категории, если required: true, и других обязательных полей)
            if (field.required) {
                let isMissing = false;
                if (fieldValue === undefined || fieldValue === null) {
                    isMissing = true;
                } else if (fieldType === 'checkbox') {
                    if (fieldValue !== true) isMissing = true;
                } else { // text, number, date, select
                    if (String(fieldValue).trim() === '') isMissing = true;
                    // Для обязательного поля даты, '0001-01-01' также считается отсутствующим значением локально
                    // (Хотя Modal.jsx старается подставить сегодня для обязательной даты, это перестраховка)
                    if (fieldType === 'date' && String(fieldValue) === '0001-01-01') {
                        isMissing = true;
                    }
                }
                if (isMissing) {
                    // Важно: Если поле amount обязательно И равно 0 или отрицательное,
                    // мы хотим показать ошибку "больше нуля", а не "обязателен".
                    // Поэтому сначала проверим специфичную ошибку суммы, а потом обязательность.
                    // Или добавим обязательность только если специфичная ошибка суммы не сработала.
                    // Давайте сделаем так: специфичная ошибка суммы ПЕРЕЗАПИСЫВАЕТ ошибку обязательности для поля amount.
                    newErrors[fieldName] = `Вы обязаны выбрать. Отправка формы невозможна`; // Сначала ставим ошибку обязательности, если есть
                }
            }

            // --- НОВОЕ: 2. Валидация для поля 'amount' (должно быть > 0) ---
            if (fieldName === 'amount') {
                // Проверяем только если поле не пустое. Если обязательное, пустое уже поймает required validation.
                // Если необязательное, пустое - это валидный случай. Проверяем только если есть значение.
                // Проверка на required уже выше. Здесь только специфичное правило "> 0".
                const valueAsString = String(fieldValue).trim();
                if (valueAsString !== '') { // Проверяем только если в поле что-то введено
                    const amountValue = parseFloat(valueAsString); // Парсим значение в число
                    // Проверяем, является ли результат парсинга числом И меньше или равно 0
                    if (isNaN(amountValue) || amountValue <= 0) {
                        // Если это поле amount, и оно <= 0, устанавливаем специфичное сообщение.
                        // Это сообщение ПЕРЕЗАПИШЕТ ошибку "обязателен", если поле было пустым или 0.
                        newErrors[fieldName] = 'Сумма должна быть больше нуля';
                    }
                }
                // Если valueAsString === '', то parseFloat будет NaN. required проверка поймает это как пустое.
                // Если поле необязательное и пустое, ошибок нет, valueAsString === '', проверка не сработает. Корректно.
            }
            // --- Конец НОВОГО ---

            // --- Конец Локальной Валидации ---


            // --- Преобразование типов (для данных, отправляемых в onSubmit) ---
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
                // Значение fieldValue уже либо "YYYY-MM-DD", либо "0001-01-01" из handleChange/инициализации
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
            // --- Конец Преобразования типов ---
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
        <div
            className="fixed inset-0 flex justify-center z-50 items-start pt-[10vh] backdrop-blur-xs bg-black/20 w-full"
            onClick={(event) => {
                // Проверяем, был ли клик именно по этому элементу (оверлею),
                // а не по одному из его дочерних элементов (содержимому модалки).
                if (event.target === event.currentTarget) {
                    onClose(); // Вызываем функцию закрытия модалки
                }
            }}>
            {/* Классы из предоставленного тобой "рабочего" кода */}
            <div
                className="p-4 rounded-lg shadow-2xl w-full max-w-md bg-green-100 border border-gray-300 relative max-h-[80vh] overflow-y-auto">
                {/* Контейнер для заголовка и кнопки закрытия */}
                <div className="flex justify-between items-center mb-1">
                    {/* Заголовок */}
                    {/* Убираем text-center у заголовка, так как flexbox управляет выравниванием */}
                    {/* Убираем mb-4 у заголовка, так как контейнер теперь имеет mb-4 */}
                    <Text variant="h2" className="">
                        {title}
                    </Text>
                    {/* Кнопка закрытия */}
                    {/* Убрали абсолютное позиционирование и z-index */}
                    <IconButton
                        icon={XMarkIcon}
                        onClick={onClose} // <-- Этот onClick вызывает onClose проп из Modal.jsx (который закрывает модалку и сбрасывает submissionError)
                        className="text-gray-500 hover:text-gray-700" // Оставляем только стили цвета
                    />
                </div>
                {/* Блок общей ошибки с сервера */} {/* <--- Исправлено здесь */}
                {submissionError && (
                    <div className="mb-4 py-2 px-3 bg-red-100 text-sm border rounded-md text-[var(--color-form-error)] border-[var(--color-form-error)]">
                        {submissionError.message || submissionError}  {/* ✅ Рендерим только строку */}
                    </div>
                )}
                {/* Форма */}
                <form onSubmit={handleSubmit} className="space-y-0">
                    {currentFields.map((field, index) => (
                        <div key={field.name} className="relative">
                            <Input
                                ref={index === 0 ? firstInputRef : null}
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
                            variant="secondary"
                        >
                            Отмена
                        </TextButton>
                        <TextButton
                            type="submit"
                            variant="primary"
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