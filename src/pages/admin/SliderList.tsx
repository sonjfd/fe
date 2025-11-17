// SliderList.tsx (refactor cho đồng bộ với TableCategory / CategoryList)

import React, { useEffect, useMemo, useState } from "react";
import {
  listSliders,
  getSliderById,
  deleteSlider,
  updateSliderActive,
  updateSliderPosition,
} from "@/api/admin.slider.api";
import type { Slider } from "@/api/admin.slider.api";
import { toast } from "react-toastify";

import { FiltersBar } from "@/components/admin/slider/FiltersBar";
import { SliderTable } from "@/components/admin/slider/SliderTable";
import { SliderModal } from "@/components/admin/slider/SliderModal";

export default function SliderList() {
  // filters
  const [filters, setFilters] = useState<{
    keyword: string;
    active: boolean | "ALL";
    startDate?: string;
    endDate?: string;
    size: number;
  }>({
    keyword: "",
    active: "ALL",
    startDate: undefined,
    endDate: undefined,
    size: 10,
  });

  const [page, setPage] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [rows, setRows] = useState<Slider[]>([]);
  const [total, setTotal] = useState(0);

  const totalPages = useMemo(
    () => Math.max(1, Math.ceil(total / filters.size)),
    [total, filters.size]
  );

  // modal state
  const [openModal, setOpenModal] = useState(false);
  const [editing, setEditing] = useState<Slider | null>(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);

      const res = await listSliders({
        page,
        size: filters.size,
        keyword: filters.keyword,
        active: filters.active === "ALL" ? undefined : Boolean(filters.active),
        startDate: filters.startDate,
        endDate: filters.endDate,
        sort: "createdAt,desc",
      });

      const items = res?.items ?? [];
      const totalCount = res?.total ?? 0;

      setRows(items);
      setTotal(totalCount);
    } catch (e: any) {
      setError(e?.message || "Lỗi tải dữ liệu");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, filters]);

  const handleCreate = () => {
    setEditing(null);
    setOpenModal(true);
  };

  const handleEdit = async (id: number) => {
    const slider = await getSliderById(id);
    setEditing(slider);
    setOpenModal(true);
  };

  const handleToggleActive = async (s: Slider) => {
    try {
      await updateSliderActive(s.id, !s.active);
      await fetchData();
      toast.success("Đã cập nhật trạng thái");
    } catch (e: any) {
      toast.error(e?.message || "Lỗi cập nhật trạng thái");
    }
  };

  const handleChangePosition = async (s: Slider, pos: number) => {
    try {
      await updateSliderPosition(s.id, pos);
      await fetchData();
      toast.success("Đã cập nhật vị trí");
    } catch (e: any) {
      toast.error(e?.message || "Lỗi cập nhật vị trí");
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Xoá slider này?")) return;
    try {
      await deleteSlider(id);
      await fetchData();
      toast.success("Đã xoá slider");
    } catch (e: any) {
      toast.error(e?.message || "Lỗi xoá slider");
    }
  };

  return (
    <div className="rounded-lg border border-neutral-200 bg-white">
      {/* Header giống TableCategory */}
      <div className="flex items-center justify-between border-b border-neutral-200 p-4">
        <h2 className="text-lg font-semibold">Sliders</h2>
        <button
          onClick={handleCreate}
          className="rounded-md border border-neutral-300 px-3 py-2 text-sm"
        >
          + Tạo slider
        </button>
      </div>

      {/* Filters (tương tự section filter của TableCategory) */}
      <FiltersBar
        defaultValues={{
          keyword: filters.keyword,
          active:
            filters.active === "ALL"
              ? "ALL"
              : String(filters.active) === "true"
              ? "true"
              : "false",
          startDate: filters.startDate,
          endDate: filters.endDate,
          size: filters.size,
        }}
        onChange={(v) => {
          setPage(0);
          setFilters(v);
        }}
      />

      {/* Table + phân trang (SliderTable đã có footer phân trang riêng) */}
      <SliderTable
        rows={rows}
        loading={loading}
        error={error}
        page={page}
        size={filters.size}
        total={total}
        totalPages={totalPages}
        onPrev={() => setPage((p) => Math.max(0, p - 1))}
        onNext={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
        onGoto={(n) => setPage(n)}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onToggleActive={handleToggleActive}
        onChangePosition={handleChangePosition}
      />

      {/* Modal tạo / sửa slider */}
      <SliderModal
        open={openModal}
        onClose={() => setOpenModal(false)}
        initial={editing}
        onSaved={fetchData}
      />
    </div>
  );
}
