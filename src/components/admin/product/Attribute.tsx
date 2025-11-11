import React from "react";
import { useNavigate, useParams } from "react-router-dom";

type AttrValue = { id: number; label: string };
type Attr = { id: number; code: string; name: string; values: AttrValue[] };

export default function AttributePanel() {
  const navigate = useNavigate();
  const { id } = useParams();
  const pid = Number(id);

  const [attrs, setAttrs] = React.useState<Attr[]>([
    {
      id: 1,
      code: "storage",
      name: "Dung lượng",
      values: [
        { id: 1001, label: "128 GB" },
        { id: 1002, label: "256 GB" },
        { id: 1003, label: "512 GB" },
      ],
    },
    {
      id: 2,
      code: "color",
      name: "Màu sắc",
      values: [
        { id: 2001, label: "Đen" },
        { id: 2002, label: "Trắng" },
        { id: 2003, label: "Đỏ" },
      ],
    },
  ]);
  const [active, setActive] = React.useState<number>(attrs[0]?.id ?? 0);
  const [keyword, setKeyword] = React.useState("");

  const filtered = attrs.filter(
    (a) =>
      a.name.toLowerCase().includes(keyword.toLowerCase()) ||
      a.code.toLowerCase().includes(keyword.toLowerCase())
  );

  const current = attrs.find((a) => a.id === active) ?? null;

  const updateAttr = (next: Attr) =>
    setAttrs((s) => s.map((x) => (x.id === next.id ? next : x)));

  const addAttribute = () => {
    const nid = Date.now();
    setAttrs([
      {
        id: nid,
        code: `attr-${nid.toString().slice(-4)}`,
        name: "Thuộc tính mới",
        values: [],
      },
      ...attrs,
    ]);
    setActive(nid);
  };

  const removeAttr = (id: number) =>
    setAttrs((s) => s.filter((x) => x.id !== id));

  const addValue = (label: string) =>
    current &&
    updateAttr({
      ...current,
      values: [...current.values, { id: Date.now(), label }],
    });

  const removeValue = (valueId: number) =>
    current &&
    updateAttr({
      ...current,
      values: current.values.filter((v) => v.id !== valueId),
    });

  return (
    <div className=" p-4">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold">Attributes — Product #{pid}</h2>

        <button
          onClick={() => navigate(-1)}
          className="rounded-md border border-neutral-300 px-3 py-2 text-sm hover:bg-neutral-50"
        >
          ← Quay lại
        </button>
      </div>

      <div className="grid gap-4 md:grid-cols-[280px_1fr]">
        {/* LEFT SIDE */}
        <div className="rounded-lg border border-neutral-200 bg-white p-4 flex flex-col gap-3">
          <input
            placeholder="Tìm theo code hoặc tên…"
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            className="border border-neutral-300 rounded px-3 py-2 text-sm"
          />

          <div className="flex-1 max-h-[500px] overflow-y-auto space-y-1">
            {filtered.map((a) => (
              <button
                key={a.id}
                onClick={() => setActive(a.id)}
                className={`w-full rounded-md px-3 py-2 text-left text-sm flex items-center gap-2
                  ${
                    active === a.id
                      ? "bg-neutral-100 font-semibold"
                      : "hover:bg-neutral-50"
                  }`}
              >
                <span className="rounded bg-neutral-200 px-2 py-0.5 text-[11px]">
                  {a.code}
                </span>
                {a.name}
                <span className="text-neutral-500">
                  ({a.values.length} value)
                </span>
              </button>
            ))}
          </div>

          <button
            className="rounded-md border border-neutral-300 px-3 py-2 text-sm font-medium hover:bg-neutral-50"
            onClick={addAttribute}
          >
            + Thêm thuộc tính
          </button>
        </div>

        {/* RIGHT DETAIL */}
        <div className="rounded-lg border border-neutral-200 bg-white p-5">
          {current ? (
            <>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Code</label>
                  <input
                    readOnly
                    value={current.code}
                    className="mt-1 w-full border border-neutral-300 rounded px-3 py-2"
                  />
                  <p className="text-xs text-neutral-500 mt-1">
                    Duy nhất trong product. a–z, 0–9, gạch ngang.
                  </p>
                </div>

                <div>
                  <label className="text-sm font-medium">Tên hiển thị</label>
                  <input
                    value={current.name}
                    onChange={(e) =>
                      updateAttr({ ...current, name: e.target.value })
                    }
                    className="mt-1 w-full border border-neutral-300 rounded px-3 py-2"
                  />
                </div>
              </div>

              <div className="flex gap-3 mt-4">
                <button className="border border-red-300 text-red-600 rounded px-3 py-2 hover:bg-red-50">
                  Xoá
                </button>
                <button className="bg-neutral-900 text-white rounded px-4 py-2 hover:bg-neutral-800">
                  Lưu thuộc tính
                </button>
              </div>

              {/* VALUES */}
              <div className="mt-6">
                <label className="block text-sm font-semibold mb-2">
                  Giá trị (Values)
                </label>

                <div className="flex gap-2">
                  <input
                    placeholder="Nhập nhãn, ví dụ: 512 GB / Đỏ"
                    className="flex-1 border border-neutral-300 rounded px-3 py-2"
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        const v = e.currentTarget.value.trim();
                        if (v) addValue(v);
                        e.currentTarget.value = "";
                      }
                    }}
                  />
                  <button className="border border-neutral-300 rounded px-3 py-2 hover:bg-neutral-50">
                    + Thêm value
                  </button>
                </div>

                <div className="mt-3 border rounded divide-y">
                  <div className="grid grid-cols-[80px_1fr_120px] bg-neutral-50 px-3 py-2 text-sm font-medium">
                    <div>ID</div>
                    <div>Nhãn</div>
                    <div>Thao tác</div>
                  </div>

                  {current.values.map((v) => (
                    <div
                      key={v.id}
                      className="grid grid-cols-[80px_1fr_120px] items-center px-3 py-2 gap-2"
                    >
                      <div>{v.id}</div>
                      <input
                        value={v.label}
                        className="border border-neutral-300 rounded px-2 py-1"
                        onChange={(e) =>
                          updateAttr({
                            ...current,
                            values: current.values.map((x) =>
                              x.id === v.id
                                ? { ...x, label: e.target.value }
                                : x
                            ),
                          })
                        }
                      />
                      <div className="flex gap-2">
                        <button className="border border-neutral-300 rounded px-2 py-1 text-sm">
                          Lưu
                        </button>
                        <button
                          onClick={() => removeValue(v.id)}
                          className="border border-red-300 bg-red-50 text-red-600 rounded px-2 py-1 text-sm"
                        >
                          Xoá
                        </button>
                      </div>
                    </div>
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
