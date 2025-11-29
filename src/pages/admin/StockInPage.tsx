import React, { useEffect, useState } from 'react';
import adminStockApi from "@/api/admin.stock.api"; // Bỏ .ts
import type { IStockIn } from '@/types/stock';
import { toast } from 'react-toastify';
import CreateStockInModal from "components/admin/Stock/CreateStockInModal.tsx";
import StockInDetailModal from "components/admin/Stock/StockInDetailModal.tsx";

const StockInPage: React.FC = () => {
    const [stockIns, setStockIns] = useState<IStockIn[]>([]);
    const [loading, setLoading] = useState<boolean>(true);

    // Pagination State
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(0);
    const [pageSize] = useState(10);

    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

    const [viewModalOpen, setViewModalOpen] = useState(false);
    const [selectedId, setSelectedId] = useState<number | null>(null);

    const fetchStockIns = async () => {
        setLoading(true);
        try {
            const res = await adminStockApi.getAllStockIn(page, pageSize);
            const responseData = res.data || res;

            if (responseData && responseData.items){
                // @ts-ignore
                setStockIns(responseData.items);
                const total = responseData.total || 0;
                setTotalPages(Math.ceil(total / pageSize));
            } else {
                setStockIns([]);
            }
        } catch (error) {
            toast.error("Không thể tải danh sách phiếu nhập");
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchStockIns();
    }, [page]);

    const handleCreateSuccess = () => {
        setPage(1);
        fetchStockIns();
    };

    const handlePageChange = (newPage: number) => {
        if (newPage >= 1 && newPage <= totalPages) {
            setPage(newPage);
        }
    };

    const handleViewDetail = (id: number) => {
        setSelectedId(id);
        setViewModalOpen(true);
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'CONFIRMED': return 'text-green-600 bg-green-100 border border-green-800';
            case 'PENDING': return 'text-yellow-600 bg-yellow-100 border border-yellow-300';
            case 'CANCELLED': return 'text-red-600 bg-red-100 border border-red-600';
            default: return 'text-gray-600 bg-gray-100 border border-gray-200';
        }
    };
    const STATUS_MAPPING: Record<string, string> = {
        'PENDING': 'CHỜ XỬ LÝ',
        'CONFIRMED': 'ĐÃ XÁC NHẬN',
        'CANCELLED': 'ĐÃ HỦY',
    };

    return (
        <div className="p-6 bg-white rounded-lg shadow-md">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h2 className="text-lg font-bold text-gray-800">Nhập Kho</h2>
                </div>

                <button
                    onClick={() => setIsCreateModalOpen(true)}
                    className="flex items-center gap-2 px-3 py-2 bg-white text-black border rounded-xl transition shadow-sm font-medium"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    Tạo phiếu nhập
                </button>
            </div>

            {/* TABLE CONTENT */}
            <div className="overflow-x-auto min-h-[400px]">
                <table className="min-w-full text-left text-sm border-collapse">
                    <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                        <th className="px-4 py-3 font-semibold text-gray-700">STT</th>
                        <th className="px-4 py-3 font-semibold text-gray-700">Nhà cung cấp</th>
                        <th className="px-4 py-3 font-semibold text-gray-700">Tổng số lượng</th>
                        <th className="px-4 py-3 font-semibold text-gray-700">Tổng tiền</th>
                        <th className="px-4 py-3 font-semibold text-gray-700">Trạng thái</th>
                        <th className="px-4 py-3 font-semibold text-gray-700 text-center">Hành động</th>
                    </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                    {loading ? (
                        <tr><td colSpan={7} className="text-center py-10 text-gray-500">Đang tải dữ liệu...</td></tr>
                    ) : stockIns.length === 0 ? (
                        <tr><td colSpan={7} className="text-center py-10 text-gray-500 italic">Chưa có phiếu nhập nào.</td></tr>
                    ) : (
                        stockIns.map((item,index) => (
                            <tr key={item.id} className="hover:bg-blue-50 transition duration-150">
                                <td className="px-4 py-3 text-gray-700 font-medium">{(page - 1) * pageSize + index + 1}</td>
                                <td className="px-4 py-3 text-gray-700">{item.supplierName}</td>
                                <td className="px-4 py-3 text-gray-700">{item.totalQuantity}</td>
                                <td className="px-4 py-3 text-gray-700 font-medium">
                                    {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(item.totalCost)}
                                </td>
                                <td className="px-4 py-3">
                                        <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getStatusColor(item.status)}`}>
                                            {STATUS_MAPPING[item.status] || item.status}
                                        </span>
                                </td>
                                <td className="px-4 py-3 text-center">
                                    <button
                                        onClick={() => handleViewDetail(item.id)}
                                        className="text-black hover:text-white font-medium text-xs border border-black px-3 py-1 rounded bg-white hover:bg-black transition"
                                    >
                                        Chi tiết
                                    </button>
                                </td>
                            </tr>
                        ))
                    )}
                    </tbody>
                </table>
            </div>

            {/* PAGINATION */}
            {!loading && totalPages > 0 && (
                <div className="flex justify-between items-center border-t pt-4 mt-4 bg-white">
                    <div className="text-sm text-gray-500">
                        Trang <span className="font-bold text-gray-800">{page}</span> / <span className="font-bold text-gray-800">{totalPages}</span>
                    </div>

                    <div className="flex gap-1">
                        <button
                            onClick={() => handlePageChange(page - 1)}
                            disabled={page === 1}
                            className={`px-3 py-1 border rounded text-sm font-medium transition
                                ${page === 1
                                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                : 'bg-white text-gray-700 hover:bg-gray-50 hover:text-black hover:border-black'
                            }`}
                        >
                            Trước
                        </button>

                        {/* Simple Pagination Numbers (Rút gọn cho dễ nhìn) */}
                        {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => {
                            if (totalPages > 7 && pageNum !== 1 && pageNum !== totalPages && (pageNum < page - 1 || pageNum > page + 1)) {
                                if (pageNum === 2 || pageNum === totalPages - 1) return <span key={pageNum} className="px-2 py-1 text-gray-400">...</span>;
                                return null;
                            }
                            return (
                                <button
                                    key={pageNum}
                                    onClick={() => handlePageChange(pageNum)}
                                    className={`min-w-[32px] h-8 flex items-center justify-center border rounded text-sm font-medium transition
                                        ${page === pageNum
                                        ? 'bg-black text-white border-black'
                                        : 'bg-white text-gray-700 hover:bg-gray-50 hover:text-black hover:border-black'
                                    }`}
                                >
                                    {pageNum}
                                </button>
                            );
                        })}

                        <button
                            onClick={() => handlePageChange(page + 1)}
                            disabled={page === totalPages}
                            className={`px-3 py-1 border rounded text-sm font-medium transition
                                ${page === totalPages
                                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                : 'bg-white text-gray-700 hover:bg-gray-50 hover:text-black hover:border-black'
                            }`}
                        >
                            Sau
                        </button>
                    </div>
                </div>
            )}

            <CreateStockInModal
                isOpen={isCreateModalOpen}
                onClose={() => setIsCreateModalOpen(false)}
                onSuccess={handleCreateSuccess}
            />
            <StockInDetailModal
                isOpen={viewModalOpen}
                stockInId={selectedId}
                onClose={() => {
                    setViewModalOpen(false);
                    setSelectedId(null);
                }}
                onSuccess={() => fetchStockIns()}
            />
        </div>
    );
};

export default StockInPage;