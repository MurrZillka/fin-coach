// src/components/ui/Input.jsx
import PropTypes from 'prop-types';
import Text from './Text';

// --- Определяем propTypes для опций выпадающего списка ---
const optionShape = PropTypes.shape({
    value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired, // Значение опции
    label: PropTypes.string.isRequired, // Отображаемый текст опции
});
// --- Конец propTypes для опций ---

export default function Input({
                                  label,
                                  value, // value для всех типов, булево для checkbox
                                  onChange,
                                  type = 'text',
                                  name,
                                  error,
                                  placeholder, // Используется не для всех типов
                                  disabled = false,
                                  options, // <--- prop: массив опций для типа 'select'
                                  required = false, // пропс required
                              }) {
    const errorId = `${name}-error`;

    // --- Проверяем тип поля ---
    const isCheckbox = type === 'checkbox';
    const isSelect = type === 'select'; // проверка для типа 'select'

    // Обработчик изменения поля ввода
    const handleInputChange = (e) => {
        const { name, type } = e.target; // Получаем name и type из e.target

        let fieldValue; // Переменная для хранения актуального значения поля

        // Определяем значение поля в зависимости от его типа
        if (type === 'checkbox') {
            fieldValue = e.target.checked; // Для чекбокса значение - это булево checked
        } else if (type === 'number') {
            // Для числового поля берем value как строку. Парсинг в число происходит в Modal.jsx (в handleSubmit).
            fieldValue = e.target.value;
        } else if (type === 'select') {
            fieldValue = e.target.value; // Для select берем value как строку
        } else { // text, date и другие
            fieldValue = e.target.value; // Для остальных берем value как строку
        }

        // --- ИЗМЕНЕНИЕ: Вызываем onChange с name и определенным fieldValue для ВСЕХ типов ---
        onChange(name, fieldValue);
        // --- Конец ИЗМЕНЕНИЯ ---
    };

    return (
        // Используем gap-1, как и было
        <div className="flex flex-col gap-0">
            {label && (
                // Используем htmlFor для связки метки с полем ввода по ID
                <Text variant="label" htmlFor={name}>
                    {label}
                    {required && <span className="text-red-500 ml-1">*</span>} {/* Добавляем звездочку для обязательных полей */}
                </Text>
            )}

            {/* --- Условный рендеринг в зависимости от типа поля --- */}
            {isCheckbox ? (
                // --- Рендеринг чекбокса ---
                <div className="flex items-center gap-2">
                    <input
                        id={name}
                        type="checkbox" // Всегда type="checkbox"
                        name={name}
                        checked={!!value} // Привязываем к пропу value (который должен быть булевым)
                        onChange={handleInputChange} // <-- Используем наш модифицированный обработчик
                        disabled={disabled}
                        aria-invalid={!!error}
                        aria-describedby={error ? errorId : undefined}
                        // Сохраняем твои стили для чекбокса
                        className={`form-checkbox h-5 w-5 text-primary-600 rounded ${
                            error ? 'border-form-error' : 'border-secondary-200'
                        } ${!disabled ? 'focus:ring-primary-500' : ''} ${
                            disabled ? 'bg-secondary-50 cursor-not-allowed opacity-60' : ''
                        }`}
                    />
                    {/* Опционально: метка справа от чекбокса, если нужно */}
                    {/* <Text variant="body" htmlFor={name}>{label}</Text> */}
                </div>
            ) : isSelect ? ( // --- Рендеринг выпадающего списка (select) ---
                // --- Рендеринг select ---
                <select
                    id={name}
                    name={name}
                    // Value должно быть строкой для HTML select.
                    // Преобразуем полученное value (которое может быть числом, например, ID категории) в строку.
                    // Если value undefined или null, используем пустую строку.
                    value={value === undefined || value === null ? '' : String(value)} // Value для select, преобразуем в строку
                    onChange={handleInputChange} // <-- Используем наш модифицированный обработчик
                    disabled={disabled}
                    aria-invalid={!!error}
                    aria-describedby={error ? errorId : undefined}
                    // Применяем стили, похожие на input поля
                    className={`border rounded-md px-3 py-2 text-base text-secondary-800 bg-background w-full transition-colors duration-300 ease-in-out ${
                        error ? 'border-form-error' : 'border-secondary-200'
                    } ${!disabled ? 'focus:ring-2 focus:ring-primary-500 focus:border-primary-500' : ''} ${
                        disabled ? 'bg-secondary-50 cursor-not-allowed opacity-60' : ''
                    }`}
                >
                    {/* Опция по умолчанию (пустая) */}
                    {/* Рендерим пустую опцию с value="", она будет выбрана по умолчанию если value='' */}
                    <option value="">-- Выберите категорию --</option> {/* Плейсхолдер/пустая опция */}

                    {/* Перебираем массив опций и рендерим элементы <option> */}
                    {/* Проверяем, что options существует и является массивом */}
                    {options && Array.isArray(options) && options.map((option) => (
                        // Value опции может быть числом или строкой
                        <option key={option.value} value={option.value}> {/* Value опции */}
                            {option.label} {/* Отображаемый текст опции */}
                        </option>
                    ))}
                </select>
            ) : (
                // --- Рендеринг стандартного поля ввода (text, number, date и т.д.) ---
                <input
                    id={name}
                    type={type} // Используем переданный тип
                    name={name}
                    // Value для input, всегда преобразуем в строку
                    value={value === undefined || value === null ? '' : String(value)}
                    onChange={handleInputChange} // <-- Используем наш модифицированный обработчик
                    placeholder={placeholder}
                    disabled={disabled}
                    aria-invalid={!!error}
                    aria-describedby={error ? errorId : undefined}
                    // Добавляем required пропс для input (если он есть)
                    required={required}
                    // Сохраняем твои стили для input
                    className={`border rounded-md px-3 py-2 text-base text-secondary-800 bg-background w-full transition-colors duration-300 ease-in-out ${
                        error ? 'border-form-error' : 'border-secondary-200'
                    } ${!disabled ? 'focus:ring-2 focus:ring-primary-500 focus:border-primary-500' : ''} ${
                        disabled ? 'bg-secondary-50 cursor-not-allowed opacity-60' : ''
                    }`}
                />
            )}
            {/* --- Конец Условного рендеринга --- */}

            {/* Контейнер для сообщения об ошибке (фиксированная высота и скрытие overflow) */}
            <div className="h-[20px] overflow-hidden"> {/* Фиксированная высота, чтобы не прыгало */}
                {/* Текст ошибки, управляемый классами видимости error-visible/error-hidden */}
                {/* Классы error-visible/error-hidden должны быть определены в index.css */}
                <Text variant="formError" id={errorId} className={error ? 'error-visible' : 'error-hidden'}>
                    {error || ''} {/* Отображаем текст ошибки или пусто */}
                </Text>
            </div>

            {/* Тултип рендерится в Modal.jsx */}
        </div>
    );
}

// --- Обновленные propTypes (без изменений) ---
Input.propTypes = {
    label: PropTypes.string,
    // value может быть строкой, числом, булевым, null или undefined.
    // Убираем isRequired, чтобы разрешить null/undefined.
    value: PropTypes.oneOfType([PropTypes.string, PropTypes.number, PropTypes.bool]),
    onChange: PropTypes.func.isRequired,
    type: PropTypes.string, // Включает 'select' теперь
    name: PropTypes.string.isRequired,
    error: PropTypes.string,
    placeholder: PropTypes.string,
    disabled: PropTypes.bool,
    // Добавляем propType для массива опций, необходим при type='select'
    options: PropTypes.arrayOf(optionShape), // Массив опций
    required: PropTypes.bool, // Добавляем propType для required
};
// --- Конец обновленных propTypes ---

Input.defaultProps = {
    type: 'text',
    disabled: false,
    required: false, // По умолчанию не обязательное
};