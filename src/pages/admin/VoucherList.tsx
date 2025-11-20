// src/pages/admin/VoucherList.tsx
import React from "react";
import {
    adminListVouchers,
    adminDeleteVoucher,
} from "@/api/admin.voucher.api";
import { toast } from "react-toastify";
import CreateVoucher from "components/admin/voucher/CreateVoucher";
import UpdateVoucher from "components/admin/voucher/UpdateVoucher";
import TableVoucher from "components/admin/voucher/TableVoucher";
import AssignVoucherUsersModal from "components/admin/voucher/AssignVoucherUsersModal";

const VoucherListPage: React.FC = () => {
    const [items, setItems] = React.useState<IVoucher[]>([]);
    const [loading, setLoading] = React.useState(false);

    const [openCreate, setOpenCreate] = React.useState(false);
    const [openEdit, setOpenEdit] = React.useState(false);
    const [editing, setEditing] = React.useState<IVoucher | null>(null);

    const [openAssign, setOpenAssign] = React.useState(false);
    const [assigningVoucher, setAssigningVoucher] =
        React.useState<IVoucher | null>(null);

    async function load() {
        try {
            setLoading(true);
            const data = await adminListVouchers();
            setItems(data);
        } catch (e: any) {
            toast.error(
                e?.response?.data?.message || "Không tải được danh sách voucher"
            );
        } finally {
            setLoading(false);
        }
    }

    React.useEffect(() => {
        load();
    }, []);

    function handleOpenCreate() {
        setOpenCreate(true);
    }

    function handleCreated(v: IVoucher) {
        // reload list để sync
        load();
        // Nếu voucher tạo mới là ASSIGNED -> mở luôn modal chọn khách hàng
        if (v.applyScope === "ASSIGNED") {
            setAssigningVoucher(v);
            setOpenAssign(true);
        }
    }

    function handleEdit(v: IVoucher) {
        setEditing(v);
        setOpenEdit(true);
    }
    function handleUpdated(updated: IVoucher) {
        const old = items.find((x) => x.id === updated.id);

        setItems((prev) => prev.map((x) => (x.id === updated.id ? updated : x)));

        // ⬇️ ALL -> ASSIGNED thì mở modal gán user
        if (old?.applyScope === "ALL" && updated.applyScope === "ASSIGNED") {
            setAssigningVoucher(updated);
            setOpenAssign(true);
        }
    }



    async function handleDelete(v: IVoucher) {
        if (!window.confirm(`Xóa voucher ${v.code}?`)) return;
        try {
            await adminDeleteVoucher(v.id);
            toast.success("Xóa voucher thành công");
            setItems((prev) => prev.filter((x) => x.id !== v.id));
        } catch (e: any) {
            toast.error(e?.response?.data?.message || "Xóa voucher thất bại");
        }
    }

    function handleAssign(v: IVoucher) {
        setAssigningVoucher(v);
        setOpenAssign(true);
    }

    return (
        <div className="rounded-2xl border bg-white p-6 shadow-sm">
            <div className="mb-4 flex items-center justify-between">
                <h1 className="text-lg font-semibold">Quản lý voucher</h1>

                <button
                    onClick={handleOpenCreate}
                    className="rounded-md bg-slate-800 px-4 py-2 text-sm font-medium text-white hover:bg-slate-900"
                >
                    + Tạo voucher
                </button>
            </div>

            <TableVoucher
                items={items}
                loading={loading}
                onEdit={handleEdit}
                onAssign={handleAssign}
                onDelete={handleDelete}
            />

            {/* Modal tạo mới */}
            <CreateVoucher
                open={openCreate}
                onClose={() => setOpenCreate(false)}
                onCreated={handleCreated}
            />

            {/* Modal cập nhật */}
            <UpdateVoucher
                open={openEdit}
                onClose={() => {
                    setOpenEdit(false);
                    setEditing(null);
                }}
                voucher={editing}
                onUpdated={handleUpdated}
            />

            {/* Modal gán khách hàng */}
            <AssignVoucherUsersModal
                open={openAssign}
                voucher={assigningVoucher}
                onClose={() => {
                    setOpenAssign(false);
                    setAssigningVoucher(null);
                    // nếu cần sync lượt used / status ... thì load lại:
                    // load();
                }}
            />
        </div>
    );
};

export default VoucherListPage;
