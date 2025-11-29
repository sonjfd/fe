import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import axios from "@/services/axios.customize";
import adminStockAdjApi from "@/api/admin.stockadj.api.ts";
import type {IStockAdjCreateReq} from "@/types/stockadj";

interface CreateStockAdjModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
}

interface StockAdjItemState {
    productVariantId: number;
    sku: string;
    changeQuantity: number; // Có thể âm hoặc dương
}

interface VariantOption {
    variantId: number;
    productName: string;
    sku: string;
}

const CreateStockAdjModal: React.FC<CreateStockAdjModalProps> = ({ isOpen, onClose, onSuccess }) => {
    const [reason, setReason] = useState('');
    const [items, setItems] = useState<StockAdjItemState[]>([
        { productVariantId: 0, changeQuantity: 0, sku: "" }
    ]);
    const [variantOptions, setVariantOptions] = useState<VariantOption[]>([]);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isLoadingVariants, setIsLoadingVariants] = useState(false);

    useEffect(() => {
        if (isOpen) {
            setReason('');
            setItems([{ productVariantId: 0, changeQuantity: 0, sku: "" }]);
            fetchVariants();
        }
    }, [isOpen]);

    const fetchVariants = async () => {
        setIsLoadingVariants(true);
        try {
            // Tận dụng API search có sẵn từ file mẫu StockIn
            const res: any = await axios.get('/api/v1/home/search/products?q=&page=1&size=500');
            if (res.data && res.data.items) {
                const list = res.data.items as VariantOption[];
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
        setItems([...items, { productVariantId: 0, changeQuantity: 0, sku: "" }]);
    };

    const handleRemoveItem = (index: number) => {
        if (items.length === 1) return;
        const newItems = items.filter((_, i) => i !== index);
        setItems(newItems);
    };

    const handleChangeItem = (index: number, field: keyof StockAdjItemState, value: string | number) => {
        const newItems = [...items];
        // @ts-ignore
        newItems[index][field] = field === 'changeQuantity' ? Number(value) : value;

        // Tự động điền SKU khi chọn Variant
        if (field === 'productVariantId') {
            const selected = variantOptions.find(v => v.variantId === Number(value));
            if (selected) newItems[index].sku = selected.sku;
        }

        setItems(newItems);
    };

    const validateForm = () => {
        if (!reason.trim()) {
            toast.error("Vui lòng nhập lý do kiểm kê/điều chỉnh");
            return false;
        }
        if (items.some(i => !i.productVariantId || i.productVariantId === 0)) {
            toast.error("Vui lòng chọn Sản phẩm cho tất cả các dòng");
            return false;
        }
        if (items.some(i => i.changeQuantity === 0)) {
            toast.error("Số lượng điều chỉnh phải khác 0");
            return false;
        }
        // Check trùng lặp
        const variantIds = items.map(i => i.productVariantId);
        const uniqueIds = new Set(variantIds);
        if (uniqueIds.size !== variantIds.length) {
            toast.error("Có sản phẩm trùng lặp trong danh sách.");
            return false;
        }
        return true;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!validateForm()) return;

        setIsSubmitting(true);
        const payload: IStockAdjCreateReq = {
            reason: reason.trim(),
            items: items.map(i => ({
                productVariantId: i.productVariantId,
                changeQuantity: i.changeQuantity
            }))
        };

        try {
            await adminStockAdjApi.createStockAdj(payload);
            toast.success("Tạo phiếu kiểm kê thành công!");
            onSuccess();
            onClose();
        } catch (error: any) {
            console.error(error);
            const msg = error.response?.data?.message || "Lỗi khi tạo phiếu";
            if (msg === "INVALID_STOCK_ADJUSTMENT") {
                toast.error("Lỗi: Số lượng tồn kho sau khi giảm bị âm.");
            } else {
                toast.error(msg);
            }
        } finally {
            setIsSubmitting(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm p-4 overflow-y-auto">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl animate-fade-in-down relative">
                <div className="flex justify-between items-center p-5 border-b border-gray-100">
                    <h2 className="text-xl font-bold text-gray-800">Tạo Phiếu Điều Chỉnh Kho</h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600">✕</button>
                </div>

                <div className="p-6 max-h-[80vh] overflow-y-auto">
                    <form onSubmit={handleSubmit} id="create-adj-form">
                        <div className="mb-6">
                            <label className="block text-sm font-bold text-gray-700 mb-1">Lý do điều chỉnh <span className="text-red-500">*</span></label>
                            <textarea
                                className="w-full border border-gray-300 rounded p-2 focus:border-blue-500 outline-none"
                                rows={2}
                                value={reason}
                                onChange={(e) => setReason(e.target.value)}
                                placeholder="VD: Hư hỏng, thất thoát, kiểm kê định kỳ..."
                            />
                        </div>

                        <div className="mb-4">
                            <label className="block text-sm font-bold text-gray-700 mb-2">Chi tiết sản phẩm</label>
                            <div className="space-y-2">
                                {items.map((item, index) => (
                                    <div key={index} className="flex gap-3 items-center bg-gray-50 p-3 rounded border border-gray-200">
                                        <div className="flex-1">
                                            <label className="text-xs text-gray-500 block mb-1">Sản phẩm</label>
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

                                        <div className="w-48">
                                            <label className="text-xs text-gray-500 block mb-1">Thay đổi (+ tăng, - giảm)</label>
                                            <input
                                                type="number"
                                                className={`w-full border rounded p-2 text-sm text-right font-bold ${item.changeQuantity < 0 ? 'text-red-600 border-red-300' : 'text-green-600 border-green-300'}`}
                                                value={item.changeQuantity}
                                                onChange={(e) => handleChangeItem(index, 'changeQuantity', e.target.value)}
                                            />
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

                            <button
                                type="button"
                                onClick={handleAddItem}
                                className="mt-4 text-blue-600 font-semibold hover:underline text-sm"
                            >
                                + Thêm dòng sản phẩm
                            </button>
                        </div>
                    </form>
                </div>

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
                        form="create-adj-form"
                        disabled={isSubmitting}
                        className="px-5 py-2 bg-black text-white rounded hover:bg-gray-800 font-medium disabled:opacity-50 flex items-center gap-2"
                    >
                        {isSubmitting && <span className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></span>}
                        Xác nhận & Lưu
                    </button>
                </div>
            </div>
        </div>
    );
};

export default CreateStockAdjModal;