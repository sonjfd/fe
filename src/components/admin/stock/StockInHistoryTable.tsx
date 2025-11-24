import React, {useEffect, useState} from "react";
import { toast } from "react-toastify";
import {AdminStockApi} from "@/api/admin.stock.api.ts";
import type {StockInResDTO} from "@/types/stock";
import CustomLoading from "../../CustomLoading";


const getStatusBadge = (status: string) => {
    switch (status){
        case "CONFIRMED": return <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs font-semibold">Đã nhập kho</span>
        case "PENDING": return <span className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded-full text-rs font-semibold">Chờ xác nhận</span>
        case "CANCELED": return <span className="px-2 py-1 bg-red-100 text-red-800 rounded-full text-xs font-semibold">Đã hủy</span>
        default: return status;
    }
};

interface props {
    refreshTrigger: boolean;
}

const StockInHistoryTable: React.FC<props> = ({refreshTrigger}) => {
    const [stockIns, setStockIns] = useState<StockInResDTO[]>([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        fetchHistory();
    }, [refreshTrigger]);

    const fetchHistory = async () => {
        setLoading(true);
        try {
            const res = await AdminStockApi.getAllStockIn();
            if (res) setStockIns(res);
        } catch (error){
            console.error("Tải dữ liệu thất bại", error);
        } finally {
            setLoading(false);
        }
    };

    const handleConfirm = async (id: number)=>{
        if (!window.confirm("Bạn có chắc chắn muốn xác nhận nhập kho ? Số lượng tồn kho sẽ tăng lên.")) return;
        try {
            await AdminStockApi.confirmStockIn(id);
            toast.success("Đã nhập kho thành công!");
            fetchHistory();
        } catch (error){
            toast.error("Lỗi khi xác nhận nhập kho");
        }
    };

    const handleCancel = async (id: number) => {
        if (!window.confirm("Bạn có chắc chắn hủy phiếu?")) return;

        try{
            await AdminStockApi.cancelStockIn(id);
            toast.success("Hủy phiếu thành công!");
            fetchHistory();
        } catch (error) {
            toast.error("Lỗi khi hủy phiếu");
        }
    };

    if (loading) return <CustomLoading/>


    return (
        <div className="bg-white rounded-lg shadow-sm p-6 mt-6">
            <h3 className="text-xl font-bold mb-4 text-grey-800">Lịch sử nhập kho</h3>
            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                    <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">ID</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Nhà cung cấp</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Ngày tạo</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Trạng thái</th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Hành động</th>
                    </tr>
                    </thead>

                    <tbody className="bg-white divide-y divide-gray-200">
                    {stockIns.map((item) => (
                        <tr key={item.id} className="hover:bg-gray-50">
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">#{item.id}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{item.supplierName}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.createdAt}</td>
                            <td className="px-6 py-4 whitespace-nowrap">{getStatusBadge(item.status)}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                {item.status === "PENDING" && (
                                    <div className="flex justify-end gap-2">
                                        <button onClick={() => handleConfirm(item.id)}
                                                className="text-green-600 hover:text-green-900 bg-green-50 px-2 py-1 rounded">
                                            Nhập kho
                                        </button>
                                        <button
                                            onClick={() => handleCancel(item.id)}
                                            className="text-red-600 hover:text-red-900 bg-red-50 px-2 py-1 rounded">
                                            Hủy
                                        </button>
                                    </div>
                                    )}
                                {item.status !== 'PENDING' && (
                                    <span className="text-gray-400 italic">Đã đóng</span>
                                )}
                            </td>
                        </tr>
                    ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default StockInHistoryTable;