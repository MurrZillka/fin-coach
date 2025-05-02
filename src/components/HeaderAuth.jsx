import { Link, useLocation } from 'react-router-dom';
import Text from './ui/Text';

const links = [
  { path: '/demo', label: 'Обзор' },
  { path: '/login', label: 'Войти' },
  { path: '/signup', label: 'Зарегистрироваться' },
];

export default function HeaderAuth() {
  const location = useLocation();

  return (
    <header className="bg-primary-500 px-4 py-2 flex items-center justify-between shadow">
      <Text variant="h1" className="text-white text-lg font-bold">
        FinCoach
      </Text>
      <nav className="flex space-x-4">
        {links.map(link => {
          const isActive = location.pathname === link.path;
          return isActive ? (
            <span
              key={link.path}
              className="text-white opacity-60 cursor-default font-medium"
            >
              {link.label}
            </span>
          ) : (
            <Link
              key={link.path}
              to={link.path}
              className="text-white hover:text-primary-200 transition font-medium"
            >
              {link.label}
            </Link>
          );
        })}
      </nav>
    </header>
  );
}