import axios from "axios";
import { Mutex } from "async-mutex";

const mutex = new Mutex();

const instance = axios.create({
    baseURL: import.meta.env.VITE_BACKEND_URL,
    withCredentials: true,
});

const handleRefreshToken = async () => {
    return await mutex.runExclusive(async () => {
        try {
            const res = await instance.get("/api/v1/auth/refresh");
            if (res && res.data) return res.data.access_token;
            return null;
        } catch {
            return null;
        }
    });
};

instance.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem("access_token");
        if (token) config.headers["Authorization"] = `Bearer ${token}`;
        return config;
    },
    (error) => Promise.reject(error)
);

instance.interceptors.response.use(
    (response) => {
        if (response && response.data) return response.data;
        return response;
    },
    async (error) => {
        if (error.config && error.response && +error.response.status === 401) {
            const access_token = await handleRefreshToken();
            if (access_token) {
                error.config.headers["Authorization"] = `Bearer ${access_token}`;
                localStorage.setItem("access_token", access_token);
                return instance.request(error.config);
            }
        }
        if (error && error.response && error.response.data) {
            return error.response.data;
        }
        return Promise.reject(error);
    }
);

export default instance;
