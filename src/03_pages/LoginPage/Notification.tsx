import React from 'react';

interface NotificationProps {
    type: 'error' | 'success';
    message: string;
    className?: string;
}

const Notification: React.FC<NotificationProps> = ({ type, message, className = '' }) => {
    const baseClasses = "mb-4 p-3 rounded-md";
    const typeClasses = {
        error: "bg-red-100 border border-red-300 text-gray-800",
        success: "bg-green-100 text-green-800"
    };

    return (
        <div className={`${baseClasses} ${typeClasses[type]} ${className}`}>
            {message}
        </div>
    );
};

export default Notification;
