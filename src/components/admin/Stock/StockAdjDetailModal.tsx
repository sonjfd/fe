import React, { useEffect, useState } from 'react';
import type {IStockAdjRes} from "@/types/stockadj";
import { toast } from 'react-toastify';
import adminStockAdjApi from "@/api/admin.stockadj.api.ts";

interface StockAdjDetailModalProps {
    isOpen: boolean;
    stockAdjId: number | null;
    onClose: () => void;
}

const StockAdjDetailModal: React.FC<StockAdjDetailModalProps> = ({ isOpen, stockAdjId, onClose }) => {
    const [detail, setDetail] = useState<IStockAdjRes | null>(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (isOpen && stockAdjId) {
            fetchDetail(stockAdjId);
        } else {
            setDetail(null);
        }
    }, [isOpen, stockAdjId]);

    const fetchDetail = async (id: number) => {
        setLoading(true);
        try {
            const res = await adminStockAdjApi.getStockAdjById(id);
            if (res && res.data) {
                setDetail(res.data);
            }
        } catch (error) {
            console.error(error);
            toast.error("Không tải được chi tiết phiếu kiểm kê");
            onClose();
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm p-4 overflow-y-auto">
            <div className="bg-white rounded-lg shadow-2xl w-full max-w-4xl animate-fade-in-down relative flex flex-col max-h-[90vh]">
                <div className="flex justify-between items-center p-5 border-b border-gray-100">
                    <h2 className="text-lg font-bold text-gray-800">
                        Chi tiết Phiếu kiểm kê #{stockAdjId}
                    </h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition p-1">
                        ✕
                    </button>
                </div>

                <div className="p-6 overflow-y-auto flex-1">
                    {loading ? (
                        <div className="flex justify-center items-center h-40">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
                        </div>
                    ) : !detail ? (
                        <div className="text-center text-red-500">Không tìm thấy dữ liệu</div>
                    ) : (
                        <>
                            <div className="mb-6 bg-gray-50 p-4 rounded-lg border border-gray-100">
                                <div className="grid grid-cols-2 gap-4 text-sm">
                                    <div>
                                        <div className="text-gray-500 mb-1">Lý do điều chỉnh:</div>
                                        <div className="font-semibold text-gray-800">{detail.reason}</div>
                                    </div>
                                    <div className="text-right">
                                        <div className="text-gray-500 mb-1">Ngày tạo:</div>
                                        <div className="font-semibold text-gray-800">{new Date(detail.createdAt).toLocaleString('vi-VN')}</div>
                                    </div>
                                </div>
                            </div>

                            <div>
                                <h3 className="text-sm font-bold text-gray-800 mb-3 uppercase tracking-wide border-l-4 border-black pl-2">Danh sách sản phẩm</h3>
                                <div className="overflow-x-auto rounded-lg border border-gray-200">
                                    <table className="min-w-full divide-y divide-gray-200 text-sm">
                                        <thead className="bg-gray-50 text-gray-500 font-medium">
                                        <tr>
                                            <th className="px-4 py-3 text-left">Sản phẩm / SKU</th>
                                            <th className="px-4 py-3 text-right">Tồn cũ</th>
                                            <th className="px-4 py-3 text-right">Thay đổi</th>
                                            <th className="px-4 py-3 text-right">Tồn mới</th>
                                        </tr>
                                        </thead>
                                        <tbody className="bg-white divide-y divide-gray-100">
                                        {detail.items.map((item, index) => (
                                            <tr key={index} className="hover:bg-gray-50">
                                                <td className="px-4 py-3">
                                                    <div className="font-medium text-gray-900">{item.productVariantName}</div>
                                                    <div className="text-xs text-gray-500 mt-0.5">
                                                        #{item.productVariantId} | {item.sku}
                                                    </div>
                                                </td>
                                                <td className="px-4 py-3 text-right text-gray-600">{item.oldQuantity}</td>
                                                <td className={`px-4 py-3 text-right font-bold ${item.changeQuantity > 0 ? 'text-green-600' : 'text-red-600'}`}>
                                                    {item.changeQuantity > 0 ? `+${item.changeQuantity}` : item.changeQuantity}
                                                </td>
                                                <td className="px-4 py-3 text-right font-semibold text-gray-900">{item.newQuantity}</td>
                                            </tr>
                                        ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </>
                    )}
                </div>

                <div className="p-5 border-t border-gray-100 flex justify-end bg-gray-50 rounded-b-lg">
                    <button
                        onClick={onClose}
                        className="px-5 py-2 border border-gray-300 rounded text-gray-700 hover:bg-gray-100 font-medium transition"
                    >
                        Đóng
                    </button>
                </div>
            </div>
        </div>
    );
};

export default StockAdjDetailModal;