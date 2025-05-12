import Text from './ui/Text.jsx';
import NavLinkItem from './ui/NavLinkItem.jsx';
import MobileMenu from './ui/MobileMenu.jsx'; // Новый импорт

const HeaderAuth = () => {
    const links = [
        { path: '/demo', label: 'Обзор' },
        { path: '/login', label: 'Войти' },
        { path: '/signup', label: 'Зарегистрироваться' },
    ];

    return (
        <header className="bg-secondary-800 text-background p-5 shadow-md flex-shrink-0">
            <div className="max-w-7xl mx-auto flex justify-between items-center h-full">
                <Text variant="h1">Financial Coach</Text>
                {/* Горизонтальная навигация для больших экранов */}
                <nav className="hidden md:flex items-center">
                    {links.map((link) => (
                        <NavLinkItem key={link.path} to={link.path} label={link.label} />
                    ))}
                </nav>
                {/* Мобильное меню для малых экранов */}
                <MobileMenu links={links} />
            </div>
        </header>
    );
};

HeaderAuth.displayName = 'HeaderAuth';
export default HeaderAuth;