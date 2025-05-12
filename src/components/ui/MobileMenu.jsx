// src/components/ui/MobileMenu.jsx
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bars3Icon } from '@heroicons/react/24/solid';
import NavLinkItem from './NavLinkItem';
import Text from './Text';
import IconButton from './IconButton';
import { ArrowRightStartOnRectangleIcon } from '@heroicons/react/24/outline';

const MobileMenu = ({ links, userName, onLogout }) => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const navigate = useNavigate();

    const toggleMenu = () => {
        setIsMenuOpen(!isMenuOpen);
    };

    const handleLinkClick = (path) => {
        setIsMenuOpen(false); // Закрываем меню
        setTimeout(() => {
            navigate(path); // Переходим по ссылке после анимации
        }, 300); // Задержка равна duration-300
    };

    // Авто-закрытие меню через 10 секунд бездействия
    useEffect(() => {
        let timer;
        if (isMenuOpen) {
            timer = setTimeout(() => {
                setIsMenuOpen(false);
            }, 10000); // 10 секунд
        }
        return () => clearTimeout(timer);
    }, [isMenuOpen]);

    return (
        <div className="md:hidden">
            {/* Кнопка гамбургера */}
            <button
                onClick={toggleMenu}
                className="p-2 text-background hover:bg-secondary-500 rounded-md"
            >
                <Bars3Icon className="h-6 w-6" />
            </button>

            {/* Мобильное меню */}
            <div
                className={`fixed top-[64px] left-0 w-full h-full flex flex-col px-6 py-4 gap-4 z-50 backdrop-blur-sm ${
                    isMenuOpen
                        ? 'animate-menu-slide-in'
                        : 'transform -translate-x-full transition-transform duration-300 ease-in-out'
                }`}
            >
                <div className="flex flex-col items-center bg-secondary-800/75 rounded-2xl gap-4">
                    {/* Имя пользователя */}
                    {userName && (
                        <Text variant="body" className="py-4 text-background">
                            {userName}
                        </Text>
                    )}
                    {/* Навигационные ссылки */}
                    {links.map((link) => (
                        <NavLinkItem
                            key={link.path}
                            to={link.path}
                            label={link.label}
                            onClick={() => handleLinkClick(link.path)} // Вызывает закрытие и навигацию
                            className="py-4 w-fit"
                        />
                    ))}
                    {/* Кнопка выхода */}
                    {onLogout && (
                        <IconButton
                            icon={ArrowRightStartOnRectangleIcon}
                            onClick={() => {
                                toggleMenu(); // Закрывает меню
                                onLogout(); // Выполняет выход
                            }}
                            className="py-4 text-background hover:bg-white/10"
                            tooltip="Выйти"
                        />
                    )}
                </div>
            </div>
        </div>
    );
};

MobileMenu.displayName = 'MobileMenu';

export default MobileMenu;