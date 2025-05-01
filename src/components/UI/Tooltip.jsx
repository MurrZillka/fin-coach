import { forwardRef } from 'react';

const Tooltip = forwardRef(({ children, text }, ref) => {
    return (
        <span ref={ref} className="relative group">
      {children}
            <span className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 hidden group-hover:block bg-secondary-800 text-background text-xs rounded-sm px-2 py-1 shadow-sm whitespace-nowrap">
        {text}
                <span className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-secondary-800"></span>
      </span>
    </span>
    );
});

Tooltip.displayName = 'Tooltip';

export default Tooltip;