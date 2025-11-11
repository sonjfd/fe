import React, { useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

type VariantRow = {
  id: string; // unique for UI
  combination: string; // e.g. "Đỏ / 128 GB"
  sku: string;
  price: number | string;
  stock: number | string;
  checked: boolean;
};

const COLOR_OPTIONS = ["Đỏ", "Đen", "Trắng"];
const CAPACITY_OPTIONS = ["128 GB", "256 GB", "512 GB"];

// tiny utils
const cartesian = <T, U>(a: T[], b: U[]) =>
  a.flatMap((x) => b.map((y) => [x, y] as const));
const toSKU = (color: string, cap: string) =>
  `IP16-${color
    .toUpperCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\s+/g, "")}-${cap.replace(/\s+/g, "")}`;

export default function CreateVariants() {
  const { id } = useParams();
  const pid = Number(id);
  const navigate = useNavigate();

  // multi-select states
  const [colors, setColors] = useState<string[]>([]);
  const [capacities, setCapacities] = useState<string[]>([]);

  // generate rows from selections
  const rows = useMemo<VariantRow[]>(() => {
    if (!colors.length || !capacities.length) return [];
    return cartesian(colors, capacities).map(([c, cap]) => {
      const combo = `${c} / ${cap}`;
      return {
        id: `${c}-${cap}`,
        combination: combo,
        sku: toSKU(c, cap),
        price: 0,
        stock: 0,
        checked: true,
      };
    });
  }, [colors, capacities]);

  // local edits (id -> fields)
  const [edits, setEdits] = useState<
    Record<string, Omit<VariantRow, "id" | "combination">>
  >({});

  const viewRows: VariantRow[] = rows.map((r) =>
    edits[r.id] ? { ...r, ...edits[r.id] } : r
  );

  const togglePick = (
    list: string[],
    v: string,
    setter: (s: string[]) => void
  ) => {
    setter(list.includes(v) ? list.filter((x) => x !== v) : [...list, v]);
  };

  const updateRow = (id: string, patch: Partial<VariantRow>) =>
    setEdits((s) => ({ ...s, [id]: { ...(s[id] ?? {}), ...patch } }));

  const removeRow = (id: string) => updateRow(id, { checked: false });

  const onSave = () => {
    const selected = viewRows.filter((r) => r.checked);
    // TODO: call API to save selected variants
    console.log("Saving variants:", selected);
  };

  return (
    <div className="rounded-lg border border-neutral-200 bg-white">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-neutral-200 p-4">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate(-1)}
            className="rounded-md border border-neutral-300 px-3 py-2 text-sm"
          >
            ← Quay lại
          </button>
          <h2 className="text-lg font-semibold">
            Tạo biến thể (variants) — Product #{pid}
          </h2>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => navigate(-1)}
            className="rounded-md border border-neutral-300 px-3 py-2 text-sm"
          >
            Huỷ
          </button>
          <button
            onClick={onSave}
            className="rounded-md bg-neutral-900 px-3 py-2 text-sm text-white"
          >
            Lưu các variants đã chọn
          </button>
        </div>
      </div>

      {/* Pickers (multi-select) */}
      <div className="grid grid-cols-1 gap-4 p-4 md:grid-cols-2">
        <div className="rounded-lg border p-4">
          <div className="mb-2 font-semibold">Màu sắc</div>
          <div className="flex flex-wrap gap-2">
            {COLOR_OPTIONS.map((c) => {
              const active = colors.includes(c);
              return (
                <button
                  key={c}
                  onClick={() => togglePick(colors, c, setColors)}
                  className={`rounded-md px-3 py-1.5 text-sm border ${
                    active
                      ? "bg-neutral-900 text-white border-neutral-900"
                      : "border-neutral-300 hover:bg-neutral-50"
                  }`}
                >
                  {c}
                </button>
              );
            })}
          </div>
        </div>

        <div className="rounded-lg border p-4">
          <div className="mb-2 font-semibold">Dung lượng</div>
          <div className="flex flex-wrap gap-2">
            {CAPACITY_OPTIONS.map((cap) => {
              const active = capacities.includes(cap);
              return (
                <button
                  key={cap}
                  onClick={() => togglePick(capacities, cap, setCapacities)}
                  className={`rounded-md px-3 py-1.5 text-sm border ${
                    active
                      ? "bg-neutral-900 text-white border-neutral-900"
                      : "border-neutral-300 hover:bg-neutral-50"
                  }`}
                >
                  {cap}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Generated table (no “Chọn tất cả”, không giá/stock hàng loạt) */}
      <div className="overflow-x-auto p-2">
        <table className="w-full text-sm">
          <thead className="bg-neutral-50 text-neutral-700 font-semibold">
            <tr>
              <th className="px-4 py-2 text-left">Combination</th>
              <th className="px-4 py-2 text-left">SKU</th>
              <th className="px-4 py-2 text-left">Giá</th>
              <th className="px-4 py-2 text-left">Tồn kho</th>
              <th className="px-4 py-2 text-left">Chọn</th>
              <th className="px-4 py-2 text-left">Xoá</th>
            </tr>
          </thead>
          <tbody>
            {viewRows.map((r) => (
              <tr key={r.id} className="border-t">
                <td className="px-4 py-3 font-medium">{r.combination}</td>
                <td className="px-4 py-3">
                  <input
                    className="w-full rounded border border-neutral-300 px-3 py-1.5"
                    value={r.sku}
                    onChange={(e) => updateRow(r.id, { sku: e.target.value })}
                  />
                </td>
                <td className="px-4 py-3">
                  <input
                    type="number"
                    className="w-full rounded border border-neutral-300 px-3 py-1.5"
                    value={r.price}
                    onChange={(e) => updateRow(r.id, { price: e.target.value })}
                  />
                </td>
                <td className="px-4 py-3">
                  <input
                    type="number"
                    className="w-full rounded border border-neutral-300 px-3 py-1.5"
                    value={r.stock}
                    onChange={(e) => updateRow(r.id, { stock: e.target.value })}
                  />
                </td>
                <td className="px-4 py-3">
                  <input
                    type="checkbox"
                    checked={r.checked}
                    onChange={(e) =>
                      updateRow(r.id, { checked: e.target.checked })
                    }
                  />
                </td>
                <td className="px-4 py-3">
                  <button
                    className="rounded-md border border-red-300 bg-red-50 px-3 py-1.5 text-red-600"
                    onClick={() => removeRow(r.id)}
                  >
                    X
                  </button>
                </td>
              </tr>
            ))}

            {!viewRows.length && (
              <tr>
                <td
                  className="px-4 py-6 text-center text-neutral-500"
                  colSpan={6}
                >
                  Hãy chọn ít nhất 1 màu và 1 dung lượng để tạo biến thể.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
