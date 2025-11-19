import React from "react";
import {
    getMyAddresses as listAddresses,
    createAddress,
    updateAddress,
    deleteAddress,
    setDefaultAddress,
} from "@/api/account.api";
import {AddressModal} from "@/components/client/AddressModal";
import {toast} from "react-toastify";

export default function AddressPage() {
    const [items, setItems] = React.useState<IAddress[]>([]);
    const [loading, setLoading] = React.useState(true);

    const [openModal, setOpenModal] = React.useState(false);
    const [editing, setEditing] = React.useState<IAddress | null>(null);

    async function load() {
        setLoading(true);
        try {
            const data = await listAddresses();
            setItems(data);
        } catch (e: any) {
            toast.error(e?.response?.data?.message || "Không tải được địa chỉ");
        } finally {
            setLoading(false);
        }
    }

    React.useEffect(() => {
        load();
    }, []);

    async function handleCreate(payload: IUpsertAddressReq) {
        await createAddress(payload);
        toast.success("Thêm địa chỉ thành công");
        await load();
    }

    async function handleUpdate(payload: IUpsertAddressReq) {
        if (!editing) return;
        await updateAddress(editing.id, payload);
        toast.success("Cập nhật địa chỉ thành công");
        await load();
    }

    async function onDelete(id: number) {
        if (!confirm("Bạn chắc chắn muốn xóa địa chỉ này?")) return;
        await deleteAddress(id);
        toast.success("Xóa địa chỉ thành công");
        await load();
    }

    async function onSetDefault(id: number) {
        await setDefaultAddress(id);
        toast.success("Đặt địa chỉ mặc định thành công");
        await load();
    }

    return (
        <>
            <div className="rounded-2xl border bg-white p-6 shadow-sm">
                <div className="mb-4 flex items-center justify-between">
                    <h2 className="text-lg font-semibold">Địa chỉ của tôi</h2>
                    <button
                        onClick={() => {
                            setEditing(null);
                            setOpenModal(true);
                        }}
                        className="rounded-md bg-slate-800 px-4 py-2 text-sm text-white hover:bg-slate-900"
                    >
                        + Thêm địa chỉ mới
                    </button>
                </div>

                {loading ? (
                    <div className="text-sm text-slate-500">Đang tải...</div>
                ) : items.length === 0 ? (
                    <div className="text-sm text-slate-500">
                        Bạn chưa có địa chỉ nào. Hãy thêm một địa chỉ mới.
                    </div>
                ) : (
                    <div className="space-y-4">
                        {items.map((a) => (
                            <div
                                key={a.id}
                                className="rounded-lg border px-4 py-3 text-sm text-slate-800"
                            >
                                <div className="flex items-start justify-between gap-4">
                                    <div>
                                        <div className="flex flex-wrap items-center gap-2">
          <span className="font-semibold">
            {a.fullName} — {a.phone}
          </span>

                                            {a.default && (
                                                <span
                                                    className="inline-flex items-center rounded border border-slate-700 px-2 py-0.5 text-[11px] font-semibold text-slate-700">
              Mặc định
            </span>
                                            )}
                                        </div>

                                        <div className="mt-1 text-slate-600">
                                            {a.addressDetail}
                                            <br/>
                                            {a.ward}, {a.district}, {a.province}
                                        </div>
                                    </div>

                                    <div className="flex flex-col items-end gap-1 text-[13px]">
                                        <button
                                            onClick={() => {
                                                setEditing(a);
                                                setOpenModal(true);
                                            }}
                                            className="text-blue-600 hover:underline"
                                        >
                                            Cập nhật
                                        </button>

                                        <button
                                            onClick={() => onDelete(a.id)}
                                            className="text-rose-600 hover:underline"
                                        >
                                            Xóa
                                        </button>

                                        {!a.default && (
                                            <button
                                                onClick={() => onSetDefault(a.id)}
                                                className="text-slate-800 hover:underline"
                                            >
                                                Thiết lập mặc định
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}

                    </div>
                )}
            </div>

            <AddressModal
                open={openModal}
                onClose={() => setOpenModal(false)}
                initial={editing}
                onSubmit={editing ? handleUpdate : handleCreate}
            />
        </>
    );
}
