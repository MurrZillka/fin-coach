// src/components/ui/Tooltip.tsx
import { forwardRef, ForwardedRef, ReactNode } from 'react';

type Position = 'top' | 'bottom' | 'left' | 'right';

interface TooltipProps {
    children: ReactNode;
    text: string;
    position?: Position;
    className?: string;
}

const Tooltip = forwardRef<HTMLSpanElement, TooltipProps>(({
                                                               children,
                                                               text,
                                                               position = 'top',
                                                               className = ''
                                                           }, ref: ForwardedRef<HTMLSpanElement>) => {
    const positionClasses = {
        top: 'bottom-full left-1/2 transform -translate-x-1/2 mb-2',
        bottom: 'top-full left-1/2 transform -translate-x-1/2 mt-2',
        left: 'right-full top-1/2 transform -translate-y-1/2 mr-2',
        right: 'left-full top-1/2 transform -translate-y-1/2 ml-2'
    };

    const arrowClasses = {
        top: 'top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-secondary-800',
        bottom: 'bottom-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-b-secondary-800',
        left: 'left-full top-1/2 transform -translate-y-1/2 border-4 border-transparent border-l-secondary-800',
        right: 'right-full top-1/2 transform -translate-y-1/2 border-4 border-transparent border-r-secondary-800'
    };

    return (
        <span
            ref={ref}
            className={`relative group ${className}`}
        >
            {children}
            <span
                className={`
                    absolute ${positionClasses[position]} 
                    hidden group-hover:block 
                    bg-secondary-800 text-background text-xs rounded-sm px-2 py-1 
                    shadow-sm whitespace-nowrap z-50
                    transition-opacity duration-200 delay-300
                `}
                role="tooltip"
                aria-hidden="true"
            >
                {text}
                <span className={`absolute ${arrowClasses[position]}`}></span>
            </span>
        </span>
    );
});

Tooltip.displayName = 'Tooltip';

export default Tooltip;
