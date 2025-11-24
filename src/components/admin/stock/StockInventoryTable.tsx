import { useEffect, useState } from "react";
import { AdminStockApi } from "@/api/admin.stock.api";
import type {StockResDTO} from "@/types/stock";
import CustomLoading from "../../CustomLoading";

const StockInventoryTable = () => {
    const [stocks, setStocks] = useState<StockResDTO[]>([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const fetchStocks = async () => {
            setLoading(true);
            try {
                const res = await AdminStockApi.getAllStocks();
                if (res){
                    setStocks(res);
                }
            } catch (error){
                console.error("Không thể lấy thông tin hàng", error);
            } finally {
                setLoading(false);
            }
        };
        fetchStocks();
    }, []);

    if (loading) return <CustomLoading/>

    return (
        <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-xl font-bold mb-4 text-gray-800">Danh sách tồn kho</h3>
            <div className="overflow-x-auto">
                <table className="min-w-full divide-gray-200">
                    <thead className="bg-gray-50">
                    <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">SKU</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Sản phẩm</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Phân loại</th>
                        <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Tổng tồn</th>
                        <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Đang giữ</th>
                        <th className="px-6 py-3 text-center text-xs font-medium text-green-600 uppercase tracking-wider">Có thể bán</th>
                    </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                    {stocks.map((stock) => (
                        <tr key={stock.id} className="hover: bg-gray-50 transition-colors">
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{stock.sku}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{stock.productName}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{stock.variantName}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-center font-bold text-blue-600">{stock.quantity}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-center text-orange-500">{stock.reserved}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-center font-bold text-green-600">{stock.available}</td>
                        </tr>
                    ))}
                    {stocks.length === 0 && (
                        <tr>
                            <td colSpan={6} className="px-6 py-4 text-center text-sm text-gray-500">Chưa có dữ liệu tồn kho.</td>
                        </tr>
                    )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default StockInventoryTable;