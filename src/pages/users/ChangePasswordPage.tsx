import React from "react";
import { changePassword } from "../../api/account.api";


export default function ChangePasswordPage() {
    const [form, setForm] = React.useState<IChangePasswordReq>({ currentPassword: "", newPassword: "" });
    const [confirm, setConfirm] = React.useState("");
    const [errors, setErrors] = React.useState<Record<string, string>>({});
    const [saving, setSaving] = React.useState(false);


    function validate() {
        const e: Record<string, string> = {};
        const strong = /^(?=.*[a-z])(?=.*[A-Z])(?=.*[^A-Za-z0-9]).{8,}$/;
        if (!form.currentPassword) e.currentPassword = "* Bắt buộc";
        if (!form.newPassword) e.newPassword = "* Bắt buộc"; else if (!strong.test(form.newPassword)) e.newPassword = "Tối thiểu 8 ký tự, có chữ hoa, chữ thường, ký tự đặc biệt";
        if (confirm !== form.newPassword) e.confirm = "Xác nhận mật khẩu không khớp";
        setErrors(e); return Object.keys(e).length === 0;
    }


    async function onSubmit() {
        if (!validate()) return;
        try { setSaving(true); await changePassword(form); alert("Đổi mật khẩu thành công (mock)"); setForm({ currentPassword: "", newPassword: "" }); setConfirm(""); }
        catch (e: any) { alert(e.message); }
        finally { setSaving(false); }
    }


    return (
        <div className="p-6 bg-white border rounded-xl shadow-sm max-w-lg">
            <h2 className="text-lg font-semibold mb-4">Đổi mật khẩu</h2>
            <div className="space-y-4">
                <Field label={<Req>Mật khẩu cũ</Req>}>
                    <Password value={form.currentPassword} onChange={v=>setForm(s=>({ ...s, currentPassword:v }))} />
                    {errors.currentPassword && <Err>{errors.currentPassword}</Err>}
                </Field>
                <Field label={<Req>Mật khẩu mới</Req>}>
                    <Password value={form.newPassword} onChange={v=>setForm(s=>({ ...s, newPassword:v }))} />
                    {errors.newPassword && <Err>{errors.newPassword}</Err>}
                </Field>
                <Field label={<Req>Nhập lại mật khẩu mới</Req>}>
                    <Password value={confirm} onChange={setConfirm} />
                    {errors.confirm && <Err>{errors.confirm}</Err>}
                </Field>
                <button onClick={onSubmit} disabled={saving} className="bg-slate-800 text-white px-6 py-2 rounded-md hover:bg-slate-900 disabled:opacity-50">{saving? 'Đang lưu...' : 'Đổi mật khẩu'}</button>
            </div>
        </div>
    );
}


function Field({ label, children }: { label: React.ReactNode; children: React.ReactNode }) {
    return (
        <div>
            <div className="mb-1 text-sm text-gray-600">{label}</div>
            <div className="flex flex-col gap-1">{children}</div>
        </div>
    );
}
const Err = ({ children }: { children: React.ReactNode }) => <span className="text-xs text-slate-800">{children}</span>;
const Req = ({ children }: { children: React.ReactNode }) => <span className="after:content-['_*'] after:text-slate-800">{children}</span>;
function Password({ value, onChange }: { value: string; onChange: (v: string) => void }) {
    const [show, setShow] = React.useState(false);
    return (
        <div className="relative">
            <input type={show? 'text':'password'} value={value} onChange={e=>onChange(e.target.value)} className="h-10 w-full rounded-md border border-gray-300 px-3 pr-10 text-[15px] focus:outline-none focus:ring-2 focus:ring-slate-700/30 focus:focus:border-slate-700"/>
            <button type="button" onClick={()=>setShow(s=>!s)} className="absolute right-2 top-2 text-sm text-gray-600">{show? 'Ẩn':'Hiện'}</button>
        </div>
    );
}