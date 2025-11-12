import React from "react";
import { listAddresses, createAddress, deleteAddress, updateAddress } from "../../api/account.api";


export default function AddressPage() {
    const [items, setItems] = React.useState<IAddress[]>([]);
    React.useEffect(() => { listAddresses().then(setItems); }, []);


    async function add() {
        const name = prompt("Họ tên người nhận") || "";
        const phone = prompt("Số điện thoại") || "";
        const province = prompt("Tỉnh/Thành") || "";
        const district = prompt("Quận/Huyện") || "";
        const ward = prompt("Phường/Xã") || "";
        const addressDetail = prompt("Địa chỉ chi tiết") || "";
        const created = await createAddress({ name, phone, province, district, ward, addressDetail });
        setItems(prev => [...prev, created]);
    }
    async function remove(id: IAddress["id"]) {
        if (!confirm("Xóa địa chỉ này?")) return;
        await deleteAddress(id);
        setItems(prev => prev.filter(a => a.id !== id));
    }
    async function setDefault(id: IAddress["id"]) {
        await updateAddress(id, { isDefault: true });
        const fresh = await listAddresses();
        setItems(fresh);
    }


    return (
        <div className="p-6 bg-white border rounded-xl shadow-sm">
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-semibold">Địa chỉ của tôi</h2>
                <button onClick={add} className="bg-slate-800 text-white px-4 py-2 rounded-md hover:bg-slate-900">+ Thêm địa chỉ mới</button>
            </div>
            <div className="space-y-4">
                {items.map(a => (
                    <div key={a.id} className="border rounded-lg p-4">
                        <div className="flex justify-between items-center">
                            <div>
                                <strong>{a.name}</strong> — {a.phone}
                            </div>
                            <div className="flex gap-2">
                                <button onClick={() => setDefault(a.id)} className="text-sm text-gray-700 hover:bg-slate-800">Thiết lập mặc định</button>
                                <button onClick={() => remove(a.id)} className="text-sm text-slate-800 hover:text-slate-800">Xóa</button>
                            </div>
                        </div>
                        <div className="text-gray-700 mt-1">{a.addressDetail}</div>
                        {a.isDefault && <div className="inline-block mt-2 text-xs text-slate-800 border border-slate-500 px-2 py-1 rounded">Mặc định</div>}
                    </div>
                ))}
            </div>
        </div>
    );
}