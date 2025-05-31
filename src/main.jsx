import ReactDOM from 'react-dom/client';
import './index.css';
import {initializeStoreCoordinator} from "./storeCoordinator.js";
import useAuthStore from "./stores/authStore.js";
import App from "./App.jsx";

useAuthStore.getState().initAuth()
initializeStoreCoordinator();

ReactDOM.createRoot(document.getElementById('root')).render(
    //<React.StrictMode>
        <App />
    //</React.StrictMode>,
);
