import ReactDOM from 'react-dom/client';
import './index.css';
import useAuthStore from './02_stores/authStore/authStore';
import App from './App';

const rootElement = document.getElementById('root');

if (!rootElement) {
    throw new Error('Root element not found');
}

const initApp = async (): Promise<void> => {
    await useAuthStore.getState().initAuth();
    ReactDOM.createRoot(rootElement).render(<App />);
};

initApp().catch(console.error);
