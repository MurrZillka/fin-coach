export default function Header() {
    return (
        <header className="bg-secondary-800 text-background p-4 shadow-md">
            <div className="max-w-7xl mx-auto flex justify-between items-center">
                <h1 className="text-2xl font-semibold">Financial Coach</h1>
                <nav>
                    <a href="#" className="text-secondary-200 hover:text-primary-500 mx-4">Главная</a>
                    <a href="#" className="text-secondary-200 hover:text-primary-500 mx-4">Категории</a>
                    <a href="#" className="text-secondary-200 hover:text-primary-500 mx-4">Баланс</a>
                </nav>
            </div>
        </header>
    );
}