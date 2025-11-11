import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import AddProduct from "./AddProduct";
import { deleteProduct, fetchProducts } from "@/api/admin.api";
import { fetchChildCategories } from "@/api/admin.api";
import { toast } from "react-toastify";
import EditProductModal from "./EditProductModal";

interface IChildCategory {
  id: number | string;
  name: string;
}

export default function TableProduct() {
  const [rows, setRows] = useState<IProductTable[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [openModalAdd, setOpenModalAdd] = useState<boolean>(false);
  const [selectedProduct, serSelectedProduct] = useState<IProductTable | null>(
    null
  );
  const [openEditModal, setOpenEditModal] = useState<boolean>(false);

  const [page, setPage] = useState<number>(1);
  const [size, setSize] = useState<number>(10);
  const [name, setName] = useState<string>("");
  const [cateId, setCateId] = useState<string>("");
  const [sortField, setSortField] = useState<string>("createdAt");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");

  const [hasNext, setHasNext] = useState<boolean>(false);

  const [childCategories, setChildCategories] = useState<IChildCategory[]>([]);

  const query = useMemo(() => {
    let q = `page=${page}&size=${size}&sortField=${encodeURIComponent(
      sortField
    )}&sortDirection=${encodeURIComponent(sortDirection)}`;

    q += `&name=${encodeURIComponent(name || "")}`;

    if (cateId !== "" && cateId !== undefined && cateId !== null) {
      q += `&cateId=${encodeURIComponent(String(cateId))}`;
    }
    return q;
  }, [page, size, name, cateId, sortField, sortDirection]);

  const loadData = async () => {
    try {
      setLoading(true);
      const data = await fetchProducts(query);
      setRows(data);
      setHasNext(data.length === size);
    } finally {
      setLoading(false);
    }
  };

  const fetchCate = async () => {
    const cats = await fetchChildCategories();
    setChildCategories(cats);
  };

  useEffect(() => {
    fetchCate();
  }, []);

  useEffect(() => {
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query]);

  const handleDelete = (id: number) => {
    toast(
      ({ closeToast }) => (
        <div className="space-y-2">
          <p>Bạn có chắc muốn xóa sản phẩm này?</p>
          <div className="flex gap-2">
            <button
              className="px-3 py-1 rounded bg-red-600 text-white"
              onClick={async () => {
                await deleteProduct(id);
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
    setCateId("");
    setPage(1);
    setSize(10);
    setSortField("createdAt");
    setSortDirection("desc");
  };

  const toggleSort = (field: string) => {
    if (sortField === field) {
      setSortDirection((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortField(field);
      setSortDirection("desc");
    }
    setPage(1);
  };

  return (
    <div className="rounded-lg border border-neutral-200 bg-white">
      <div className="flex items-center justify-between border-b border-neutral-200 p-4">
        <h2 className="text-lg font-semibold">Products</h2>
        <button
          className="rounded-md border border-neutral-300 px-3 py-2 text-sm"
          onClick={() => setOpenModalAdd(true)}
        >
          + Thêm sản phẩm
        </button>
      </div>

      <div className="grid grid-cols-1 gap-3 p-4 md:grid-cols-4">
        <div className="col-span-1">
          <label className="block text-sm mb-1">Tìm theo tên</label>
          <input
            value={name}
            onChange={(e) => {
              setName(e.target.value);
              setPage(1);
            }}
            className="w-full rounded border px-3 py-2"
            placeholder="Nhập tên sản phẩm"
          />
        </div>

        <div className="col-span-1">
          <label className="block text-sm mb-1">Danh mục </label>
          <select
            value={cateId}
            onChange={(e) => {
              setCateId(e.target.value);
              setPage(1);
            }}
            className="w-full rounded border px-3 py-2"
          >
            <option value="">-- Tất cả --</option>
            {childCategories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>

        <div className="col-span-1">
          <label className="block text-sm mb-1">Kích thước trang</label>
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

        <div className="col-span-1 flex items-end gap-2">
          <button
            onClick={resetFilter}
            className="rounded-md border border-neutral-300 px-3 py-2"
          >
            Reset
          </button>
        </div>
      </div>

      {/* Bảng */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-neutral-50 text-neutral-600">
            <tr>
              <th className="px-4 py-2 text-left">Stt</th>

              <th className="px-4 py-2 text-left">Mã code</th>

              <th
                className="px-4 py-2 text-left cursor-pointer select-none"
                onClick={() => toggleSort("name")}
                title="Nhấn để sắp xếp theo tên"
              >
                Tên{" "}
                {sortField === "name"
                  ? sortDirection === "asc"
                    ? "▲"
                    : "▼"
                  : ""}
              </th>

              <th className="px-4 py-2 text-left">Hành động</th>
            </tr>
          </thead>
          <tbody>
            {!loading &&
              rows.map((p, idx) => (
                <tr key={p.id} className="border-t">
                  <td className="px-4 py-3">{(page - 1) * size + idx + 1}</td>
                  <td className="px-4 py-3">{p.code}</td>
                  <td className="px-4 py-3">{p.name}</td>

                  <td className="px-4 py-3">
                    <div className="flex flex-wrap gap-2">
                      <Link
                        to={`/admin/products/${p.id}/attributes`}
                        className="rounded-md border border-neutral-300 px-3 py-1.5"
                      >
                        Thuộc tính
                      </Link>
                      <Link
                        to={`/admin/products/${p.id}/variants`}
                        className="rounded-md border border-neutral-300 px-3 py-1.5"
                      >
                        Biến thể
                      </Link>
                      <button
                        className="rounded-md border border-neutral-300 px-3 py-1.5"
                        onClick={() => {
                          setOpenEditModal(true);
                          serSelectedProduct(p);
                        }}
                      >
                        Sửa
                      </button>
                      <button
                        className="rounded-md border border-red-300 bg-red-50 px-3 py-1.5 text-red-600"
                        onClick={() => handleDelete(p.id)}
                      >
                        Xóa
                      </button>
                    </div>
                  </td>
                </tr>
              ))}

            {loading && (
              <tr>
                <td
                  className="px-4 py-6 text-center text-neutral-500"
                  colSpan={6}
                >
                  Đang tải...
                </td>
              </tr>
            )}

            {!loading && !rows.length && (
              <tr>
                <td
                  className="px-4 py-6 text-center text-neutral-500"
                  colSpan={6}
                >
                  Không có dữ liệu
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between p-4">
        <div className="text-sm text-neutral-600">
          Trang <b>{page}</b>
        </div>
        <div className="flex gap-2">
          <button
            className="rounded-md border border-neutral-300 px-3 py-1.5 disabled:opacity-50"
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1 || loading}
          >
            Prev
          </button>
          <button
            className="rounded-md border border-neutral-300 px-3 py-1.5 disabled:opacity-50"
            onClick={() => setPage((p) => p + 1)}
            disabled={!hasNext || loading}
          >
            Next
          </button>
        </div>
      </div>

      {openEditModal && (
        <EditProductModal
          onClose={() => setOpenEditModal(false)}
          onSuccess={loadData}
          selectedProduct={selectedProduct}
        />
      )}

      {openModalAdd && (
        <AddProduct
          onClose={() => setOpenModalAdd(false)}
          onSuccess={loadData}
        />
      )}
    </div>
  );
}
