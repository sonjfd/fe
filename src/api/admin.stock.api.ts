import axiosClient from "@/services/axios.customize";
import type {IApiResponse, IPagination, StockResDTO, IStockIn, IStockInCreateReq, IStockInDetail} from "@/types/stock";

const STOCK_URL = "/api/v1/admin/stock";
const STOCK_IN_URL = "/api/v1/admin/stockIn";

const adminStockApi = {

    getAllStocks: (page: number = 1, size: number = 10, keyword: string = "") => {
        return axiosClient.get<IApiResponse<IPagination<StockResDTO[]>>>(STOCK_URL, {
            params: { page, size,keyword }
        });
    },

    getStockById: (id: number) => {
        return axiosClient.get<IApiResponse<StockResDTO>>(`${STOCK_URL}/${id}`);
    },

    createStockIn: (data: IStockInCreateReq) => {
        return axiosClient.post<IApiResponse<IStockIn>>(STOCK_IN_URL, data);
    },

    getAllStockIn: (page: number = 1, size: number = 10) => {
        return axiosClient.get<IApiResponse<IPagination<IStockIn[]>>>(STOCK_IN_URL, {
            params: { page, size }
        });
    },

    getStockInById: (id: number) => {
        return axiosClient.get<IApiResponse<IStockInDetail>>(`${STOCK_IN_URL}/${id}`);
    },

    confirmStockIn: (id: number) => {
        return axiosClient.patch<IApiResponse<IStockIn>>(`${STOCK_IN_URL}/${id}/confirm`);
    },

    cancelStockIn: (id: number) => {
        return axiosClient.patch<IApiResponse<IStockIn>>(`${STOCK_IN_URL}/${id}/cancel`);
    }
};

export default adminStockApi;