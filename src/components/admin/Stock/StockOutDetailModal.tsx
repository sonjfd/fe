import React from 'react';
import type {StockOutResDTO} from "@/types/stockout";

interface Props {
    isOpen: boolean;
    onClose:() => void;
    data: StockOutResDTO | null;
}

const StockOutDetailModal: React.FC<Props> = ({isOpen, onClose,data}) =>{
    if (!isOpen || !data) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm p-4 overflow-y-auto">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-3xl overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-grey-50">
                    <h3 className="text-xl font-bold text-gray-800">
                        Chi tiết Xuất kho #{data.id}
                    </h3>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition p-1 rounded-md hover:bg-gray-100">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>
                <div className="p-6 space-y-6">
                    <div className="grid grid-cols-2 gap-6 bg-gray-50 p-4 rounded-lg">
                        <div>
                            <p className="text-xs text-gray-500 uppercase">Mã Đơn hàng</p>
                            <p className="font-bold text-blue-600">{data.orderId ? `#${data.orderId}` : 'N/A'}</p>
                        </div>
                        <div>
                            <p className="text-xs text-gray-500 uppercase">Loại phiếu</p>
                            <span className="font-medium text-gray-800">{data.type}</span>
                        </div>
                        <div>
                            <p className="text-xs text-gray-500 uppercase">Ngày tạo</p>
                            <p className="text-sm">{new Date(data.createdAt).toLocaleString('vi-VN')}</p>
                        </div>
                    </div>
                    <div>
                        <h4 className="font-bold text-gray-800 mb-2">Danh sách sản phẩm</h4>
                        <div className="border rounded-lg overflow-hidden">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">SKU</th>
                                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Tên sản phẩm</th>
                                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Số lượng</th>
                                </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                {data.items?.map((item, index) => (
                                    <tr key={index}>
                                        <td className="px-4 py-2 text-sm text-gray-900 font-mono">{item.sku}</td>
                                        <td className="px-4 py-2 text-sm text-gray-900">{item.productName}</td>
                                        <td className="px-4 py-2 text-sm text-gray-900 text-right font-bold">{item.quantity}</td>
                                    </tr>
                                ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default StockOutDetailModal;