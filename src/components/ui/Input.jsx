// src/components/ui/Input.jsx
import PropTypes from 'prop-types';
import Text from './Text';

// --- Добавляем propTypes для опций выпадающего списка ---
// Определяем структуру объекта опции
const optionShape = PropTypes.shape({
    value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired, // Значение опции (может быть строкой или числом, как ID)
    label: PropTypes.string.isRequired, // Отображаемый текст опции
});
// --- Конец propTypes для опций ---


export default function Input({
                                  label,
                                  value, // value для всех типов теперь
                                  onChange,
                                  type = 'text',
                                  name,
                                  error,
                                  placeholder, // Обычно не используется для checkbox и select
                                  disabled = false,
                                  options, // <--- НОВЫЙ prop: массив опций для типа 'select'
                                  required = false, // Добавляем пропс required для Input
                              }) {
    const errorId = `${name}-error`;

    // --- Проверяем тип поля ---
    const isCheckbox = type === 'checkbox';
    const isSelect = type === 'select'; // <--- НОВАЯ проверка для типа 'select'


    // Обработчик изменения поля ввода
    // Нормализует событие для разных типов полей
    const handleInputChange = (e) => {
        if (isCheckbox) {
            // Для чекбокса передаем булево значение checked
            onChange({
                target: {
                    name: e.target.name,
                    value: e.target.checked, // <--- Используем e.target.checked
                }
            });
        } else {
            // Для остальных типов (text, number, date, select), передаем стандартное значение из e.target.value
            // Для select, e.target.value будет строкой (значением выбранной опции)
            onChange(e); // <--- Передаем исходный объект события
        }
    };


    return (
        // Используем gap-1, как и было
        <div className="flex flex-col gap-1">
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
                        // Для чекбокса используем checked вместо value
                        checked={!!value} // <--- Используем checked пропс и приводим value к булеву (!!value)
                        onChange={handleInputChange} // <--- Используем наш модифицированный обработчик
                        disabled={disabled}
                        aria-invalid={!!error}
                        aria-describedby={error ? errorId : undefined}
                        // Стили для чекбокса
                        className={`form-checkbox h-5 w-5 text-primary-600 rounded ${ // Пример стилей для чекбокса
                            error ? 'border-form-error' : 'border-secondary-200'
                        } ${!disabled ? 'focus:ring-primary-500' : ''} ${
                            disabled ? 'bg-secondary-50 cursor-not-allowed opacity-60' : ''
                        }`}
                    />
                    {/* Опционально: метка справа от чекбокса, если нужно. Если есть label выше, этот не нужен. */}
                    {/* <Text variant="body" htmlFor={name}>{label}</Text> */}
                </div>
            ) : isSelect ? ( // <--- НОВЫЙ БЛОК: Рендеринг выпадающего списка (select)
                // --- Рендеринг select ---
                <select
                    id={name}
                    name={name}
                    // Value должно быть строкой для HTML select.
                    // Преобразуем полученное value (которое может быть числом, например, ID категории) в строку.
                    // Если value undefined или null, используем пустую строку, чтобы не было ошибки select с uncontrolled/controlled input.
                    value={value === undefined || value === null ? '' : String(value)} // Value для select, преобразуем в строку
                    onChange={handleInputChange}
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
                    {/* Ее наличие зависит от того, является ли поле обязательным */}
                    {/* Если поле обязательное, эту опцию можно сделать disabled или убрать, но часто она нужна как плейсхолдер */}
                    {/* Рендерим пустую опцию, только если она нужна (т.е. select не обязательный ИЛИ есть ошибка required) */}
                    {/* Проще всегда рендерить первую опцию с value="", она будет выбрана по умолчанию если value='' */}
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
                    onChange={handleInputChange} // <--- Используем наш модифицированный обработчик
                    placeholder={placeholder}
                    disabled={disabled}
                    aria-invalid={!!error}
                    aria-describedby={error ? errorId : undefined}
                    // Добавляем required пропс для input
                    required={required} // Пропс required для Input
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
                <Text variant="formError" id={errorId} className={error ? 'error-visible' : 'error-hidden'}>
                    {error || ''} {/* Отображаем текст ошибки или пусто */}
                </Text>
            </div>

            {/* Тултип рендерится в Modal.jsx */}

        </div>
    );
}

// --- Обновленные propTypes ---
Input.propTypes = {
    label: PropTypes.string,
    // value теперь может быть строкой, числом, булевым, или null/undefined
    // Правильный способ указать, что проп может быть одним из типов ИЛИ null/undefined - это не ставить .isRequired
    value: PropTypes.oneOfType([PropTypes.string, PropTypes.number, PropTypes.bool]), // <--- ИСПРАВЛЕНО: Убран null и undefined из массива
    onChange: PropTypes.func.isRequired,
    type: PropTypes.string, // Включает 'select' теперь
    name: PropTypes.string.isRequired,
    error: PropTypes.string,
    placeholder: PropTypes.string,
    disabled: PropTypes.bool,
    // Добавляем propType для массива опций, необходим при type='select'
    options: PropTypes.arrayOf(optionShape), // <--- НОВЫЙ propType: массив опций
    required: PropTypes.bool, // Добавляем propType для required
};
// --- Конец обновленных propTypes ---


Input.defaultProps = {
    type: 'text',
    disabled: false,
    required: false,
};