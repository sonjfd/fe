import { useEffect, useMemo, useRef, useState } from "react";
import { toast } from "react-toastify";
import { deleteUser, fetchUsers } from "@/api/admin.api";
import CreateUser from "./CreateUser";
import UpdateUser from "./UpdateUser";
import UserDetail from "./UserDetail";

export default function TableUser() {
  const [rows, setRows] = useState<IUser[]>([]);
  const [meta, setMeta] = useState({ page: 1, size: 10, total: 0 });
  const [loading, setLoading] = useState(false);

  // filters
  const [page, setPage] = useState(1);
  const [size, setSize] = useState(10);
  const [name, setName] = useState("");
  const [from, setFrom] = useState<string>("");
  const [to, setTo] = useState<string>("");

  // modals
  const [openCreate, setOpenCreate] = useState(false);
  const [editing, setEditing] = useState<IUser | null>(null);
  const [viewing, setViewing] = useState<IUser | null>(null);
  const [inputValue, setInputValue] = useState(page);
  const inputRef = useRef<number | null>(null);

  const searchRef = useRef<number | null>(null);
  const [searchValue, setSearchValue] = useState("");

  const toIsoStart = (d: string) =>
    d ? new Date(`${d}T00:00:00Z`).toISOString() : "";
  const toIsoEnd = (d: string) =>
    d ? new Date(`${d}T23:59:59Z`).toISOString() : "";

  const query = useMemo(() => {
    let s = `page=${page}&size=${size}`;
    if (name) s += `&email=${encodeURIComponent(name)}`;
    if (from) s += `&fromDate=${encodeURIComponent(toIsoStart(from))}`;
    if (to) s += `&toDate=${encodeURIComponent(toIsoEnd(to))}`;
    return s;
  }, [page, size, name, from, to]);

  const load = async () => {
    try {
      setLoading(true);
      const data = await fetchUsers(query);
      setRows(data?.items ?? []);
      setMeta({
        page: data?.page ?? 1,
        size: data?.size ?? size,
        total: data?.total ?? 0,
      });
    } catch (e: any) {
      toast.error(e?.message || "Không tải được danh sách");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query]);

  const filtered = rows.filter((r) => +r.role.id !== 1);

  const handleDelete = (id: number) => {
    toast(
      ({ closeToast }) => (
        <div className="space-y-2">
          <p>Bạn có chắc muốn xóa người dùng này?</p>
          <div className="flex gap-2">
            <button
              className="px-3 py-1 rounded bg-red-600 text-white"
              onClick={async () => {
                await deleteUser(id);
                setRows((s) => s.filter((x) => x.id !== id));
                toast.success("Đã xóa!");
                closeToast();
              }}
            >
              Xóa
            </button>
            <button className="px-3 py-1 rounded border" onClick={closeToast}>
              Hủy
            </button>
          </div>
        </div>
      ),
      {
        autoClose: false,
        closeOnClick: false,
        draggable: false,
      }
    );
  };
  const resetFilter = () => {
    setName("");
    setFrom("");
    setTo("");
    setSearchValue("");
    setPage(1);
    setSize(10);
  };

  return (
    <div className="rounded-lg border border-neutral-200 bg-white">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-neutral-200 p-4">
        <h2 className="text-lg font-semibold">Danh sách khách hàng</h2>
        <button
          onClick={() => setOpenCreate(true)}
          className="rounded-md border border-neutral-300 px-3 py-2 text-sm"
        >
          + Tạo người dùng
        </button>
      </div>

      {/* Filters */}
      <div className="grid gap-3 p-4 md:grid-cols-4">
        <div className="col-span-1">
          <label className="mb-1 block text-sm">Tìm theo tên</label>
          <input
            value={searchValue}
            onChange={(e) => {
              setSearchValue(e.target.value);
              if (searchRef.current) clearTimeout(searchRef.current);
              searchRef.current = window.setTimeout(() => {
                setName(e.target.value);
              }, 500);
              setPage(1);
            }}
            className="w-full rounded border px-3 py-2"
            placeholder="Nhập tên người dùng"
          />
        </div>

        <div className="col-span-1">
          <label className="mb-1 block text-sm">Từ ngày</label>
          <input
            type="date"
            value={from}
            onChange={(e) => {
              setFrom(e.target.value);
              setPage(1);
            }}
            className="w-full rounded border px-3 py-2"
          />
        </div>

        <div className="col-span-1">
          <label className="mb-1 block text-sm">Đến ngày</label>
          <input
            type="date"
            value={to}
            onChange={(e) => {
              setTo(e.target.value);
              setPage(1);
            }}
            className="w-full rounded border px-3 py-2"
          />
        </div>

        <div className="col-span-1 flex items-end">
          <button
            onClick={resetFilter}
            className="h-[38px] rounded-md border border-neutral-300 px-3 py-2"
          >
            Đặt lại
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-neutral-50 text-neutral-600">
            <tr>
              <th className="px-4 py-2 text-left">Stt</th>
              <th className="px-4 py-2 text-left">Họ tên</th>
              <th className="px-4 py-2 text-left">Email</th>
              <th className="px-4 py-2 text-left">SĐT</th>
              <th className="px-4 py-2 text-left">Vai trò</th>
              <th className="px-4 py-2 text-left">Trạng thái</th>
              <th className="px-4 py-2 text-left">Thao tác</th>
            </tr>
          </thead>

          <tbody>
            {!loading &&
              filtered.map((u, idx) => (
                <tr key={u.id} className="border-t">
                  <td className="px-4 py-3">{(page - 1) * size + idx + 1}</td>
                  <td className="px-4 py-3 font-medium">{u.fullName}</td>
                  <td className="px-4 py-3">{u.email}</td>
                  <td className="px-4 py-3">{u.phone}</td>
                  <td className="px-4 py-3">
                    {u.role?.id === 1 ? "Admin" : "Khách hàng"}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`rounded px-2 py-0.5 text-xs ${
                        u.status === "ACTIVE"
                          ? "bg-green-100 text-green-700"
                          : u.status === "BAN"
                          ? "bg-red-100 text-red-700"
                          : "bg-neutral-100 text-neutral-700"
                      }`}
                    >
                      {u.status === "ACTIVE"
                        ? "Đang hoạt động"
                        : u.status === "NOT_ACTIVE"
                        ? "Chưa kích hoạt"
                        : "Đã bị khoá"}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap gap-2">
                      <button
                        className="rounded-md border border-neutral-300 px-3 py-1.5"
                        onClick={() => setViewing(u)}
                      >
                        Xem
                      </button>
                      <button
                        className="rounded-md border border-neutral-300 px-3 py-1.5"
                        onClick={() => setEditing(u)}
                      >
                        Sửa
                      </button>
                      <button
                        className="rounded-md border border-red-300 bg-red-50 px-3 py-1.5 text-red-600"
                        onClick={() => handleDelete(u.id)}
                      >
                        Xoá
                      </button>
                    </div>
                  </td>
                </tr>
              ))}

            {loading && (
              <tr>
                <td
                  className="px-4 py-6 text-center text-neutral-500"
                  colSpan={7}
                >
                  Đang tải…
                </td>
              </tr>
            )}

            {!loading && rows.length === 0 && (
              <tr>
                <td
                  className="px-4 py-6 text-center text-neutral-500"
                  colSpan={7}
                >
                  Không có dữ liệu
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between p-4 text-sm">
        <div>
          Trang <b>{meta.page}</b>/<b>{meta.total}</b>
        </div>

        <div className="flex items-center gap-2">
          {/* Nút trước */}
          <button
            className="rounded-md border border-neutral-300 px-3 py-1.5 disabled:opacity-50"
            disabled={page === 1 || loading}
            onClick={() => setPage((p) => Math.max(1, p - 1))}
          >
            Trước
          </button>

          <input
            type="number"
            value={inputValue}
            min={1}
            max={meta.total}
            onChange={(e) => {
              const raw = e.target.value;

              if (raw === "") {
                setInputValue(NaN);
                return;
              }

              const num = Number(raw);
              setInputValue(num);

              if (inputRef.current) clearTimeout(inputRef.current);

              inputRef.current = window.setTimeout(() => {
                if (!isNaN(num) && num >= 1) {
                  setPage(num);
                }
              }, 500);
            }}
            className="w-16 rounded-md border border-neutral-300 px-2 
            py-1.5 text-center outline-none focus:border-blue-600 
            focus:ring-2 focus:ring-blue-600/20"
          />

          {/* Nút sau */}
          <button
            className="rounded-md border border-neutral-300 px-3 py-1.5 disabled:opacity-50"
            disabled={rows.length < meta.size || loading}
            onClick={() => setPage((p) => p + 1)}
          >
            Sau
          </button>
        </div>
      </div>

      {/* Modals */}
      {openCreate && (
        <CreateUser
          onClose={() => setOpenCreate(false)}
          onSuccess={() => {
            setOpenCreate(false);
            load();
          }}
        />
      )}
      {editing && (
        <UpdateUser
          user={editing}
          onClose={() => setEditing(null)}
          onSuccess={() => {
            setEditing(null);
            load();
          }}
        />
      )}
      {viewing && (
        <UserDetail user={viewing} onClose={() => setViewing(null)} />
      )}
    </div>
  );
}
