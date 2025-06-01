// src/components/Header.jsx
import {useNavigate} from 'react-router-dom';
import useAuthStore from '../stores/authStore';
import useRemindersStore from '../stores/remindersStore';
import useModalStore from '../stores/modalStore';
import Text from './ui/Text';
import IconButton from './ui/IconButton';
import NavLinkItem from './ui/NavLinkItem';
import MobileMenu from './ui/MobileMenu';
import {ArrowRightStartOnRectangleIcon} from '@heroicons/react/24/outline';
import ReminderButton from "./ui/ReminderButton.jsx";

export default function Header() {
    const navigate = useNavigate();
    const {isAuthenticated, logout} = useAuthStore();

    const { needRemind, loading } = useRemindersStore();
    const clearError = useRemindersStore(state => state.clearError);
    const openModal = useModalStore(state => state.openModal);

    const getUserName = () => {
        const storedName = localStorage.getItem('userName');
        return storedName || 'Пользователь';
    };

    const handleLogout = () => {
        logout();
        console.log('Header: Logout triggered.');
        navigate('/login', {replace: true});
    };

    const handleReminderClick = () => {
        console.log('Header: Reminder icon clicked. Opening reminder modal.');
        clearError();

        openModal(
            'reminderNotification',
            {
                title: 'Важное напоминание!',
                message: 'Пора обновить доходы и расходы, иначе может нарушиться точность учета финансов.',
                confirmText: 'Внести расходы',
                cancelText: 'Внести доходы',
                onConfirm: () => {
                    navigate('/spendings');
                },
                onCancel: () => {
                    navigate('/credits');
                },
                thirdButtonText: 'Закрыть',
                onThirdButtonClick: () => {
                }
            }
        );
    };

    const links = [
        {path: '/main', label: 'Главная'},
        {path: '/categories', label: 'Категории'},
        {path: '/spendings', label: 'Расходы'},
        {path: '/credits', label: 'Доходы'},
        {path: '/goals', label: 'Цели'},
    ];

    return (
        <header className="bg-secondary-800 text-background p-4 shadow-md h-[64px]">
            <div className="max-w-7xl mx-auto flex justify-between items-center h-full">
                {/* Логотип */}
                <Text variant="h1" className="md:text-xl">
                    Financial Coach
                </Text>

                <div className="flex justify-center md:flex-grow md:justify-end ml-4">
                    <ReminderButton
                        needRemind={needRemind}
                        isLoading={loading}
                        onClick={handleReminderClick}
                    />
                </div>

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
                        links={links}
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