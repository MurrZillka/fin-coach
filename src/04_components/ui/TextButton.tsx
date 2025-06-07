// src/components/ui/TextButton.tsx
import { forwardRef, ReactNode, ForwardedRef } from 'react';

const baseStyles = 'rounded-md transition focus:outline-none focus:ring-2 focus:ring-opacity-50 disabled:opacity-50 disabled:cursor-not-allowed';

const variantStyles = {
    primary: 'bg-primary-600 text-background hover:bg-primary-500 focus:ring-primary-600',
    secondary: 'bg-secondary-500 text-white hover:bg-secondary-800 focus:ring-secondary-500',
    error: 'bg-accent-error text-white hover:bg-accent-error/80 focus:ring-accent-error',
} as const;

const sizeStyles = {
    sm: 'px-2 py-1 text-sm',
    md: 'px-2 py-1 md:px-3 md:py-2 text-sm md:text-base',
    lg: 'px-4 py-2 text-base md:text-lg',
} as const;

type Variant = keyof typeof variantStyles;
type Size = keyof typeof sizeStyles;

interface TextButtonProps {
    children?: ReactNode;
    onClick?: () => void;
    className?: string;
    disabled?: boolean;
    type?: 'button' | 'submit' | 'reset';
    variant?: Variant;
    size?: Size;
}

const TextButton = forwardRef<HTMLButtonElement, TextButtonProps>(({
                                                                       children,
                                                                       onClick,
                                                                       className = '',
                                                                       disabled = false,
                                                                       type = 'button',
                                                                       variant = 'primary',
                                                                       size = 'md',
                                                                       ...rest
                                                                   }, ref: ForwardedRef<HTMLButtonElement>) => {
    const variantClass = variantStyles[variant] || variantStyles.primary;
    const sizeClass = sizeStyles[size] || sizeStyles.md;

    return (
        <button
            ref={ref}
            onClick={onClick}
            disabled={disabled}
            type={type}
            className={`${baseStyles} ${variantClass} ${sizeClass} ${className}`}
            {...rest}
        >
            {children}
        </button>
    );
});

TextButton.displayName = 'TextButton';

export default TextButton;
