import axiosClient from "@/services/axios.customize";
import type {StockInCreateReqDTO, StockInResDTO, StockResDTO} from "@/types/stock";

const STOCK_URL = "/api/v1/admin/stock";
const STOCK_IN_URL = "/api/v1/admin/stockIn";

export const AdminStockApi = {
    getAllStocks: () => {
        return axiosClient.get<any, StockResDTO[]>(STOCK_URL);
    },

    getAllStockIn: () => {
        return axiosClient.get<any,StockInResDTO[]>(STOCK_IN_URL);
    },

    createStockIn: (data: StockInCreateReqDTO) => {
        return axiosClient.post<any,StockInResDTO>(STOCK_IN_URL, data);
    },

    getStockInById: (id: number | string) => {
        return axiosClient.get<any,StockInResDTO>(`${STOCK_IN_URL}/${id}`);
    },

    confirmStockIn: (id: number | string) => {
        return axiosClient.patch<any,StockInResDTO>(`${STOCK_IN_URL}/${id}/confirm`);
    },

    cancelStockIn: (id:number | string) => {
        return axiosClient.patch<any, StockInResDTO>(`${STOCK_IN_URL}/${id}/cancel`);
    },
};