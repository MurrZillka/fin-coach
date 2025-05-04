//src/components/ui/HeaderAuth.jsx
import { Link, useLocation } from 'react-router-dom';
import Text from './ui/Text.jsx'; // Убедись, что путь правильный

const HeaderAuth = () => {
    const location = useLocation();

    const links = [
        { path: '/demo', label: 'Обзор' },
        { path: '/login', label: 'Войти' },
        { path: '/signup', label: 'Зарегистрироваться' },
    ];

    return (
        // Убран класс h-16. Высота определяется содержимым и p-4. Добавлен flex-shrink-0.
        <header className="bg-secondary-800 text-background p-5 shadow-md flex-shrink-0">
            <div className="max-w-7xl mx-auto flex justify-between items-center h-full"> {/* h-full и items-center */}
                <Text variant="h1">Financial Coach</Text>
                <nav className="h-full flex items-center"> {/* h-full и flex items-center */}
                    {links.map((link) => (
                        <span key={link.path} className="mx-4">
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