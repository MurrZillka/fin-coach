import { forwardRef } from 'react';
import Tooltip from './Tooltip';

// eslint-disable-next-line no-unused-vars
const IconButton = forwardRef(({ icon: Icon, onClick, className = '', tooltip, disabled = false }, ref) => {
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
});

IconButton.displayName = 'IconButton';

export default IconButton;