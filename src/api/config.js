const config = {
    useMocks: false, // Теперь по умолчанию false, чтобы сразу работать с сервером
    apiBaseUrl: 'http://localhost:8888',
};

export const getUseMocks = () => config.useMocks;
export const setUseMocks = (value) => {
    config.useMocks = !!value;
};
export const API_BASE_URL = config.apiBaseUrl;