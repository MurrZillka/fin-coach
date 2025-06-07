// src/components/ui/IconButton.tsx
import { forwardRef, ForwardRefExoticComponent, RefAttributes, SVGProps, ForwardedRef } from 'react';
import Tooltip from './Tooltip';

interface IconButtonProps {
    icon: ForwardRefExoticComponent<
    Omit<SVGProps<SVGSVGElement>, 'ref'> &
    { title?: string; titleId?: string; } &
    RefAttributes<SVGSVGElement>
    >;
    onClick?: () => void;
    className?: string;
    tooltip?: string;
    disabled?: boolean;
}

const IconButton = forwardRef<HTMLButtonElement, IconButtonProps>(
    ({ icon: Icon, onClick, className = '', tooltip, disabled = false }, ref: ForwardedRef<HTMLButtonElement>) => {
        const button = (
            <button
                ref={ref}
                onClick={onClick}
                disabled={disabled}
                className={`p-2 rounded-md transition focus:outline-none focus:ring-2 focus:ring-opacity-50 disabled:opacity-50 disabled:cursor-not-allowed ${className}`}
            >
                <Icon className="w-5 h-5" />
            </button>
        );

        return tooltip ? <Tooltip text={tooltip}>{button}</Tooltip> : button;
    }
);

IconButton.displayName = 'IconButton';

export default IconButton;
