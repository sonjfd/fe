import React from "react";
import {updateMe} from "../../api/account.api";
import {uploadAvatar} from "../../api/upload.api";   // <-- sửa import
import {useCurrentApp} from "../../components/context/AppContext.tsx";
import "react-toastify/dist/ReactToastify.css";
import { toast } from "react-toastify";


const Err = ({children}: { children: React.ReactNode }) => (
    <span className="text-xs text-red-600">{children}</span>
);
const Req = ({children}: { children: React.ReactNode }) => (
    <span className="after:content-['_*'] after:text-red-600">{children}</span>
);

function Row({label, children}: { label: React.ReactNode; children: React.ReactNode }) {
    return (
        <div className="grid grid-cols-12 items-center gap-4 py-2">
            <div className="col-span-12 md:col-span-3 text-sm font-medium text-gray-800">
                {label}
            </div>
            <div className="col-span-12 md:col-span-9 flex flex-col gap-1">{children}</div>
        </div>
    );
}

export default function ProfilePage() {
    const {user, setUser} = useCurrentApp();
    const [form, setForm] = React.useState<IUpdateProfileReq>({
        fullName: "",
        phone: "",
        gender: "FEMALE",
        avatar: undefined,
    });
    const [avatarFile, setAvatarFile] = React.useState<File | null>(null);
    const [errors, setErrors] = React.useState<Record<string, string>>({});
    const [saving, setSaving] = React.useState(false);
    const isGoogle = user?.provider === "GOOGLE";
    // Load dữ liệu ban đầu từ user context
    React.useEffect(() => {
        if (user) {
            setForm({
                fullName: user.fullName,
                phone: user.phone,
                gender: user.gender,
                avatar: user.avatar,
            });
        }
    }, [user]);

    //  Validate dữ liệu trước khi gửi
    function validate() {
        const e: Record<string, string> = {};

        // --- Full name ---
        if (!form.fullName.trim()) e.fullName = "Vui lòng nhập họ tên";
        else if (form.fullName.trim().length < 3)
            e.fullName = "Tên phải lớn hơn 3 kí tự";
        else if (!/[a-zA-ZÀ-ỹ\s]+$/.test(form.fullName.trim()))
            e.fullName = "Tên chỉ được chứa chữ cái và khoảng trắng";

        // --- Phone ---
        const phonePattern = /^0\d{9,10}$/;
        if (!form.phone.trim()) e.phone = "Vui lòng nhập số điện thoại";
        else if (!phonePattern.test(form.phone.trim()))
            e.phone = "Số điện thoại bắt đầu bằng 0 và đủ 10-11 kí tự";

        // --- Gender ---
        if (!form.gender) e.gender = "Vui lòng chọn giới tính";

        setErrors(e);
        return Object.keys(e).length === 0;
    }

    // Hàm xử lý khi nhấn Lưu
    async function onSave() {
        if (isGoogle) {
            toast.warn("Tài khoản đăng nhập bằng Google không thể chỉnh sửa hồ sơ tại đây");
            return;
        }
        if (!validate() || !user) return;
        try {
            setSaving(true);

            let avatarUrl = form.avatar;

            //  Nếu user chọn file mới → upload lên Cloudinary
            if (avatarFile) {
                const res = await uploadAvatar(user.id, avatarFile);
                avatarUrl = res.data;   // API trả ApiResponse<String>
            }
            //  Gọi API cập nhật hồ sơ
            const payload: IUpdateProfileReq = {
                fullName: form.fullName.trim(),
                phone: form.phone.trim(),
                gender: form.gender,
                avatar: avatarUrl,
            };
            const updated = await updateMe(payload);

            //  Cập nhật context để sync header/sidebar
            setUser?.({
                ...user,
                ...updated,
                role:
                    typeof (updated as any).role === "object"
                        ? String((updated as any).role.id)
                        : (updated as any).role,
            });
            setAvatarFile(null);
            toast.success("Cập nhật hồ sơ thành công");

        } catch (e: any) {
            toast.error(e?.message || "Đã xảy ra lỗi khi cập nhật hồ sơ");

        } finally {
            setSaving(false);
        }
    }

    if (!user)
        return <div className="p-4 text-sm text-slate-500">Đang tải...</div>;

    return (
        <div className="grid grid-cols-1 lg:grid-cols-[1fr,256px] gap-4">
            <section className="rounded-2xl border bg-white p-6 shadow-sm">
                <h1 className="text-xl font-semibold mb-2">Hồ Sơ Của Tôi</h1>

                {isGoogle && (
                    <p className="mb-3 text-xs text-amber-600">
                        Bạn đang đăng nhập bằng Google, các thông tin này chỉ đọc và
                        không thể chỉnh sửa từ hệ thống.
                    </p>
                )}

                <Row label={<Req>Email</Req>}>
                    <div>{user.email}</div>
                </Row>

                <Row label={<Req>Họ và tên</Req>}>
                    <input
                        type="text"
                        placeholder="Nguyễn Văn A"
                        value={form.fullName}
                        onChange={(e) =>
                            setForm((s) => ({...s, fullName: e.target.value}))
                        }
                        readOnly={isGoogle}
                        className={`h-10 w-full md:w-[420px] rounded-md border px-3 text-[15px] outline-none
                            ${isGoogle ? "bg-gray-100 cursor-not-allowed" : ""}
                            ${
                            errors.fullName
                                ? "border-red-500 focus:border-red-500"
                                : "border-gray-300 focus:border-slate-700"
                        }`}
                    />
                    {errors.fullName && <Err>{errors.fullName}</Err>}
                </Row>

                <Row label={<Req>Số điện thoại</Req>}>
                    <input
                        type="text"
                        placeholder="0912345678"
                        value={form.phone}
                        onChange={(e) =>
                            setForm((s) => ({...s, phone: e.target.value}))
                        }
                        readOnly={isGoogle}
                        className={`h-10 w-full md:w-[420px] rounded-md border px-3 text-[15px] outline-none
                            ${isGoogle ? "bg-gray-100 cursor-not-allowed" : ""}
                            ${
                            errors.phone
                                ? "border-red-500 focus:border-red-500"
                                : "border-gray-300 focus:border-slate-700"
                        }`}
                    />
                    {errors.phone && <Err>{errors.phone}</Err>}
                </Row>

                <Row label={<Req>Giới tính</Req>}>
                    <div className="flex items-center gap-6">
                        <label className="inline-flex items-center gap-2">
                            <input
                                type="radio"
                                name="gender"
                                checked={form.gender === "MALE"}
                                onChange={() =>
                                    setForm((s) => ({...s, gender: "MALE"}))
                                }
                                disabled={isGoogle}
                                className="h-4 w-4 accent-slate-800"
                            />
                            <span>Nam</span>
                        </label>
                        <label className="inline-flex items-center gap-2">
                            <input
                                type="radio"
                                name="gender"
                                checked={form.gender === "FEMALE"}
                                onChange={() =>
                                    setForm((s) => ({...s, gender: "FEMALE"}))
                                }
                                disabled={isGoogle}
                                className="h-4 w-4 accent-slate-800"
                            />
                            <span>Nữ</span>
                        </label>
                    </div>
                    {errors.gender && <Err>{errors.gender}</Err>}
                </Row>

                <div className="grid grid-cols-12 items-center py-2">
                    <div className="col-span-12 md:col-span-3"/>
                    <div className="col-span-12 md:col-span-9">
                        <button
                            onClick={onSave}
                            disabled={saving || isGoogle}
                            className="rounded-md bg-slate-800 px-6 py-2 text-white hover:bg-slate-900 disabled:opacity-60"
                        >
                            {saving ? "Đang lưu..." : "Lưu"}
                        </button>
                    </div>
                </div>
            </section>

            <aside className="bg-white border rounded-2xl p-6 shadow-sm flex flex-col items-center gap-4">
                <img
                    src={
                        avatarFile
                            ? URL.createObjectURL(avatarFile)
                            : form.avatar || "https://placehold.co/120"
                    }
                    className="h-28 w-28 rounded-full object-cover ring-2 ring-gray-200"
                />
                <input
                    id="avatar"
                    type="file"
                    accept="image/*"
                    className="hidden"
                    disabled={isGoogle}
                    onChange={(e) =>
                        setAvatarFile(e.target.files?.[0] || null)
                    }
                />
                <label
                    htmlFor="avatar"
                    className={`border border-gray-300 px-4 py-2 rounded-md text-sm
                        ${isGoogle ? "cursor-not-allowed opacity-60" : "cursor-pointer hover:bg-gray-50"}`}
                >
                    Chọn Ảnh
                </label>
                <p className="text-xs text-gray-500 text-center">
                    Dung lượng tối đa 1 MB
                    <br/>
                    Định dạng: .JPEG, .PNG
                </p>
            </aside>
        </div>
    );
}



