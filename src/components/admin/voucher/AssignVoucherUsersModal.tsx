// src/components/admin/voucher/AssignVoucherUsersModal.tsx
import React, { useEffect, useState } from "react";
import { X, Search } from "lucide-react";
import { toast } from "react-toastify";
import {
    adminAssignVoucherUsers,
    adminGetVoucherAssignedUsers,
    adminSearchUsersByEmail,
} from "@/api/admin.voucher.api";

type Props = {
    open: boolean;
    voucher: IVoucher | null;
    onClose: () => void;
};

const cx = (v: Array<string | false | null | undefined>) =>
    v.filter(Boolean).join(" ");

const AssignVoucherUsersModal: React.FC<Props> = ({ open, voucher, onClose }) => {
    const [keyword, setKeyword] = useState("");
    const [loading, setLoading] = useState(false);
    const [searchResult, setSearchResult] = useState<IUserEmailLite[]>([]);
    const [selected, setSelected] = useState<IUserEmailLite[]>([]);
    const [saving, setSaving] = useState(false);

    // Khi mở modal: load danh sách khách đã được gán sẵn
    useEffect(() => {
        if (!open || !voucher) return;
        (async () => {
            try {
                setLoading(true);
                const cur = await adminGetVoucherAssignedUsers(voucher.id);
                if (Array.isArray(cur)) {
                    setSelected(cur);
                } else if (cur && Array.isArray((cur as any).data)) {
                    setSelected((cur as any).data);
                } else {
                    setSelected([]);
                }
               
            } catch (e: any) {
                console.error(e);
                toast.error(
                    e?.response?.data?.message || "Không tải được khách hàng đã gán"
                );
            } finally {
                setLoading(false);
            }
        })();
    }, [open, voucher]);

    // Reset state khi đóng modal
    useEffect(() => {
        if (!open) {
            setKeyword("");
            setSearchResult([]);
            // selected giữ nguyên nếu bạn muốn, nhưng flow này thường đóng lại là ok
        }
    }, [open]);

    // 🔍 Tìm kiếm realtime khi gõ (debounce ~400ms)
    useEffect(() => {
        if (!open || !voucher) return;
        const term = keyword.trim();

        if (!term) {
            setSearchResult([]);
            return;
        }

        const timeout = setTimeout(() => {
            (async () => {
                try {
                    setLoading(true);
                    const users = await adminSearchUsersByEmail(term); // trả về IUserEmailLite[]
                    setSearchResult(users);
                } catch (err: any) {
                    console.error(err);
                    toast.error(
                        err?.response?.data?.message || "Lỗi tìm kiếm khách hàng theo email"
                    );
                } finally {
                    setLoading(false);
                }
            })();
        }, 400); // debounce 400ms

        return () => clearTimeout(timeout);
    }, [keyword, open, voucher]);

    if (!open || !voucher) return null;

    // Vẫn giữ handleSearch để bấm nút "Tìm" nếu muốn
    async function handleSearch(e?: React.FormEvent) {
        if (e) e.preventDefault();
        const term = keyword.trim();
        if (!term) {
            setSearchResult([]);
            return;
        }
        try {
            setLoading(true);
            const res = await adminSearchUsersByEmail(keyword.trim());

            let list: any = res;
            if (!Array.isArray(list)) {
                if (list && Array.isArray(list.data)) list = list.data;
                else if (list && Array.isArray(list.items)) list = list.items;
                else list = [];
            }

            setSearchResult(list as IUserEmailLite[]);
        } catch (err: any) {
            console.error(err);
            toast.error(err?.response?.data?.message || "Lỗi tìm kiếm khách hàng theo email");
        } finally {
            setLoading(false);
        }
    }

    function toggleSelect(u: IUserEmailLite) {
        setSelected((prev) => {
            const exist = prev.find((x) => x.id === u.id);
            if (exist) {
                return prev.filter((x) => x.id !== u.id);
            }
            // thêm user mới vào danh sách đã chọn
            return [...prev, u];
        });
    }

    function removeSelected(email: string) {
        setSelected((prev) => prev.filter((u) => u.email !== email));
    }

    async function handleSave() {
        try {
            setSaving(true);
            
            const emails = selected.map((u) => u.email);
            await adminAssignVoucherUsers(voucher.id, emails);
            toast.success("Cập nhật danh sách khách hàng sử dụng voucher thành công");
            onClose();
        } catch (err: any) {
            console.error(err);
            toast.error(
                err?.response?.data?.message || "Không thể cập nhật danh sách khách hàng"
            );
        } finally {
            setSaving(false);
        }
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
            <div className="w-full max-w-3xl rounded-2xl bg-white shadow-lg">
                {/* Header */}
                <div className="flex items-center justify-between border-b px-4 py-3">
                    <h2 className="text-sm font-semibold">
                        Gán khách hàng cho voucher{" "}
                        <span className="font-mono font-bold">{voucher.code}</span>
                    </h2>
                    <button
                        onClick={onClose}
                        className="rounded-full p-1 text-slate-500 hover:bg-slate-100 hover:text-slate-700"
                    >
                        <X className="h-5 w-5" />
                    </button>
                </div>

                {/* Body */}
                <div className="grid max-h-[70vh] grid-cols-1 gap-4 overflow-auto px-4 py-3 md:grid-cols-[2fr,1.4fr] text-sm">
                    {/* Cột trái: search + kết quả realtime */}
                    <div>
                        <form onSubmit={handleSearch} className="mb-3 flex gap-2">
                            <div className="flex flex-1 items-center gap-2 rounded-md border border-slate-300 px-2">
                                <Search className="h-4 w-4 text-slate-400" />
                                <input
                                    value={keyword}
                                    onChange={(e) => setKeyword(e.target.value)}
                                    placeholder="Nhập email hoặc tên để tìm..."
                                    className="h-8 flex-1 border-none text-sm outline-none"
                                />
                            </div>
                            <button
                                type="submit"
                                className="h-8 rounded-md bg-slate-900 px-3 text-xs font-medium text-white hover:bg-slate-800"
                                disabled={loading}
                            >
                                {loading ? "Đang tìm..." : "Tìm"}
                            </button>
                        </form>

                       

                        <div className="max-h-[45vh] overflow-auto rounded-md border text-sm">
                            {loading && (
                                <div className="p-3 text-center text-xs text-slate-500">
                                    Đang tải...
                                </div>
                            )}

                            {!loading && !keyword.trim() && searchResult.length === 0 && (
                                <div className="p-3 text-center text-xs text-slate-500">
                                    Nhập từ khóa để hiển thị kết quả
                                </div>
                            )}

                            {!loading && keyword.trim() && searchResult.length === 0 && (
                                <div className="p-3 text-center text-xs text-slate-500">
                                    Không tìm thấy khách hàng phù hợp
                                </div>
                            )}

                            {searchResult.map((u) => {
                                const active = !!selected.find((x) => x.id === u.id);
                                return (
                                    <button
                                        key={u.id}
                                        type="button"
                                        onClick={() => toggleSelect(u)}
                                        className={cx([
                                            "flex w-full items-center justify-between border-b px-3 py-2 text-left text-sm last:border-b-0",
                                            active ? "bg-slate-900/5" : "hover:bg-slate-50",
                                        ])}
                                    >
                                        <div>
                                            <div className="font-medium">{u.fullName || u.email}</div>
                                            <div className="text-xs text-slate-500">{u.email}</div>
                                        </div>
                                        {active && (
                                            <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-semibold text-emerald-700">
                        Đã chọn
                      </span>
                                        )}
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    {/* Cột phải: danh sách đã chọn (khi mở modal đã auto load) */}
                    <div>
                        <div className="mb-2 flex items-center justify-between">
                            <h3 className="text-sm font-semibold">Khách hàng đã chọn</h3>
                            <span className="text-xs text-slate-500">
                {selected.length} người
              </span>
                        </div>
                        <div className="max-h-[50vh] overflow-auto rounded-md border text-sm">
                            {selected.length === 0 && (
                                <div className="p-3 text-center text-xs text-slate-500">
                                    Chưa chọn khách hàng nào
                                </div>
                            )}
                            {selected.map((u) => (
                                <div
                                    key={u.id}
                                    className="flex items-center justify-between border-b px-3 py-2 last:border-b-0"
                                >
                                    <div>
                                        <div className="font-medium">{u.fullName || u.email}</div>
                                        <div className="text-xs text-slate-500">{u.email}</div>
                                    </div>
                                    <button
                                        onClick={() => removeSelected(u.email)}
                                        className="text-xs text-rose-600 hover:underline"
                                    >
                                        Bỏ chọn
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="flex justify-end gap-2 border-t px-4 py-3">
                    <button
                        onClick={onClose}
                        className="rounded-md border border-slate-300 px-4 py-1.5 text-sm hover:bg-slate-50"
                        disabled={saving}
                    >
                        Đóng
                    </button>
                    <button
                        onClick={handleSave}
                        disabled={saving}
                        className="rounded-md bg-slate-900 px-4 py-1.5 text-sm text-white hover:bg-slate-800 disabled:opacity-60"
                    >
                        {saving ? "Đang lưu..." : "Lưu danh sách"}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default AssignVoucherUsersModal;
