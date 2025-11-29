import axios from "@/services/axios.customize";
import type {PaginationDTO, StockOutResDTO, StockOutSimpleResDTO,IBackendRes} from "@/types/stockout";

const STOCK_OUT_URL = "api/v1/admin/stockOut";

export const getStockOuts = async (page: number = 1, size: number = 10) => {
    const url = `${STOCK_OUT_URL}?page=${page}&size=${size}`;
    return await axios.get<IBackendRes<PaginationDTO<StockOutSimpleResDTO[]>>>(url);
};

export const getStockOutDetail = async (id: number) => {
    const url = `${STOCK_OUT_URL}/${id}`;

    return await axios.get<IBackendRes<StockOutResDTO>>(url);
}