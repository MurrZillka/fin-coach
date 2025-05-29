// src/components/Header.jsx
import { useNavigate } from 'react-router-dom';
import { useEffect, useState, useRef } from 'react';
import useAuthStore from '../stores/authStore';
import useRemindersStore from '../stores/remindersStore';
import useModalStore from '../stores/modalStore';
import Text from './ui/Text';
import IconButton from './ui/IconButton';
import NavLinkItem from './ui/NavLinkItem';
import MobileMenu from './ui/MobileMenu';
import { ArrowRightStartOnRectangleIcon, BellAlertIcon } from '@heroicons/react/24/outline';
import Tooltip from "./ui/Tooltip.jsx";

export default function Header() {
    const navigate = useNavigate();
    const { isAuthenticated, user, logout } = useAuthStore();
    // Деструктурируем todayReminder, loading, fetchTodayReminder, clearError
    const { todayReminder, loading: reminderLoading, fetchTodayReminder, clearError } = useRemindersStore();
    const { openModal } = useModalStore();

    const [isBlinking, setIsBlinking] = useState(false);
    const blinkIntervalRef = useRef(null);

    const getUserName = () => {
        const storedName = localStorage.getItem('userName');
        return storedName || 'Пользователь';
    };

    const handleLogout = () => {
        logout();
        console.log('Header: Logout triggered.');
        navigate('/login', { replace: true });
    };

    // --- ЛОГИКА ФЕТЧИНГА НАПОМИНАНИЙ ---
    useEffect(() => {
        if (isAuthenticated && user?.access_token) {
            console.log('Header: Authenticated, fetching today reminder...');
            fetchTodayReminder();
        } else {
            setIsBlinking(false);
            if (blinkIntervalRef.current) {
                clearInterval(blinkIntervalRef.current);
                blinkIntervalRef.current = null;
            }
        }
    }, [isAuthenticated, user?.access_token, fetchTodayReminder]);

    // --- ЛОГИКА МОРГАНИЯ ЛАМПОЧКИ ---
    useEffect(() => {
        // --- ИЗМЕНЕНО: Правильный доступ к todayReminder.TodayRemind.need_remind ---
        if (todayReminder?.TodayRemind?.need_remind && !reminderLoading) {
            const startBlinking = () => {
                if (blinkIntervalRef.current) {
                    clearInterval(blinkIntervalRef.current);
                }

                const toggleBlink = () => setIsBlinking(prev => !prev);
                let currentIntervalTime = 0;

                const createNextBlink = () => {
                    currentIntervalTime = Math.random() * (3000 - 2000) + 2000;
                    blinkIntervalRef.current = setTimeout(() => {
                        toggleBlink();
                        createNextBlink();
                    }, currentIntervalTime);
                };

                createNextBlink();
            };

            startBlinking();
        } else {
            setIsBlinking(false);
            if (blinkIntervalRef.current) {
                clearInterval(blinkIntervalRef.current);
                blinkIntervalRef.current = null;
            }
        }

        return () => {
            if (blinkIntervalRef.current) {
                clearInterval(blinkIntervalRef.current);
            }
        };
    }, [todayReminder, reminderLoading]);

    // --- ОБРАБОТЧИК КЛИКА ПО ЛАМПОЧКЕ ---
    const handleReminderClick = () => {
        console.log('Header: Reminder icon clicked. Opening reminder modal.');
        clearError();

        // --- ИЗМЕНЕНИЕ ЗДЕСЬ: ПРАВИЛЬНЫЙ ВЫЗОВ openModal ---
        openModal(
            'reminderNotification', // <-- ПЕРВЫЙ АРГУМЕНТ: СТРОКА (тип модалки)
            { // <-- ВТОРОЙ АРГУМЕНТ: ОБЪЕКТ (пропсы для модалки)
                title: 'Важное напоминание!',
                message: 'Пора обновить доходы и расходы, иначе может нарушиться точность учета финансов.',
                confirmText: 'Внести расходы',
                cancelText: 'Внести доходы',
                onConfirm: () => {
                    navigate('/spendings');
                    // closeModal(); // Удаляем это, так как модалка сама закрывается
                },
                onCancel: () => {
                    navigate('/credits');
                    // closeModal(); // Удаляем это, так как модалка сама закрывается
                },
                thirdButtonText: 'Закрыть',
                onThirdButtonClick: () => {
                    // closeModal(); // Удаляем это, так как модалка сама закрывается
                }
            }
        );
    };

    const links = [
        { path: '/main', label: 'Главная' },
        { path: '/categories', label: 'Категории' },
        { path: '/spendings', label: 'Расходы' },
        { path: '/credits', label: 'Доходы' },
        { path: '/goals', label: 'Цели' },
    ];

    return (
        <header className="bg-secondary-800 text-background p-4 shadow-md flex-shrink-0 h-[64px]">
            <div className="max-w-7xl mx-auto flex justify-between items-center h-full">
                {/* Логотип */}
                <Text variant="h1" className="md:text-xl">
                    Financial Coach
                </Text>

                {/* --- НОВОЕ МЕСТО ДЛЯ КОЛОКОЛЬЧИКА: ВСЕГДА ВИДЕН --- */}
                <div className="flex justify-center md:justify-end w-full">
                {todayReminder?.TodayRemind?.need_remind && !reminderLoading && (
                    <IconButton
                        icon={BellAlertIcon}
                        onClick={handleReminderClick}
                        className={`
                            ${isBlinking
                            ? 'text-red-400 animate-pulse border-red-500 border-2 border-opacity-100'
                            : 'text-yellow-300 border-red-500 border-2 border-opacity-0'}
                            rounded-full p-1
                            hover:text-red-500 hover:border-red-500 transition-all duration-100
                            cursor-pointer
                            // ml-auto // <-- УДАЛЕН ЭТОТ КЛАСС
                        `}
                        tooltip="Есть напоминание!"
                    />
                )}
                </div>
                {/* --- КОНЕЦ НОВОГО МЕСТА --- */}


                {/* Навигация и пользователь (для больших экранов) - скрывается на мобилке */}
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
                        {/* Здесь колокольчик был раньше, теперь его убрали */}
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
                        hasReminder={todayReminder?.TodayRemind?.need_remind && !reminderLoading}
                        onReminderClick={handleReminderClick}
                        // isBlinking пока не передаем в MobileMenu, если он теперь не рендерит сам колокольчик.
                        // Если MobileMenu внутри себя тоже что-то показывает про напоминание, тогда надо будет передать.
                        // Но если MobileMenu просто содержит бургер, то не надо.
                    />
                )}
            </div>
        </header>
    );
}

Header.displayName = 'Header';