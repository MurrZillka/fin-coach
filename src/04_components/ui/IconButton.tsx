// src/components/ui/IconButton.tsx
import { forwardRef, ComponentType, SVGProps, ForwardedRef } from 'react';
import Tooltip from './Tooltip';

interface IconButtonProps {
    icon: ComponentType<SVGProps<SVGSVGElement>>;
    onClick?: () => void;
    className?: string;
    tooltip?: string;
    disabled?: boolean;
    // Позволяет явно указать aria-label, если нужно отличать от tooltip
    'aria-label'?: string;
}

const IconButton = forwardRef<HTMLButtonElement, IconButtonProps>(
    (
        {
            icon: Icon,
            onClick,
            className = '',
            tooltip,
            disabled = false,
            'aria-label': ariaLabel,
            ...rest
        },
        ref: ForwardedRef<HTMLButtonElement>
    ) => {
        const button = (
            <button
                ref={ref}
                onClick={onClick}
                disabled={disabled}
                className={`p-2 rounded-md transition focus:outline-none focus:ring-2 focus:ring-opacity-50 disabled:opacity-50 disabled:cursor-not-allowed ${className}`}
                aria-label={ariaLabel ?? tooltip}
                {...rest}
            >
                <Icon className="w-5 h-5" />
            </button>
        );

        return tooltip ? <Tooltip text={tooltip}>{button}</Tooltip> : button;
    }
);

IconButton.displayName = 'IconButton';

export default IconButton;
