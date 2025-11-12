import type { AttributeValue } from "@/api/admin.product.attributes.api";
import { useEffect, useState } from "react";

export default function ValueRow({
  valueItem,
  onSave,
  onDelete,
}: {
  valueItem: AttributeValue;
  onSave: (label: string) => void;
  onDelete: () => void;
}) {
  const [label, setLabel] = useState(valueItem.value);

  useEffect(() => setLabel(valueItem.value), [valueItem.id, valueItem.value]);

  return (
    <div className="grid grid-cols-[80px_1fr_140px] items-center px-3 py-2">
      <div className="font-medium">{valueItem.id}</div>
      <input
        className="rounded border border-neutral-300 px-2 py-1"
        value={label}
        onChange={(e) => setLabel(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") onSave(label);
        }}
      />
      <div className="flex gap-2">
        <button
          className="rounded border border-neutral-300 px-3 py-1.5"
          onClick={() => onSave(label)}
        >
          Lưu
        </button>
        <button
          className="rounded border border-red-300 bg-red-50 px-3 py-1.5 text-red-600"
          onClick={onDelete}
        >
          Xoá
        </button>
      </div>
    </div>
  );
}
