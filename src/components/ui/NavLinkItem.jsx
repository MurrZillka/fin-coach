// src/components/ui/NavLinkItem.jsx
import React from 'react';
// Импортируем Link и useLocation из React Router
import { Link, useLocation } from 'react-router-dom';

// Убедись, что путь к компоненту Text корректный из папки src/components/ui
import Text from './Text'; // Предполагается, что Text.jsx лежит рядом


// Определяем компонент NavLinkItem. Принимает props to (путь) и label (надпись ссылки)
const NavLinkItem = ({ to, label }) => {
    // Используем useLocation, чтобы узнать текущий путь URL
    const location = useLocation();

    // Определяем, активна ли ссылка (совпадает ли путь ссылки с текущим путем URL)
    const isActive = location.pathname === to;

    return (
        // --- Обертка span с отступом mx-4 ---
        // Этот span с margin-left/right (mx-4) оборачивает каждую ссылку
        // Как было сделано в HeaderAuth.jsx
        <span className="mx-4">
            {/* --- Условный рендеринг в зависимости от активности --- */}
            {isActive ? (
                // --- Если ссылка АКТИВНА ---
                // Рендерим ТОЛЬКО компонент Text, так как активная ссылка не должна быть кликабельной (она уже открыта)
                // Используем variant="navLinkInactive" и opacity-50 (как в HeaderAuth.jsx)
                // Добавляем cursor-default, чтобы курсор не менялся на "руку"
                <Text variant="navLinkInactive" className="opacity-50 cursor-default">
                    {label} {/* Отображаем надпись ссылки */}
                </Text>
            ) : (
                // --- Если ссылка НЕАКТИВНА ---
                // Рендерим тег Link из React Router, который оборачивает компонент Text
                <Link to={to}> {/* Link предоставляет кликабельность и переход по пути "to" */}
                    {/* Используем variant="navLink" для стилизации текста неактивной ссылки */}
                    {/* Добавь класс ховера сюда, если variant="navLink" сам по себе его не задает
                        (например: className="hover:text-opacity-80") */}
                    <Text variant="navLink">
                        {label} {/* Отображаем надпись ссылки */}
                    </Text>
                </Link>
            )}
            {/* --- Конец условного рендеринга --- */}
        </span>
        // --- Конец обертки span ---
    );
};

// Устанавливаем display name для отладки в React DevTools
NavLinkItem.displayName = 'NavLinkItem';

export default NavLinkItem;