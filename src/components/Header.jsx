import Text from './ui/Text';

export default function Header() {
    return (
        <header className="bg-secondary-800 text-background p-4 shadow-md">
            <div className="max-w-7xl mx-auto flex justify-between items-center">
                <Text variant="h1">Financial Coach</Text>
                <nav>
                    <a href="#" className="mx-4">
                        <Text variant="navLink">Главная</Text>
                    </a>
                    <a href="#" className="mx-4">
                        <Text variant="navLink">Категории</Text>
                    </a>
                    <a href="#" className="mx-4">
                        <Text variant="navLink">Баланс</Text>
                    </a>
                </nav>
            </div>
        </header>
    );
}