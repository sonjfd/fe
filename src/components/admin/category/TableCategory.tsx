import { useEffect, useMemo, useRef, useState } from "react";

import CreateCategory from "./CreateCategory";
import UpdateCategory from "./UpdateCategory";
import { toast } from "react-toastify";
import {
  deleteCategory,
  fetchCategories,
  fetchCategoriesForSelect,
} from "@/api/auth.api";

export default function TableCategory() {
  const [rows, setRows] = useState<ICategoryRow[]>([]);
  const [meta, setMeta] = useState({ page: 1, size: 10, total: 0 });
  const [loading, setLoading] = useState(false);

  const [openCreate, setOpenCreate] = useState(false);
  const [editing, setEditing] = useState<ICategoryRow | null>(null);

  // filters
  const [page, setPage] = useState(1);
  const [size, setSize] = useState(10);
  const [name, setName] = useState("");
  const [parentOptions, setParentOptions] = useState<ICategoryRow[]>([]);
  const [parentFilter, setParentFilter] = useState<string>("");
  const [inputValue, setInputValue] = useState(page);
  const inputRef = useRef<number | null>(null);

  const searchRef = useRef<number | null>(null);
  const [searchValue, setSearchValue] = useState("");

  useEffect(() => {
    (async () => {
      const all = await fetchCategoriesForSelect();
      setParentOptions(all.filter((c) => c.parentId === null));
    })();
  }, []);

  const query = useMemo(() => {
    let q = `page=${page}&size=${size}&sortField=createdAt&sortDirection=desc`;
    if (name) q += `&name=${encodeURIComponent(name)}`;
    return q;
  }, [page, size, name]);

  const load = async () => {
    try {
      setLoading(true);
      const data = await fetchCategories(query);
      let items = data?.items ?? [];
      // lọc client theo parent
      if (parentFilter === "0") {
        items = items.filter((i) => i.parentId === null);
      } else if (parentFilter) {
        const pid = Number(parentFilter);
        items = items.filter((i) => i.parentId === pid);
      }
      setRows(items);
      setMeta({
        page: data?.page ?? 1,
        size: data?.size ?? size,
        total: data?.total ?? 0,
      });
    } catch (e: any) {
      toast.error(e?.message || "Không tải được danh mục");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query, parentFilter]);
  const handleDelete = (id: number) => {
    toast(
      ({ closeToast }) => (
        <div className="space-y-2">
          <p>Bạn có chắc muốn xóa danh mục này?</p>
          <div className="flex gap-2">
            <button
              className="px-3 py-1 rounded bg-red-600 text-white"
              onClick={async () => {
                await deleteCategory(id);
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

  return (
    <div className="rounded-lg border border-neutral-200 bg-white">
      <div className="flex items-center justify-between border-b border-neutral-200 p-4">
        <h2 className="text-lg font-semibold">Danh mục</h2>
        <button
          className="rounded-md border border-neutral-300 px-3 py-2 text-sm"
          onClick={() => setOpenCreate(true)}
        >
          + Thêm danh mục
        </button>
      </div>

      {/* Filters */}
      <div className="grid gap-3 p-4 md:grid-cols-4">
        <div>
          <label className="mb-1 block text-sm">Tìm theo tên</label>
          <input
            value={searchValue}
            onChange={(e) => {
              setSearchValue(e.target.value);
              if (searchRef.current) clearTimeout(searchRef.current);
              searchRef.current = window.setTimeout(() => {
                setName(e.target.value);
              }, 300);
              setPage(1);
            }}
            className="w-full rounded border px-3 py-2"
            placeholder="Nhập tên danh mục"
          />
        </div>

        <div>
          <label className="mb-1 block text-sm">Lọc theo cha</label>
          <select
            value={parentFilter}
            onChange={(e) => {
              setParentFilter(e.target.value);
              setPage(1);
            }}
            className="w-full rounded border px-3 py-2"
          >
            <option value="">— Tất cả —</option>
            <option value="0">— Chỉ danh mục cha —</option>
            {parentOptions.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="mb-1 block text-sm">Kích thước trang</label>
          <select
            value={size}
            onChange={(e) => {
              setSize(Number(e.target.value));
              setPage(1);
            }}
            className="w-full rounded border px-3 py-2"
          >
            {[5, 10, 20, 50].map((n) => (
              <option key={n} value={n}>
                {n} / trang
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-end">
          <button
            onClick={() => {
              setName("");
              setParentFilter("");
              setSearchValue("");
              setPage(1);
              setSize(10);
            }}
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
              <th className="px-4 py-2 text-left">Tên</th>
              <th className="px-4 py-2 text-left">Cha</th>
              <th className="px-4 py-2 text-left">Mô tả</th>
              <th className="px-4 py-2 text-left">Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {!loading &&
              rows.map((c, idx) => (
                <tr key={c.id} className="border-t">
                  <td className="px-4 py-3">{(page - 1) * size + idx + 1}</td>
                  <td className="px-4 py-3 font-medium">{c.name}</td>
                  <td className="px-4 py-3">{c.parentId ?? "—"}</td>
                  <td className="px-4 py-3">{c.description || "—"}</td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap gap-2">
                      <button
                        className="rounded-md border border-neutral-300 px-3 py-1.5"
                        onClick={() => setEditing(c)}
                      >
                        Sửa
                      </button>
                      <button
                        className="rounded-md border border-red-300 bg-red-50 px-3 py-1.5 text-red-600"
                        onClick={() => handleDelete(c.id)}
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
                  colSpan={5}
                >
                  Đang tải…
                </td>
              </tr>
            )}

            {!loading && rows.length === 0 && (
              <tr>
                <td
                  className="px-4 py-6 text-center text-neutral-500"
                  colSpan={5}
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
          Trang <b>{meta.page}</b> / <b>{meta.total}</b>
        </div>
        <div className="flex gap-2">
          <button
            className="rounded-md border border-neutral-300 px-3 py-1.5 disabled:opacity-50"
            disabled={meta.page <= 1 || loading}
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
        <CreateCategory onClose={() => setOpenCreate(false)} onSuccess={load} />
      )}
      {editing && (
        <UpdateCategory
          category={editing}
          onClose={() => setEditing(null)}
          onSuccess={() => {
            setEditing(null);
            load();
          }}
        />
      )}
    </div>
  );
}
