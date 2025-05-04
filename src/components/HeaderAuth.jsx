import Text from './ui/Text.jsx'; // Добавляем обратно импорт компонента Text
import NavLinkItem from './ui/NavLinkItem.jsx';

const HeaderAuth = () => {

    const links = [
        { path: '/demo', label: 'Обзор' },
        { path: '/login', label: 'Войти' },
        { path: '/signup', label: 'Зарегистрироваться' },
    ];

    return (
        // Классы хедера
        <header className="bg-secondary-800 text-background p-5 shadow-md flex-shrink-0">
            <div className="max-w-7xl mx-auto flex justify-between items-center h-full">
                <Text variant="h1">Financial Coach</Text> {/* Рендерим заголовок */}

                <nav className="h-full flex items-center">
                    {links.map((link) => (
                        <NavLinkItem
                            key={link.path}
                            to={link.path}
                            label={link.label}
                        />
                    ))}
                </nav>
            </div>
        </header>
    );
};

// Устанавливаем display name для отладки
HeaderAuth.displayName = 'HeaderAuth';

export default HeaderAuth;