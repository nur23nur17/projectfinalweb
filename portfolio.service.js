import axios from 'axios';

const BASE_URL = 'http://localhost:3000/api/portfolio';

const PortfolioService = {
    getAll: async () => {
        try {
            const response = await axios.get(BASE_URL);
            return response.data;
        } catch (error) {
            console.error('Error fetching portfolio items:', error);
            throw error;
        }
    },

    create: async (data) => {
        try {
            const response = await axios.post(BASE_URL, data, {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
                },
            });
            return response.data;
        } catch (error) {
            console.error('Error creating portfolio item:', error);
            throw error;
        }
    },

    update: async (id, data) => {
        try {
            const response = await axios.put(`${BASE_URL}/${id}`, data, {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
                },
            });
            return response.data;
        } catch (error) {
            console.error('Error updating portfolio item:', error);
            throw error;
        }
    },

    delete: async (id) => {
        try {
            const response = await axios.delete(`${BASE_URL}/${id}`, {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
                },
            });
            return response.data;
        } catch (error) {
            console.error('Error deleting portfolio item:', error);
            throw error;
        }
    },
};

export default PortfolioService;
