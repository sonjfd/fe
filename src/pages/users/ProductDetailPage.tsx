import { addToCartApi } from "@/api/cart.api";
import { fetchProductDetail } from "@/api/home.api";
import {
  fetchProductReviews,
  saveRating,
  deleteRating,
  type RatingResDTO,
} from "@/api/rating.api";
import { useCurrentApp } from "@/components/context/AppContext";
import React, { useEffect, useState } from "react";
import {
  useLocation,
  useNavigate,
  useParams,
  useSearchParams,
} from "react-router-dom";
import { toast } from "react-toastify";

const formatCurrency = (value: number) =>
  new Intl.NumberFormat("vi-VN").format(value) + "₫";

const renderStars = (rating: number) => {
  const total = 5;
  const stars = [];
  for (let i = 1; i <= total; i++) {
    stars.push(
      <span
        key={i}
        className={i <= rating ? "text-yellow-400" : "text-gray-300"}
      >
        ★
      </span>
    );
  }
  return stars;
};

const ProductDetailPage: React.FC = () => {
  const { reloadCart, user, isAuthenticated } = useCurrentApp();
  const { id } = useParams();
  const productId = Number(id);

  const [searchParams] = useSearchParams();
  const skuFromUrl = searchParams.get("sku") ?? "";

  const navigate = useNavigate();
  const location = useLocation();

  const [data, setData] = useState<ProductDetailDTO | null>(null);
  const [loading, setLoading] = useState(true); // loading toàn trang
  const [variantLoading, setVariantLoading] = useState(false); // loading khi đổi variant

  const [currentVariant, setCurrentVariant] = useState<VariantDTO | null>(null);
  const [selectedValueIds, setSelectedValueIds] = useState<number[]>([]);
  const [mainImage, setMainImage] = useState<string | null>(null);

  // ---- RATING ONLY ----
  const [reviewLoading, setReviewLoading] = useState(false);
  const [averageRating, setAverageRating] = useState<number>(0);
  const [totalRatings, setTotalRatings] = useState<number>(0);
  const [ratings, setRatings] = useState<RatingResDTO[]>([]);

  const [myRatingId, setMyRatingId] = useState<number | null>(null);
  const [myRatingScore, setMyRatingScore] = useState<number>(5);
  const [myRatingContent, setMyRatingContent] = useState<string>("");

  const [quantity, setQuantity] = useState<string>("1");

  // ----- LOAD PRODUCT DETAIL -----
  useEffect(() => {
    if (!productId) return;

    (async () => {
      try {
        setLoading(true);
        const res = await fetchProductDetail(productId, skuFromUrl);
        if (!res.data) return;

        const product = res.data as ProductDetailDTO;
        setData(product);

        const variants = product.variants || [];
        let defVariant: VariantDTO | undefined;

        if (product.defaultVariantId) {
          defVariant = variants.find((v) => v.id === product.defaultVariantId);
        }
        if (!defVariant && variants.length > 0) {
          defVariant = variants[0];
        }

        if (!defVariant) {
          setCurrentVariant(null);
          return;
        }

        setCurrentVariant(defVariant);
        setSelectedValueIds(defVariant.valueIds ?? []);
        setMainImage(defVariant.thumbnail || product.images[0] || null);
      } finally {
        setLoading(false);
      }
    })();
  }, [productId, skuFromUrl]);

  // ----- LOAD RATING LIST -----
  const loadReviews = React.useCallback(async () => {
    if (!productId) return;
    try {
      setReviewLoading(true);
      const res = await fetchProductReviews(productId);
      if (!res) return;

      setAverageRating(res.averageRating ?? 0);
      setTotalRatings(res.totalRatings ?? 0);
      setRatings(res.ratings ?? []);

      if (res.myRating) {
        setMyRatingId(res.myRating.id);
        setMyRatingScore(res.myRating.score);
        setMyRatingContent(res.myRating.content ?? "");
      } else {
        setMyRatingId(null);
        setMyRatingScore(5);
        setMyRatingContent("");
      }
    } catch (error) {
      console.error(error);
      toast.error("Không thể tải đánh giá sản phẩm");
    } finally {
      setReviewLoading(false);
    }
  }, [productId]);

  useEffect(() => {
    loadReviews();
  }, [loadReviews]);

  const attributes = data?.attributes ?? [];
  const variants = data?.variants ?? [];

  const handleChooseValue = (attributeId: number, valueId: number) => {
    if (!data || !variants.length || variantLoading) return;

    const attr = data.attributes.find((a) => a.id === attributeId);
    if (!attr) return;

    const attrValueIds = attr.values.map((v) => v.id);

    setSelectedValueIds((prev) => {
      const filtered = prev.filter((id) => !attrValueIds.includes(id));
      const next = [...filtered, valueId];

      const sorted = [...next].sort((a, b) => a - b);
      const matched = variants.find((v) => {
        const vs = [...v.valueIds].sort((x, y) => x - y);
        if (vs.length !== sorted.length) return false;
        return vs.every((id, idx) => id === sorted[idx]);
      });

      if (matched) {
        // Bắt đầu loading khi đổi variant
        setVariantLoading(true);

        setTimeout(() => {
          setCurrentVariant(matched);
          setMainImage(matched.thumbnail || data.images[0] || null);

          if (matched.sku) {
            const params = new URLSearchParams(location.search);
            params.set("sku", matched.sku);
            navigate(`${location.pathname}?${params.toString()}`, {
              replace: true,
            });
          }

          setVariantLoading(false);
        }, 1000);
      }

      return next;
    });
  };

  const isOptionAvailable = (attributeId: number, valueId: number): boolean => {
    if (!data) return false;

    return variants.some((variant) => {
      if (!variant.valueIds.includes(valueId)) return false;

      for (const selected of selectedValueIds) {
        if (selected === valueId) continue;

        const selectedAttr = data.attributes.find((attr) =>
          attr.values.some((v) => v.id === selected)
        );
        if (!selectedAttr) continue;

        if (selectedAttr.id === attributeId) continue;

        if (!variant.valueIds.includes(selected)) return false;
      }
      return true;
    });
  };
  const isCanRate = isAuthenticated && user?.role === "USER";

  // ---- SUBMIT / DELETE RATING ----
  const handleSubmitRating = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!productId) return;

    if (!isAuthenticated) {
      navigate(
        `/login?redirect=${encodeURIComponent(
          location.pathname + location.search
        )}`
      );
      return;
    }

    // Kiểm tra hợp lệ
    if (!myRatingScore || myRatingScore < 1 || myRatingScore > 5) {
      toast.error("Vui lòng chọn số sao hợp lệ");
      return;
    }

    if (!myRatingContent.trim()) {
      toast.error("Vui lòng nhập nội dung đánh giá");
      return;
    }

    try {
      await saveRating(productId, {
        score: myRatingScore,
        content: myRatingContent.trim(),
      });

      toast.success(
        myRatingId ? "Cập nhật đánh giá thành công" : "Gửi đánh giá thành công"
      );

      await loadReviews();
    } catch (error: any) {
      console.error(error);
      toast.error(
        error?.response?.data?.message ||
          "Không thể gửi đánh giá, vui lòng thử lại"
      );
    }
  };

  const handleDeleteRating = async () => {
    if (!productId) return;

    try {
      await deleteRating(productId);
      toast.success("Xóa đánh giá thành công");
      await loadReviews();
    } catch (error: any) {
      console.error(error);
      toast.error(
        error?.response?.data?.message ||
          "Không thể xóa đánh giá, vui lòng thử lại"
      );
    }
  };

  const quantityNumber = Number(quantity);
  const isQuantityValid =
    quantity.trim() !== "" &&
    !Number.isNaN(quantityNumber) &&
    quantityNumber >= 1 &&
    quantityNumber < (currentVariant?.stock ?? 0);

  const handleAddToCard = async (id: number, quantity: number) => {
    if (!isAuthenticated) {
      toast.info("Vui lòng đăng nhập để thêm sản phẩm vào giỏ hàng");
      navigate(`/login?redirect=${encodeURIComponent(location.pathname)}`);
      return;
    }

    const payload = {
      variantId: id,
      quantity: Number(quantity),
    };
    const res = await addToCartApi(payload);
    if (res.data) {
      toast.success("Thêm vào giỏ hàng thành công");
      reloadCart();
    } else {
      toast.error(res.message);
    }
  };

  // ================== SKELETON LOADING NHƯ SHOPEE ==================
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 px-4 py-8">
        <div className="max-w-6xl mx-auto bg-white rounded-2xl shadow-md border border-gray-100 overflow-hidden animate-pulse">
          <div className="px-6 pt-6 pb-3 border-b border-gray-100 bg-gradient-to-r from-gray-50 via-white to-gray-50">
            <div className="h-5 w-2/3 bg-gray-200 rounded mb-2" />
            <div className="h-4 w-40 bg-gray-100 rounded" />
          </div>

          <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Skeleton ảnh */}
            <div>
              <div className="rounded-2xl overflow-hidden border border-gray-100 bg-gray-100 flex items-center justify-center mb-4 h-[320px] md:h-[380px]" />
              <div className="flex gap-3">
                {Array.from({ length: 4 }).map((_, idx) => (
                  <div
                    key={idx}
                    className="min-w-[72px] h-[72px] rounded-xl bg-gray-100"
                  />
                ))}
              </div>
            </div>

            {/* Skeleton info */}
            <div className="flex flex-col">
              <div className="h-4 w-40 bg-gray-200 rounded mb-3" />
              <div className="flex items-end gap-3 mb-4">
                <div className="h-8 w-32 bg-gray-200 rounded" />
                <div className="h-4 w-24 bg-gray-100 rounded" />
              </div>

              <div className="space-y-4 border-t border-gray-100 pt-4 mt-2 flex-1">
                {Array.from({ length: 2 }).map((_, idx) => (
                  <div key={idx}>
                    <div className="h-4 w-32 bg-gray-200 rounded mb-2" />
                    <div className="flex flex-wrap gap-2">
                      {Array.from({ length: 4 }).map((_, i) => (
                        <div
                          key={i}
                          className="px-6 py-2 rounded-full bg-gray-100"
                        />
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-4 space-y-3">
                <div className="flex items-center gap-3">
                  <div className="h-4 w-16 bg-gray-200 rounded" />
                  <div className="h-9 w-24 bg-gray-100 rounded" />
                </div>
                <div className="h-11 w-full bg-gray-200 rounded-full" />
              </div>
            </div>
          </div>

          <div className="px-6 pb-8 border-t border-gray-100 bg-gray-50/50">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-6">
              <div className="md:col-span-2 bg-white border border-gray-100 rounded-xl p-4 shadow-sm">
                <div className="h-5 w-32 bg-gray-200 rounded mb-3" />
                <div className="space-y-2">
                  <div className="h-3 w-full bg-gray-100 rounded" />
                  <div className="h-3 w-5/6 bg-gray-100 rounded" />
                  <div className="h-3 w-3/4 bg-gray-100 rounded" />
                </div>
              </div>

              <div className="bg-white border border-gray-100 rounded-xl p-4 shadow-sm">
                <div className="flex items-center justify-between mb-3">
                  <div className="h-5 w-32 bg-gray-200 rounded" />
                  <div className="h-3 w-16 bg-gray-100 rounded" />
                </div>
                <div className="h-24 bg-gray-50 rounded-lg border border-gray-100" />
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
  // ================== END SKELETON ==================

  if (!data || !currentVariant) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-red-500 font-medium">
          Không tìm thấy thông tin sản phẩm
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 px-4 py-8">
      <div className="max-w-6xl mx-auto bg-white rounded-2xl shadow-md border border-gray-100 overflow-hidden">
        <div className="px-6 pt-6 pb-3 border-b border-gray-100 bg-gradient-to-r from-gray-50 via-white to-gray-50">
          <h1 className="text-xl md:text-2xl font-semibold text-gray-900">
            {data.name} {currentVariant.name}
          </h1>
          <div className="text-xs text-gray-500 mt-1">
            Mã sản phẩm:{" "}
            <span className="font-mono bg-gray-50 px-2 py-0.5 rounded-full border border-gray-100">
              {data.code}
            </span>
          </div>
        </div>

        <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Hình ảnh + thumbnail */}
          <div>
            <div className="relative rounded-2xl overflow-hidden border border-gray-100 bg-gray-50 flex items-center justify-center mb-4">
              <img
                src={mainImage ?? data.images[0]}
                alt={currentVariant.name}
                className={`w-full h-[320px] md:h-[380px] object-contain transition-opacity duration-200 ${
                  variantLoading ? "opacity-60" : "opacity-100"
                }`}
              />

              {variantLoading && (
                <div className="absolute inset-0 flex items-center justify-center bg-white/50">
                  <div className="h-9 w-9 rounded-full border-2 border-gray-300 border-t-transparent animate-spin" />
                </div>
              )}
            </div>

            <div className="flex gap-3 overflow-x-auto pb-1">
              {[currentVariant.thumbnail, ...data.images].map((img, idx) => {
                if (!img) return null;
                const key = `${img}-${idx}`;
                const isActive = mainImage === img;
                return (
                  <button
                    key={key}
                    onClick={() => !variantLoading && setMainImage(img)}
                    className={`min-w-[72px] h-[72px] rounded-xl overflow-hidden border ${
                      isActive
                        ? "border-gray-500 ring-1 ring-gray-300"
                        : "border-gray-100 hover:border-gray-300"
                    } bg-gray-50`}
                    disabled={variantLoading}
                  >
                    <img
                      src={img}
                      alt={`thumb-${idx}`}
                      className="w-full h-full object-cover"
                    />
                  </button>
                );
              })}
            </div>
          </div>

          {/* Thông tin sản phẩm + variant + add to cart */}
          <div className="flex flex-col relative">
            {variantLoading && (
              <div className="absolute inset-0 bg-white/40 pointer-events-none rounded-xl" />
            )}

            <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
              <span className="flex items-center gap-1">
                <span className="text-yellow-400">
                  {renderStars(Math.round(averageRating || 0))}
                </span>
                <span className="ml-1 text-xs text-gray-500">
                  {averageRating.toFixed(1)} / 5 ({totalRatings} lượt đánh giá)
                </span>
              </span>
            </div>

            <div className="flex items-end gap-3 mb-4">
              <div className="text-3xl font-bold text-gray-800">
                {formatCurrency(currentVariant.price)}
              </div>
              <div className="text-xs text-gray-500">
                Còn lại{" "}
                <span className="font-semibold text-gray-700">
                  {currentVariant.stock}
                </span>{" "}
                sản phẩm
              </div>
            </div>

            <div className="space-y-4 border-t border-gray-100 pt-4 mt-2 flex-1">
              {attributes.map((attr) => (
                <div key={attr.id}>
                  <div className="text-sm font-medium text-gray-900 mb-2">
                    {attr.name}
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {attr.values.map((val) => {
                      const active = selectedValueIds.includes(val.id);
                      const available = isOptionAvailable(attr.id, val.id);

                      return (
                        <button
                          key={val.id}
                          disabled={!available || variantLoading}
                          onClick={() => handleChooseValue(attr.id, val.id)}
                          className={[
                            "px-3 py-1 rounded-full border text-sm transition",
                            !available || variantLoading
                              ? "bg-gray-50 text-gray-300 border-gray-100 cursor-not-allowed"
                              : active
                              ? "bg-gray-800 text-white border-gray-800 shadow-sm"
                              : "bg-white text-gray-800 border-gray-200 hover:border-gray-400",
                          ].join(" ")}
                        >
                          {val.value}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-4 space-y-3">
              <div className="flex items-center gap-3">
                <span className="text-sm text-gray-700">Số lượng:</span>
                <input
                  type="number"
                  inputMode="numeric"
                  min={1}
                  max={currentVariant.stock - 1}
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                  disabled={variantLoading}
                  className={[
                    "w-24 border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1",
                    isQuantityValid
                      ? "border-gray-300 focus:ring-gray-400"
                      : "border-red-400 focus:ring-red-400",
                  ].join(" ")}
                />
                <span className="text-xs text-gray-500">
                  Còn lại {currentVariant.stock} sản phẩm
                </span>
              </div>

              {!isQuantityValid && (
                <div className="text-xs text-red-500">
                  Vui lòng nhập số lượng từ 1 đến {currentVariant.stock}.
                </div>
              )}

              <div className="flex gap-3">
                <button
                  className={[
                    "flex-1 bg-gray-800 text-white font-semibold py-3 rounded-full shadow-md shadow-gray-200 transition",
                    isQuantityValid && !variantLoading
                      ? "hover:bg-gray-900 cursor-pointer"
                      : "opacity-60 cursor-not-allowed",
                  ].join(" ")}
                  disabled={!isQuantityValid || variantLoading}
                  onClick={() => {
                    handleAddToCard(currentVariant.id, Number(quantity));
                  }}
                >
                  Thêm vào giỏ hàng
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Mô tả sản phẩm + ĐÁNH GIÁ */}
        <div className="px-6 pb-8 border-t border-gray-100 bg-gray-50/50">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-6">
            <div className="md:col-span-2 bg-white border border-gray-100 rounded-xl p-4 shadow-sm">
              <h2 className="text-lg font-bold text-gray-900 mb-3">
                Mô tả sản phẩm
              </h2>
              <div
                className="prose prose-sm max-w-none text-gray-900 prose-p:mb-2"
                dangerouslySetInnerHTML={{ __html: data.description }}
              />
            </div>

            <div className="bg-white border border-gray-100 rounded-xl p-4 shadow-sm">
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-lg font-semibold text-gray-900">
                  Đánh giá sản phẩm
                </h2>
                <span className="text-xs text-gray-500">
                  {totalRatings} lượt đánh giá
                </span>
              </div>

              {/* FORM ĐÁNH GIÁ CỦA BẠN */}
              <form
                className="space-y-2 mb-4 border border-gray-100 rounded-lg p-3 bg-gray-50/70"
                onSubmit={handleSubmitRating}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-medium text-gray-800">
                    Đánh giá của bạn
                  </span>
                  {!isCanRate && (
                    <span className="text-[11px] text-red-500">
                      Bạn cần đăng nhập để đánh giá
                    </span>
                  )}
                  {isCanRate && myRatingId && (
                    <span className="text-[11px] px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-100">
                      Bạn đã đánh giá sản phẩm này
                    </span>
                  )}
                </div>

                <textarea
                  rows={3}
                  placeholder={
                    isCanRate
                      ? "Chia sẻ cảm nhận về sản phẩm..."
                      : "Vui lòng đăng nhập để đánh giá"
                  }
                  value={myRatingContent}
                  onChange={(e) => setMyRatingContent(e.target.value)}
                  disabled={!isCanRate || reviewLoading}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-gray-400 disabled:bg-gray-100"
                />

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1 text-sm">
                    {[1, 2, 3, 4, 5].map((v) => (
                      <button
                        key={v}
                        type="button"
                        onClick={() => isCanRate && setMyRatingScore(v)}
                        disabled={!isCanRate}
                      >
                        <span
                          className={
                            v <= myRatingScore
                              ? "text-yellow-400 text-lg"
                              : "text-gray-300 text-lg"
                          }
                        >
                          ★
                        </span>
                      </button>
                    ))}
                  </div>
                  <div className="flex items-center gap-2">
                    {isCanRate && myRatingId && (
                      <button
                        type="button"
                        onClick={handleDeleteRating}
                        className="px-2 py-1 rounded-md border border-red-300 text-[11px] text-red-600 hover:bg-red-50 transition"
                      >
                        Xóa
                      </button>
                    )}
                    <button
                      type="submit"
                      disabled={!isCanRate || reviewLoading}
                      className="px-2.5 py-1 rounded-md bg-gray-800 text-white text-[11px] font-medium hover:bg-gray-900 disabled:opacity-60 transition"
                    >
                      {myRatingId ? "Cập nhật" : "Gửi đánh giá"}
                    </button>
                  </div>
                </div>
              </form>

              {/* DANH SÁCH ĐÁNH GIÁ */}
              <div className="space-y-3 max-h-64 overflow-y-auto pr-1">
                {reviewLoading && (
                  <div className="text-xs text-gray-500">
                    Đang tải đánh giá...
                  </div>
                )}
                {!reviewLoading && ratings.length === 0 && (
                  <div className="text-xs text-gray-500">
                    Chưa có đánh giá nào, hãy là người đầu tiên!
                  </div>
                )}

                {ratings.map((r) => (
                  <div
                    key={r.id}
                    className="border border-gray-100 rounded-lg px-3 py-2 text-xs bg-white"
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-semibold text-gray-800">
                        {r.userName}
                      </span>
                      <span className="text-gray-400 text-[11px]">
                        {new Date(r.createdAt).toLocaleString("vi-VN")}
                      </span>
                    </div>
                    <div className="text-yellow-400 text-sm mb-1">
                      {renderStars(r.score)}
                    </div>
                    <p className="text-gray-700 whitespace-pre-line">
                      {r.content}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetailPage;
