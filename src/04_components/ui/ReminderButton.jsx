// components/ui/ReminderButton.jsx
import { useState, useEffect, useRef } from 'react';
import { BellAlertIcon } from '@heroicons/react/24/outline';

export default function ReminderButton({
                                           needRemind,
                                           isLoading,
                                           onClick,
                                           className = '',
                                       }) {
    const [isBlinking, setIsBlinking] = useState(false);
    const intervalRef = useRef(null);

    useEffect(() => {
        if (intervalRef.current) {
            clearInterval(intervalRef.current);
            intervalRef.current = null;
        }

        if (needRemind && !isLoading) {
            setIsBlinking(true);
            intervalRef.current = setInterval(() => {
                setIsBlinking(prev => !prev);
            }, 1500);
        } else {
            setIsBlinking(false);
        }

        return () => {
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
                intervalRef.current = null;
            }
        };
    }, [needRemind, isLoading]);

    if (!needRemind || isLoading) return null;

    return (
        <button
            onClick={onClick}
            className={`
                ${isBlinking
                ? 'text-red-400 animate-pulse border-red-500 border-2'
                : 'text-yellow-300 border-red-500 border-2 border-opacity-0'
            }
                rounded-sm p-1 hover:text-red-500 hover:border-red-500 
                transition-all duration-100 cursor-pointer
                ${className}
            `}
            title="Есть напоминание!"
        >
            <BellAlertIcon className="h-6 w-6" />
        </button>
    );
}
