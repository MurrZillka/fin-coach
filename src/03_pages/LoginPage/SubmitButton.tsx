import React from 'react';

interface SubmitButtonProps {
    isLoading: boolean;
    loadingText?: string;
    children: React.ReactNode;
    className?: string;
}

const SubmitButton: React.FC<SubmitButtonProps> = ({
                                                       isLoading,
                                                       loadingText = 'Загрузка...',
                                                       children,
                                                       className = ''
                                                   }) => {
    const baseClasses = "w-full bg-primary-500 text-background font-medium py-2 px-4 rounded-md hover:bg-primary-600 disabled:bg-secondary-500 disabled:cursor-not-allowed";

    return (
        <button
            type="submit"
            className={`${baseClasses} ${className}`}
            disabled={isLoading}
        >
            {isLoading ? loadingText : children}
        </button>
    );
};

export default SubmitButton;
