import axios from 'axios';

const axiosInstance = axios.create({
    baseURL: import.meta.env.BACKEND_URL,
    headers: {
        'X-Requested-With': 'XMLHttpRequest'
    }
});

window.axios = axiosInstance;

export default axiosInstance;