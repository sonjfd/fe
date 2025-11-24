import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { AdminStockApi } from "@/api/admin.stock.api";
import { stockHelperApi } from "@/api/admin.helper.api";
import type {StockInCreateReqDTO} from "@/types/stock";

interface ItemRow {
    tempId: number;
    selectedProductId: number;
    productVariantId: number;
    quantity: number;
    cost: number;
    variantOptions: any[];
    loadingVariants: boolean;
}

const CreatePurchaseOrderPage = () => {
    const navigate = useNavigate();
    const [supplierName, setSupplierName] = useState("");
    const [products, setProducts] = useState<any[]>([]);
    const [rows, setRows] = useState<ItemRow[]>([
        { tempId: Date.now(), selectedProductId: 0, productVariantId: 0, quantity: 1, cost: 0, variantOptions: [], loadingVariants: false }
    ]);

    useEffect(() => {
        const loadProducts = async () => {
            try {
                const list = await stockHelperApi.getProductsForSelect();
                setProducts(list);
            } catch (e) { toast.error("Lỗi tải danh sách sản phẩm"); }
        };
        loadProducts();
    }, []);

    const handleAddRow = () => {
        setRows([...rows, { tempId: Date.now(), selectedProductId: 0, productVariantId: 0, quantity: 1, cost: 0, variantOptions: [], loadingVariants: false }]);
    };

    const handleRemoveRow = (index: number) => {
        if (rows.length === 1) return;
        const remove = [...rows];
        remove.splice(index, 1);
        setRows(remove);
    };

    const handleRowChange = (index: number, field: keyof ItemRow, value: any) => {
        const newRows = [...rows]; (newRows[index] as any)[field] = value; setRows(newRows);
    };

    const handleProductChange = async (index: number, productId: number) => {
        const newRows = [...rows];
        newRows[index].selectedProductId = productId;
        newRows[index].productVariantId = 0;
        newRows[index].loadingVariants = true;
        newRows[index].variantOptions = [];
        setRows(newRows);

        if (productId !== 0) {
            try {
                const variants = await stockHelperApi.getVariantByProductId(productId);
                setRows(prev => {
                    const up = [...prev];
                    up[index].variantOptions = variants;
                    up[index].loadingVariants = false;
                    return up;
                });
            } catch (e) { console.error(e); }
        }
    };

    const handleSubmit = async () => {
        if (!supplierName.trim()) return toast.error("Nhập tên nhà cung cấp");
        const validItems = rows.filter(r => r.productVariantId !== 0);
        if (validItems.length === 0) return toast.error("Chọn ít nhất 1 sản phẩm");

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
            toast.success("Tạo phiếu nhập thành công!");
            navigate("/admin/purchase-orders");
        } catch (e: any) {
            toast.error(e?.response?.data?.message || "Lỗi tạo phiếu");
        }
    };

    return (
        <div className="p-6 bg-gray-100 min-h-screen flex justify-center">
            <div className="w-full max-w-4xl bg-white rounded shadow-lg p-8">
                <h2 className="text-2xl font-bold text-gray-800 mb-6 border-b pb-4">Tạo Đơn Nhập Hàng Mới</h2>

                <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Nhà Cung Cấp</label>
                    <input
                        type="text"
                        className="w-full border border-gray-300 rounded p-2 focus:ring-2 focus:ring-blue-500 outline-none"
                        placeholder="Nhập tên NCC..."
                        value={supplierName}
                        onChange={e => setSupplierName(e.target.value)}
                    />
                </div>

                <div className="space-y-4 mb-8">
                    <div className="grid grid-cols-12 gap-2 font-bold text-gray-500 text-sm uppercase">
                        <div className="col-span-4">Sản phẩm</div>
                        <div className="col-span-3">Biến thể</div>
                        <div className="col-span-2">Số lượng</div>
                        <div className="col-span-2">Giá nhập</div>
                        <div className="col-span-1"></div>
                    </div>
                    {rows.map((row, idx) => (
                        <div key={row.tempId} className="grid grid-cols-12 gap-2 items-center bg-gray-50 p-2 rounded border border-gray-100">
                            <div className="col-span-4">
                                <select
                                    className="w-full border rounded p-2 text-sm"
                                    value={row.selectedProductId}
                                    onChange={e => handleProductChange(idx, Number(e.target.value))}
                                >
                                    <option value={0}>-- Chọn SP --</option>
                                    {products.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                                </select>
                            </div>
                            <div className="col-span-3">
                                <select
                                    className="w-full border rounded p-2 text-sm disabled:bg-gray-200"
                                    value={row.productVariantId}
                                    onChange={e => handleRowChange(idx, 'productVariantId', e.target.value)}
                                    disabled={row.selectedProductId === 0}
                                >
                                    <option value={0}>{row.loadingVariants ? "Loading..." : "-- Loại --"}</option>
                                    {row.variantOptions.map(v => (
                                        <option key={v.id} value={v.id}>{v.sku} - {v.name || v.attributeValues?.map((a:any)=>a.value).join('/')}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="col-span-2">
                                <input type="number" min="1" className="w-full border rounded p-2 text-sm text-center"
                                       value={row.quantity} onChange={e => handleRowChange(idx, 'quantity', e.target.value)} />
                            </div>
                            <div className="col-span-2">
                                <input type="number" min="0" className="w-full border rounded p-2 text-sm text-right"
                                       value={row.cost} onChange={e => handleRowChange(idx, 'cost', e.target.value)} />
                            </div>
                            <div className="col-span-1 text-center">
                                <button onClick={() => handleRemoveRow(idx)} className="text-red-500 hover:text-red-700">🗑️</button>
                            </div>
                        </div>
                    ))}
                    <button onClick={handleAddRow} className="text-blue-600 text-sm font-semibold hover:underline">+ Thêm dòng</button>
                </div>

                <div className="flex justify-end gap-4 pt-4 border-t">
                    <button onClick={() => navigate("/admin/purchase-orders")} className="px-5 py-2 text-gray-600 hover:bg-gray-100 rounded border">Hủy bỏ</button>
                    <button onClick={handleSubmit} className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 font-medium shadow">Lưu Phiếu</button>
                </div>
            </div>
        </div>
    );
};

export default CreatePurchaseOrderPage;
