// components/admin/Stock/CreateStockInModal.tsx
import React, { useState, useEffect } from 'react';
import adminStockApi from "@/api/admin.stock.api";
import type { IStockInCreateReq } from '@/types/stock';
import { toast } from 'react-toastify';
import axios from "@/services/axios.customize";

interface CreateStockInModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
}

interface StockInItemState {
    productVariantId: number;
    sku: string;
    quantity: number;
    importPrice: number;
}

// Interface cho dữ liệu variant lấy về để hiển thị trong select
interface VariantOption {
    variantId: number;
    productName: string;
    sku: string;
}

const CreateStockInModal: React.FC<CreateStockInModalProps> = ({ isOpen, onClose, onSuccess }) => {
    const [supplierName, setSupplierName] = useState('');
    const [items, setItems] = useState<StockInItemState[]>([
        {
            productVariantId: 0, quantity: 1, importPrice: 0,
            sku: ""
        }
    ]);
    const [variantOptions, setVariantOptions] = useState<VariantOption[]>([]);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isLoadingVariants, setIsLoadingVariants] = useState(false);

    // Load danh sách variant khi mở modal
    useEffect(() => {
        if (isOpen) {
            // Reset form
            setSupplierName('');
            setItems([{
                productVariantId: 0, quantity: 1, importPrice: 0,
                sku: ""
            }]);

            fetchVariants();
        }
    }, [isOpen]);

    const fetchVariants = async () => {
        setIsLoadingVariants(true);
        try {
            // Tận dụng API search client để lấy list variant phẳng
            // Lấy size lớn để "list hết" như yêu cầu
            const res: any = await axios.get('/api/v1/home/search/products?q=&page=1&size=500');
            if (res.data && res.data.items) {
                const list = res.data.items as VariantOption[];
                // Sắp xếp theo ID tăng dần
                list.sort((a, b) => a.variantId - b.variantId);
                setVariantOptions(list);
            }
        } catch (error) {
            console.error("Lỗi tải danh sách sản phẩm", error);
            toast.error("Không tải được danh sách sản phẩm");
        } finally {
            setIsLoadingVariants(false);
        }
    };

    const handleAddItem = () => {
        setItems([...items, { productVariantId: 0, quantity: 1, importPrice: 0, sku:""}]);
    };

    const handleRemoveItem = (index: number) => {
        if (items.length === 1) return;
        const newItems = items.filter((_, i) => i !== index);
        setItems(newItems);
    };

    const handleChangeItem = (index: number, field: keyof StockInItemState, value: string | number) => {
        const newItems = [...items];
        // @ts-ignore
        newItems[index][field] = Number(value);
        setItems(newItems);
    };

    const validateForm = () => {
        if (!supplierName.trim()) {
            toast.error("Vui lòng nhập tên Nhà cung cấp");
            return false;
        }

        // Check sản phẩm chưa chọn
        if (items.some(i => !i.productVariantId || i.productVariantId === 0)) {
            toast.error("Vui lòng chọn Sản phẩm cho tất cả các dòng");
            return false;
        }

        // Check số lượng và giá
        if (items.some(i => i.quantity <= 0 || i.importPrice < 0)) {
            toast.error("Số lượng phải > 0 và Giá nhập không được âm");
            return false;
        }

        // Check trùng lặp sản phẩm
        const variantIds = items.map(i => i.productVariantId);
        const uniqueIds = new Set(variantIds);
        if (uniqueIds.size !== variantIds.length) {
            toast.error("Có sản phẩm bị trùng lặp trong danh sách. Vui lòng gộp lại.");
            return false;
        }

        return true;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!validateForm()) return;

        setIsSubmitting(true);

        const payload: IStockInCreateReq = {
            supplierName: supplierName.trim(),
            items: items.map(i => ({
                productVariantId: i.productVariantId,
                sku: i.sku,
                quantity: i.quantity,
                cost: i.importPrice
            }))
        };

        try {
            await adminStockApi.createStockIn(payload);
            toast.success("Tạo phiếu nhập thành công!");
            onSuccess();
            onClose();
        } catch (error: any) {
            console.error(error);
            const msg = error.response?.data?.message || "Lỗi khi tạo phiếu";
            toast.error(msg);
        } finally {
            setIsSubmitting(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm p-4 overflow-y-auto">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-5xl animate-fade-in-down relative">
                {/* Header */}
                <div className="flex justify-between items-center p-5 border-b border-gray-100">
                    <h2 className="text-xl font-bold text-gray-800">Tạo Phiếu Nhập Kho</h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600">✕</button>
                </div>

                {/* Body */}
                <div className="p-6 max-h-[80vh] overflow-y-auto">
                    <form onSubmit={handleSubmit} id="create-stock-form">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-1">Nhà cung cấp <span className="text-red-500">*</span></label>
                                <input
                                    className="w-full border border-gray-300 rounded p-2 focus:border-blue-500 outline-none"
                                    value={supplierName}
                                    onChange={(e) => setSupplierName(e.target.value)}
                                    placeholder="VD: Công ty ABC"
                                />
                            </div>
                        </div>

                        <div className="mb-4">
                            <label className="block text-sm font-bold text-gray-700 mb-2">Chi tiết hàng hóa</label>
                            <div className="space-y-2">
                                {items.map((item, index) => (
                                    <div key={index} className="flex gap-3 items-center bg-gray-50 p-3 rounded border border-gray-200">
                                        <div className="flex-1">
                                            <label className="text-xs text-gray-500 block mb-1">Sản phẩm (Variant)</label>
                                            <select
                                                className="w-full border border-gray-300 rounded p-2 text-sm focus:border-blue-500 outline-none"
                                                value={item.productVariantId}
                                                onChange={(e) => handleChangeItem(index, 'productVariantId', e.target.value)}
                                            >
                                                <option value={0}>-- Chọn sản phẩm --</option>
                                                {isLoadingVariants ? (
                                                    <option disabled>Đang tải...</option>
                                                ) : (
                                                    variantOptions.map(v => (
                                                        <option key={v.variantId} value={v.variantId}>
                                                            #{v.variantId} | {v.sku} | {v.productName}
                                                        </option>
                                                    ))
                                                )}
                                            </select>
                                        </div>

                                        <div className="w-32">
                                            <label className="text-xs text-gray-500 block mb-1">Số lượng</label>
                                            <input
                                                type="number" min="1"
                                                className="w-full border border-gray-300 rounded p-2 text-sm text-right"
                                                value={item.quantity}
                                                onChange={(e) => handleChangeItem(index, 'quantity', e.target.value)}
                                            />
                                        </div>

                                        <div className="w-40">
                                            <label className="text-xs text-gray-500 block mb-1">Giá nhập (VNĐ)</label>
                                            <input
                                                type="number" min="0"
                                                className="w-full border border-gray-300 rounded p-2 text-sm text-right"
                                                value={item.importPrice}
                                                onChange={(e) => handleChangeItem(index, 'importPrice', e.target.value)}
                                            />
                                        </div>

                                        <div className="w-32 text-right pt-4">
                                            <span className="text-sm font-bold text-gray-700">
                                                {new Intl.NumberFormat('vi-VN').format(item.quantity * item.importPrice)} đ
                                            </span>
                                        </div>

                                        <button
                                            type="button"
                                            onClick={() => handleRemoveItem(index)}
                                            className="text-red-500 hover:bg-red-50 p-2 rounded mt-4"
                                            disabled={items.length === 1}
                                            title="Xóa dòng"
                                        >
                                            ✕
                                        </button>
                                    </div>
                                ))}
                            </div>

                            <div className="flex justify-between items-center mt-4">
                                <button
                                    type="button"
                                    onClick={handleAddItem}
                                    className="text-blue-600 font-semibold hover:underline text-sm"
                                >
                                    + Thêm dòng sản phẩm
                                </button>
                                <div className="text-base font-bold text-gray-800">
                                    Tổng cộng: <span className="text-red-600 text-xl ml-2">
                                        {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(
                                            items.reduce((sum, item) => sum + (item.quantity * item.importPrice), 0)
                                        )}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </form>
                </div>

                {/* Footer */}
                <div className="p-5 border-t border-gray-100 flex justify-end gap-3 bg-gray-50 rounded-b-lg">
                    <button
                        type="button"
                        onClick={onClose}
                        className="px-5 py-2 border border-gray-300 rounded text-gray-700 hover:bg-gray-100 font-medium"
                        disabled={isSubmitting}
                    >
                        Hủy bỏ
                    </button>
                    <button
                        type="submit"
                        form="create-stock-form"
                        disabled={isSubmitting}
                        className="px-5 py-2 bg-black text-white rounded hover:bg-gray-800 font-medium disabled:opacity-50 flex items-center gap-2"
                    >
                        {isSubmitting && <span className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></span>}
                        Lưu phiếu
                    </button>
                </div>
            </div>
        </div>
    );
};

export default CreateStockInModal;