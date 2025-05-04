// src/components/ui/HeaderAuth.jsx
// Удалены Link и useLocation, т.к. они теперь внутри NavLinkItem
// Удаляем Text, т.к. он используется внутри NavLinkItem
// import { Link, useLocation } from 'react-router-dom'; // Удалено

// --- Добавлен обратно импорт Text ---
// Убедись, что путь к Text корректный из папки src/components/ui
import Text from './ui/Text.jsx'; // Добавляем обратно импорт компонента Text
// --- Конец добавленного импорта ---

// --- Импортируем NavLinkItem ---
// Убедись, что путь к NavLinkItem корректный (из папки src/components/ui)
import NavLinkItem from './ui/NavLinkItem.jsx';
// --- Конец импорта NavLinkItem ---


// Компонент HeaderAuth теперь гораздо чище
const HeaderAuth = () => {
    // useLocation больше не нужен здесь

    // Определяем список ссылок
    const links = [
        { path: '/demo', label: 'Обзор' },
        { path: '/login', label: 'Войти' },
        { path: '/signup', label: 'Зарегистрироваться' },
    ];

    return (
        // Классы хедера
        <header className="bg-secondary-800 text-background p-5 shadow-md flex-shrink-0">
            <div className="max-w-7xl mx-auto flex justify-between items-center h-full">
                {/* --- Теперь компонент Text импортирован и может быть использован --- */}
                <Text variant="h1">Financial Coach</Text> {/* Рендерим заголовок */}
                {/* --- Конец использования Text --- */}

                <nav className="h-full flex items-center">
                    {/* Используем NavLinkItem для ссылок */}
                    {links.map((link) => (
                        <NavLinkItem
                            key={link.path}
                            to={link.path}
                            label={link.label}
                        />
                    ))}
                </nav>
            </div>
        </header>
    );
};

// Устанавливаем display name для отладки
HeaderAuth.displayName = 'HeaderAuth';

export default HeaderAuth;