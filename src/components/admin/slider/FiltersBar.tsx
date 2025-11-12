import React, { useEffect } from "react";
import { useForm } from "react-hook-form";

export interface FilterForm {
  keyword: string;
  active: "ALL" | "true" | "false";
  startDate?: string;
  endDate?: string;
  size: number;
}

export const FiltersBar: React.FC<{
  defaultValues: FilterForm;
  onChange: (v: {
    keyword: string;
    active: boolean | "ALL";
    startDate?: string;
    endDate?: string;
    size: number;
  }) => void;
}> = ({ defaultValues, onChange }) => {
  const { register, watch } = useForm<FilterForm>({
    defaultValues,
    mode: "onChange",
  });
  const values = watch();
  useEffect(() => {
    onChange({
      keyword: values.keyword,
      active: values.active === "ALL" ? "ALL" : values.active === "true",
      startDate: values.startDate || undefined,
      endDate: values.endDate || undefined,
      size: Number(values.size || 10),
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    values.keyword,
    values.active,
    values.startDate,
    values.endDate,
    values.size,
  ]);

  return (
    <div className="p-4 flex flex-wrap gap-3 items-center">
      <input
        {...register("keyword")}
        className="h-10 w-72 rounded-lg border-gray-200 focus:border-indigo-500 focus:ring-indigo-500"
        placeholder="Tìm theo tiêu đề/đường dẫn"
      />
      <select
        {...register("active")}
        className="h-10 rounded-lg border-gray-200 focus:border-indigo-500 focus:ring-indigo-500 text-sm"
      >
        <option value="ALL">Tất cả</option>
        <option value="true">Đang bật</option>
        <option value="false">Đang tắt</option>
      </select>
      <div className="flex items-center gap-2 text-sm">
        <input
          type="date"
          {...register("startDate")}
          className="h-10 rounded-lg border-gray-200"
        />
        <span>→</span>
        <input
          type="date"
          {...register("endDate")}
          className="h-10 rounded-lg border-gray-200"
        />
      </div>
      <div className="ml-auto flex gap-3 items-center">
        <select
          {...register("size", { valueAsNumber: true })}
          className="h-10 rounded-lg border-gray-200 focus:border-indigo-500 focus:ring-indigo-500 text-sm"
        >
          {[10, 20, 50].map((n) => (
            <option key={n} value={n}>
              {n}/page
            </option>
          ))}
        </select>
      </div>
    </div>
  );
};
