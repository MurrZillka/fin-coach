interface Config {
    apiBaseUrl: string;
}

const config: Config = {
    apiBaseUrl: 'http://217.12.38.196:8888',
};

export const API_BASE_URL: string = config.apiBaseUrl;