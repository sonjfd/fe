import { useEffect, useMemo, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import { ProductCard } from "@/components/client/ProductCard";
import {
  fetchCategoryAttributes,
  fetchVariantByCategory,
} from "@/api/home.api";

type PriceRangeKey = "RANGE_0_5" | "RANGE_5_15" | "RANGE_15_PLUS";

export default function CategoryPage() {
  const { id } = useParams();
  const cid = Number(id);

  const [rows, setRows] = useState<VariantFilter[]>([]);
  const [meta, setMeta] = useState({ page: 1, size: 12, total: 0 });
  const [loading, setLoading] = useState(false);

  const [page, setPage] = useState(1);
  const [size, setSize] = useState(12);
  const [sortTab, setSortTab] = useState<"newest" | "popular" | "asc" | "desc">(
    "newest"
  );

  const [priceRanges, setPriceRanges] = useState<PriceRangeKey[]>([]);

  const [attributeFilters, setAttributeFilters] = useState<AttributeFilter[]>(
    []
  );
  const [selectedAttrValues, setSelectedAttrValues] = useState<string[]>([]);

  const [pageInput, setPageInput] = useState(page);
  const inputRef = useRef<number | null>(null);

  useEffect(() => {
    if (!cid) return;

    (async () => {
      try {
        const res = await fetchCategoryAttributes(cid);

        setAttributeFilters(res.data ?? []);
      } catch (err) {
        console.error("API get attributes error:", err);
      }
    })();
  }, [cid]);

  const togglePriceRange = (value: PriceRangeKey) => {
    setPriceRanges((prev) =>
      prev.includes(value) ? prev.filter((v) => v !== value) : [...prev, value]
    );
    setPage(1);
    setPageInput(1);
  };

  const toggleAttributeValue = (value: string) => {
    setSelectedAttrValues((prev) =>
      prev.includes(value) ? prev.filter((v) => v !== value) : [...prev, value]
    );
    setPage(1);
    setPageInput(1);
  };

  const query = useMemo(() => {
    const params = new URLSearchParams();

    params.set("page", String(page));
    params.set("size", String(size));

    // sort
    switch (sortTab) {
      case "popular":
        params.set("sort", "popular");
        break;
      case "asc":
        params.set("sort", "price_asc");
        break;
      case "desc":
        params.set("sort", "price_desc");
        break;
      case "newest":
      default:
        params.set("sort", "createdAt_desc");
        break;
    }

    priceRanges.forEach((r) => {
      params.append("priceRanges", r);
    });

    selectedAttrValues.forEach((val) => {
      params.append("attributeValues", val);
    });

    return params.toString();
  }, [page, size, sortTab, priceRanges, selectedAttrValues]);

  const load = async () => {
    if (!cid) return;
    try {
      setLoading(true);
      const res = await fetchVariantByCategory(cid, query);
      const data = res.data;

      setRows(data?.items ?? []);
      setMeta({
        page: data?.page as number,
        size: data?.size ?? size,
        total: data?.total ?? 0,
      });

      setPageInput(data?.page as number);
    } catch (e) {
      console.error("API Error: ", e);
      setRows([]);
      setMeta({ page: 1, size, total: 0 });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query, cid]);

  const totalPages = Math.max(
    1,
    Math.ceil((meta.total || 0) / (meta.size || size))
  );

  const handleGoPrev = () => {
    setPage((p) => Math.max(1, p - 1));
  };

  const handleGoNext = () => {
    setPage((p) => Math.min(totalPages, p + 1));
  };

  const handleResetFilter = () => {
    setSortTab("newest");
    setPriceRanges([]);
    setSelectedAttrValues([]);
    setPage(1);
    setSize(12);
    setPageInput(1);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto">
        {loading ? (
          <div>Đang tải...</div>
        ) : (
          <>
            <div className="flex items-center justify-between mb-4">
              <h1 className="text-xl font-bold">Danh sách sản phẩm</h1>
              <button
                onClick={handleResetFilter}
                className="text-sm px-3 py-1 border rounded"
              >
                Xoá bộ lọc
              </button>
            </div>

            <div className="grid grid-cols-12 gap-6">
              {/* LEFT FILTER */}
              <aside className="col-span-3 bg-white p-4 rounded-lg shadow">
                <h2 className="font-semibold mb-3">Khoảng giá</h2>

                <label className="flex gap-2 mb-2">
                  <input
                    type="checkbox"
                    checked={priceRanges.includes("RANGE_0_5")}
                    onChange={() => togglePriceRange("RANGE_0_5")}
                  />
                  <span>0 - 5.000.000đ</span>
                </label>

                <label className="flex gap-2 mb-2">
                  <input
                    type="checkbox"
                    checked={priceRanges.includes("RANGE_5_15")}
                    onChange={() => togglePriceRange("RANGE_5_15")}
                  />
                  <span>5.000.000đ - 15.000.000đ</span>
                </label>

                <label className="flex gap-2 mb-2">
                  <input
                    type="checkbox"
                    checked={priceRanges.includes("RANGE_15_PLUS")}
                    onChange={() => togglePriceRange("RANGE_15_PLUS")}
                  />
                  <span>Trên 15.000.000đ</span>
                </label>

                <div className="mt-6">
                  <h2 className="font-semibold mb-3">Thuộc tính</h2>

                  {attributeFilters.map((attr, idx) => (
                    <div key={idx} className="mb-4">
                      <div className="font-medium text-sm mb-1">
                        {attr.name}
                      </div>

                      <div className="space-y-1 text-sm">
                        {attr.values.map((v, i) => (
                          <label
                            key={`${attr.name}-${v.value}-${i}`}
                            className="flex items-center gap-2 cursor-pointer"
                          >
                            <input
                              type="checkbox"
                              checked={selectedAttrValues.includes(v.value)}
                              onChange={() => toggleAttributeValue(v.value)}
                            />
                            <span>{v.value}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </aside>

              {/* RIGHT CONTENT */}
              <main className="col-span-9">
                {/* SORT + PAGE SIZE */}
                <div className="flex justify-between mb-4">
                  <div className="flex bg-gray-100 rounded-full p-1">
                    {[
                      { id: "newest", label: "Mới nhất" },
                      { id: "popular", label: "Phổ biến" },
                      { id: "asc", label: "Giá tăng" },
                      { id: "desc", label: "Giá giảm" },
                    ].map((t) => (
                      <button
                        key={t.id}
                        onClick={() => {
                          setSortTab(t.id as any);
                          setPage(1);
                          setPageInput(1);
                        }}
                        className={`px-3 py-1 rounded-full ${
                          sortTab === t.id
                            ? "bg-indigo-600 text-white"
                            : "text-gray-600"
                        }`}
                      >
                        {t.label}
                      </button>
                    ))}
                  </div>

                  <select
                    value={size}
                    onChange={(e) => {
                      setSize(Number(e.target.value));
                      setPage(1);
                      setPageInput(1);
                    }}
                    className="border px-2 py-1 rounded"
                  >
                    <option value={6}>6 / trang</option>
                    <option value={12}>12 / trang</option>
                    <option value={20}>20 / trang</option>
                  </select>
                </div>

                {/* PRODUCT GRID */}
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {rows.map((v) => (
                    <ProductCard
                      key={v.id}
                      productVariantId={v.id}
                      name={v.name}
                      imageUrl={v.thumbnail}
                      salePrice={v.price}
                      stock={v.stock}
                      rating={5}
                      reviewCount={0}
                      sku={v.sku}
                      productId={v.productId}
                    />
                  ))}
                </div>

                {/* PAGINATION + INPUT PAGE */}
                <div className="mt-6 flex justify-center items-center gap-4 text-sm">
                  <button
                    className="px-3 py-1 border rounded"
                    onClick={handleGoPrev}
                    disabled={page <= 1}
                  >
                    Trước
                  </button>

                  <div className="flex items-center gap-2">
                    <span>Trang</span>
                    <input
                      type="number"
                      value={pageInput}
                      min={1}
                      max={totalPages}
                      onChange={(e) => {
                        const raw = e.target.value;

                        // Nếu xóa trắng
                        if (raw === "") {
                          setPageInput(NaN);
                          return;
                        }

                        const num = Number(raw);
                        setPageInput(num);

                        // Xóa timeout cũ
                        if (inputRef.current) clearTimeout(inputRef.current);

                        // Sau 500ms user ngừng gõ → setPage
                        inputRef.current = window.setTimeout(() => {
                          if (!isNaN(num) && num >= 1) {
                            const validPage = Math.min(num, totalPages);
                            setPage(validPage);
                            setPageInput(validPage);
                          }
                        }, 500);
                      }}
                      className="w-14 border rounded px-2 py-1 text-center"
                    />

                    <span>/ {totalPages}</span>
                  </div>

                  <button
                    className="px-3 py-1 border rounded"
                    onClick={handleGoNext}
                    disabled={page >= totalPages}
                  >
                    Sau
                  </button>
                </div>
              </main>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
