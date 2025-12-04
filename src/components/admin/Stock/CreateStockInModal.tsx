// components/admin/Stock/CreateStockInModal.tsx
import React, { useState, useEffect, useRef } from 'react';
import adminStockApi from "@/api/admin.stock.api";
import type { IStockInCreateReq } from '@/types/stock';
import { toast } from 'react-toastify';
import axios from "@/services/axios.customize";

interface CreateStockInModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
}

// Thêm productName để hiển thị trên ô nhập
interface StockInItemState {
    productVariantId: number;
    sku: string;
    productName: string; 
    quantity: number;
    importPrice: number;
}

// Interface kết quả tìm kiếm
interface VariantOption {
    variantId: number;
    productName: string;
    sku: string;
}

// --- SUB-COMPONENT: Dòng nhập hàng (Xử lý tìm kiếm riêng biệt) ---
interface StockItemRowProps {
    item: StockInItemState;
    index: number;
    onUpdate: (index: number, field: keyof StockInItemState, value: any) => void;
    onRemove: (index: number) => void;
    isSingle: boolean;
}

const StockItemRow: React.FC<StockItemRowProps> = ({ item, index, onUpdate, onRemove, isSingle }) => {
    // State nội bộ cho việc tìm kiếm
    const [searchTerm, setSearchTerm] = useState(item.productName || "");
    const [suggestions, setSuggestions] = useState<VariantOption[]>([]);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [isSearching, setIsSearching] = useState(false);
    
    const wrapperRef = useRef<HTMLDivElement>(null);

    // Đồng bộ lại input khi dữ liệu cha thay đổi (VD: reset form)
    useEffect(() => {
        setSearchTerm(item.productName || "");
    }, [item.productName]);

    // Xử lý Click ra ngoài để đóng gợi ý
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
                setShowSuggestions(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    // --- LOGIC TÌM KIẾM THỦ CÔNG (Thay thế useDebounce) ---
    useEffect(() => {
        // Nếu ô tìm kiếm rỗng hoặc giống tên đã chọn -> không tìm
        if (!searchTerm.trim() || searchTerm === item.productName) {
            setSuggestions([]);
            return;
        }

        // Tạo bộ đếm ngược (Delay 500ms)
        const delaySearch = setTimeout(async () => {
            setIsSearching(true);
            try {
                const res: any = await axios.get('/api/v1/home/search/products', {
                    params: {
                        q: searchTerm,
                        page: 1,
                        size: 20 // Lấy 20 kết quả
                    }
                });
                
                if (res.data && res.data.items) {
                    setSuggestions(res.data.items);
                    setShowSuggestions(true);
                } else {
                    setSuggestions([]);
                }
            } catch (error) {
                console.error("Lỗi tìm kiếm:", error);
            } finally {
                setIsSearching(false);
            }
        }, 500);

        // Hủy bộ đếm ngược nếu người dùng gõ tiếp (Cleanup function)
        return () => clearTimeout(delaySearch);
    }, [searchTerm, item.productName]);

    // Xử lý khi chọn sản phẩm từ danh sách
    const handleSelectProduct = (variant: VariantOption) => {
        // Cập nhật dữ liệu lên cha
        onUpdate(index, 'productVariantId', variant.variantId);
        onUpdate(index, 'sku', variant.sku);
        onUpdate(index, 'productName', variant.productName);
        
        // Cập nhật hiển thị và đóng gợi ý
        setSearchTerm(variant.productName);
        setShowSuggestions(false);
    };

    return (
        <div className="flex flex-col md:flex-row gap-3 items-start md:items-center bg-gray-50 p-3 rounded border border-gray-200 relative mb-2">
            {/* Cột 1: Ô NHẬP TÌM KIẾM */}
            <div className="flex-1 w-full relative" ref={wrapperRef}>
                <label className="text-xs text-gray-500 block mb-1 font-semibold">Tên sản phẩm / SKU</label>
                <div className="relative">
                    <input
                        type="text"
                        className={`w-full border ${item.productVariantId ? 'border-black' : 'border-gray-300'} rounded p-2 text-sm outline-none focus:border-black focus:ring-1 focus:ring-black transition-colors`}
                        placeholder="Nhập tên sản phẩm..."
                        value={searchTerm}
                        onChange={(e) => {
                            setSearchTerm(e.target.value);
                            // Nếu xóa trắng -> Reset thông tin sản phẩm đã chọn
                            if (e.target.value === '') {
                                onUpdate(index, 'productVariantId', 0);
                                onUpdate(index, 'sku', '');
                                onUpdate(index, 'productName', '');
                            } else {
                                // Nếu người dùng sửa tên -> Reset ID để bắt buộc chọn lại
                                if (item.productVariantId !== 0) {
                                    onUpdate(index, 'productVariantId', 0);
                                }
                                setShowSuggestions(true);
                            }
                        }}
                        onFocus={() => {
                            if (suggestions.length > 0 && searchTerm) setShowSuggestions(true);
                        }}
                    />
                </div>

                {/* DANH SÁCH GỢI Ý */}
                {showSuggestions && (
                    <div className="absolute z-50 w-full bg-white border border-gray-300 rounded-md mt-1 max-h-60 overflow-y-auto shadow-xl ring-1 ring-black ring-opacity-5">
                        {suggestions.length > 0 ? (
                            suggestions.map((variant) => (
                                <div
                                    key={variant.variantId}
                                    className="p-2.5 hover:bg-white cursor-pointer border-b border-gray-100 last:border-0 flex justify-between items-center"
                                    onClick={() => handleSelectProduct(variant)}
                                >
                                    <div>
                                        <p className="text-sm font-medium text-gray-800">{variant.productName}</p>
                                        <p className="text-xs text-gray-500">SKU: <span className="font-mono text-gray-700">{variant.sku}</span></p>
                                    </div>
                                    {item.productVariantId === variant.variantId && (
                                        <span className="text-xs font-bold px-2 py-1 rounded">Đã chọn</span>
                                    )}
                                </div>
                            ))
                        ) : (
                            !isSearching && searchTerm && (
                                <div className="p-3 text-sm text-gray-500 text-center">Không tìm thấy sản phẩm nào</div>
                            )
                        )}
                    </div>
                )}
                
            </div>

            {/* Cột 2: SỐ LƯỢNG */}
            <div className="w-full md:w-28">
                <label className="text-xs text-gray-500 block mb-1 font-semibold">Số lượng</label>
                <input
                    type="number" min="1"
                    className="w-full border border-gray-300 rounded p-2 text-sm text-right focus:border-black outline-none"
                    value={item.quantity}
                    onChange={(e) => onUpdate(index, 'quantity', e.target.value)}
                />
            </div>

            {/* Cột 3: GIÁ NHẬP */}
            <div className="w-full md:w-36">
                <label className="text-xs text-gray-500 block mb-1 font-semibold">Giá nhập (VNĐ)</label>
                <input
                    type="number" min="0"
                    className="w-full border border-gray-300 rounded p-2 text-sm text-right focus:border-black outline-none"
                    value={item.importPrice}
                    onChange={(e) => onUpdate(index, 'importPrice', e.target.value)}
                />
            </div>

            {/* Cột 4: THÀNH TIỀN & XÓA */}
            <div className="w-full md:w-auto flex justify-between md:flex-col md:items-end mt-2 md:mt-0 min-w-[100px]">
                <div className="md:pt-6">
                    <span className="md:hidden text-xs text-gray-500 mr-2">Thành tiền:</span>
                    <span className="text-sm font-bold text-black block text-right">
                        {new Intl.NumberFormat('vi-VN').format(item.quantity * item.importPrice)} đ
                    </span>
                </div>
                <button
                    type="button"
                    onClick={() => onRemove(index)}
                    className="text-red-500 hover:text-red-700 hover:bg-red-50 p-1.5 rounded transition-colors md:mt-1 self-end"
                    disabled={isSingle}
                    title="Xóa dòng này"
                >
                    <span className="text-sm font-bold">Xóa </span>
                </button>
            </div>
        </div>
    );
};

// --- COMPONENT CHÍNH ---
const CreateStockInModal: React.FC<CreateStockInModalProps> = ({ isOpen, onClose, onSuccess }) => {
    const [supplierName, setSupplierName] = useState('');
    const [items, setItems] = useState<StockInItemState[]>([
        {
            productVariantId: 0, 
            quantity: 1, 
            importPrice: 0,
            sku: "", 
            productName: "" // Khởi tạo rỗng
        }
    ]);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Reset form khi mở modal
    useEffect(() => {
        if (isOpen) {
            setSupplierName('');
            setItems([{
                productVariantId: 0, 
                quantity: 1, 
                importPrice: 0, 
                sku: "", 
                productName: ""
            }]);
        }
    }, [isOpen]);

    const handleAddItem = () => {
        setItems([...items, { 
            productVariantId: 0, 
            quantity: 1, 
            importPrice: 0, 
            sku: "", 
            productName: "" 
        }]);
    };

    const handleRemoveItem = (index: number) => {
        if (items.length === 1) return;
        const newItems = items.filter((_, i) => i !== index);
        setItems(newItems);
    };

    const handleChangeItem = (index: number, field: keyof StockInItemState, value: string | number) => {
        const newItems = [...items];
        
        if (field === 'quantity' || field === 'importPrice' || field === 'productVariantId') {
             // @ts-ignore
            newItems[index][field] = Number(value);
        } else {
             // @ts-ignore
            newItems[index][field] = value;
        }
        setItems(newItems);
    };

    const validateForm = () => {
        if (!supplierName.trim()) {
            toast.error("Vui lòng nhập tên Nhà cung cấp");
            return false;
        }

        // Kiểm tra xem dòng nào chưa chọn sản phẩm
        const invalidIndex = items.findIndex(i => !i.productVariantId || i.productVariantId === 0);
        if (invalidIndex !== -1) {
            toast.error(`Dòng thứ ${invalidIndex + 1}: Vui lòng tìm và chọn sản phẩm từ danh sách gợi ý!`);
            return false;
        }

        if (items.some(i => i.quantity <= 0 || i.importPrice < 0)) {
            toast.error("Số lượng phải > 0 và Giá nhập không được âm");
            return false;
        }

        // Kiểm tra trùng lặp
        const variantIds = items.map(i => i.productVariantId);
        const uniqueIds = new Set(variantIds);
        if (uniqueIds.size !== variantIds.length) {
            toast.error("Có sản phẩm bị trùng lặp trong danh sách. Vui lòng gộp số lượng lại.");
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

    // Tính tổng tiền
    const totalAmount = items.reduce((sum, item) => sum + (item.quantity * item.importPrice), 0);

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm p-4 overflow-y-auto">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-5xl animate-fade-in-down relative flex flex-col max-h-[90vh]">
                {/* Header */}
                <div className="flex justify-between items-center p-5 border-b border-gray-100 shrink-0">
                    <div>
                        <h2 className="text-xl font-bold text-gray-800">Tạo Phiếu Nhập Kho</h2>
                    </div>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600 p-2 rounded-full hover:bg-gray-100 transition-colors">
                        <span className="text-xl">✕</span>
                    </button>
                </div>

                {/* Body - Có thanh cuộn */}
                <div className="p-6 overflow-y-auto grow">
                    <form id="create-stock-form" onSubmit={handleSubmit}>
                        {/* Nhà cung cấp */}
                        <div className="p-4 rounded-lg mb-6">
                            <label className="block text-sm font-bold text-gray-700 mb-1">
                                Nhà cung cấp <span className="text-red-500">*</span>
                            </label>
                            <input
                                className="w-full border border-gray-300 rounded p-2 focus:border-black outline-none bg-white"
                                value={supplierName}
                                onChange={(e) => setSupplierName(e.target.value)}
                                placeholder="Nhập tên nhà cung cấp (VD: Công ty ABC)..."
                                autoFocus
                            />
                        </div>

                        {/* Danh sách hàng hóa */}
                        <div className="mb-4">
                            <label className="block text-sm font-bold text-gray-700 mb-2">Chi tiết hàng hóa</label>
                            <div className="space-y-3">
                                {items.map((item, index) => (
                                    <StockItemRow 
                                        key={index}
                                        item={item}
                                        index={index}
                                        onUpdate={handleChangeItem}
                                        onRemove={handleRemoveItem}
                                        isSingle={items.length === 1}
                                    />
                                ))}
                            </div>

                            <div className="flex justify-between items-center mt-6 pt-4 border-t border-gray-100">
                                <button
                                    type="button"
                                    onClick={handleAddItem}
                                    className="text-black font-semibold px-3 py-2 rounded transition-colors flex items-center gap-1"
                                >
                                    <span className="text-lg font-bold">+</span> Thêm dòng sản phẩm
                                </button>
                                <div className="text-base font-medium text-gray-600">
                                    Tổng tiền: <span className="text-red-600 text-2xl font-bold ml-2">
                                        {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(totalAmount)}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </form>
                </div>

                {/* Footer */}
                <div className="p-5 border-t border-gray-100 flex justify-end gap-3 bg-gray-50 rounded-b-lg shrink-0">
                    <button
                        type="button"
                        onClick={onClose}
                        className="px-5 py-2 border border-gray-300 rounded text-gray-700 hover:bg-gray-100 font-medium transition-colors"
                        disabled={isSubmitting}
                    >
                        Hủy bỏ
                    </button>
                    <button
                        type="submit"
                        form="create-stock-form"
                        disabled={isSubmitting}
                        className="px-6 py-2 bg-black text-white rounded hover:bg-black font-medium disabled:opacity-50 flex items-center gap-2 shadow-sm transition-colors"
                    >
                        {isSubmitting && <span className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></span>}
                        Lưu phiếu nhập
                    </button>
                </div>
            </div>
        </div>
    );
};

export default CreateStockInModal;