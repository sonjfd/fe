import React, { useEffect, useState } from 'react';
import adminStockAdjApi from "@/api/admin.stockadj.api.ts";
import { toast } from 'react-toastify';
import type {IStockAdjRes} from "@/types/stockadj";
import CreateStockAdjModal from "components/admin/Stock/CreateStockAdjModal.tsx";
import StockAdjDetailModal from "components/admin/Stock/StockAdjDetailModal.tsx";

const StockAdjustmentPage: React.FC = () => {
    const [data, setData] = useState<IStockAdjRes[]>([]);
    const [loading, setLoading] = useState<boolean>(true);

    // Pagination State
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(0);
    const [pageSize] = useState(10);

    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [viewModalOpen, setViewModalOpen] = useState(false);
    const [selectedId, setSelectedId] = useState<number | null>(null);

    const fetchData = async () => {
        setLoading(true);
        try {
            const res = await adminStockAdjApi.getAllStockAdj(page, pageSize);
            // Xử lý response giống StockInPage để tương thích với axios.customize
            const responseData = res.data || res;

            if (responseData && responseData.items){
                // @ts-ignore
                setData(responseData.items);
                const total = responseData.total || 0;
                setTotalPages(Math.ceil(total / pageSize));
            } else {
                setData([]);
            }
        } catch (error) {
            toast.error("Không thể tải danh sách phiếu kiểm kê");
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, [page]);

    const handleCreateSuccess = () => {
        setPage(1);
        fetchData();
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

    return (
        <div className="p-6 bg-white rounded-lg shadow-md">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h2 className="text-lg font-bold text-gray-800">Điều Chỉnh Kho</h2>
                </div>

                <button
                    onClick={() => setIsCreateModalOpen(true)}
                    className="flex items-center gap-2 px-3 py-2 bg-white text-black border rounded-xl transition shadow-sm font-medium hover:bg-gray-50"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    Tạo phiếu điều chỉnh
                </button>
            </div>

            {/* TABLE CONTENT */}
            <div className="overflow-x-auto min-h-[400px]">
                <table className="min-w-full text-left text-sm border-collapse">
                    <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                        <th className="px-4 py-3 font-semibold text-gray-700 w-16">STT</th>
                        <th className="px-4 py-3 font-semibold text-gray-700">Lý do điều chỉnh</th>
                        <th className="px-4 py-3 font-semibold text-gray-700">Số sản phẩm</th>
                        <th className="px-4 py-3 font-semibold text-gray-700">Ngày tạo</th>
                        <th className="px-4 py-3 font-semibold text-gray-700 text-center">Hành động</th>
                    </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                    {loading ? (
                        <tr><td colSpan={5} className="text-center py-10 text-gray-500">Đang tải dữ liệu...</td></tr>
                    ) : data.length === 0 ? (
                        <tr><td colSpan={5} className="text-center py-10 text-gray-500 italic">Chưa có phiếu kiểm kê nào.</td></tr>
                    ) : (
                        data.map((item, index) => (
                            <tr key={item.id} className="hover:bg-blue-50 transition duration-150">
                                <td className="px-4 py-3 text-gray-700 font-bold">{(page - 1) * pageSize + index + 1}</td>
                                <td className="px-4 py-3 text-gray-700">
                                    <div className="max-w-md truncate" title={item.reason}>{item.reason}</div>
                                </td>
                                <td className="px-4 py-3 text-gray-700">
                                    {item.items ? item.items.length : 0} dòng
                                </td>
                                <td className="px-4 py-3 text-gray-700">
                                    {new Date(item.createdAt).toLocaleString('vi-VN')}
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

            <CreateStockAdjModal
                isOpen={isCreateModalOpen}
                onClose={() => setIsCreateModalOpen(false)}
                onSuccess={handleCreateSuccess}
            />
            <StockAdjDetailModal
                isOpen={viewModalOpen}
                stockAdjId={selectedId}
                onClose={() => {
                    setViewModalOpen(false);
                    setSelectedId(null);
                }}
            />
        </div>
    );
};

export default StockAdjustmentPage;