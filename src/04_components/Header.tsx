// src/components/Header.tsx
import { useNavigate } from 'react-router-dom';
import useAuthStore from '../02_stores/authStore/authStore';
import useRemindersStore from '../02_stores/remindersStore/remindersStore';
import useModalStore from '../02_stores/modalStore/modalStore';
import Text from './ui/Text';
import IconButton from './ui/IconButton';
import NavLinkItem from './ui/NavLinkItem';
import MobileMenu from './ui/MobileMenu';
import ReminderButton from './ui/ReminderButton';
import { ArrowRightStartOnRectangleIcon } from '@heroicons/react/24/outline';
import { APP_NAME, NAVIGATION_LINKS } from '../constants/navigation';
import { createReminderModalProps } from './ui/Modals/utils/reminderModal';

export default function Header() {
    const navigate = useNavigate();
    const { isAuthenticated, logout } = useAuthStore();

    const needRemind = useRemindersStore(state => state.todayReminder?.TodayRemind?.need_remind);
    const reminderLoading = useRemindersStore(state => state.loading);
    const clearError = useRemindersStore(state => state.clearError);
    const openModal = useModalStore(state => state.openModal);

    const getUserName = (): string => {
        const storedName = localStorage.getItem('userName');
        return storedName || 'Пользователь';
    };

    const handleLogout = (): void => {
        logout();
        console.log('Header: Logout triggered.');
        navigate('/login', { replace: true });
    };

    const handleReminderClick = (): void => {
        console.log('Header: Reminder icon clicked. Opening reminder modal.');
        clearError();
        openModal('reminderNotification', createReminderModalProps(navigate));
    };

    return (
        <header className="bg-secondary-800 text-background p-4 shadow-md h-[64px]">
            <div className="max-w-7xl mx-auto flex justify-between items-center h-full">
                {/* Логотип */}
                <Text variant="h1" className="md:text-xl">
                    {APP_NAME}
                </Text>

                <div className="flex justify-center md:flex-grow md:justify-end ml-4">
                    <ReminderButton
                        needRemind={needRemind}
                        isLoading={reminderLoading}
                        onClick={handleReminderClick}
                    />
                </div>

                {/* Навигация и пользователь (для больших экранов) */}
                {isAuthenticated && (
                    <div className="hidden md:flex items-center space-x-4">
                        <nav className="flex items-center space-x-4">
                            {NAVIGATION_LINKS.map((link) => (
                                <NavLinkItem
                                    key={link.path}
                                    to={link.path}
                                    label={link.label}
                                />
                            ))}
                        </nav>
                        <Text variant="navLink">
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

                {/* Мобильное меню */}
                {isAuthenticated && (
                    <MobileMenu
                        links={NAVIGATION_LINKS}
                        userName={getUserName()}
                        onLogout={handleLogout}
                        hasReminder={needRemind}
                        onReminderClick={handleReminderClick}
                    />
                )}
            </div>
        </header>
    );
}

Header.displayName = 'Header';
