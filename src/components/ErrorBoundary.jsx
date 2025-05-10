// src/components/ErrorBoundary.jsx
import React from 'react';

/**
 * Компонент для обработки ошибок в дочерних компонентах.
 */
class ErrorBoundary extends React.Component {
    state = { hasError: false };

    static getDerivedStateFromError() {
        return { hasError: true };
    }

    render() {
        if (this.state.hasError) {
            return (
                <div className="text-accent-error p-4">
                    Произошла ошибка. Пожалуйста, перезагрузите страницу.
                </div>
            );
        }
        return this.props.children;
    }
}

export default ErrorBoundary;