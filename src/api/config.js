const config = {
    useMocks: true,
    apiBaseUrl: 'http://localhost:8888',
};

export const getUseMocks = () => config.useMocks;
export const setUseMocks = (value) => {
    config.useMocks = !!value; // Приводим к boolean
};
export const API_BASE_URL = config.apiBaseUrl;