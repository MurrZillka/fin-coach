// src/components/Header.jsx
import { useNavigate } from 'react-router-dom';
import { useEffect, useState, useRef } from 'react'; // Добавляем useEffect, useState, useRef
import useAuthStore from '../stores/authStore';
import useRemindersStore from '../stores/remindersStore'; // ДОБАВЛЕНО
import useModalStore from '../stores/modalStore'; // ДОБАВЛЕНО
import Text from './ui/Text';
import IconButton from './ui/IconButton';
import NavLinkItem from './ui/NavLinkItem';
import MobileMenu from './ui/MobileMenu';
import { ArrowRightStartOnRectangleIcon, BellAlertIcon } from '@heroicons/react/24/outline'; // Добавляем BellAlertIcon

export default function Header() {
    const navigate = useNavigate();
    const { isAuthenticated, user, logout } = useAuthStore(); // Добавляем user для проверки токена
    const { todayReminder, loading: reminderLoading, error: reminderError, fetchTodayReminder, clearError } = useRemindersStore(); // ДОБАВЛЕНО
    const { openModal } = useModalStore(); // ДОБАВЛЕНО

    const [isBlinking, setIsBlinking] = useState(false); // Состояние для моргания лампочки
    const blinkIntervalRef = useRef(null); // Ref для хранения ID интервала

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
        // Фетчим напоминания, если пользователь аутентифицирован и токен есть
        if (isAuthenticated && user?.access_token) {
            console.log('Header: Authenticated, fetching today reminder...');
            fetchTodayReminder();
        } else {
            // Если пользователь не аутентифицирован, останавливаем моргание и очищаем данные
            setIsBlinking(false);
            if (blinkIntervalRef.current) {
                clearInterval(blinkIntervalRef.current);
                blinkIntervalRef.current = null;
            }
            // Возможно, здесь также нужно очистить состояние remindersStore,
            // но это уже делается через storeInitializer при логауте.
        }
    }, [isAuthenticated, user?.access_token, fetchTodayReminder]); // Зависимости: isAuthenticated и токен

    // --- ЛОГИКА МОРГАНИЯ ЛАМПОЧКИ ---
    useEffect(() => {
        if (todayReminder?.need_remind && !reminderLoading) {
            // Если нужно напоминать и не идет загрузка
            const startBlinking = () => {
                if (blinkIntervalRef.current) {
                    clearInterval(blinkIntervalRef.current); // Очищаем предыдущий интервал
                }

                const toggleBlink = () => setIsBlinking(prev => !prev);
                let currentIntervalTime = 0;

                // Запускаем первый интервал, который будет менять состояние и запускать следующий
                const createNextBlink = () => {
                    currentIntervalTime = Math.random() * (6000 - 3000) + 3000; // От 3 до 6 секунд
                    blinkIntervalRef.current = setTimeout(() => {
                        toggleBlink();
                        createNextBlink(); // Рекурсивно запускаем следующий таймаут
                    }, currentIntervalTime);
                };

                // Запускаем первый цикл
                createNextBlink();
            };

            startBlinking(); // Начинаем моргание
        } else {
            // Если напоминание не нужно, или идет загрузка, или произошла ошибка, останавливаем моргание
            setIsBlinking(false);
            if (blinkIntervalRef.current) {
                clearInterval(blinkIntervalRef.current);
                blinkIntervalRef.current = null;
            }
        }

        // Очистка интервала при размонтировании компонента или изменении условий
        return () => {
            if (blinkIntervalRef.current) {
                clearInterval(blinkIntervalRef.current);
            }
        };
    }, [todayReminder, reminderLoading]); // Зависимости: todayReminder и reminderLoading

    // --- ОБРАБОТЧИК КЛИКА ПО ЛАМПОЧКЕ ---
    const handleReminderClick = () => {
        console.log('Header: Reminder icon clicked. Opening reminder modal.');
        clearError(); // Сбрасываем ошибку в remindersStore, если она была

        openModal({
            modalType: 'reminderNotification', // Укажем уникальный тип модалки
            modalProps: {
                title: 'Важное напоминание!',
                message: 'Пора бы расходы и доходы внести, иначе может нарушиться точность учета финансов.',
                confirmText: 'Внести расходы',
                cancelText: 'Внести доходы',
                onConfirm: () => {
                    navigate('/spendings'); // Переход на страницу расходов
                    useModalStore.getState().closeModal(); // Закрываем модалку
                },
                onCancel: () => {
                    navigate('/credits'); // Переход на страницу доходов
                    useModalStore.getState().closeModal(); // Закрываем модалку
                },
                // Добавляем третью кнопку для закрытия
                thirdButtonText: 'Закрыть',
                onThirdButtonClick: () => {
                    useModalStore.getState().closeModal(); // Просто закрываем модалку
                }
            }
        });
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
                        {/* --- ДОБАВЛЕНО: Кнопка-лампочка для напоминаний --- */}
                        {todayReminder?.need_remind && !reminderLoading && (
                            <IconButton
                                icon={BellAlertIcon} // Используем BellAlertIcon для лампочки
                                onClick={handleReminderClick}
                                className={`
                                    ${isBlinking ? 'text-red-400 animate-pulse' : 'text-yellow-300'} // Цвет и анимация
                                    hover:text-red-500 transition-colors
                                    ml-4
                                `}
                                tooltip="Есть напоминание!"
                            />
                        )}
                        {/* --- Конец ДОБАВЛЕННОГО --- */}
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
                        // --- ДОБАВЛЕНО: Передаем параметры напоминания в MobileMenu ---
                        hasReminder={todayReminder?.need_remind && !reminderLoading}
                        onReminderClick={handleReminderClick}
                        // --- Конец ДОБАВЛЕННОГО ---
                    />
                )}
            </div>
        </header>
    );
}

Header.displayName = 'Header';