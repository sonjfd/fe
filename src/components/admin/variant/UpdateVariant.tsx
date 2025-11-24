import { useState } from "react";
import axios from "services/axios.customize";
import { toast } from "react-toastify";

interface VariantAttributes {
  id: number;
  name: string;
  value: string;
}

interface Variant {
  id: number;
  name: string;
  sku: string;
  price: number;
  stock: number;
  sold: number;
  attributes: VariantAttributes[];
}

export default function UpdateVariantModal({
  value,
  onClose,
  onSaved,
}: {
  value: Variant;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [name, setName] = useState<string>(value.name);
  const [price, setPrice] = useState<number | string>(value.price);
  const [stock, setStock] = useState<number | string>(value.stock);
  const [saving, setSaving] = useState(false);

  const combination = value.attributes.map((a) => a.value).join(" / ");

  const submit = async () => {
    try {
      setSaving(true);

      await axios.put(`/api/v1/admin/variants/${value.id}`, {
        name: name,
        price: Number(price) || 0,
        stock: Number(stock) || 0,
      });

      toast.success("Đã cập nhật biến thể");
      onSaved();
      onClose();
    } catch (e: any) {
      toast.error(
        e?.response?.data?.message || e?.message || "Cập nhật thất bại"
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-md rounded-lg bg-white p-5 shadow-xl">
        <h3 className="mb-3 text-lg font-semibold">Sửa biến thể</h3>

        <div className="mb-3 text-sm">
          <div className="text-neutral-500">Combination</div>
          <div className="font-medium">{combination}</div>

          <div className="text-neutral-500 mt-1">SKU</div>
          <div className="font-mono text-[13px]">{value.sku}</div>
        </div>

        {/* 🆕 FIELD TÊN BIẾN THỂ */}
        <div className="mb-3">
          <label className="block text-sm font-medium">Tên biến thể</label>
          <input
            className="mt-1 w-full rounded border border-neutral-300 px-3 py-2"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Nhập tên biến thể"
          />
        </div>

        <div className="grid gap-3 md:grid-cols-2">
          <div>
            <label className="block text-sm font-medium">Giá</label>
            <input
              type="number"
              min={0}
              className="mt-1 w-full rounded border border-neutral-300 px-3 py-2"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-sm font-medium">Tồn kho</label>
            <input
              type="number"
              min={0}
              className="mt-1 w-full rounded border border-neutral-300 px-3 py-2"
              value={stock}
              onChange={(e) => setStock(e.target.value)}
            />
          </div>
        </div>

        <div className="mt-4 flex justify-end gap-2">
          <button
            className="rounded-md border border-neutral-300 px-3 py-2"
            onClick={onClose}
            disabled={saving}
          >
            Hủy
          </button>
          <button
            className="rounded-md bg-neutral-900 px-4 py-2 text-white disabled:opacity-60"
            onClick={submit}
            disabled={saving}
          >
            Lưu
          </button>
        </div>
      </div>
    </div>
  );
}
