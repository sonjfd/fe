import {useEffect, useState} from "react";
import {Link, useNavigate} from "react-router-dom";
import {toast} from "react-toastify";
import {AdminStockApi} from "@/api/admin.stock.api.ts";
import type {StockInResDTO} from "@/types/stock";
import CustomLoading from "../../components/CustomLoading";

const PurchaseOrderListPage = () => {
    const [list, setList] = useState<StockInResDTO[]>([]);
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setLoading(true);
        try {
            const res = await AdminStockApi.getAllStockIn();

            if (res) setList(res.sort((a,b) => b.id - a.id));
        } catch (error){
            toast.error("Lỗi tải danh sách.");
        } finally {
            setLoading(false);
        }
    };

    const getStatusBadge = (status: string) => {
        switch (status){
            case 'CONFIRMED': return <span className="px-2 py-1 bg-green-500 text-green-800 rounded text-xs font-bold">ĐÃ NHẬP KHO</span>;
            case 'PENDING': return <span className="px-2 py-1 bg-yellow-500 text-yellow-800 rounded text-xs font-bold">CHỜ XỬ LÝ</span>;
            case 'CANCELLED': return <span className="px-2 py-1 bg-red-500 text-red-800 rounded text-xs font-bold">ĐÃ HỦY</span>;
            default: return status;
        }
    };

    if (loading) return <CustomLoading/>

    return (
        <div className="p-6 bg-gray-50 min-h-screen">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800">Đơn nhập hàng</h1>
                </div>
                <Link to="/admin/purchase-orders/create" className="px-4 py-2 bg-black text-white rounded shadow">
                    <span>+ Tạo đơn nhập</span>
                </Link>
            </div>
            <div className="bg-white rounded shadow overflow-hidden border border-gray-200">
                <table className="min-w-full divide-gray-200">
                    <thead className="bg-gray-50">
                    <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Mã Order</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Nhà cung cấp</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Ngày tạo</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Số dòng sản phẩm</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Trạng thái</th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Hành động</th>
                    </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 bg-white">
                    {list.map((item) => (
                        <tr key={item.id} className="hover:bg-gray-50 cursor-pointer" onClick={() => navigate(`/admin/purchase-orders/${item.id}`)}>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-blue-600">#{item.id}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{item.supplierName}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.createdAt}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.item?.length || 0}</td>
                            <td className="px-6 py-4 whitespace-nowrap">{getStatusBadge(item.status)}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                <Link to={`/admin/purchase-orders/${item.id}`} className="text-indigo-600 hover:text-indigo-900 px-3 py-1 border rounded hover:bg-indigo-50">
                                    Chi tiết
                                </Link>
                            </td>
                        </tr>
                    ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default PurchaseOrderListPage;