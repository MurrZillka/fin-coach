// src/components/Header.jsx
import {useNavigate} from 'react-router-dom';
import {useEffect, useState, useRef} from 'react';
import useAuthStore from '../stores/authStore';
import useRemindersStore from '../stores/remindersStore';
import useModalStore from '../stores/modalStore';
import Text from './ui/Text';
import IconButton from './ui/IconButton';
import NavLinkItem from './ui/NavLinkItem';
import MobileMenu from './ui/MobileMenu';
import {ArrowRightStartOnRectangleIcon, BellAlertIcon} from '@heroicons/react/24/outline';
import Tooltip from "./ui/Tooltip.jsx";

export default function Header() {
    const navigate = useNavigate();
    const {isAuthenticated, user, logout} = useAuthStore();

    const needRemind = useRemindersStore(state => state.todayReminder?.TodayRemind?.need_remind);
    const reminderLoading = useRemindersStore(state => state.loading);
    const fetchTodayReminder = useRemindersStore(state => state.fetchTodayReminder);
    const clearError = useRemindersStore(state => state.clearError);
    const openModal = useModalStore(state => state.openModal);

    const [isBlinking, setIsBlinking] = useState(false);
    const blinkIntervalRef = useRef(null);

    const getUserName = () => {
        const storedName = localStorage.getItem('userName');
        return storedName || 'Пользователь';
    };

    const handleLogout = () => {
        logout();
        console.log('Header: Logout triggered.');
        navigate('/login', {replace: true});
    };

    // --- ЛОГИКА ФЕТЧИНГА НАПОМИНАНИЙ ---
    useEffect(() => {
        if (isAuthenticated && user?.access_token) {
            console.log('Header: Authenticated, fetching today reminder...');
            fetchTodayReminder();
        } else {
            // При отсутствии аутентификации, убедимся, что моргание остановлено
            setIsBlinking(false);
            if (blinkIntervalRef.current) {
                clearInterval(blinkIntervalRef.current);
                blinkIntervalRef.current = null;
            }
        }
    }, [isAuthenticated, user?.access_token, fetchTodayReminder]);

    // --- ИСПРАВЛЕННАЯ ЛОГИКА МОРГАНИЯ ЛАМПОЧКИ ---
    useEffect(() => {
        // Очищаем предыдущий интервал при каждом перезапуске эффекта
        if (blinkIntervalRef.current) {
            clearInterval(blinkIntervalRef.current);
            blinkIntervalRef.current = null;
        }

        // Если нужно моргать и нет загрузки
        if (needRemind && !reminderLoading) {
            // Устанавливаем isBlinking в true, чтобы начать моргание сразу
            // (или в false, если хотим начать с невидимой)
            setIsBlinking(true);

            // Запускаем интервал
            const toggleBlink = () => setIsBlinking(prev => !prev);
            let currentIntervalTime = 0; // Определяем здесь, чтобы можно было использовать

            // Вместо setTimeout, будем использовать setInterval для постоянного моргания
            // или можно оставить setTimeout, но тогда его нужно постоянно перезапускать
            // Давайте сделаем через setInterval, это проще для постоянного моргания
            blinkIntervalRef.current = setInterval(() => {
                // Если хотим рандомное время, то тут сложнее,
                // тогда каждый раз надо очищать и ставить новый setTimeout.
                // Давай пока сделаем фиксированное, а потом можно усложнить.
                toggleBlink();
            }, 1500); // Моргание каждые 1.5 секунды
            // Или если нужно именно рандомное время, тогда так:
            /*
            const createNextBlink = () => {
                currentIntervalTime = Math.random() * (3000 - 2000) + 2000;
                blinkIntervalRef.current = setTimeout(() => {
                    toggleBlink();
                    createNextBlink(); // Рекурсивный вызов для следующего моргания
                }, currentIntervalTime);
            };
            createNextBlink();
            */
        } else {
            // Если моргать не нужно, убеждаемся, что isBlinking false и интервал очищен
            setIsBlinking(false);
        }

        // Функция очистки, которая будет вызвана при размонтировании компонента
        // или перед каждым новым запуском эффекта
        return () => {
            if (blinkIntervalRef.current) {
                clearInterval(blinkIntervalRef.current);
                blinkIntervalRef.current = null;
            }
        };
    }, [needRemind, reminderLoading]); // Зависимости: эти значения управляют запуском/остановкой моргания

    // --- ОБРАБОТЧИК КЛИКА ПО ЛАМПОЧКЕ ---
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
                onThirdButtonClick: () => {}
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

                <div className="flex justify-center md:justify-end w-auto ml-4">
                    {/* --- ЛОГ ДЛЯ ОТЛАДКИ (можно оставить, он не мешает) --- */}
                    {console.log('Header Render Check: needRemind:', needRemind, 'reminderLoading:', reminderLoading)}

                    {/* Условие рендеринга теперь использует needRemind */}
                    {needRemind && !reminderLoading && (
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
                        `}
                            tooltip="Есть напоминание!"
                        />
                    )}

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
            </div>
        </header>
    );
}

Header.displayName = 'Header';