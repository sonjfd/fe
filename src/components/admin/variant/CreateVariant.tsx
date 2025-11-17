import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import {
  fetchProductAttribute,
  type AttributeName,
  type AttributeValue,
} from "@/api/admin.product.attributes.api";
import { addVariantsApi } from "@/api/admin.variant.api";
import { uploadFiles } from "@/api/upload.api";
import VariantTable from "./VariantTable.";

type Row = {
  id: string;
  values: AttributeValue[];
  combination: string;
  name: string;
  price: string | number;
  stock: string | number;
  checked: boolean;
  thumbnail: string | null;
};

function cartesian<T>(lists: T[][]): T[][] {
  return lists.reduce<T[][]>(
    (a, b) => a.flatMap((x) => b.map((y) => [...x, y])),
    [[]]
  );
}

export default function CreateVariants() {
  const { id } = useParams();
  const pid = Number(id);
  const navigate = useNavigate();

  const [attrs, setAttrs] = useState<AttributeName[]>([]);
  const [loadingAttrs, setLoadingAttrs] = useState(false);
  const [picked, setPicked] = useState<Record<number, number[]>>({});
  const [refreshFlag, setRefreshFlag] = useState(0);

  const loadAttrs = async () => {
    try {
      setLoadingAttrs(true);
      const res = await fetchProductAttribute(pid);
      if (res.data) {
        setAttrs(res.data);
        const init: Record<number, number[]> = {};
        res.data.forEach((a) => (init[a.id] = []));
        setPicked(init);
      } else {
        toast.error(res.message || "Không lấy được thuộc tính");
      }
    } catch (e: any) {
      toast.error(e?.message || "Lỗi tải thuộc tính");
    } finally {
      setLoadingAttrs(false);
    }
  };

  useEffect(() => {
    if (Number.isFinite(pid)) loadAttrs();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pid]);

  const togglePick = (attrId: number, valId: number) => {
    setPicked((s) => {
      const cur = s[attrId] || [];
      const next = cur.includes(valId)
        ? cur.filter((x) => x !== valId)
        : [...cur, valId];
      return { ...s, [attrId]: next };
    });
  };

  const rows: Row[] = useMemo(() => {
    const groups: AttributeValue[][] = [];

    for (const a of attrs) {
      const sel = (picked[a.id] || [])
        .map((id) => a.values.find((v) => v.id === id))
        .filter(Boolean) as AttributeValue[];

      if (!sel.length) return [];
      groups.push(sel);
    }

    const combos = cartesian(groups);

    return combos.map((vals) => {
      const label = vals.map((v) => v.value).join(" / ");
      const uid = vals.map((v) => v.id).join("-");
      return {
        id: uid,
        values: vals,
        combination: label,
        name: "",
        price: 0,
        stock: 0,
        checked: true,
        thumbnail: null,
      };
    });
  }, [attrs, picked]);

  const [edits, setEdits] = useState<Record<string, Partial<Row>>>({});
  const viewRows: Row[] = rows.map((r) =>
    edits[r.id] ? { ...r, ...edits[r.id] } : r
  );

  const updateRow = (id: string, patch: Partial<Row>) =>
    setEdits((s) => ({ ...s, [id]: { ...(s[id] ?? {}), ...patch } }));

  const removeRow = (id: string) => updateRow(id, { checked: false });

  const handleUploadThumbnail = async (
    rowId: string,
    fileList: FileList | null
  ) => {
    const file = fileList?.[0];
    if (!file) return;

    try {
      const res = await uploadFiles([file]); // res: UploadMultiRes
      const urls = res.data ?? []; // lấy mảng string[]
      const first = urls[0];

      if (!first) {
        toast.error("Upload ảnh thất bại");
        return;
      }

      updateRow(rowId, { thumbnail: first });
      toast.success("Đã upload ảnh");
    } catch (e: any) {
      toast.error(e?.message || "Upload ảnh thất bại");
    }
  };

  const onSave = async () => {
    const selected = viewRows.filter((r) => r.checked);
    if (!selected.length) {
      toast.error("Chưa chọn biến thể nào");
      return;
    }

    const items = selected.map((r) => ({
      values: r.values.map((v) => ({ id: v.id })),
      combination: r.combination,
      name: r.name.trim(),
      price: Number(r.price) || 0,
      stock: Number(r.stock) || 0,
      thumbnail: r.thumbnail,
    }));

    try {
      const res = await addVariantsApi(pid, { items });
      if (res.data) {
        toast.success("Đã tạo biến thể");
        setEdits({});
        setRefreshFlag((x) => x + 1);
      } else {
        toast.error(res.message || "Tạo biến thể thất bại");
      }
    } catch (e: any) {
      toast.error(e?.message || "Tạo biến thể thất bại");
    }
  };

  return (
    <div className="rounded-lg border border-neutral-200 bg-white">
      <div className="flex items-center justify-between border-b border-neutral-200 p-4">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate(-1)}
            className="rounded-md border border-neutral-300 px-3 py-2 text-sm"
          >
            ← Quay lại
          </button>
          <h2 className="text-lg font-semibold">
            Tạo biến thể — Product #{pid}
          </h2>
        </div>
        <button
          onClick={onSave}
          className="rounded-md bg-neutral-900 px-3 py-2 text-sm text-white"
        >
          Lưu các biến thể đã chọn
        </button>
      </div>

      <div className="grid grid-cols-1 gap-4 p-4 md:grid-cols-2">
        {loadingAttrs && (
          <div className="col-span-2 text-sm text-neutral-500">
            Đang tải thuộc tính…
          </div>
        )}

        {!loadingAttrs &&
          attrs.map((a) => (
            <div key={a.id} className="rounded-lg border p-4">
              <div className="mb-2 font-semibold">
                {a.name}{" "}
                <span className="text-xs text-neutral-500">({a.code})</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {a.values.map((v) => {
                  const active = (picked[a.id] || []).includes(v.id);
                  return (
                    <button
                      key={v.id}
                      onClick={() => togglePick(a.id, v.id)}
                      className={`rounded-md px-3 py-1.5 text-sm border ${
                        active
                          ? "bg-neutral-900 text-white border-neutral-900"
                          : "border-neutral-300 hover:bg-neutral-50"
                      }`}
                    >
                      {v.value}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
      </div>

      {attrs.length === 0 ? (
        <p className="py-4 text-center text-neutral-500">
          Vui lòng tạo thuộc tính
        </p>
      ) : (
        <div className="overflow-x-auto p-2">
          <table className="w-full text-sm">
            <thead className="bg-neutral-50 text-neutral-700 font-semibold">
              <tr>
                <th className="px-4 py-2 text-left">Combination</th>
                <th className="px-4 py-2 text-left">Tên biến thể</th>
                <th className="px-4 py-2 text-left">Giá</th>
                <th className="px-4 py-2 text-left">Tồn kho</th>
                <th className="px-4 py-2 text-left">Ảnh</th>
                <th className="px-4 py-2 text-left">Chọn</th>
                <th className="px-4 py-2 text-left">Xoá</th>
              </tr>
            </thead>
            <tbody>
              {viewRows.map((r) => (
                <tr key={r.id} className="border-t">
                  <td className="px-4 py-3 font-medium text-neutral-700">
                    {r.combination}
                  </td>
                  <td className="px-4 py-3">
                    <input
                      type="text"
                      className="w-full rounded border border-neutral-300 px-3 py-1.5"
                      value={r.name}
                      placeholder="Nhập tên biến thể"
                      onChange={(e) =>
                        updateRow(r.id, { name: e.target.value })
                      }
                    />
                  </td>
                  <td className="px-4 py-3">
                    <input
                      type="number"
                      min={0}
                      className="w-full rounded border border-neutral-300 px-3 py-1.5"
                      value={r.price}
                      onChange={(e) =>
                        updateRow(r.id, { price: e.target.value })
                      }
                    />
                  </td>
                  <td className="px-4 py-3">
                    <input
                      type="number"
                      min={0}
                      className="w-full rounded border border-neutral-300 px-3 py-1.5"
                      value={r.stock}
                      onChange={(e) =>
                        updateRow(r.id, { stock: e.target.value })
                      }
                    />
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) =>
                          handleUploadThumbnail(r.id, e.target.files)
                        }
                      />
                      {r.thumbnail && (
                        <img
                          src={r.thumbnail}
                          alt={r.name || r.combination}
                          className="h-10 w-10 rounded object-cover"
                        />
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <input
                      type="checkbox"
                      checked={!!r.checked}
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
                    colSpan={7}
                  >
                    Hãy chọn ít nhất 1 giá trị ở mỗi thuộc tính để tạo biến thể.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      <div className="border-t p-4">
        <VariantTable productId={pid} refreshKey={refreshFlag} />
      </div>
    </div>
  );
}
