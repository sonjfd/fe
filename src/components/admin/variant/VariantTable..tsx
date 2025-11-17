import { useEffect, useMemo, useRef, useState } from "react";
import { toast } from "react-toastify";
import axios from "services/axios.customize";
import UpdateVariantModal from "./UpdateVariant";
import { getAllVariantByProductId } from "@/api/admin.variant.api";

interface VariantAttributes {
  id: number;
  name: string;
  value: string;
}

interface ListItemRes {
  id: number;
  name: string;
  sku: string;
  price: number;
  stock: number;
  sold: number;
  thumbnail: string;
  attributes: VariantAttributes[];
}

export default function VariantTable({
  productId,
  refreshKey,
}: {
  productId: number;
  refreshKey?: number;
}) {
  const [rows, setRows] = useState<ListItemRes[]>([]);
  const [loading, setLoading] = useState(false);

  const [page, setPage] = useState<number>(1);
  const [size, setSize] = useState<number>(10);
  const [meta, setMeta] = useState<{
    page: number;
    size: number;
    total: number;
  }>({ page: 1, size: 10, total: 0 });

  const [editing, setEditing] = useState<ListItemRes | null>(null);
  const [inputValue, setInputValue] = useState(page);
  const inputRef = useRef<number | null>(null);

  const query = useMemo(() => {
    return `page=${page}&size=${size}`;
  }, [page, size]);

  const load = async () => {
    try {
      setLoading(true);
      const res = await getAllVariantByProductId(productId, query);

      if (res.data) {
        const d = res.data;
        setRows(d.items ?? []);
        setMeta({
          page: d.page ?? page,
          size: d.size ?? size,
          total: d.total ?? 0,
        });
      } else {
        toast.error(res.message || "Không tải được danh sách biến thể");
      }
    } catch (e: any) {
      toast.error(e?.message || "Lỗi tải danh sách biến thể");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!productId) return;
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [productId, query, refreshKey]);

  const askDelete = async (id: number) => {
    toast(
      ({ closeToast }) => (
        <div className="space-y-2">
          <p>Bạn có chắc muốn xóa biến thể này?</p>
          <div className="flex gap-2">
            <button
              className="px-3 py-1 rounded bg-red-600 text-white"
              onClick={async () => {
                await axios.delete(`/api/v1/admin/variants/${id}`);
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

  const totalPages = Math.max(1, Math.ceil(meta.total / meta.size));

  return (
    <div className="rounded-lg border border-neutral-200 bg-white">
      <div className="flex items-center justify-between border-b border-neutral-200 p-4">
        <h3 className="text-base font-semibold">Danh sách biến thể hiện có</h3>

        <div className="flex items-center gap-2 text-sm">
          <span>Kích thước trang:</span>
          <select
            value={size}
            onChange={(e) => {
              setSize(Number(e.target.value));
              setPage(1);
            }}
            className="rounded border px-3 py-2"
          >
            {[5, 10, 20, 50].map((n) => (
              <option key={n} value={n}>
                {n} / trang
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="overflow-x-auto p-2">
        <table className="w-full text-sm">
          <thead className="bg-neutral-50 text-neutral-700 font-semibold">
            <tr>
              <th className="px-4 py-2 text-left">Stt</th>
              <th className="px-4 py-2 text-left">Ảnh</th>
              <th className="px-4 py-2 text-left">Tên</th>
              <th className="px-4 py-2 text-left">SKU</th>
              <th className="px-4 py-2 text-left">Giá</th>
              <th className="px-4 py-2 text-left">Tồn kho</th>
              <th className="px-4 py-2 text-left">Đã bán</th>
              <th className="px-4 py-2 text-left">Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {!loading &&
              rows.map((v, idx) => (
                <tr key={v.id} className="border-t">
                  <td className="px-4 py-3">{(page - 1) * size + idx + 1}</td>

                  <td className="px-4 py-3">
                    {v.thumbnail ? (
                      <img
                        src={v.thumbnail}
                        alt={v.name}
                        className="h-12 w-12 rounded object-cover border border-neutral-200"
                      />
                    ) : (
                      <span className="text-xs text-neutral-400">
                        Không có ảnh
                      </span>
                    )}
                  </td>

                  <td className="px-4 py-3">{v.name}</td>
                  <td className="px-4 py-3">{v.sku}</td>
                  <td className="px-4 py-3">{v.price}</td>
                  <td className="px-4 py-3">{v.stock}</td>
                  <td className="px-4 py-3">{v.sold}</td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2">
                      <button
                        className="rounded-md border border-neutral-300 px-3 py-1.5"
                        onClick={() => setEditing(v)}
                      >
                        Sửa
                      </button>
                      <button
                        className="rounded-md border border-red-300 bg-red-50 px-3 py-1.5 text-red-600"
                        onClick={() => askDelete(v.id)}
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
                  colSpan={8}
                >
                  Đang tải…
                </td>
              </tr>
            )}

            {!loading && rows.length === 0 && (
              <tr>
                <td
                  className="px-4 py-6 text-center text-neutral-500"
                  colSpan={8}
                >
                  Chưa có biến thể
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="flex items-center justify-between p-4 text-sm">
        <div>
          Trang <b>{meta.page}</b> / <b>{totalPages}</b> • Tổng{" "}
          <b>{meta.total}</b>
        </div>
        <div className="flex gap-2">
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
            max={totalPages}
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
                if (!isNaN(num) && num >= 1 && num <= totalPages) {
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
            disabled={page >= totalPages || loading}
            onClick={() => setPage((p) => p + 1)}
          >
            Sau
          </button>
        </div>
      </div>

      {editing && (
        <UpdateVariantModal
          value={editing}
          onClose={() => setEditing(null)}
          onSaved={load}
        />
      )}
    </div>
  );
}
