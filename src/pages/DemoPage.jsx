import { Link } from 'react-router-dom';
import Text from '../components/ui/Text';

const DemoPage = () => {
    return (
        <div className="min-h-screen flex items-center justify-center bg-background">
            <div className="flex flex-col space-y-4">
                <Link to="/login">
                    <Text variant="body" className="text-primary hover:text-primary-dark">
                        Войти
                    </Text>
                </Link>
                <Link to="/signup">
                    <Text variant="body" className="text-primary hover:text-primary-dark">
                        Зарегистрироваться
                    </Text>
                </Link>
            </div>
        </div>
    );
};

export default DemoPage;