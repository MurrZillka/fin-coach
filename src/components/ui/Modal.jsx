// src/components/ui/Modal.jsx
import { useState, useEffect } from 'react'; // Добавляем useEffect для сброса формы
import Text from './Text'; // Убедись, что путь корректен
import Input from './Input'; // Убедись, что путь корректен
import TextButton from './TextButton'; // Убедись, что путь корректен
import Tooltip from './Tooltip'; // Убедись, что путь корректен
import PropTypes from 'prop-types'; // Убедись, что импортирован
import { XMarkIcon } from '@heroicons/react/24/outline'; // Убедись, что импортирован
import IconButton from './IconButton'; // Убедись, что путь корректен
// Импорт useModalStore не нужен здесь, он используется в LayoutWithHeader и на страницах


// --- Определяем propTypes для опций выпадающего списка (такое же определение, как в Input.jsx) ---
const optionShape = PropTypes.shape({
    value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired, // Значение опции
    label: PropTypes.string.isRequired, // Отображаемый текст опции
});
// --- Конец propTypes для опций ---


const Modal = ({ isOpen, onClose, title, fields, initialData = {}, onSubmit, submitText = 'Сохранить' }) => {
    // Локальное состояние формы и ошибок
    const [formData, setFormData] = useState(initialData);
    const [errors, setErrors] = useState({});

    // Эффект для сброса formData и errors при изменении initialData или при открытии модала
    // Это гарантирует, что при открытии для нового объекта или редактировании форма будет заполнена/сброшена корректно
    useEffect(() => {
        console.log('Modal: useEffect triggered. Re-initializing formData and errors based on initialData/fields.'); // Лог триггера useEffect
        // Подготавливаем начальные данные, учитывая типы полей для корректной инициализации формы
        const initialFormData = fields.reduce((acc, field) => {
            const initialValue = initialData[field.name];
            if (field.type === 'checkbox') {
                acc[field.name] = initialValue === undefined || initialValue === null ? false : !!initialValue;
            } else if (field.type === 'select') {
                // Для select значение должно быть строкой или пустой строкой
                acc[field.name] = initialValue === undefined || initialValue === null ? '' : String(initialValue);
            }
            else {
                // Для остальных типов (text, number, date) значение - строка
                acc[field.name] = initialValue === undefined || initialValue === null ? '' : initialValue;
            }
            return acc;
        }, {});

        setFormData(initialFormData);
        setErrors({}); // Сбрасываем ошибки при re-initialization
        console.log('Modal: formData initialized to:', initialFormData); // Лог начальных данных формы

    }, [initialData, fields]); // Зависим от initialData и определений полей


    // Если модал не открыт, ничего не рендерим (контролируется в LayoutWithHeader)
    if (!isOpen) return null;

    // Обработчик изменения полей формы
    // Принимает объект события или объект { name, value } (из Input.jsx)
    const handleChange = (e) => {
        // e.target будет либо HTMLInputElement, либо HTMLSelectElement,
        // либо объект, нормализованный в Input.jsx для чекбокса/селекта
        const { name, value } = e.target; // Деструктурируем name и value

        console.log(`Modal: handleChange - Field "${name}" changed to value:`, value); // Лог изменения поля

        // Обновляем локальное состояние формы
        setFormData({ ...formData, [name]: value });

        // Сбрасываем ошибку для этого поля при изменении
        const newErrors = { ...errors };
        delete newErrors[name]; // Удаляем ошибку для измененного поля
        setErrors(newErrors);
    };

    // Обработчик отправки формы
    const handleSubmit = (e) => {
        e.preventDefault();
        console.log('Modal: handleSubmit started. Current formData:', formData); // Лог данных формы перед валидацией

        const newErrors = {};
        const dataToSend = { ...formData }; // Рабочая копия данных для отправки

        // Получаем сегодняшнюю дату как объект Date в локальном часовом поясе
        const nowLocal = new Date();
        // Вручную конструируем строку "YYYY-MM-DD" для сегодняшней даты в ЛОКАЛЬНОМ часовом поясе
        const yearLocal = nowLocal.getFullYear();
        const monthLocal = String(nowLocal.getMonth() + 1).padStart(2, '0');
        const dayLocal = String(nowLocal.getDate()).padStart(2, '0');
        const todayLocalString = `${yearLocal}-${monthLocal}-${dayLocal}`;

        // --- Логика валидации и преобразования типов перед отправкой ---
        fields.forEach((field) => {
            const fieldName = field.name;
            const fieldType = field.type || 'text';
            const fieldValue = dataToSend[fieldName]; // Значение из formData

            // 1. Валидация на обязательность (Required)
            if (field.required) {
                let isFieldMissing = false;
                if (fieldValue === undefined || fieldValue === null) {
                    isFieldMissing = true;
                } else if (fieldType === 'checkbox') {
                    if (fieldValue === false) isFieldMissing = true; // Обязательный чекбокс должен быть true
                } else if (fieldType === 'number' || fieldType === 'text' || fieldType === 'date') {
                    // Для этих типов, пустая строка (после trim) считается "отсутствующей"
                    if (String(fieldValue).trim() === '') isFieldMissing = true;
                } else if (fieldType === 'select') {
                    // Для select, пустая строка ("") считается "отсутствующей"
                    if (String(fieldValue) === '') isFieldMissing = true;
                }

                if (isFieldMissing) {
                    newErrors[fieldName] = `${field.label} обязателен`;
                }
            }


            // 2. Локальная валидация: проверка даты на будущее (для типа 'date' и поля с именем 'date')
            if (fieldName === 'date' && fieldType === 'date' && fieldValue && !newErrors[fieldName]) { // Проверяем только если есть значение и нет других ошибок
                const inputDateString = String(fieldValue); // Должна быть строка "YYYY-MM-DD"

                // Сравниваем строку введенной даты со строкой сегодняшней даты (локально)
                if (inputDateString > todayLocalString) {
                    newErrors[fieldName] = `${field.label} не может быть в будущем`;
                }
            }

            // 3. Преобразование типов перед отправкой (на основе field.type)
            if (!newErrors[fieldName]) { // Только если нет ошибок валидации для этого поля
                if (fieldType === 'number') {
                    // Преобразуем в число. Пустая строка, null, undefined -> 0 (если не required и пусто)
                    const valueAsString = String(fieldValue);
                    if (valueAsString.trim() !== '') { // Если не пустая строка
                        const parsedAmount = parseFloat(valueAsString);
                        if (!isNaN(parsedAmount)) {
                            dataToSend[fieldName] = parsedAmount; // Успешно спарсили в число
                        } else {
                            // Если парсинг не удался
                            newErrors[fieldName] = `${field.label} должен быть числом`;
                            dataToSend[fieldName] = 0; // Отправляем 0 при ошибке парсинга
                        }
                    } else {
                        // Если пустая строка в number поле (и оно не required, т.к. required обработан выше)
                        dataToSend[fieldName] = 0; // Отправляем 0
                    }

                } else if (fieldType === 'checkbox') {
                    // Преобразуем к булеву
                    dataToSend[fieldName] = !!fieldValue;

                } else if (fieldType === 'select') {
                    // Значение из select придет как строка. Если API ждет число (как для category_id), нужно преобразовать.
                    // Если выбрана пустая опция (""), то fieldValue будет пустой строкой.
                    // Если поле обязательное и пусто, ошибка уже добавлена выше.
                    // Если не обязательное и пусто, отправляем null (как договорились)
                    if (String(fieldValue).trim() === '' || fieldValue === null || fieldValue === undefined) {
                        dataToSend[fieldName] = null; // Отправляем null, если значение из select пустое/не определено
                    } else {
                        // Иначе, преобразуем строку значения из select в число.
                        const parsedValue = Number(fieldValue);
                        if (!isNaN(parsedValue)) {
                            dataToSend[fieldName] = parsedValue; // Отправляем числовое значение
                        } else {
                            // Если парсинг в число не удался (для select с value="число" такого не должно быть)
                            console.warn(`Modal: Could not parse select value "${fieldValue}" for field "${fieldName}" to number. Sending null.`);
                            dataToSend[fieldName] = null; // Отправим null
                        }
                    }
                }
                // Note: date from type="date" input is already "YYYY-MM-DD" string in formData,
                // which spendingStore then converts to ISO string for API.
            }
        });

        // Обновляем локальное состояние ошибок формы
        setErrors(newErrors);
        console.log('Modal: handleSubmit validation results - newErrors:', newErrors, 'dataToSend:', dataToSend); // Лог результатов валидации

        // Если ошибок валидации нет
        if (Object.keys(newErrors).length === 0) {
            console.log('Modal: Validation passed. Calling onSubmit with data:', dataToSend); // Лог успешной валидации
            // Вызываем переданный колбэк с очищенными/преобразованными данными
            onSubmit(dataToSend); // <-- Вызываем переданную функцию (например, handleAddSubmit на странице)

            // closeModal() не вызываем здесь. Закрытие происходит на странице после store action.

        } else {
            console.log('Modal: Validation failed. Errors:', newErrors); // Лог провала валидации
        }
        console.log('Modal: handleSubmit finished.'); // Лог завершения handleSubmit
    };

    return (
        // Подложка модала: фикс позиция, по центру, высокий z-index, полупрозрачный фон
        // Используем стили из твоей версии Modal.jsx
        <div className="fixed inset-0 flex justify-center z-50 items-start pt-[20vh]"
             style={{ backgroundColor: 'rgba(229, 231, 235, 0.7)' }}> {/* Твой полупрозрачный фон */}
            {/* Контейнер содержимого модала: отступы, скругления, тень, фиксированная ширина, фон, рамка */}
            {/* Используем стили из твоей версии Modal.jsx */}
            <div className="p-6 rounded-lg shadow-lg w-full max-w-md bg-green-100 border border-gray-300 relative max-h-[80vh] overflow-y-auto"> {/* Твой фон bg-green-100 */}
                {/* Кнопка закрытия - абсолютное позиционирование */}
                {/* Используем стили из твоей версии Modal.jsx */}
                <IconButton
                    icon={XMarkIcon}
                    onClick={onClose}
                    className="absolute top-2 right-2 text-gray-500 hover:text-gray-700"
                    tooltip="Закрыть"
                />

                {/* Заголовок */}
                {/* Используем стили из твоей версии Modal.jsx */}
                <Text variant="h2" className="mb-4 text-center">
                    {title}
                </Text>

                {/* Форма */}
                {/* Используем стили из твоей версии Modal.jsx */}
                <form onSubmit={handleSubmit} className="space-y-4">
                    {/* Маппим массив полей для рендеринга компонентов Input */}
                    {fields.map((field) => (
                        <div key={field.name} className="relative"> {/* relative для позиционирования тултипа */}
                            {/* Компонент Input: рендерит метку, поле ввода и ошибку */}
                            <Input
                                label={field.label} // Метка поля
                                name={field.name} // Имя поля
                                type={field.type || 'text'} // Тип поля (дефолт text)
                                // Значение поля: берем из локального состояния formData.
                                // Input ожидает значение (строку, число или булево).
                                // Убедимся, что значение для Input никогда не undefined.
                                value={formData[field.name]} // Передаем значение из состояния формы
                                onChange={handleChange} // Передаем обработчик изменения из Modal
                                error={errors[field.name]} // Сообщение об ошибке валидации для этого поля
                                placeholder={field.placeholder} // Текст-заполнитель
                                disabled={field.disabled} // Можно добавить отключение поля из определения fields
                                required={field.required} // Передаем required пропс в Input
                                // --- ДОБАВЛЕНО: Передача options для типа 'select' ---
                                options={field.options} // Передаем опции. Input сам проверит тип и рендерит select.
                                // --- Конец ДОБАВЛЕННОГО ---
                            />
                            {/* Тултип: если определен в описании поля */}
                            {field.tooltip && (
                                <Tooltip content={field.tooltip} className="absolute right-2 top-2"> {/* Позиционирование и стили тултипа */}
                                    <span>?</span> {/* Или иконка вопроса */}
                                </Tooltip>
                            )}
                        </div>
                    ))}

                    {/* Контейнер для кнопок формы */}
                    {/* Используем стили из твоей версии Modal.jsx */}
                    <div className="flex justify-end gap-2">
                        {/* Кнопка Отмена: при клике вызывает onClose */}
                        {/* Используем инлайн-стили из твоей версии Modal.jsx */}
                        <TextButton
                            onClick={onClose}
                            type="button" // Указываем type="button"
                            style={{ // Инлайн стиль фона из твоей версии
                                backgroundColor: `rgb(var(--color-secondary-500))`,
                                color: 'white',
                            }}
                            // Добавляем классы из твоей версии Modal.jsx
                            className="hover:[background-color:rgb(var(--color-secondary-800))] rounded-md px-4 py-2"
                        >
                            Отмена
                        </TextButton>
                        {/* Кнопка Отправить: type="submit" вызывает handleSubmit */}
                        {/* Используем инлайн-стили из твоей версии Modal.jsx */}
                        <TextButton
                            type="submit"
                            style={{ // Инлайн стиль фона из твоей версии
                                backgroundColor: `rgb(var(--color-primary-500))`,
                                color: 'white',
                            }}
                            // Добавляем классы из твоей версии Modal.jsx
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
    isOpen: PropTypes.bool.isRequired, // Пропс isOpen обязателен
    onClose: PropTypes.func.isRequired, // Функция закрытия
    title: PropTypes.string.isRequired, // Заголовок модала
    // fields - массив объектов, описывающих поля формы
    fields: PropTypes.arrayOf(PropTypes.shape({
        name: PropTypes.string.isRequired, // Имя поля
        label: PropTypes.string.isRequired, // Метка поля
        required: PropTypes.bool, // Обязательное поле?
        type: PropTypes.string, // Тип поля ('text', 'number', 'checkbox', 'date', 'select')
        placeholder: PropTypes.string, // Плейсхолдер
        tooltip: PropTypes.string, // Текст тултипа
        disabled: PropTypes.bool, // Отключено ли поле?
        // --- ДОБАВЛЕНО: options propType для типа 'select' ---
        // options - массив опций, обязателен, если type='select'
        options: (props, propName, componentName, location, propFullName) => {
            if (props.type === 'select') {
                // Если тип select, проверяем, что options существует и является массивом объектов
                if (!props[propName] || !Array.isArray(props[propName])) {
                    return new Error(
                        `Invalid prop \`${propFullName}\` supplied to \`${componentName}\`. ` +
                        `\`options\` is required and must be an array of objects when \`type\` is 'select'.`
                    );
                }
                // Проверяем форму объектов внутри массива options
                const optionShapeChecker = optionShape; // Используем определенный выше optionShape
                for (let i = 0; i < props[propName].length; i++) {
                    const error = optionShapeChecker(props[propName], i, componentName, location, `${propFullName}[${i}]`);
                    if (error) return error;
                }
            }
            // Если тип не select, или options корректен, нет ошибки
            return null;
        },
        // --- Конец ДОБАВЛЕННОГО ---
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
    initialData: {}, // Пустые начальные данные по умолчанию
    submitText: 'Сохранить', // Дефолтный текст кнопки
    // isOpen теперь обязателен, убираем его из defaultProps
};


export default Modal;