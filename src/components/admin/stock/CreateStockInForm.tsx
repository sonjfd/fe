import React, {useEffect, useState} from "react";
import { toast } from "react-toastify";
import { AdminStockApi } from "@/api/admin.stock.api.ts";
import type {StockInCreateReqDTO} from "@/types/stock";
import {stockHelperApi} from "@/api/admin.helper.api.ts";


interface ItemRow{
    tempId: number,
    selectedProductId: number;
    productVariantId: number;
    quantity: number;
    cost: number;
    variantOptions: any[];
    loadingVariant: boolean;
}

interface props{
    onSuccess: () => void;
    onCancel: () => void;
}

const CreateStockInForm: React.FC<props> = ({onSuccess, onCancel}) => {
    const [supplierName, setSupplierName] = useState("");
    const [products, setProducts] = useState<any[]>([]);
    const [row, setRows] = useState<ItemRow[]>([{tempId: Date.now(),selectedProductId: 0, productVariantId: 0, quantity: 1, cost: 0, variantOptions: [], loadingVariant: false}
    ]);

    useEffect(() => {
        const loadProducts = async () => {
            try {
                const list: any = await stockHelperApi.getProductsForSelect();
                setProducts(list);
            } catch (e){
                toast.error("Không tải được danh sách sản phẩm");
            }
        };
        loadProducts();
    }, []);

    const handleAddRow = () => {
        setRows([...row, {
            tempId: Date.now(),
            selectedProductId: 0,
            productVariantId: 0,
            quantity: 1,
            cost: 0,
            variantOptions: [],
            loadingVariant: false
        }]);
    };

    const handleRemoveRow = (index: number)=> {
        if (row.length === 1) return;
        const newRow = [...row];
        newRow.splice(index, 1);
        setRows(newRow);
    }

    const handleRowChange = (index: number, field: keyof ItemRow, value:any) => {
        const newRows = [...row];
        (newRows[index] as any) [field] = value;
        setRows(newRows);
    };

    const handleProductChange = async (index: number, productId: number) => {
        const newRow = [...row];
        newRow[index].selectedProductId = productId;
        newRow[index].productVariantId = 0;
        newRow[index].loadingVariant = true;
        newRow[index].variantOptions = [];
        setRows(newRow);

        if (productId !== 0){
            try {
                const variants = await stockHelperApi.getVariantByProductId(productId);

                setRows(prev => {
                    const updated = [...prev];
                    updated[index].variantOptions = variants;
                    updated[index].loadingVariant = false;
                    return updated;
                });
            } catch (error){
                console.error(error);
            }
        }
    };

    const handleSubmit = async () => {
        if (!supplierName.trim()) return toast.error("Vui lòng nhập tên nhà cung cấp");

        const validItems = row.filter(r => r.productVariantId !== 0);
        if (validItems.length === 0) return toast.error("Vui lòng chọn ít nhất 1 sản phẩm/variant hợp lệ");

        if (row.some(r => r.quantity <= 0 || r.cost < 0))
            return toast.error("Số lượng phải > 0 và giá nhập >= 0");

        const payload: StockInCreateReqDTO = {
            supplierName,
            items: validItems.map(r => ({
                productVariantId: Number(r.productVariantId),
                quantity: Number(r.quantity),
                cost: Number(r.cost)
            }))
        };
        try {
            await AdminStockApi.createStockIn(payload);
            toast.success("Tạo phiếu nhập kho thành công!");
            onSuccess();
        } catch (error: any){
            toast.error(error?.response?.data?.message || "Lỗi tạo phiếu");
        }
    };

    return (
        <div className="bg-white p-6 rounded-lg border border-blue-200 shadow-lg mb-8 animate-fade-in-down">
            <h3 className="text-lg font-bold text-blue-800 mb-4 border-b pb-2">Phiếu Nhập Kho Mới</h3>

            <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">Nhà cung cấp</label>
                <input type="text"
                       className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                       placeholder="Ví dụ: Samsung Official Distributor..."
                       value={supplierName}
                       onChange={e => setSupplierName(e.target.value)}
                />
            </div>

            <div className="space-y-3">
                <div className="grid grid-cols-12 gap-2 text-xs font-bold text-gray-500 uppercase">
                    <div className="col-span-3">Chọn sản phẩm</div>
                    <div className="col-span-4">Chọn loại (Variant)</div>
                    <div className="col-span-2">Số lượng</div>
                    <div className="col-span-2">Giá nhập(VNĐ)</div>
                    <div className="col-span-1"></div>
                </div>

                {row.map((row, idx) => (
                    <div key={row.tempId} className="grid grid-cols-12 gap-2 items-start bg-gray-50 p-2 rounded">
                        <div className= "col-span-3">
                            <select className="w-full border border-gray-300 rounded px-2 py-1.5 text-sm"
                                    value={row.selectedProductId}
                                    onChange={(e) => handleProductChange(idx, Number(e.target.value))}
                                    >
                                <option value={0}>-- Chọn Sản Phẩm --</option>
                                {products.map(p => (
                                    <option key={p.id} value={p.id}>{p.name}</option>
                                ))}
                            </select>
                        </div>

                        <div className="col-span-4">
                            <select className="w-full border border-gray-300 rounded px-2 py-1.5 text-sm disabled:bg-gray-200"
                                    value={row.productVariantId}
                                    onChange={(e) => handleRowChange(idx, 'productVariantId', e.target.value)}
                                    disabled={row.selectedProductId === 0}
                                    >
                                <option value={0}>
                                    {row.loadingVariant ? "Đang tải..." : "-- Chọn Phiên Bản --"}
                                </option>
                                {row.variantOptions.map(v => (
                                    <option key={v.id} value={v.id}>
                                        {v.sku} - {v.name || v.attributes?.map((av:any) => av.value).join('/')}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="col-span-2">
                            <input
                            type="number" min="1"
                            className="w-full border border-gray-300 rounded px-2 py-1.5 text-sm text-center"
                            value={row.quantity}
                            onChange={(e) => handleRowChange(idx, 'quantity',e.target.value)}
                            />
                        </div>

                        <div className="col-span-2">
                            <input
                            type="number" min="0"
                            className="w-full border border-gray-300 rounded px-2 py-1.5 text-sm text-right"
                            value={row.cost}
                            onChange={(e) => handleRowChange(idx, 'cost',e.target.value)}
                            />
                        </div>

                        <div className="col-span-1 flex justify-center">
                            <button onClick={() => handleRemoveRow(idx)}
                                    className="text-red-500 hover:text-red-700 p-1"
                                    title="Xóa">
                                Xóa🗑️
                            </button>
                        </div>
                    </div>
                ))}
            </div>
            <div className="mt-4 flex justify-between items-center">
                <button onClick={handleAddRow}
                        className="text-blue-600 text-sm font-semibold hover:underline flex items-center gap-1">
                    + Thêm dòng sản phẩm
                </button>
                <div className="flex gap-3">
                    <button onClick={onCancel} className="px-4 py-2 border rounded text-gray-600 hover:bg-gray-100">Hủy</button>
                    <button onClick={handleSubmit} className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 shadow">Lưu</button>
                </div>
            </div>
        </div>
    );
};

export default CreateStockInForm;