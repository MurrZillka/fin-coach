//src/components/ui/HeaderAuth.jsx
import { Link, useLocation } from 'react-router-dom'; // useLocation все еще нужен для выделения текущей ссылки
import Text from './ui/Text.jsx'; // Убедись, что путь к компоненту Text правильный относительно этой папки

const HeaderAuth = () => {
    const location = useLocation();
    // Удалили переменную allowedPaths и избыточную проверку if()
    // Логика выбора HeaderAuth теперь полностью в LayoutWithHeader.jsx

    const links = [
        { path: '/demo', label: 'Обзор' },
        { path: '/login', label: 'Войти' },
        { path: '/signup', label: 'Зарегистрироваться' },
    ];

    return (
        // ДОБАВЛЕН КЛАСС h-16 для фиксированной высоты
        <header className="bg-secondary-800 text-background p-4 shadow-md h-16">
            <div className="max-w-7xl mx-auto flex justify-between items-center h-full"> {/* h-full */}
                <Text variant="h1">Financial Coach</Text>
                <nav className="h-full flex items-center"> {/* h-full и flex items-center */}
                    {links.map((link) => (
                        <span key={link.path} className="mx-4">
                            {/* useLocation все еще нужен здесь для сравнения location.pathname с link.path */}
                            {location.pathname === link.path ? (
                                <Text variant="navLinkInactive" className="opacity-50">
                                    {link.label}
                                </Text>
                            ) : (
                                <Link to={link.path}>
                                    <Text variant="navLink">{link.label}</Text>
                                </Link>
                            )}
                        </span>
                    ))}
                </nav>
            </div>
        </header>
    );
};

export default HeaderAuth;