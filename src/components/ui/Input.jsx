// src/components/ui/Input.jsx
import PropTypes from 'prop-types';
import Text from './Text';

export default function Input({
                                  label,
                                  value, // value для text/number/date, но для checkbox мы будем использовать 'checked' пропс
                                  onChange,
                                  type = 'text',
                                  name,
                                  error,
                                  placeholder, // Обычно не используется для checkbox
                                  disabled = false,
                              }) {
    const errorId = `${name}-error`;

    // --- НОВАЯ ЛОГИКА: Обработка типа checkbox ---
    const isCheckbox = type === 'checkbox';

    // Для checkbox, состояние "отмечен" хранится в булевом значении,
    // которое в формах обычно передается через пропс 'checked'.
    // В formData (в Modal.jsx) это будет поле с именем чекбокса и булевым значением.
    // Однако, onChange в Modal ожидает event.target.value, которое для checkbox не работает.
    // Модифицируем handleChange в Input, чтобы он возвращал правильное значение для checkbox.

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
            // Для остальных типов передаем стандартное строковое value
            onChange(e); // <--- Передаем исходный объект события для остальных типов
        }
    };
    // --- Конец НОВОЙ ЛОГИКИ ---


    return (
        // Используем gap-1, как и было
        <div className="flex flex-col gap-1">
            {label && (
                // Используем htmlFor для связки метки с полем ввода по ID
                <Text variant="label" htmlFor={name}>
                    {label}
                </Text>
            )}
            {/* --- НОВАЯ ЛОГИКА: Рендеринг поля ввода или чекбокса --- */}
            {/* Если это чекбокс, рендерим его немного иначе */}
            {isCheckbox ? (
                // Контейнер для чекбокса и метки в одной строке (по желанию, для лучшего выравнивания)
                // Убираем label выше, если он рендерится здесь же
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
                        // Стили для чекбокса могут отличаться
                        className={`form-checkbox h-5 w-5 text-primary-600 rounded ${ // Пример стилей для чекбокса
                            error ? 'border-form-error' : 'border-secondary-200'
                        } ${!disabled ? 'focus:ring-primary-500' : ''} ${
                            disabled ? 'bg-secondary-50 cursor-not-allowed opacity-60' : ''
                        }`}
                    />
                    {/* Опционально: метка справа от чекбокса, если нужно */}
                    {/* Если ты хочешь, чтобы метка была справа, удали блок с label выше */}
                    {/* <Text variant="body" htmlFor={name}>{label}</Text> */}
                </div>
            ) : (
                // Если это не чекбокс, рендерим как раньше (text, number, date и т.д.)
                <input
                    id={name}
                    type={type} // Используем переданный тип
                    name={name}
                    value={value || ''} // Используем value
                    onChange={handleInputChange} // <--- Используем наш модифицированный обработчик
                    placeholder={placeholder}
                    disabled={disabled}
                    aria-invalid={!!error}
                    aria-describedby={error ? errorId : undefined}
                    className={`border rounded-md px-3 py-2 text-base text-secondary-800 bg-background w-full transition-colors duration-300 ease-in-out ${
                        error ? 'border-form-error' : 'border-secondary-200'
                    } ${!disabled ? 'focus:ring-2 focus:ring-primary-500 focus:border-primary-500' : ''} ${
                        disabled ? 'bg-secondary-50 cursor-not-allowed opacity-60' : ''
                    }`}
                />
            )}
            {/* --- Конец НОВОЙ ЛОГИКИ Рендеринга --- */}


            {/* Контейнер для сообщения об ошибке (высота и скрытие overflow) */}
            <div className="h-[20px] overflow-hidden"> {/* Фиксированная высота, чтобы не прыгало */}
                {/* Текст ошибки, управляемый классами видимости */}
                {/* Классы error-visible/error-hidden должны быть определены в index.css */}
                <Text variant="formError" id={errorId} className={error ? 'error-visible' : 'error-hidden'}>
                    {error || ''} {/* Отображаем текст ошибки или пусто */}
                </Text>
            </div>

            {/* Тултип - его размещение может зависеть от типа поля,
                сейчас он рендерится в Modal.jsx, но если он должен быть частью Input,
                его логика должна быть здесь. В твоем Modal.jsx он рендерится рядом с Input. */}
            {/* {field.tooltip && ( ... )} */}

        </div>
    );
}

// --- НОВЫЕ propTypes для поддержки булевых значений для чекбокса ---
Input.propTypes = {
    label: PropTypes.string,
    // value теперь может быть строкой (для текста/числа/даты) или булевым (для чекбокса)
    value: PropTypes.oneOfType([PropTypes.string, PropTypes.bool]), // <--- ИЗМЕНЕНО
    onChange: PropTypes.func.isRequired,
    type: PropTypes.string,
    name: PropTypes.string.isRequired,
    error: PropTypes.string,
    placeholder: PropTypes.string,
    disabled: PropTypes.bool,
};
// --- Конец НОВЫХ propTypes ---

Input.defaultProps = {
    type: 'text',
    disabled: false,
};