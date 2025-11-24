import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { AdminStockApi } from "@/api/admin.stock.api";
import type { StockInResDTO } from "@/types/stock";
import CustomLoading from "../../components/CustomLoading";

const PurchaseOrderDetailPage = () => {
    const {id} = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [order, setOrder] = useState<StockInResDTO | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (id) fetchDetail(id);
    }, [id]);

    const fetchDetail = async (poId: string) => {
        setLoading(true);
        try {
            const res = await AdminStockApi.getStockInById(poId);
            setOrder(res);
        } catch (error) {
            toast.error("Không tìm thấy đơn hàng");
            navigate("/admin/purchase-orders");
        } finally {
            setLoading(false);
        }
    };

    const handleConfirm = async () => {
        if (!window.confirm("Xác nhận nhập kho? Tồn kho sẽ được cập nhật.")) return;
        try {
            await AdminStockApi.confirmStockIn(id!);
            toast.success("Nhập kho thành công!");
            fetchDetail(id!); // Reload lại để thấy trạng thái mới
        } catch (error) {
            toast.error("Lỗi khi xác nhận");
        }
    };

    const handleCancel = async () => {
        if (!window.confirm("Hủy đơn nhập này?")) return;
        try {
            await AdminStockApi.cancelStockIn(id!);
            toast.success("Đã hủy đơn hàng");
            fetchDetail(id!);
        } catch (error) {
            toast.error("Lỗi khi hủy");
        }
    };

    if (loading) return <CustomLoading/>;
    if (!order) return <div>Order not found</div>;

    const totalCost = order.item.reduce((acc, item) => acc + (item.cost * item.quantity), 0);

    return (
        <div className="p-6 max-w-5xl mx-auto">
            {/* Header Actions */}
            <div className="flex justify-between items-start mb-6">
                <button onClick={() => navigate("/admin/purchase-orders")}
                        className="text-gray-500 hover:text-gray-700 flex items-center gap-1">
                    ← Quay lại danh sách
                </button>
                <div className="space-x-3">
                    {order.status === 'PENDING' && (
                        <>
                            <button onClick={handleCancel}
                                    className="px-4 py-2 bg-red-100 text-red-700 rounded hover:bg-red-200 font-medium">
                                Hủy đơn (Cancel)
                            </button>
                            <button onClick={handleConfirm}
                                    className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 font-medium shadow">
                                Xác nhận Nhập Kho (Confirm)
                            </button>
                        </>
                    )}
                </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6 mb-6 border border-gray-200 relative overflow-hidden">
                <div className="absolute top-0 right-0 p-4">
                    <span className={`text-lg font-bold px-3 py-1 rounded border-2 ${
                        order.status === 'CONFIRMED' ? 'border-green-500 text-green-600' :
                            order.status === 'PENDING' ? 'border-yellow-500 text-yellow-600' :
                                'border-red-500 text-red-600'
                    }`}>
                        {order.status}
                    </span>
                </div>
                <h2 className="text-2xl font-bold text-gray-800 mb-4">Đơn Nhập #{order.id}</h2>
                <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                        <p className="text-gray-500">Nhà cung cấp:</p>
                        <p className="font-medium text-lg text-gray-900">{order.supplierName}</p>
                    </div>
                    <div>
                        <p className="text-gray-500">Ngày tạo:</p>
                        <p className="font-medium text-gray-900">{order.createdAt}</p>
                    </div>
                </div>
            </div>

            <div className="bg-white rounded-lg shadow overflow-hidden border border-gray-200">
                <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
                    <h3 className="font-bold text-gray-700">Chi tiết sản phẩm</h3>
                </div>
                <table className="min-w-full divide-y divide-gray-200">
                    <thead>
                    <tr className="bg-gray-50 text-gray-500 text-xs uppercase">
                        <th className="px-6 py-3 text-left">Sản phẩm / Biến thể</th>
                        <th className="px-6 py-3 text-center">Số lượng</th>
                        <th className="px-6 py-3 text-right">Đơn giá nhập</th>
                        <th className="px-6 py-3 text-right">Thành tiền</th>
                    </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                    {order.item.map((item) => (
                        <tr key={item.id}>
                            <td className="px-6 py-4">
                                <div className="text-sm font-medium text-gray-900">Variant
                                    ID: {item.productVariantId}</div>

                            </td>
                            <td className="px-6 py-4 text-center text-sm">{item.quantity}</td>
                            <td className="px-6 py-4 text-right text-sm">{item.cost.toLocaleString()} đ</td>
                            <td className="px-6 py-4 text-right text-sm font-medium">{(item.cost * item.quantity).toLocaleString()} đ</td>
                        </tr>
                    ))}
                    </tbody>
                    <tfoot className="bg-gray-50">
                    <tr>
                        <td colSpan={3} className="px-6 py-4 text-right font-bold text-gray-700">Tổng giá trị đơn nhập:</td>
                        <td className="px-6 py-4 text-right font-bold text-blue-600 text-lg">{totalCost.toLocaleString()} đ</td>
                    </tr>
                    </tfoot>
                </table>
            </div>
        </div>
    );
};

export default PurchaseOrderDetailPage;