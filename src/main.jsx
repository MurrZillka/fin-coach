import ReactDOM from 'react-dom/client';
import './index.css';
import useAuthStore from "./stores/authStore.js";
import App from "./App.jsx";

useAuthStore.getState().initAuth()

ReactDOM.createRoot(document.getElementById('root')).render(
    //<React.StrictMode>
    <App />
    //</React.StrictMode>,
);