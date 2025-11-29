import { useEffect, useState } from "react";
// import { Link } from "react-router-dom";
import adminStockApi from "@/api/admin.stock.api";
import { toast } from "react-toastify";
import type {StockResDTO} from "@/types/stock";
import {useDebounce} from "@/hook/UseDebounce.tsx";


export function TableStock() {
    const [rows, setRows] = useState<StockResDTO[]>([]);
    const [loading, setLoading] = useState<boolean>(false);
    const [search, setSearch] = useState("");
    const debouncedSearchTerm = useDebounce(search, 200);

    const [page, setPage] = useState<number>(1);
    const [pageSize] = useState<number>(10);
    const [totalPages, setTotalPages] = useState<number>(0);
    const [totalElements, setTotalElements] = useState<number>(0);

    const loadData = async (currentPage: number, currentKeyword: string) => {
        setLoading(true);
        try {
            // Gọi API: page, size
            const res = await adminStockApi.getAllStocks(currentPage, pageSize, currentKeyword);
            const responseData = res.data || res;
            if (responseData && responseData.items) {
                // @ts-ignore
                setRows(responseData.items || []);
                const total = responseData.total || 0;
                setTotalElements(total);
                setTotalPages(Math.ceil(total / pageSize));
            } else {
                setRows([]);
                setTotalElements(0);
            }
        } catch (error) {
            console.error(error);
            toast.error("Lỗi tải dữ liệu tồn kho");
            setRows([]);
        } finally {
            setLoading(false);
        }
    };

    // 3. Effect Hook
    useEffect(() => {
        loadData(page, debouncedSearchTerm);
    }, [page,debouncedSearchTerm, pageSize]);

    useEffect(() => {
        setPage(1);
    }, [debouncedSearchTerm]);

    const handlePageChange = (newPage: number) => {
        if (newPage >= 1 && newPage <= totalPages) {
            setPage(newPage);
        }
    };

    // 4. Render
    return (
        <div className="rounded-lg border border-neutral-200 bg-white shadow-sm">

            <div className="flex items-center justify-between border-b border-neutral-200 p-4 bg-gray-50 rounded-t-lg">
                <div>
                    <h2 className="text-lg font-bold text-gray-800">Quản lý kho</h2>
                </div>
                <div className="flex items-center gap-3 w-full md:w-auto">
                    <div className="relative w-full md:w-72">
                        <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                            <svg className="w-4 h-4 text-gray-500" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 20">
                                <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m19 19-4-4m0-7A7 7 0 1 1 1 8a7 7 0 0 1 14 0Z"/>
                            </svg>
                        </div>
                        <input
                            type="text"
                            className="bg-white border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full pl-10 p-2.5 shadow-sm"
                            placeholder="Tìm theo tên sản phẩm"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>
                    {/*<Link to={"/admin/stockIn"}>*/}
                    {/*    <button*/}
                    {/*        className="rounded-md bg-black text-white px-4 py-2 text-sm font-medium transition shadow-sm">*/}
                    {/*        Lịch sử Nhập kho*/}
                    {/*    </button>*/}
                    {/*</Link>*/}
                </div>

            </div>


            <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                    <thead className="bg-gray-100 text-gray-700 font-semibold border-y">
                    <tr>
                        <th className="px-4 py-3 font-semibold text-gray-700">STT</th>
                        <th className="px-4 py-3 font-semibold text-gray-700">Mã Sản Phẩm </th>
                        <th className="px-4 py-3 font-semibold text-gray-700">Tên Sản Phẩm</th>
                        <th className="px-4 py-3 font-semibold text-gray-700">Số lượng biến thể</th>
                        <th className="px-4 py-3 font-semibold text-gray-700">Số lượng tồn</th>
                        <th className="px-4 py-3 font-semibold text-gray-700">Đã bán</th>
                    </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                    {loading ? (
                        <tr>
                            <td colSpan={6} className="px-4 py-8 text-center text-gray-500">
                                <div className="flex justify-center items-center gap-2">
                                    <span className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></span>
                                    Đang tải dữ liệu...
                                </div>
                            </td>
                        </tr>
                    ) : rows.length === 0 ? (
                        <tr>
                            <td colSpan={6} className="px-8 py-8 text-center text-gray-500">
                                Không tìm thấy dữ liệu tồn kho.
                            </td>
                        </tr>
                    ) : (
                        rows.map((item, idx) => (
                            <tr key={idx} className="hover:bg-blue-50 transition duration-150">
                                <td className="px-3 py-3 text-gray-500">
                                    {(page - 1) * pageSize + idx + 1}
                                </td>
                                <td className="px-4 py-3 text-gray-700">
                                    {item.variantId}
                                </td>
                                <td className="px-4 py-3 text-gray-700">{item.variantName}</td>
                                <td className="px-4 py-3 text-gray-700">{item.variantQuantity}</td>
                                <td className="px-4 py-3 text-gray-700">{item.quantity}</td>
                                <td className="px-4 py-3 text-gray-700">{item.soldQuantity}</td>
                            </tr>
                        ))
                    )}
                    </tbody>
                </table>
            </div>


            <div className="flex items-center justify-between p-4 border-t bg-gray-50 rounded-b-lg">
                <div className="text-sm text-gray-600">
                    Trang <span className="font-bold">{page}</span> / <span className="font-bold">{totalPages || 1}</span> (Tổng: {totalElements})
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
                        className={`px-3 py-1.5 rounded border text-sm font-medium transition
                        ${page >= totalPages
                            ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                            : 'bg-white text-gray-700 hover:bg-gray-50 hover:text-black hover:border-black'}`}
                        onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                        disabled={page >= totalPages || loading}
                    >
                        Sau
                    </button>
                </div>
            </div>
        </div>
    );
}