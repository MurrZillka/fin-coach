import { forwardRef } from 'react';
import Text from './Text';

const TextButton = forwardRef(({ children, onClick, className = '', disabled = false }, ref) => {
    return (
        <button
            ref={ref}
            onClick={onClick}
            disabled={disabled}
            className={`px-4 py-2 bg-primary-600 text-background rounded-md hover:bg-primary-500 transition focus:outline-none focus:ring-2 focus:ring-primary-600 focus:ring-opacity-50 disabled:opacity-50 disabled:cursor-not-allowed ${className}`}
        >
            <Text variant="button">{children}</Text>
        </button>
    );
});

TextButton.displayName = 'TextButton';

export default TextButton;