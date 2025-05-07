// src/components/ui/Modal.jsx
import { useState } from 'react';
import Text from './Text';
import Input from './Input'; // Убедись, что путь корректен
import TextButton from './TextButton'; // Убедись, что путь корректен
import Tooltip from './Tooltip'; // Убедись, что путь корректен
import PropTypes from 'prop-types'; // Убедись, что импортирован

const Modal = ({ isOpen, onClose, title, fields, initialData = {}, onSubmit, submitText = 'Сохранить' }) => {
    const [formData, setFormData] = useState(initialData);
    const [errors, setErrors] = useState({});

    // Если модал не открыт, ничего не рендерим (хотя LayoutWithHeader уже управляет этим)
    if (!isOpen) return null;

    // Обработчик изменения полей формы
    // Принимает объект события или объект { name, value } для специальных случаев (как checkbox)
    const handleChange = (e) => {
        // Извлекаем name и value из объекта события/данных
        const { name, value } = e.target;

        // Обновляем локальное состояние формы, сохраняя значения как есть (строки для текста/чисел/дат, булевы для чекбокса)
        setFormData({ ...formData, [name]: value });
        // Сбрасываем ошибку для этого поля при изменении
        setErrors({ ...errors, [name]: '' });
    };

    // Обработчик отправки формы
    const handleSubmit = (e) => {
        e.preventDefault();

        const newErrors = {};
        const dataToSend = { ...formData };

        // Получаем сегодняшнюю дату как объект Date
        const nowLocal = new Date(); // Время в локальном часовом поясе пользователя

        // Вручную конструируем строку "YYYY-MM-DD" для сегодняшней даты в ЛОКАЛЬНОМ часовом поясе
        const yearLocal = nowLocal.getFullYear();
        const monthLocal = String(nowLocal.getMonth() + 1).padStart(2, '0'); // getMonth() is 0-indexed
        const dayLocal = String(nowLocal.getDate()).padStart(2, '0');
        const todayLocalString = `${yearLocal}-${monthLocal}-${dayLocal}`; // Строка "YYYY-MM-DD" в ЛОКАЛЬНОМ поясе

        // --- ЛОГИ ДЛЯ ОТЛАДКИ ---
        console.log('Modal: Validation Debug - todayLocalString (constructed):', todayLocalString);
        // --- КОНЕЦ ЛОГОВ ---


        fields.forEach((field) => {
            // --- Локальная валидация: проверка на обязательность ---
            if (field.required && (dataToSend[field.name] === undefined || dataToSend[field.name] === '')) {
                newErrors[field.name] = `${field.label} обязателен`;
            }
            // --- Конец Локальной валидации на обязательность ---

            // --- ТРЕТЬЯ ВЕРСИЯ Локальной валидации: проверка даты на будущее (сравнение локальных строк) ---
            // Применяется только к полю с именем 'date' и если в нем есть непустое значение
            if (field.name === 'date' && dataToSend[field.name]) {
                const inputDateString = dataToSend[field.name]; // Значение из Input type="date" - это строка "YYYY-MM-DD"

                // --- ЛОГИ ДЛЯ ОТЛАДКИ ---
                console.log('Modal: Validation Debug - inputDateString:', inputDateString);
                // --- КОНЕЦ ЛОГОВ ---

                // Сравниваем строку введенной даты со строкой сегодняшней даты, полученной в ЛОКАЛЬНОМ поясе.
                // Строковое сравнение "YYYY-MM-DD" работает корректно для дат.
                // Проверяем, строго ли введенная строка даты БОЛЬШЕ строки сегодняшней локальной даты.
                // Это должно правильно работать для сравнения календарных дней по локальному времени.
                if (inputDateString > todayLocalString) {
                    newErrors[field.name] = `${field.label} не может быть в будущем`; // Добавляем ошибку
                }
            }
            // --- Конец ТРЕТЬЕЙ ВЕРСИИ Локальной валидации даты ---


            // --- Преобразование типов перед отправкой ---
            if (field.type === 'number') {
                const valueAsString = dataToSend[field.name];
                if (valueAsString !== undefined && valueAsString !== null && valueAsString !== '' && !newErrors[field.name]) {
                    const parsedAmount = parseFloat(valueAsString);
                    if (!isNaN(parsedAmount)) {
                        dataToSend[field.name] = parsedAmount;
                    } else {
                        newErrors[field.name] = newErrors[field.name] || `${field.label} должен быть числом`;
                        dataToSend[field.name] = 0;
                    }
                } else if (valueAsString === '') {
                    dataToSend[field.name] = 0;
                }
            } else if (field.type === 'checkbox') {
                dataToSend[field.name] = !!dataToSend[field.name];
            }
            // Примечание: Преобразование даты в формат ISO 8601 для API происходит в handleEditSubmit/handleAddSubmit, а не здесь.
            // Modal передает строку "YYYY-MM-DD" из formData.date в пропс onSubmit.
            // --- Конец Преобразования типов ---
        });

        // Обновляем локальное состояние ошибок формы
        setErrors(newErrors);

        // Если ошибок валидации нет (объект ошибок пустой)
        // Проверяем длину newErrors *после* потенциального добавления ошибок в цикле
        if (Object.keys(newErrors).length === 0) {
            console.log('Modal: Validation passed, calling onSubmit with data:', dataToSend);
            onSubmit(dataToSend);
        } else {
            console.log('Modal: Validation failed, errors:', newErrors);
        }
    };

    return (
        // Подложка модала: фикс позиция, по центру, высокий z-index, полупрозрачный фон
        <div className="fixed inset-0 flex justify-center z-50 items-start pt-[20vh]"
             style={{ backgroundColor: 'rgba(229, 231, 235, 0.7)' }}>
            {/* Контейнер содержимого модала: отступы, скругления, тень, фиксированная ширина, фон, рамка */}
            {/* bg-green-100 возможно, нужно изменить на bg-background или другой цвет из палитры */}
            <div className="p-6 rounded-lg shadow-lg w-full max-w-md bg-green-100 border border-gray-300">
                {/* Заголовок модала */}
                <Text variant="h2" className="mb-4 text-center">
                    {title}
                </Text>

                {/* Форма модала */}
                <form onSubmit={handleSubmit} className="space-y-4">
                    {/* Маппим массив полей для рендеринга компонентов Input */}
                    {fields.map((field) => (
                        <div key={field.name} className="relative">
                            {/* Компонент Input: рендерит метку, поле ввода и ошибку */}
                            <Input
                                label={field.label} // Метка поля
                                name={field.name} // Имя поля
                                type={field.type || 'text'} // Тип поля (дефолт text)
                                // Значение поля: берем из локального состояния formData.
                                // Input ожидает значение (строку или булево для чекбокса).
                                // Убедимся, что значение для Input никогда не undefined, по умолчанию пустая строка
                                value={formData[field.name] === undefined ? '' : formData[field.name]} // Значение из состояния формы
                                onChange={handleChange} // Передаем обработчик изменения из Modal
                                error={errors[field.name]} // Сообщение об ошибке валидации для этого поля
                                placeholder={field.placeholder} // Текст-заполнитель
                                disabled={field.disabled} // Можно добавить отключение поля из определения fields
                            />
                            {/* Тултип: если определен в описании поля */}
                            {field.tooltip && (
                                <Tooltip content={field.tooltip} className="absolute right-2 top-2">
                                    <span>?</span> {/* Или иконка вопроса */}
                                </Tooltip>
                            )}
                        </div>
                    ))}

                    {/* Контейнер для кнопок формы */}
                    <div className="flex justify-end gap-2">
                        {/* Кнопка Отмена: при клике вызывает onClose (закрывает модал через useModalStore) */}
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
                        {/* Кнопка Отправить: type="submit" вызывает handleSubmit формы */}
                        <TextButton
                            type="submit"
                            style={{
                                backgroundColor: `rgb(var(--color-primary-500))`,
                                color: 'white',
                            }}
                            className="hover:[background-color:rgb(var(--color-primary-600))] rounded-md px-4 py-2"
                        >
                            {submitText} {/* Текст на кнопке Отправить */}
                        </TextButton>
                    </div>
                </form>
            </div>
        </div>
    );
};

