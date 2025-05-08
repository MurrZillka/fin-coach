// src/components/ui/Modal.jsx
import { useState, useEffect } from 'react'; // Импортируем useEffect для сброса формы при открытии/изменении данных
import Text from './Text'; // Убедись, что путь корректен
import Input from './Input'; // Убедись, что путь корректен
import TextButton from './TextButton'; // Убедись, что путь корректен
import Tooltip from './Tooltip'; // Убедись, что путь корректен
import PropTypes from 'prop-types'; // Убедись, что импортирован
import { XMarkIcon } from '@heroicons/react/24/outline'; // Убедись, что импортирован
import IconButton from './IconButton'; // Убедись, что путь корректен
// Импортируем useModalStore для доступа к его состоянию, если нужно для отладки рендеринга
// import useModalStore from '../stores/modalStore'; // Опциональный импорт для отладки, если нужно

const Modal = ({ isOpen, onClose, title, fields, initialData = {}, onSubmit, submitText = 'Сохранить' }) => {
    // Локальное состояние формы и ошибок
    const [formData, setFormData] = useState(initialData);
    const [errors, setErrors] = useState({});

    // Эффект для сброса formData и errors при изменении initialData или при открытии/закрытии модала
    // Это гарантирует, что при открытии для нового объекта (или закрытии/открытии) форма будет сброшена
    useEffect(() => {
        console.log('Modal: useEffect triggered. Re-initializing formData and errors.'); // Лог триггера useEffect
        // Устанавливаем начальные данные. Если initialData {}, форма пустая. Если для редактирования, она заполнится.
        const initialFormData = fields.reduce((acc, field) => {
            const initialValue = initialData[field.name];
            // Специальная обработка начальных значений для разных типов полей, чтобы Input получал ожидаемый формат
            if (field.type === 'checkbox') {
                // Для чекбокса значение должно быть булевым (true/false)
                acc[field.name] = initialValue === undefined || initialValue === null ? false : !!initialValue;
            } else if (field.type === 'select') {
                // Для select значение должно быть строкой, соответствующей value опции, или пустой строкой для плейсхолдера
                acc[field.name] = initialValue === undefined || initialValue === null ? '' : String(initialValue);
            }
            else {
                // Для остальных типов (text, number, date) значение - строка (или число/дата, но Input преобразует в строку)
                acc[field.name] = initialValue === undefined || initialValue === null ? '' : initialValue;
            }
            return acc;
        }, {});

        setFormData(initialFormData);
        setErrors({}); // Сбрасываем ошибки при re-initialization
        console.log('Modal: formData initialized to:', initialFormData); // Лог начальных данных формы

    }, [initialData, fields]); // Зависим от initialData и definitions of fields (если они могут меняться динамически)


    // Если модал не открыт, ничего не рендерим (контролируется в LayoutWithHeader, но эта проверка здесь для безопасности)
    if (!isOpen) {
        // console.log('Modal component: isOpen is false, returning null.'); // Отладочный лог
        return null;
    }

    // Обработчик изменения полей формы
    // Принимает объект события или объект { name, value } для специальных случаев (как checkbox в Input)
    const handleChange = (e) => {
        // e.target будет либо HTMLInputElement, либо HTMLSelectElement.
        // В Input.jsx мы уже нормализовали событие для чекбокса, возвращая { target: { name, value: checked } }.
        // Для остальных типов, e.target имеет name и value.
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
            const fieldValue = dataToSend[fieldName];

            // 1. Валидация на обязательность (Required)
            // Проверяем, является ли поле обязательным И его значение отсутствует или является "пустым"
            // "Пустое" для разных типов: undefined, null, пустая строка ("", для text, number, select, date), false (для checkbox, если required)
            // Более строгая проверка для обязательных полей:
            if (field.required) {
                let isFieldMissing = false;
                if (fieldValue === undefined || fieldValue === null) {
                    isFieldMissing = true;
                } else if (fieldType === 'checkbox') {
                    // Для обязательного чекбокса, он должен быть true. Если false, считаем "отсутствующим"
                    if (fieldValue === false) isFieldMissing = true;
                } else if (fieldType === 'number' || fieldType === 'text' || fieldType === 'date' || fieldType === 'select') {
                    // Для этих типов, пустая строка считается "отсутствующей"
                    if (String(fieldValue).trim() === '') isFieldMissing = true;
                }
                // Дополнительная проверка для select: если опции есть, но выбрана пустая опция ("")
                if (fieldType === 'select' && Array.isArray(field.options) && field.options.length > 0 && String(fieldValue) === '') {
                    isFieldMissing = true; // Если select обязателен и выбрана пустая опция
                }


                if (isFieldMissing) {
                    newErrors[fieldName] = `${field.label} обязателен`;
                }
            }


            // 2. Локальная валидация: проверка даты на будущее (для типа 'date' и поля с именем 'date')
            if (fieldName === 'date' && fieldType === 'date' && fieldValue && !newErrors[fieldName]) { // Проверяем только если нет других ошибок
                const inputDateString = String(fieldValue); // Должна быть строка "YYYY-MM-DD"

                // Сравниваем строку введенной даты со строкой сегодняшней даты (локально)
                if (inputDateString > todayLocalString) {
                    newErrors[fieldName] = `${field.label} не может быть в будущем`;
                }
            }

            // 3. Преобразование типов перед отправкой (на основе field.type)
            if (!newErrors[fieldName]) { // Только если нет ошибок валидации для этого поля
                if (fieldType === 'number') {
                    // Преобразуем в число. Пустая строка, null, undefined -> 0 или undefined если не required?
                    // Если required: true и пусто -> ошибка (уже обработано выше).
                    // Если not required и пусто -> отправляем 0 (как договорились ранее)
                    const valueAsString = String(fieldValue);
                    if (valueAsString.trim() !== '') {
                        const parsedAmount = parseFloat(valueAsString);
                        if (!isNaN(parsedAmount)) {
                            dataToSend[fieldName] = parsedAmount; // Успешно спарсили в число
                        } else {
                            // Если парсинг не удался и поле не было пустым, это ошибка
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
                    // Если не обязательное и пусто, отправляем null (как договорились ранее для числовых ID из select)
                    if (String(fieldValue).trim() === '' || fieldValue === null || fieldValue === undefined) {
                        dataToSend[fieldName] = null; // Отправляем null, если значение из select пустое/не определено
                    } else {
                        // Иначе, преобразуем строку значения из select в число.
                        // Убедимся, что результат - число, иначе может быть ошибка.
                        const parsedValue = Number(fieldValue);
                        if (!isNaN(parsedValue)) {
                            dataToSend[fieldName] = parsedValue; // Отправляем числовое значение
                        } else {
                            // Если парсинг в число не удался (хотя для select с value="число" такого быть не должно)
                            console.warn(`Modal: Could not parse select value "${fieldValue}" for field "${fieldName}" to number. Sending null.`);
                            // Отправим null, так как поле не обязательное (обязательность обработана выше) и парсинг не удался
                            dataToSend[fieldName] = null;
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
            // Обернем вызов onSubmit в try...catch, чтобы поймать ошибки из store actions,
            // если они не обрабатываются внутри самого store action и пробрасываются наружу.
            // Это позволит модалу остаться открытым и показать ошибку, если Layout не делает этого.
            // Однако, стандартный паттерн: store action устанавливает ошибку в сторе, а Layout/страница отображает ее.
            // Если onSubmit пробрасывает ошибку, ее должен поймать вызывающий код на странице.
            // Давайте придерживаться стандартного паттерна и не ловить здесь.
            onSubmit(dataToSend); // <-- Вызываем переданную функцию (например, handleAddSubmit на странице)

            // Важно: closeModal() не вызываем здесь!
            // Закрытие модала должно происходить на странице (SpendingsPage.jsx)
            // после успешного выполнения соответствующего store action (addSpending, updateSpending).
            // Это дает гибкость: модал остается открытым при ошибке API.

        } else {
            console.log('Modal: Validation failed. Errors:', newErrors); // Лог провала валидации
        }
        console.log('Modal: handleSubmit finished.'); // Лог завершения handleSubmit
    };

    return (
        // Подложка модала: фикс позиция, по центру, высокий z-index, полупрозрачный фон
        // Используем классы Tailwind
        <div className="fixed inset-0 flex justify-center z-50 items-start pt-[10vh] md:pt-[20vh]" // pt-[10vh] или pt-[20vh] для отступа сверху
             style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }} // Полупрозрачный фон (черный 50%)
        >
            {/* Контейнер содержимого модала: отступы, скругления, тень, фиксированная ширина, фон, рамка */}
            {/* Используем классы Tailwind */}
            <div className="p-6 rounded-lg shadow-lg w-full max-w-md bg-white border border-gray-300 relative max-h-[80vh] overflow-y-auto"> {/* bg-white - используем белый фон */}
                {/* Кнопка закрытия - абсолютное позиционирование */}
                <IconButton
                    icon={XMarkIcon}
                    onClick={onClose}
                    className="absolute top-2 right-2 text-gray-500 hover:text-gray-700" // Стилизация кнопки закрытия
                    tooltip="Закрыть"
                />

                {/* Заголовок */}
                <Text variant="h3" className="mb-6 text-center">{title}</Text> {/* Стилизация заголовка */}

                {/* Форма */}
                <form onSubmit={handleSubmit} className="space-y-4"> {/* space-y-4 для отступов между полями */}
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
                            {/* Позиционируем тултип относительно родительского div.relative */}
                            {field.tooltip && (
                                <Tooltip content={field.tooltip} className="absolute right-2 top-2"> {/* Стилизация тултипа */}
                                    <span>?</span> {/* Или иконка вопроса */}
                                </Tooltip>
                            )}
                        </div>
                    ))}

                    {/* Контейнер для кнопок формы */}
                    <div className="flex justify-end gap-3 mt-6"> {/* justify-end и gap для кнопок */}
                        {/* Кнопка Отмена: при клике вызывает onClose (закрывает модал через useModalStore) */}
                        {/* Используем классы Tailwind для стилизации кнопок */}
                        <TextButton
                            onClick={onClose}
                            type="button" // Указываем type="button", чтобы не сабмитило форму
                            className="bg-gray-300 text-gray-800 px-4 py-2 rounded-md hover:bg-gray-400"
                        >
                            Отмена
                        </TextButton>
                        {/* Кнопка Отправить: type="submit" вызывает handleSubmit формы */}
                        {/* Используем классы Tailwind для стилизации кнопок */}
                        <TextButton
                            type="submit"
                            className="bg-primary-600 text-white px-4 py-2 rounded-md hover:bg-primary-700"
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
    isOpen: PropTypes.bool.isRequired, // Пропс isOpen теперь обязателен, т.к. он используется для показа/скрытия
    onClose: PropTypes.func.isRequired, // Функция закрытия
    title: PropTypes.string.isRequired, // Заголовок модала
    // fields - массив объектов, описывающих поля формы
    fields: PropTypes.arrayOf(PropTypes.shape({
        name: PropTypes.string.isRequired, // Имя поля
        label: PropTypes.string.isRequired, // Метка поля
        required: PropTypes.bool, // Обязательное поле?
        type: PropTypes.string, // Тип поля ('text', 'number', 'checkbox', 'date', 'select' и т.д.)
        placeholder: PropTypes.string, // Плейсхолдер
        tooltip: PropTypes.string, // Текст тултипа
        disabled: PropTypes.bool, // Отключено ли поле?
        // --- ДОБАВЛЕНО: options propType для типа 'select' ---
        // options - массив опций, обязателен, если type='select'
        options: (props, propName, componentName, location, propFullName) => {
            if (props.type === 'select') {
                // Если тип select, проверяем, что options существует и является массивом
                if (!props[propName] || !Array.isArray(props[propName])) {
                    return new Error(
                        `Invalid prop \`${propFullName}\` supplied to \`${componentName}\`. ` +
                        `\`options\` is required and must be an array of objects when \`type\` is 'select'.`
                    );
                }
                // Опционально: можно добавить проверку формы объектов внутри массива options
                const optionShapeChecker = PropTypes.shape({
                    value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
                    label: PropTypes.string.isRequired,
                });
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