import React from "react";
import { getMe, updateMe } from "../../api/account.api";

const Err = ({ children }: { children: React.ReactNode }) => (
  <span className="text-xs text-slate-800">{children}</span>
);
const Req = ({ children }: { children: React.ReactNode }) => (
  <span className="after:content-['_*'] after:text-slate-800">{children}</span>
);

function Row({
  label,
  children,
}: {
  label: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="grid grid-cols-12 items-start gap-4 py-2">
      <div className="col-span-12 md:col-span-3 text-sm text-gray-600">
        {label}
      </div>
      <div className="col-span-12 md:col-span-9 flex flex-col gap-1">
        {children}
      </div>
    </div>
  );
}

export default function ProfilePage() {
  const [user, setUser] = React.useState<IUserProfile | null>(null);
  const [form, setForm] = React.useState<IUpdateProfileReq>({
    fullName: "",
    phone: "",
    gender: "FEMALE",
    avatar: undefined,
  });
  const [avatarFile, setAvatarFile] = React.useState<File | null>(null);
  const [errors, setErrors] = React.useState<Record<string, string>>({});

  React.useEffect(() => {
    getMe().then((u) => {
      setUser(u);
      setForm({
        fullName: u.fullName,
        phone: u.phone,
        gender: u.gender,
        avatar: u.avatar,
      });
    });
  }, []);

  function validate() {
    const e: Record<string, string> = {};
    if (!form.fullName.trim()) e.fullName = "* Bắt buộc";
    if (!form.phone.trim()) e.phone = "* Bắt buộc";
    if (!form.gender) e.gender = "* Bắt buộc";
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  async function onSave() {
    if (!validate()) return;
    const avatar = avatarFile ? URL.createObjectURL(avatarFile) : form.avatar; // mock preview
    const updated = await updateMe({ ...form, avatar });
    setUser(updated);
    setForm({
      fullName: updated.fullName,
      phone: updated.phone,
      gender: updated.gender,
      avatar: updated.avatar,
    });
    setAvatarFile(null);
    alert("Đã lưu thay đổi");
  }

  if (!user) return <p>Đang tải...</p>;

  return (
    <div className="p-6 flex flex-col lg:flex-row gap-8">
      <section className="flex-1 bg-white border rounded-xl p-6 shadow-sm">
        <h1 className="text-xl font-semibold mb-2">Hồ Sơ Của Tôi</h1>

        <Row label={<Req>Tên đăng nhập</Req>}>
          <div>{user.fullName}</div>
        </Row>
        <Row label={<Req>Email</Req>}>
          <div>{user.email}</div>
        </Row>
        <Row label={<Req>Tên</Req>}>
          <input
            value={form.fullName}
            onChange={(e) =>
              setForm((s) => ({ ...s, fullName: e.target.value }))
            }
            className="h-10 w-full md:w-[420px] rounded-md border border-gray-300 px-3 text-[15px] focus:outline-none focus:ring-2 focus:ring-slate-700/30 focus:border-slate-700"
          />
          {errors.fullName && <Err>{errors.fullName}</Err>}
        </Row>
        <Row label={<Req>Số điện thoại</Req>}>
          <input
            value={form.phone}
            onChange={(e) => setForm((s) => ({ ...s, phone: e.target.value }))}
            className="h-10 w-full md:w-[420px] rounded-md border border-gray-300 px-3 text-[15px] focus:outline-none focus:ring-2 focus:ring-slate-700/30 focus:border-slate-700"
          />
          {errors.phone && <Err>{errors.phone}</Err>}
        </Row>
        {/* ...trong form */}
        <Row label={<Req>Giới tính</Req>}>
          <div className="flex items-center gap-6">
            <label className="inline-flex items-center gap-2">
              <input
                type="radio"
                name="gender"
                checked={form.gender === "MALE"}
                onChange={() => setForm((s) => ({ ...s, gender: "MALE" }))}
                className="h-4 w-4 accent-slate-800"
              />
              <span>Nam</span>
            </label>
            <label className="inline-flex items-center gap-2">
              <input
                type="radio"
                name="gender"
                checked={form.gender === "FEMALE"}
                onChange={() => setForm((s) => ({ ...s, gender: "FEMALE" }))}
                className="h-4 w-4 accent-slate-800"
              />
              <span>Nữ</span>
            </label>
          </div>
          {errors.gender && <Err>{errors.gender}</Err>}
        </Row>

        <div className="grid grid-cols-12 items-center py-2">
          <div className="col-span-12 md:col-span-3" />
          <div className="col-span-12 md:col-span-9">
            <button
              onClick={onSave}
              className="rounded-md bg-slate-800 px-6 py-2 text-white hover:bg-slate-900"
            >
              Lưu
            </button>
          </div>
        </div>
      </section>

      <aside className="w-full lg:w-64 bg-white border rounded-xl p-6 shadow-sm flex flex-col items-center gap-4">
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
          onChange={(e) => setAvatarFile(e.target.files?.[0] || null)}
        />
        <label
          htmlFor="avatar"
          className="cursor-pointer border border-gray-300 px-4 py-2 rounded-md text-sm hover:bg-gray-50"
        >
          Chọn Ảnh
        </label>
        <p className="text-xs text-gray-500 text-center">
          Dung lượng tối đa 1 MB
          <br />
          Định dạng: .JPEG, .PNG
        </p>
      </aside>
    </div>
  );
}
