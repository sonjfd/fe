import React, { useEffect, useState } from 'react';
import adminStockApi from "@/api/admin.stock.api";
import type { IStockInDetail } from '@/types/stock';
import { toast } from 'react-toastify';
import { confirmToast } from "@/components/ConfirmToast";

interface StockInDetailModalProps {
    isOpen: boolean;
    stockInId: number | null;
    onClose: () => void;
    onSuccess: () => void; // Callback để reload list bên ngoài sau khi thao tác xong
}

const StockInDetailModal: React.FC<StockInDetailModalProps> = ({ isOpen, stockInId, onClose, onSuccess }) => {
    const [detail, setDetail] = useState<IStockInDetail | null>(null);
    const [loading, setLoading] = useState(false);
    const [processing, setProcessing] = useState(false);

    // Fetch dữ liệu khi mở modal
    useEffect(() => {
        if (isOpen && stockInId) {
            fetchDetail(stockInId);
        } else {
            setDetail(null);
        }
    }, [isOpen, stockInId]);

    const fetchDetail = async (id: number) => {
        setLoading(true);
        try {
            const res = await adminStockApi.getStockInById(id);

            if (res && res.data) {
                setDetail(res.data);
            } else if (res && !res.data){
                // @ts-ignore
                setDetail(res);
            }
        } catch (error) {
            console.error(error);
            toast.error("Không tải được chi tiết phiếu nhập");
            onClose();
        } finally {
            setLoading(false);
        }
    };

    const handleAction = async (action: 'confirm' | 'cancel') => {
        if (!detail){
            toast.error("Không tìm thấy thông tin phiếu nhập kho.");
            return;
        }

        const isConfirm = action === 'confirm';
        const confirmMsg = isConfirm
            ? "Bạn có chắc chắn muốn nhập kho phiếu này? Tồn kho sẽ được cập nhật."
            : "Bạn có chắc chắn muốn hủy kho phiếu   này?";

        const isAgreed = await confirmToast(confirmMsg);
        if (!isAgreed) return;

        setProcessing(true);
        try {
            if (isConfirm) {
                await adminStockApi.confirmStockIn(detail.id);
                toast.success("Đã nhập kho thành công!");
            } else {
                await adminStockApi.cancelStockIn(detail.id);
                toast.info("Đã hủy phiếu nhập.");
            }
            onSuccess(); // Reload list cha
            onClose();   // Đóng modal
        } catch (error: any) {
            const msg = error.response?.data?.message || "Có lỗi xảy ra";
            toast.error(msg);
        } finally {
            setProcessing(false);
        }
    };

    const formatCurrency = (val: number) =>
        new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(val);

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'CONFIRMED': return <span className="px-3 py-1 rounded-full text-xs font-bold bg-green-100 text-green-700 border border-green-200">ĐÃ XÁC NHẬN</span>;
            case 'PENDING': return <span className="px-3 py-1 rounded-full text-xs font-bold bg-yellow-100 text-yellow-700 border border-yellow-200">CHỜ XỬ LÝ</span>;
            case 'CANCELLED': return <span className="px-3 py-1 rounded-full text-xs font-bold bg-red-100 text-red-700 border border-red-200">ĐÃ HỦY</span>;
            default: return <span className="px-3 py-1 rounded-full text-xs font-bold bg-gray-100 text-gray-700">{status}</span>;
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm p-4 overflow-y-auto">
            <div className="bg-white rounded-lg shadow-2xl w-full max-w-4xl animate-fade-in-down relative flex flex-col max-h-[90vh]">

                {/* Header */}
                <div className="flex justify-between items-center p-5 border-b border-gray-100">
                    <h2 className="text-lg font-bold text-gray-800">
                        Chi tiết Phiếu nhập #{stockInId}
                    </h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition p-1 rounded-md hover:bg-gray-100">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                {/* Body */}
                <div className="p-6 overflow-y-auto flex-1">
                    {loading ? (
                        <div className="flex justify-center items-center h-40">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
                        </div>
                    ) : !detail ? (
                        <div className="text-center text-red-500">Không tìm thấy dữ liệu</div>
                    ) : (
                        <>
                            {/* Info Section */}
                            <div className="flex justify-between items-start mb-6 bg-gray-50 p-4 rounded-lg border border-gray-100">
                                <div className="grid grid-cols-2 gap-x-8 gap-y-2 text-sm">
                                    <div className="text-gray-500">Nhà cung cấp:</div>
                                    <div className="font-semibold text-gray-800">{detail.supplierName}</div>


                                    <div className="text-gray-500">Ngày tạo:</div>
                                    <div className="font-semibold text-gray-800">{new Date(detail.createdAt).toLocaleString('vi-VN')}</div>
                                </div>
                                <div className="flex flex-col items-end">
                                    <div className="mb-2">{getStatusBadge(detail.status)}</div>
                                </div>
                            </div>


                            {/* Table Items */}
                            <div>
                                <h3 className="text-sm font-bold text-gray-800 mb-3 uppercase tracking-wide border-l-4 border-black pl-2">Danh sách sản phẩm</h3>
                                <div className="overflow-x-auto rounded-lg border border-gray-200">
                                    <table className="min-w-full divide-y divide-gray-200 text-sm">
                                        <thead className="bg-gray-50 text-gray-500 font-medium">
                                        <tr>
                                            <th className="px-4 py-3 text-left">Sản phẩm / SKU</th>
                                            <th className="px-4 py-3 text-right">Số lượng</th>
                                            <th className="px-4 py-3 text-right">Giá nhập</th>
                                            <th className="px-4 py-3 text-right">Thành tiền</th>
                                        </tr>
                                        </thead>
                                        <tbody className="bg-white divide-y divide-gray-100">
                                        {detail.items.map((item) => (
                                            <tr key={item.id} className="hover:bg-gray-50">
                                                <td className="px-4 py-3">
                                                    <div className="font-medium text-gray-900">{item.productName}</div>
                                                    <div className="text-xs text-gray-500 mt-0.5">
                                                        #{item.productVariantId} | {item.sku}
                                                    </div>
                                                </td>
                                                <td className="px-4 py-3 text-right font-medium">{item.quantity}</td>
                                                <td className="px-4 py-3 text-right text-gray-600">{formatCurrency(item.cost)}</td>
                                                <td className="px-4 py-3 text-right font-semibold text-gray-900">{formatCurrency(item.totalPrice = (item.quantity * item.cost))}</td>
                                            </tr>
                                        ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </>
                    )}
                </div>

                {/* Footer Action */}
                <div className="p-5 border-t border-gray-100 flex justify-end gap-3 bg-gray-50 rounded-b-lg">
                    <button
                        onClick={onClose}
                        className="px-5 py-2 border border-gray-300 rounded text-gray-700 hover:bg-gray-100 font-medium transition"
                        disabled={processing}
                    >
                        Đóng
                    </button>

                    {/* Chỉ hiện nút action nếu trạng thái là PENDING */}
                    {detail?.status === 'PENDING' && (
                        <>
                            <button
                                onClick={() => handleAction('cancel')}
                                disabled={processing}
                                className="px-5 py-2 bg-white border border-red-200 text-red-600 rounded hover:bg-red-50 font-medium transition disabled:opacity-50"
                            >
                                Hủy phiếu
                            </button>
                            <button
                                onClick={() => handleAction('confirm')}
                                disabled={processing}
                                className="px-5 py-2 bg-black text-white rounded shadow-md hover:bg-gray-800 font-medium transition flex items-center gap-2 disabled:opacity-50"
                            >
                                {processing && <span className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></span>}
                                Xác nhận Nhập kho
                            </button>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

export default StockInDetailModal;