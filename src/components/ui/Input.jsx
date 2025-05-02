import PropTypes from 'prop-types';
import Text from './Text';

export default function Input({
                                  label,
                                  value,
                                  onChange,
                                  type = 'text',
                                  name,
                                  error,
                                  placeholder,
                                  disabled = false,
                              }) {
    const errorId = `${name}-error`;

    return (
        <div className="flex flex-col gap-1">
            {label && (
                <Text variant="label" htmlFor={name}>
                    {label}
                </Text>
            )}
            <input
                id={name}
                type={type}
                name={name}
                value={value}
                onChange={onChange}
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
            <div className="h-[20px] overflow-hidden">
                <Text variant="formError" id={errorId} className={error ? 'error-visible' : 'error-hidden'}>
                    {error || ''}
                </Text>
            </div>
        </div>
    );
}

Input.propTypes = {
    label: PropTypes.string,
    value: PropTypes.string.isRequired,
    onChange: PropTypes.func.isRequired,
    type: PropTypes.string,
    name: PropTypes.string.isRequired,
    error: PropTypes.string,
    placeholder: PropTypes.string,
    disabled: PropTypes.bool,
};

Input.defaultProps = {
    type: 'text',
    disabled: false,
};