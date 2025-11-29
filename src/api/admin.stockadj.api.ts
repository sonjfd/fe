import axios from "services/axios.customize.ts";
import type {IStockAdjCreateReq} from "@/types/stockadj";

const adminStockAdjApi = {
    getAllStockAdj: (page: number, size: number) => {
        return axios.get(`/api/v1/admin/stockAdjustment?page=${page}&size=${size}`);
    },


    getStockAdjById: (id: number) => {
        return axios.get(`/api/v1/admin/stockAdjustment/${id}`);
    },


    createStockAdj: (data: IStockAdjCreateReq) => {
        return axios.post('/api/v1/admin/stockAdjustment', data);
    }
};

export default adminStockAdjApi;