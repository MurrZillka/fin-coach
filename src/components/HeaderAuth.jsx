import { Link, useLocation } from 'react-router-dom';
import Text from './ui/Text';

const links = [
    { path: '/demo', label: 'Обзор' },
    { path: '/login', label: 'Войти' },
    { path: '/signup', label: 'Зарегистрироваться' },
];

const HeaderAuth = () => {
    const location = useLocation();
    const allowedPaths = ['/demo', '/login', '/signup'];

    if (!allowedPaths.includes(location.pathname)) {
        return null;
    }

    return (
        <header className="bg-secondary-800 text-background p-4 shadow-md">
            <div className="max-w-7xl mx-auto flex justify-between items-center">
                <Text variant="h1">Financial Coach</Text>
                <nav>
                    {links.map((link) => (
                        <span key={link.path} className="mx-4">
              {location.pathname === link.path ? (
                  <Text variant="navLinkInactive" className="opacity-50">
                      {link.label}
                  </Text>
              ) : (
                  <Link to={link.path}>
                      <Text variant="navLink">{link.label}</Text>
                  </Link>
              )}
            </span>
                    ))}
                </nav>
            </div>
        </header>
    );
};

export default HeaderAuth;