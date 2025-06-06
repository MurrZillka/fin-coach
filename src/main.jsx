import ReactDOM from 'react-dom/client';
import './index.css';
import useAuthStore from "./02_stores/authStore/authStore.ts";
import App from "./App.jsx";

const initApp = async () => {
    await useAuthStore.getState().initAuth();
    ReactDOM.createRoot(document.getElementById('root')).render(<App />);
};

initApp();