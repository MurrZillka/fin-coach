import { Link } from 'react-router-dom';
import Text from './ui/Text';
export default function Header() {
    return (
        <header className="bg-secondary-800 text-background p-4 shadow-md">
            <div className="max-w-7xl mx-auto flex justify-between items-center">
                <Text variant="h1">Financial Coach</Text>
                <nav>
                    <Link to="/login" className="mx-4">
                        <Text variant="navLink">Вход</Text>
                    </Link>
                    <Link to="/signup" className="mx-4">
                        <Text variant="navLink">Регистрация</Text>
                    </Link>
                    <Link to="/categories" className="mx-4">
                        <Text variant="navLink">Категории</Text>
                    </Link>
                    <Link to="/credits" className="mx-4">
                        <Text variant="navLink">Доходы</Text>
                    </Link>
                    <Link to="/spendings" className="mx-4">
                        <Text variant="navLink">Расходы</Text>
                    </Link>
                </nav>
            </div>
        </header>
    );
}