// src/components/ui/MobileMenu.tsx
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bars3Icon } from '@heroicons/react/24/solid';
import NavLinkItem from './NavLinkItem';
import Text from './Text';
import IconButton from './IconButton';
import { ArrowRightStartOnRectangleIcon } from '@heroicons/react/24/outline';

interface LinkItem {
    path: string;
    label: string;
}

interface MobileMenuProps {
    links: LinkItem[];
    userName?: string;
    onLogout?: () => void;
    hasReminder?: boolean;
    onReminderClick?: () => void;
}

const MobileMenu = ({ links, userName, onLogout }: MobileMenuProps) => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const navigate = useNavigate();

    const toggleMenu = () => {
        setIsMenuOpen(!isMenuOpen);
    };

    const handleLinkClick = (path: string) => {
        setIsMenuOpen(false);
        setTimeout(() => {
            navigate(path);
        }, 300);
    };

    useEffect(() => {
        let timer: NodeJS.Timeout;
        if (isMenuOpen) {
            timer = setTimeout(() => {
                setIsMenuOpen(false);
            }, 10000);
        }
        return () => clearTimeout(timer);
    }, [isMenuOpen]);

    return (
        <div className="md:hidden">
            <button
                onClick={toggleMenu}
                className="p-2 text-background hover:bg-secondary-500 rounded-md"
            >
                <Bars3Icon className="h-6 w-6" />
            </button>

            <div
                className={`fixed top-[64px] left-0 w-full h-full flex flex-col px-6 py-4 gap-4 z-50 backdrop-blur-sm ${
                    isMenuOpen
                        ? 'animate-menu-slide-in'
                        : 'transform -translate-x-full transition-transform duration-300 ease-in-out'
                }`}
            >
                <div className="flex flex-col items-center bg-secondary-800/75 rounded-2xl gap-4">
                    {userName && (
                        <Text variant="body" className="py-4 text-background">
                            {userName}
                        </Text>
                    )}
                    {links.map((link) => (
                        <NavLinkItem
                            key={link.path}
                            to={link.path}
                            label={link.label}
                            onClick={() => handleLinkClick(link.path)}
                            className="py-4 w-fit"
                        />
                    ))}
                    {onLogout && (
                        <IconButton
                            icon={ArrowRightStartOnRectangleIcon}
                            onClick={() => {
                                toggleMenu();
                                onLogout();
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
