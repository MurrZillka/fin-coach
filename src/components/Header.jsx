// src/components/Header.jsx
import { useNavigate } from 'react-router-dom';
import useAuthStore from '../stores/authStore';
import Text from './ui/Text';
import IconButton from './ui/IconButton';
import NavLinkItem from './ui/NavLinkItem';
import MobileMenu from './ui/MobileMenu';
import { ArrowRightStartOnRectangleIcon } from '@heroicons/react/24/outline';

export default function Header() {
    const navigate = useNavigate();
    const { isAuthenticated, logout } = useAuthStore();

    const getUserName = () => {
        const storedName = localStorage.getItem('userName');
        return storedName || 'Пользователь';
    };

    const handleLogout = () => {
        logout();
        console.log('Header: Logout triggered.');
        navigate('/login', { replace: true });
    };

    const links = [
        { path: '/main', label: 'Главная' },
        { path: '/categories', label: 'Категории' },
        { path: '/spendings', label: 'Расходы' },
        { path: '/credits', label: 'Доходы' },
        { path: '/goals', label: 'Цели' },
    ];

    return (
        <header className="bg-secondary-800 text-background p-4 shadow-md flex-shrink-0">
            <div className="max-w-7xl mx-auto flex justify-between items-center h-full">
                {/* Логотип */}
                <Text variant="h1" className="md:text-xl">
                    Financial Coach
                </Text>

                {/* Навигация и пользователь (для больших экранов) */}
                {isAuthenticated && (
                    <div className="hidden md:flex items-center space-x-4">
                        <nav className="flex items-center space-x-4">
                            {links.map((link) => (
                                <NavLinkItem
                                    key={link.path}
                                    to={link.path}
                                    label={link.label}
                                />
                            ))}
                        </nav>
                        <Text variant="body" className="text-background">
                            {getUserName()}
                        </Text>
                        <IconButton
                            icon={ArrowRightStartOnRectangleIcon}
                            onClick={handleLogout}
                            className="text-background hover:bg-white/10"
                            tooltip="Выйти"
                        />
                    </div>
                )}

                {/* Мобильное меню (для малых экранов) */}
                {isAuthenticated && (
                    <MobileMenu
                        links={links}
                        userName={getUserName()}
                        onLogout={handleLogout}
                    />
                )}
            </div>
        </header>
    );
}

Header.displayName = 'Header';