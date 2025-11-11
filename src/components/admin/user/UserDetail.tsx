export default function UserDetail({
  user,
  onClose,
}: {
  user: IUser;
  onClose: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="w-[520px] rounded-lg bg-white p-6 shadow-lg">
        <h3 className="mb-3 text-lg font-semibold">Chi tiết người dùng</h3>
        <div className="space-y-2 text-sm">
          <div>
            <b>ID:</b> {user.id}
          </div>
          <div>
            <b>Họ tên:</b> {user.fullName}
          </div>
          <div>
            <b>Email:</b> {user.email}
          </div>
          <div>
            <b>SĐT:</b> {user.phone}
          </div>
          <div>
            <b>Role ID:</b> {user.role?.id}
          </div>
          <div>
            <b>Trạng thái:</b> {user.status}
          </div>
          <div>
            <b>Giới tính:</b> {user.gender ?? "-"}
          </div>
        </div>

        <div className="mt-4 flex justify-end">
          <button onClick={onClose} className="rounded border px-3 py-2">
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
}
