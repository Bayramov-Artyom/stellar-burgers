const apiUrl = process.env.BURGER_API_URL as string;
export const WS_URL = apiUrl.replace(/^http/, 'ws').replace(/\/api\/?$/, '');
