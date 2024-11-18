import axios from 'axios';

const API = axios.create({
    baseURL: 'http://localhost:3000/api/auth',
});

const AuthService = {
    login: async (username, password, twoFACode) => {
        const response = await API.post('/login', { username, password, twoFACode });
        const { accessToken, refreshToken } = response.data;

        localStorage.setItem('accessToken', accessToken);
        localStorage.setItem('refreshToken', refreshToken);

        return response.data;
    },

    getProfile: async () => {
        const token = localStorage.getItem('accessToken');
        const response = await API.get('/profile', {
            headers: { Authorization: `Bearer ${token}` },
        });

        return response.data;
    },

    logout: () => {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
    },

    refreshAccessToken: async () => {
        const refreshToken = localStorage.getItem('refreshToken');
        const response = await API.post('/refresh-token', { refreshToken });
        localStorage.setItem('accessToken', response.data.accessToken);
        return response.data.accessToken;
    },
};

export default AuthService;
