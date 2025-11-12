import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import ValueRow from "./ValueRow";

import {
  fetchProductAttribute,
  addProductAttributeName,
  updateProductAttributeName,
  deletedProductAttributeName,
  addAttributeValue,
  updateAttributeValue,
  deleteAttributeValue,
  type AttributeName,
} from "@/api/admin.product.attributes.api";

export default function AttributePanel() {
  const navigate = useNavigate();
  const { id } = useParams();
  const pid = Number(id);

  const [attributes, setAttributes] = useState<AttributeName[]>([]);
  const [loading, setLoading] = useState(false);

  const [activeId, setActiveId] = useState<number | null>(null);
  const [keyword, setKeyword] = useState("");

  // Form tạo attribute (bên trái)
  const [newCode, setNewCode] = useState("");
  const [newName, setNewName] = useState("");

  // Form sửa attribute (bên phải)
  const current = useMemo(
    () => attributes.find((a) => a.id === activeId) || null,
    [attributes, activeId]
  );
  const [editName, setEditName] = useState("");
  const [editCode, setEditCode] = useState("");
  useEffect(() => {
    if (current) {
      setEditName(current.name || "");
      setEditCode(current.code || "");
    }
  }, [current?.id]); // eslint-disable-line

  // Thêm value
  const [newValue, setNewValue] = useState("");

  // Load data
  const load = async () => {
    try {
      setLoading(true);
      const res = await fetchProductAttribute(pid);
      if (res.data) {
        const list = Array.isArray(res.data) ? res.data : [res.data];
        // đảm bảo mỗi item có values là array
        const safe = list.map((a) => ({
          ...a,
          values: Array.isArray(a.values) ? a.values : [],
        }));
        setAttributes(safe);
        // set active nếu chưa có
        if (!activeId && safe.length) setActiveId(safe[0].id);
      } else {
        setAttributes([]);
        toast.error(res.message || "Không lấy được thuộc tính");
      }
    } catch (e: any) {
      toast.error(e?.message || "Lỗi tải thuộc tính");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!Number.isFinite(pid)) return;
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pid]);

  const filtered = useMemo(() => {
    const k = keyword.toLowerCase().trim();
    if (!k) return attributes;
    return attributes.filter(
      (a) =>
        a.name.toLowerCase().includes(k) || a.code.toLowerCase().includes(k)
    );
  }, [attributes, keyword]);

  const handleAddAttribute = async () => {
    const code = newCode.trim();
    const name = newName.trim();
    if (!code || !name) {
      toast.error("Vui lòng nhập đủ Code và Tên");
      return;
    }
    try {
      const res = await addProductAttributeName(code, name, { id: pid });
      if (res.data) {
        toast.success("Đã tạo thuộc tính");
        setNewCode("");
        setNewName("");
        await load();
        setActiveId(res.data.id);
      } else {
        toast.error(res.message || "Tạo thất bại");
      }
    } catch (e: any) {
      toast.error(e?.message || "Tạo thuộc tính thất bại");
    }
  };

  const handleUpdateAttribute = async () => {
    if (!current) return;
    const name = editName.trim();
    if (!name) return toast.error("Tên thuộc tính không được trống");
    try {
      const res = await updateProductAttributeName(current.id, editCode, name);
      if (res.data) {
        toast.success("Đã lưu thuộc tính");
        await load();
        setActiveId(current.id);
      } else {
        toast.error(res.message || "Lưu thất bại");
      }
    } catch (e: any) {
      toast.error(e?.message || "Lưu thuộc tính thất bại");
    }
  };

  const handleDeleteAttribute = async () => {
    if (!current) return;
    try {
      toast(
        ({ closeToast }) => (
          <div className="space-y-2">
            <p>Bạn có chắc muốn xóa không?</p>
            <div className="flex gap-2">
              <button
                className="px-3 py-1 rounded bg-red-600 text-white"
                onClick={async () => {
                  await deletedProductAttributeName(current.id);
                  await load();
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
    } catch (e: any) {
      toast.error(e?.message || "Xoá thất bại");
    }
  };

  const handleAddValue = async () => {
    if (!current) return;
    const v = newValue.trim();
    if (!v) return;
    try {
      const res = await addAttributeValue(v, { id: current.id });
      if (res.data) {
        toast.success("Đã thêm value");
        setNewValue("");
        await load();
        setActiveId(current.id);
      } else {
        toast.error(res.message || "Thêm value thất bại");
      }
    } catch (e: any) {
      toast.error(e?.message || "Thêm value thất bại");
    }
  };

  const handleUpdateValue = async (vid: number, label: string) => {
    const t = label.trim();
    if (!t || !current) return;
    try {
      const res = await updateAttributeValue(vid, t);
      if (res.data) {
        toast.success("Đã lưu value");
        await load();
        setActiveId(current.id);
      } else {
        toast.error(res.message || "Lưu value thất bại");
      }
    } catch (e: any) {
      toast.error(e?.message || "Lưu value thất bại");
    }
  };

  const handleDeleteValue = async (vid: number) => {
    if (!current) return;
    try {
      toast(
        ({ closeToast }) => (
          <div className="space-y-2">
            <p>Bạn có chắc muốn xóa không?</p>
            <div className="flex gap-2">
              <button
                className="px-3 py-1 rounded bg-red-600 text-white"
                onClick={async () => {
                  await deleteAttributeValue(vid);
                  await load();
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
    } catch (e: any) {
      toast.error(e?.message || "Xoá value thất bại");
    }
  };

  return (
    <div className="p-4">
      {/* Header */}
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-xl font-semibold">
          <span className="font-bold">Thuộc tính</span> — Sản phẩm #{pid}
        </h2>
        <button
          onClick={() => navigate(-1)}
          className="rounded-md border border-neutral-300 px-3 py-2 text-sm hover:bg-neutral-50"
        >
          ← Quay lại
        </button>
      </div>

      <div className="grid gap-4 md:grid-cols-[280px_1fr]">
        <div className="rounded-lg border border-neutral-200 bg-white p-4 flex flex-col gap-3">
          <input
            placeholder="Tìm theo code hoặc tên…"
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            className="border border-neutral-300 rounded px-3 py-2 text-sm"
          />

          <div className="flex-1 max-h-[500px] overflow-y-auto space-y-1">
            {loading && (
              <div className="text-sm text-neutral-500">Đang tải…</div>
            )}
            {!loading && filtered.length === 0 && (
              <div className="text-sm text-neutral-500">Không có dữ liệu</div>
            )}
            {!loading &&
              filtered.map((a) => (
                <button
                  key={a.id}
                  onClick={() => setActiveId(a.id)}
                  className={`w-full rounded-md px-3 py-2 text-left text-sm flex items-center gap-2 ${
                    a.id === activeId
                      ? "bg-neutral-100 font-medium"
                      : "hover:bg-neutral-50"
                  }`}
                >
                  <span className="rounded bg-neutral-200 px-2 py-0.5 text-[11px] font-semibold">
                    {a.code}
                  </span>
                  <span className="font-medium">{a.name}</span>
                  <span className="text-neutral-500">
                    ({Array.isArray(a.values) ? a.values.length : 0} value)
                  </span>
                </button>
              ))}
          </div>

          <div className="border-t pt-3">
            <div className="mb-2 text-sm font-semibold">+ Thêm thuộc tính</div>
            <div className="mb-2">
              <label className="text-xs font-bold">Code *</label>
              <input
                value={newCode}
                onChange={(e) => setNewCode(e.target.value)}
                placeholder="vd: color, storage…"
                className="mt-1 w-full rounded border border-neutral-300 px-3 py-2 text-sm"
              />
            </div>
            <div className="mb-3">
              <label className="text-xs font-bold">Tên hiển thị *</label>
              <input
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                placeholder="vd: Màu sắc, Dung lượng…"
                className="mt-1 w-full rounded border border-neutral-300 px-3 py-2 text-sm"
              />
            </div>
            <button
              onClick={handleAddAttribute}
              className="w-full rounded-md border border-neutral-300 px-3 py-2 text-sm font-medium hover:bg-neutral-50"
            >
              Thêm thuộc tính
            </button>
          </div>
        </div>

        {/* RIGHT: detail */}
        <div className="rounded-lg border border-neutral-200 bg-white p-5">
          {!attributes.length ? (
            <div className="text-neutral-500">
              <span className="font-semibold">Chưa có thuộc tính.</span> Hãy sử
              dụng form “+ Thêm thuộc tính” bên trái để tạo mới.
            </div>
          ) : current ? (
            <>
              {/* Update attribute */}
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className="text-sm font-bold">
                    Code<span className="text-red-500">*</span>
                  </label>
                  <input
                    value={editCode}
                    className="mt-1 w-full rounded border border-neutral-300 px-3 py-2"
                    onChange={(e) => setEditCode(e.target.value)}
                  />
                </div>

                <div>
                  <label className="text-sm font-bold">
                    Tên hiển thị <span className="text-red-500">*</span>
                  </label>
                  <input
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    className="mt-1 w-full rounded border border-neutral-300 px-3 py-2"
                  />
                </div>
              </div>

              <div className="mt-4 flex gap-2">
                <button
                  className="rounded border border-red-300 px-3 py-2 text-red-600 hover:bg-red-50"
                  onClick={handleDeleteAttribute}
                >
                  Xoá
                </button>
                <button
                  className="rounded bg-neutral-900 px-4 py-2 text-white hover:bg-neutral-800"
                  onClick={handleUpdateAttribute}
                >
                  Lưu thuộc tính
                </button>
              </div>

              {/* Values */}
              <div className="mt-6">
                <label className="mb-2 block text-sm font-bold">
                  Giá trị <span className="text-red-500">*</span>
                </label>

                <div className="flex gap-2">
                  <input
                    placeholder="Nhập nhãn, ví dụ: 512 GB / Đỏ"
                    value={newValue}
                    onChange={(e) => setNewValue(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") handleAddValue();
                    }}
                    className="flex-1 rounded border border-neutral-300 px-3 py-2"
                  />
                  <button
                    className="rounded border border-neutral-300 px-3 py-2 hover:bg-neutral-50"
                    onClick={handleAddValue}
                  >
                    + Thêm value
                  </button>
                </div>

                <div className="mt-3 divide-y rounded border">
                  <div className="grid grid-cols-[80px_1fr_140px] bg-neutral-50 px-3 py-2 text-sm font-semibold">
                    <div>ID</div>
                    <div>Nhãn</div>
                    <div>Thao tác</div>
                  </div>

                  {Array.isArray(current.values) &&
                    current.values.length === 0 && (
                      <div className="px-3 py-3 text-sm text-neutral-500">
                        Chưa có value
                      </div>
                    )}

                  {Array.isArray(current.values) &&
                    current.values.map((v) => (
                      <ValueRow
                        key={v.id}
                        valueItem={v}
                        onSave={(label) => handleUpdateValue(v.id, label)}
                        onDelete={() => handleDeleteValue(v.id)}
                      />
                    ))}
                </div>
              </div>
            </>
          ) : (
            <div className="text-neutral-500">Chưa chọn thuộc tính</div>
          )}
        </div>
      </div>
    </div>
  );
}