// Определение PropTypes для валидации пропсов компонента Modal
Modal.propTypes = {
    isOpen: PropTypes.bool, // Layout контролирует видимость, но можно передавать для ясности
    onClose: PropTypes.func.isRequired, // Функция закрытия
    title: PropTypes.string.isRequired, // Заголовок модала
    // fields - массив объектов, описывающих поля формы
    fields: PropTypes.arrayOf(PropTypes.shape({
        name: PropTypes.string.isRequired, // Имя поля
        label: PropTypes.string.isRequired, // Метка поля
        required: PropTypes.bool, // Обязательное поле?
        type: PropTypes.string, // Тип поля ('text', 'number', 'checkbox', 'date' и т.д.)
        placeholder: PropTypes.string, // Плейсхолдер
        tooltip: PropTypes.string, // Текст тултипа
        disabled: PropTypes.bool, // Отключено ли поле?
    })).isRequired,
    // initialData - объект с начальными данными для формы (для редактирования)
    initialData: PropTypes.object,
    // onSubmit - функция, вызываемая при отправке формы после локальной валидации. Получает объект данных формы.
    onSubmit: PropTypes.func.isRequired,
    // submitText - текст на кнопке отправки
    submitText: PropTypes.string,
};

// Значения по умолчанию для пропсов
Modal.defaultProps = {
    isOpen: true, // По умолчанию считаем открытым, если рендерится
    initialData: {}, // Пустые начальные данные по умолчанию
    submitText: 'Сохранить', // Дефолтный текст кнопки
};


export default Modal;