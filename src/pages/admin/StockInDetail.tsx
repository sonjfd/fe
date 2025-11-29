import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import adminStockApi from "@/api/admin.stock.api";
import type { IStockInDetail } from '@/types/stock';
import { toast } from 'react-toastify';

const StockInDetail: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [detail, setDetail] = useState<IStockInDetail | null>(null);
    const [loading, setLoading] = useState(true);

    const fetchDetail = async () => {
        if (!id) return;
        setLoading(true);
        try {
            const res = await adminStockApi.getStockInById(Number(id));

            if (res && res.data) {
                setDetail(res.data);
            }
        } catch (error) {
            toast.error("Không tìm thấy phiếu nhập hoặc có lỗi xảy ra");
            console.error(error);
            navigate('/admin/stockIn');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchDetail();
    }, [id]);

    const handleAction = async (action: 'confirm' | 'cancel') => {
        if (!id) return;

        const isConfirmed = window.confirm(
            `Bạn có chắc chắn muốn ${action === 'confirm' ? 'NHẬP KHO' : 'HỦY'} phiếu này? \nHành động này không thể hoàn tác.`
        );
        if (!isConfirmed) return;

        try {
            if (action === 'confirm') {
                await adminStockApi.confirmStockIn(Number(id));
                toast.success("Đã nhập kho thành công! Số lượng tồn kho đã được cập nhật.");
            } else {
                await adminStockApi.cancelStockIn(Number(id));
                toast.info("Đã hủy phiếu nhập.");
            }
            fetchDetail();
        } catch (error: any) {
            const msg = error.response?.data?.message || "Có lỗi xảy ra khi xử lý phiếu nhập";
            toast.error(msg);
        }
    };

    if (loading) return (
        <div className="flex justify-center items-center h-64">
            <div className="text-gray-500 font-medium">Đang tải dữ liệu...</div>
        </div>
    );

    if (!detail) return (
        <div className="text-center p-8 text-red-500">
            Không tìm thấy thông tin phiếu nhập.
        </div>
    );

    // Helper format tiền
    const formatCurrency = (val: number) =>
        new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(val);

    return (
        <div className="p-6 bg-white rounded-lg shadow-md max-w-4xl mx-auto">

            <div className="border-b pb-4 mb-4 flex justify-between items-center">
                <h2 className="text-xl font-bold text-gray-800">Chi tiết Phiếu nhập #{detail.id}</h2>
                <span className={`px-4 py-1.5 rounded-full font-bold text-sm border ${
                    detail.status === 'CONFIRMED' ? 'bg-green-50 text-green-700 border-green-200' :
                        detail.status === 'CANCELLED' ? 'bg-red-50 text-red-700 border-red-200' :
                            'bg-yellow-50 text-yellow-700 border-yellow-200'
                }`}>
                    {detail.status === 'CONFIRMED' ? 'ĐÃ NHẬP KHO' : detail.status}
                </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8 bg-gray-50 p-4 rounded-md">
                <div>
                    <p className="text-gray-500 text-sm mb-1">Nhà cung cấp</p>
                    <p className="font-semibold text-gray-800">{detail.supplierName}</p>
                </div>
                <div>
                    <p className="text-gray-500 text-sm mb-1">Ngày tạo</p>
                    <p className="font-semibold text-gray-800">
                        {new Date(detail.createdAt).toLocaleString('vi-VN')}
                    </p>
                </div>
            </div>

            <h3 className="font-bold text-lg text-gray-800 mb-3 border-l-4 border-blue-600 pl-3">
                Danh sách sản phẩm
            </h3>
            <div className="overflow-hidden rounded-lg border border-gray-200 mb-8">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-100">
                    <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">Sản phẩm</th>
                        <th className="px-4 py-3 text-right text-xs font-medium text-gray-600 uppercase tracking-wider">Số lượng</th>
                        <th className="px-4 py-3 text-right text-xs font-medium text-gray-600 uppercase tracking-wider">Giá nhập</th>
                        <th className="px-4 py-3 text-right text-xs font-medium text-gray-600 uppercase tracking-wider">Thành tiền</th>
                    </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                    {detail.items?.map((item, index) => (
                        <tr key={index} className="hover:bg-gray-50">
                            <td className="px-4 py-3">
                                <div className="font-medium text-gray-900">{item.productName}</div>
                                <div className="text-gray-500 text-xs mt-1">Variant ID: {item.productVariantId} | SKU: {item.sku}</div>
                            </td>
                            <td className="px-4 py-3 text-right text-gray-700 font-medium">
                                {item.quantity}
                            </td>
                            <td className="px-4 py-3 text-right text-gray-700">
                                {formatCurrency(item.cost)}
                            </td>
                            <td className="px-4 py-3 text-right text-gray-900 font-semibold">
                                {formatCurrency(item.totalPrice)}
                            </td>
                        </tr>
                    ))}
                    </tbody>
                    <tfoot className="bg-gray-50 font-bold">
                    <tr>
                        <td colSpan={3} className="px-4 py-3 text-right text-gray-800 uppercase text-xs tracking-wider">Tổng giá trị phiếu:</td>
                        <td className="px-4 py-3 text-right text-red-600 text-lg">
                            {formatCurrency(detail.totalCost)}
                        </td>
                    </tr>
                    </tfoot>
                </table>
            </div>

            {detail.status === 'PENDING' && (
                <div className="flex justify-end gap-4 mt-6 pt-6 border-t border-gray-100">
                    <button
                        onClick={() => handleAction('cancel')}
                        className="px-6 py-2.5 bg-white text-red-600 border border-red-300 rounded-md hover:bg-red-50 font-medium transition duration-200 focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                    >
                        Hủy phiếu
                    </button>
                    <button
                        onClick={() => handleAction('confirm')}
                        className="px-6 py-2.5 bg-blue-600 text-white rounded-md shadow-md hover:bg-blue-700 font-medium transition duration-200 focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                        Xác nhận Nhập kho
                    </button>
                </div>
            )}
        </div>
    );
};

export default StockInDetail;