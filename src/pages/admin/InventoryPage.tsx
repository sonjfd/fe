import {useEffect, useState} from "react";
import {Link} from "react-router-dom";
import {AdminStockApi} from "@/api/admin.stock.api.ts";
import type {StockResDTO} from "@/types/stock";
import CustomLoading from "../../components/CustomLoading";


const InventoryPage= () => {
    const [stocks, setStocks] = useState<StockResDTO[]>([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try{
                const res = await AdminStockApi.getAllStocks();
                if (res) setStocks(res);
            } catch (error){
                console.error(error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    if (loading) return <CustomLoading/>;

    return (
        <div className="p-6 bg-gray-50 min-h-screen">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-black">Quản Lý Tồn Kho</h1>
                </div>
                <div className="flex gap-3">
                    <Link to="/admin/purchase-orders" className="px-4 py-2 bg-white border border-gray-300 rounded shadow-sm text-gray-700 hover:bg-gray-50">
                        Lịch sử nhập hàng
                    </Link>
                    <Link to="/admin/purchase-orders/create" className="px-4 py-2 bg-black text-white rounded shadow">
                        + Tạo đơn mới
                    </Link>
                </div>
            </div>

            <div className="bg-white rounded-lg shadow overflow-hidden border border-gray-200">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                    <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">SKU</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Sản phẩm</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Biến thể</th>
                        <th className="px-6 py-3 text-center text-xs font-bold text-gray-700 uppercase">Tổng tồn (Physical)</th>
                        <th className="px-6 py-3 text-center text-xs font-medium text-orange-500 uppercase">Đang giữ (Reserved)</th>
                        <th className="px-6 py-3 text-center text-xs font-bold text-green-600 uppercase">Có thể bán (Available)</th>
                    </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 bg-white">
                    {stocks.map((item) => (
                        <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-gray-900">{item.sku}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 font-medium">{item.productName}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.variantName}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-bold bg-gray-50">{item.quantity}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-center text-sm text-orange-500">{item.reserved}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-bold text-green-600 bg-green-50">{item.available}</td>
                        </tr>
                    ))}
                    {stocks.length === 0 && (
                        <tr><td colSpan={6} className="p-8 text-center text-gray-500">Kho chưa có dữ liệu.</td></tr>
                    )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default InventoryPage;