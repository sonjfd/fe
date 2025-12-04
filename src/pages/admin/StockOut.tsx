import React, { useEffect, useState } from "react";
import { getStockOuts, getStockOutDetail } from "@/api/admin.stockout.api.ts";
import type {StockOutResDTO } from "@/types/stockout";
import StockOutDetailModal from "components/admin/Stock/StockOutDetailModal.tsx";
import { toast } from "react-toastify";

const StockOut: React.FC = () => {
    // --- STATE ---
    const [stockOuts, setStockOuts] = useState<any[]>([]); // Dùng any tạm thời để chứa thêm trường totalQuantity, totalCost
    const [isLoading, setIsLoading] = useState<boolean>(false);

    const [currentPage, setCurrentPage] = useState<number>(1);
    const [totalPages, setTotalPages] = useState<number>(1);
    const [pageSize] = useState<number>(10);
    const [totalElements, setTotalElements] = useState<number>(0);

    const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
    const [selectedDetail, setSelectedDetail] = useState<StockOutResDTO | null>(null);

    // FORMAT: VNĐ
    const formatCurrency = (amount: number | undefined) => {
        if (amount === undefined || amount === null) return "0 ₫";
        return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
    };

    // --- API ---
    const fetchStockOuts = async (page: number) => {
        setIsLoading(true);
        try {
            const res = await getStockOuts(page, pageSize);
            if (res && res.data) {
                const { items, total } = res.data as any;

                // --- ĐOẠN SỬA: TÍNH CẢ TIỀN VÀ SỐ LƯỢNG ---
                const itemsWithData = await Promise.all(
                    (items || []).map(async (item: any) => {
                        try {
                            const detailRes = await getStockOutDetail(item.id);
                            
                            let totalCost = 0;
                            let totalQuantity = 0;

                            // Tính toán tổng tiền và tổng số lượng từ danh sách items chi tiết
                            if (detailRes?.data?.items) {
                                const stats = detailRes.data.items.reduce((acc: any, p: any) => {
                                    const qty = p.quantity || 0;
                                    const price = p.price || 0;
                                    
                                    acc.cost += (qty * price);
                                    acc.qty += qty;
                                    return acc;
                                }, { cost: 0, qty: 0 });

                                totalCost = stats.cost;
                                totalQuantity = stats.qty;
                            }

                            // Trả về item kèm 2 thông tin mới tính được
                            return { 
                                ...item, 
                                totalCost: totalCost,
                                totalQuantity: totalQuantity 
                            };
                        } catch (e) {
                            return { ...item, totalCost: 0, totalQuantity: 0 };
                        }
                    })
                );
                // --- KẾT THÚC ĐOẠN SỬA ---

                setStockOuts(itemsWithData);
                setTotalElements(total || 0);

                const calculatedTotalPages = Math.ceil((total || 0) / pageSize);
                setTotalPages(calculatedTotalPages > 0 ? calculatedTotalPages : 1);
            }
        } catch (error: any) {
            console.error("Lỗi lấy dữ liệu xuất hàng", error);
            const errorMessage = error?.response?.data?.message || "Lỗi tải dữ liệu";
            toast.error(errorMessage);
        } finally {
            setIsLoading(false);
        }
    };

    const handleViewDetail = async (id: number) => {
        try {
            const res = await getStockOutDetail(id);
            if (res && res.data) {
                setSelectedDetail(res.data);
                setIsModalOpen(true);
            }
        } catch (error: any) {
            toast.error("Không thể lấy thông tin.");
        }
    };

    const handlePageChange = (newPage: number) => {
        if (newPage >= 1 && newPage <= totalPages) {
            setCurrentPage(newPage);
        }
    };

    useEffect(() => {
        fetchStockOuts(currentPage);
    }, [currentPage]);


    // --- RENDER ---
    return (
        <div className="p-6 bg-white rounded-lg shadow-md">
            {/* Header */}
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h2 className="text-lg font-bold text-gray-800">Quản lý xuất kho</h2>
                </div>
            </div>

            {/* Table Container */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="min-w-full text-left text-sm border-collapse">
                        <thead className="bg-gray-50 border-b border-gray-200">
                        <tr>
                            <th className="px-4 py-3 font-semibold text-gray-700">STT</th>
                            <th className="px-4 py-3 font-semibold text-gray-700">Mã Đơn Hàng</th>
                            <th className="px-4 py-3 font-semibold text-gray-700">Ngày tạo</th>
                            <th className="px-4 py-3 font-semibold text-gray-700 text-center">Số lượng</th>
                            <th className="px-4 py-3 font-semibold text-gray-700 text-right">Tổng tiền</th>
                            <th className="px-4 py-3 font-semibold text-gray-700 text-center">Hành động</th>
                        </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                        {isLoading ? (
                            <tr>
                                <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                                    Đang tải dữ liệu...
                                </td>
                            </tr>
                        ) : stockOuts.length > 0 ? (
                            stockOuts.map((item, index) => (
                                <tr key={item.id} className="hover:bg-blue-50 transition duration-150">
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                        {(currentPage - 1) * pageSize + index + 1}
                                    </td>
                                    <td className="px-4 py-2 whitespace-nowrap text-sm">
                                        {item.orderId ? (
                                            <span className="text-black font-medium">#{item.orderId}</span>
                                        ) : (
                                            <span className="text-gray-400">N/A</span>
                                        )}
                                    </td>
                                    <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500">
                                        {new Date(item.createdAt).toLocaleString('vi-VN')}
                                    </td>
                                    
                                    {/* CỘT SỐ LƯỢNG (Đã tính toán) */}
                                    <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900 text-center font-medium">
                                        {item.totalQuantity}
                                    </td>

                                    {/* CỘT TỔNG TIỀN (Đã tính toán) */}
                                    <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900 font-bold text-right">
                                        {formatCurrency(item.totalCost)}
                                    </td>

                                    <td className="px-4 py-2 text-center">
                                        <button
                                            onClick={() => handleViewDetail(item.id)}
                                            className="text-black hover:text-white font-medium text-xs border border-black px-3 py-1 rounded bg-white hover:bg-black transition"
                                        >
                                            Chi tiết
                                        </button>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                                    Không tìm thấy dữ liệu xuất kho.
                                </td>
                            </tr>
                        )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                {!isLoading && totalPages > 0 && (
                    <div className="flex justify-between items-center pt-4 mt-4 bg-white p-4">
                        <div className="text-sm text-gray-500">
                            Trang <span className="font-bold text-gray-800">{currentPage}</span> / <span className="font-bold text-gray-800">{totalPages}</span> (Tổng: {totalElements})
                        </div>

                        <div className="flex gap-1">
                            <button
                                onClick={() => handlePageChange(currentPage - 1)}
                                disabled={currentPage === 1}
                                className={`px-3 py-1 border rounded text-sm font-medium transition
                                ${currentPage === 1
                                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                    : 'bg-white text-gray-700 hover:bg-gray-50 hover:text-black hover:border-black'
                                }`}
                            >
                                Trước
                            </button>

                            {/* Pagination Logic */}
                            {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => {
                                if (totalPages > 7 && pageNum !== 1 && pageNum !== totalPages && (pageNum < currentPage - 1 || pageNum > currentPage + 1)) {
                                    if (pageNum === 2 || pageNum === totalPages - 1) return <span key={pageNum} className="px-2 py-1 text-gray-400">...</span>;
                                    return null;
                                }
                                return (
                                    <button
                                        key={pageNum}
                                        onClick={() => handlePageChange(pageNum)}
                                        className={`min-w-[32px] h-8 flex items-center justify-center border rounded text-sm font-medium transition
                                        ${currentPage === pageNum
                                            ? 'bg-black text-white border-black'
                                            : 'bg-white text-gray-700 hover:bg-gray-50 hover:text-black hover:border-black'
                                        }`}
                                    >
                                        {pageNum}
                                    </button>
                                );
                            })}

                            <button
                                onClick={() => handlePageChange(currentPage + 1)}
                                disabled={currentPage === totalPages}
                                className={`px-3 py-1 border rounded text-sm font-medium transition
                                ${currentPage === totalPages
                                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                    : 'bg-white text-gray-700 hover:bg-gray-50 hover:text-black hover:border-black'
                                }`}
                            >
                                Sau
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* Modal */}
            <StockOutDetailModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                data={selectedDetail}
            />
        </div>
    );
};

export default StockOut;