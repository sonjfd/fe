// src/pages/users/ChangePasswordPage.tsx
import React from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { changePassword } from "../../api/account.api";
import { logoutApi } from "../../api/auth.api";
import { useCurrentApp } from "../../components/context/AppContext";

const strongRx = /^(?=.*[a-z])(?=.*[A-Z])(?=.*[^A-Za-z0-9]).{8,}$/;

export default function ChangePasswordPage() {
    const [form, setForm] = React.useState<IChangePasswordReq>({
        currentPassword: "",
        newPassword: "",
    });
    const [confirm, setConfirm] = React.useState("");
    const [errors, setErrors] = React.useState<Record<string, string>>({});
    const [saving, setSaving] = React.useState(false);

    const { setUser, setIsAuthenticated } = useCurrentApp();
    const navigate = useNavigate();

    function validate() {
        const e: Record<string, string> = {};

        if (!form.currentPassword?.trim()) {
            e.currentPassword = "Vui lòng nhập mật khẩu hiện tại";
        }

        if (!form.newPassword?.trim()) {
            e.newPassword = "Vui lòng nhập mật khẩu mới";
        } else if (!strongRx.test(form.newPassword)) {
            e.newPassword =
                "Mật khẩu phải ≥ 8 ký tự, gồm chữ hoa, chữ thường và ký tự đặc biệt";
        }

        if (!confirm?.trim()) {
            e.confirm = "Vui lòng xác nhận mật khẩu mới";
        } else if (confirm !== form.newPassword) {
            e.confirm = "Xác nhận mật khẩu không khớp";
        }

        setErrors(e);
        return Object.keys(e).length === 0;
    }

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        if (!validate()) return;

        try {
            setSaving(true);

            // ✅ Nếu mật khẩu cũ sai -> BE trả 4xx -> axios THROW -> nhảy xuống catch
            const res = await changePassword(form);
            if(!res.data) {
                // Thành công thật sự
                toast.error(res.message);
                return;
            }
            toast.success(res.message);

            // Logout giống AppHeader
            try {
                await logoutApi?.();
            } catch {
                // ignore lỗi logout
            }
            localStorage.removeItem("access_token");
            setUser(null);
            setIsAuthenticated(false);

            navigate("/login");
        } catch (err: any) {
            // Sai mật khẩu cũ hoặc lỗi khác
            const msg =
                err?.response?.data?.message ||
                err?.message ||
                "Đổi mật khẩu thất bại, vui lòng thử lại";
            toast.error(msg);
        } finally {
            setSaving(false);
        }
    }

    return (
        <form
            onSubmit={handleSubmit}
            className="max-w-2xl rounded-2xl border bg-white p-6 shadow-sm"
        >
            <h2 className="mb-4 text-lg font-semibold">Đổi mật khẩu</h2>

            <Field label="Mật khẩu cũ *" error={errors.currentPassword}>
                <PasswordInput
                    value={form.currentPassword}
                    onChange={(v) =>
                        setForm((s) => ({ ...s, currentPassword: v }))
                    }
                />
            </Field>

            <Field label="Mật khẩu mới *" error={errors.newPassword}>
                <PasswordInput
                    value={form.newPassword}
                    onChange={(v) => setForm((s) => ({ ...s, newPassword: v }))}
                />
            </Field>

            <Field label="Nhập lại mật khẩu mới *" error={errors.confirm}>
                <PasswordInput value={confirm} onChange={setConfirm} />
            </Field>

            <button
                type="submit"
                disabled={saving}
                className="mt-2 rounded-md bg-slate-800 px-6 py-2 text-white hover:bg-slate-900 disabled:opacity-60"
            >
                {saving ? "Đang lưu..." : "Đổi mật khẩu"}
            </button>
        </form>
    );
}

function Field(props: {
    label: string;
    error?: string;
    children: React.ReactNode;
}) {
    return (
        <div className="mb-4">
            <div className="mb-1 text-sm font-medium text-gray-800">
                {props.label}
            </div>
            <div className="flex flex-col gap-1">
                {props.children}
                {props.error && (
                    <span className="text-xs text-red-600">{props.error}</span>
                )}
            </div>
        </div>
    );
}

function PasswordInput({
                           value,
                           onChange,
                       }: {
    value: string;
    onChange: (v: string) => void;
}) {
    const [show, setShow] = React.useState(false);
    return (
        <div className="relative">
            <input
                type={show ? "text" : "password"}
                value={value}
                onChange={(e) => onChange(e.target.value)}
                className="h-10 w-full rounded-md border border-gray-300 px-3 pr-10 text-[15px] outline-none focus:ring-2 focus:ring-slate-700/30 focus:border-slate-700"
            />
            <button
                type="button"
                onClick={() => setShow((s) => !s)}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-sm text-slate-700"
            >
                {show ? "Ẩn" : "Hiện"}
            </button>
        </div>
    );
}
