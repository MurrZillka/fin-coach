import React from 'react';

export default function Loader() {
    return (
        <div className="flex justify-center min-h-screen bg-secondary-50 pt-[15vh]">
            <div className="flex space-x-2">
                <div className="w-4 h-4 bg-primary-500 rounded-full animate-pulse-loader"></div>
                <div className="w-4 h-4 bg-primary-500 rounded-full animate-pulse-loader animation-delay-200"></div>
                <div className="w-4 h-4 bg-primary-500 rounded-full animate-pulse-loader animation-delay-400"></div>
            </div>
        </div>
    );
}