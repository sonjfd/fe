import { fetchProductDetail } from "@/api/home.api";
import React, { useEffect, useState } from "react";
import {
  useLocation,
  useNavigate,
  useParams,
  useSearchParams,
} from "react-router-dom";

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
  const { id } = useParams();
  const productId = Number(id);

  const [searchParams] = useSearchParams();
  const skuFromUrl = searchParams.get("sku") ?? "";

  const navigate = useNavigate();
  const location = useLocation();

  const [data, setData] = useState<ProductDetailDTO | null>(null);
  const [loading, setLoading] = useState(true);

  const [currentVariant, setCurrentVariant] = useState<VariantDTO | null>(null);
  const [selectedValueIds, setSelectedValueIds] = useState<number[]>([]);
  const [mainImage, setMainImage] = useState<string | null>(null);

  const [rating] = useState(4.6);
  const [totalReviews] = useState(37);

  const [newCommentName, setNewCommentName] = useState("");
  const [newCommentContent, setNewCommentContent] = useState("");
  const [newCommentRating, setNewCommentRating] = useState(5);

  const [comments, setComments] = useState<
    {
      id: number;
      name: string;
      rating: number;
      content: string;
      time: string;
    }[]
  >([
    {
      id: 1,
      name: "Nguyễn Minh",
      rating: 5,
      content: "Máy dùng mượt, pin trâu, camera quá ổn trong tầm giá.",
      time: "2 ngày trước",
    },
    {
      id: 2,
      name: "Trần Hoa",
      rating: 4,
      content: "Màu vàng đẹp, giao hàng nhanh, đóng gói cẩn thận.",
      time: "1 tuần trước",
    },
  ]);

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

  const attributes = data?.attributes ?? [];
  const variants = data?.variants ?? [];

  const handleChooseValue = (attributeId: number, valueId: number) => {
    if (!data || !variants.length) return;

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
        setCurrentVariant(matched);
        setMainImage(matched.thumbnail || data.images[0] || null);

        if (matched.sku) {
          const params = new URLSearchParams(location.search);
          params.set("sku", matched.sku);
          navigate(`${location.pathname}?${params.toString()}`, {
            replace: true,
          });
        }
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

  const handleSubmitComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCommentName.trim() || !newCommentContent.trim()) return;

    setComments((prev) => [
      {
        id: prev.length + 1,
        name: newCommentName.trim(),
        rating: newCommentRating,
        content: newCommentContent.trim(),
        time: "Vừa xong",
      },
      ...prev,
    ]);

    setNewCommentName("");
    setNewCommentContent("");
    setNewCommentRating(5);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-gray-700 font-medium">Đang tải sản phẩm...</div>
      </div>
    );
  }

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
          <div>
            <div className="rounded-2xl overflow-hidden border border-gray-100 bg-gray-50 flex items-center justify-center mb-4">
              <img
                src={mainImage ?? data.images[0]}
                alt={currentVariant.name}
                className="w-full h-[320px] md:h-[380px] object-contain"
              />
            </div>

            <div className="flex gap-3 overflow-x-auto pb-1">
              {[currentVariant.thumbnail, ...data.images].map((img, idx) => {
                if (!img) return null;
                const key = `${img}-${idx}`;
                const isActive = mainImage === img;
                return (
                  <button
                    key={key}
                    onClick={() => setMainImage(img)}
                    className={`min-w-[72px] h-[72px] rounded-xl overflow-hidden border ${
                      isActive
                        ? "border-gray-500 ring-1 ring-gray-300"
                        : "border-gray-100 hover:border-gray-300"
                    } bg-gray-50`}
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

          <div className="flex flex-col">
            <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
              <span className="flex items-center gap-1">
                <span className="text-yellow-400">{renderStars(5)}</span>
                <span className="ml-1 text-xs text-gray-500">
                  {rating.toFixed(1)} / 5 ({totalReviews} đánh giá)
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
                          disabled={!available}
                          onClick={() => handleChooseValue(attr.id, val.id)}
                          className={[
                            "px-3 py-1 rounded-full border text-sm transition",
                            available
                              ? active
                                ? "bg-gray-800 text-white border-gray-800 shadow-sm"
                                : "bg-white text-gray-800 border-gray-200 hover:border-gray-400"
                              : "bg-gray-50 text-gray-300 border-gray-100 cursor-not-allowed",
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

            <div className="mt-4 flex gap-3">
              <button className="flex-1 bg-gray-800 hover:bg-gray-900 text-white font-semibold py-3 rounded-full shadow-md shadow-gray-200 transition">
                Thêm vào giỏ hàng
              </button>
              <button className="px-5 py-3 rounded-full border border-gray-300 text-gray-700 text-sm font-medium bg-white hover:bg-gray-50">
                Mua ngay
              </button>
            </div>
          </div>
        </div>

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
              <h2 className="text-lg font-semibold text-gray-900 mb-3">
                Đánh giá & bình luận
              </h2>

              <div className="flex items-center gap-3 mb-3">
                <div className="text-3xl font-bold text-gray-800">
                  {rating.toFixed(1)}
                </div>
                <div>
                  <div className="text-yellow-400 text-lg leading-none">
                    {renderStars(Math.round(rating))}
                  </div>
                  <div className="text-xs text-gray-500">
                    {totalReviews} lượt đánh giá
                  </div>
                </div>
              </div>

              <form className="space-y-2 mb-4" onSubmit={handleSubmitComment}>
                <input
                  type="text"
                  placeholder="Tên của bạn"
                  value={newCommentName}
                  onChange={(e) => setNewCommentName(e.target.value)}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-gray-400"
                />
                <textarea
                  rows={3}
                  placeholder="Chia sẻ cảm nhận về sản phẩm..."
                  value={newCommentContent}
                  onChange={(e) => setNewCommentContent(e.target.value)}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-gray-400"
                />
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1 text-sm">
                    <span className="text-gray-700">Đánh giá:</span>
                    {[1, 2, 3, 4, 5].map((v) => (
                      <button
                        key={v}
                        type="button"
                        onClick={() => setNewCommentRating(v)}
                      >
                        <span
                          className={
                            v <= newCommentRating
                              ? "text-yellow-400 text-lg"
                              : "text-gray-300 text-lg"
                          }
                        >
                          ★
                        </span>
                      </button>
                    ))}
                  </div>
                  <button
                    type="submit"
                    className="px-3 py-1.5 rounded-full bg-gray-800 text-white text-xs font-medium hover:bg-gray-900"
                  >
                    Gửi đánh giá
                  </button>
                </div>
              </form>

              <div className="space-y-3 max-h-60 overflow-y-auto pr-1">
                {comments.map((c) => (
                  <div
                    key={c.id}
                    className="border border-gray-100 rounded-lg px-3 py-2 text-xs"
                  >
                    <div className="flex justify-between mb-1">
                      <span className="font-semibold text-gray-800">
                        {c.name}
                      </span>
                      <span className="text-gray-400">{c.time}</span>
                    </div>
                    <div className="text-yellow-400 text-sm">
                      {renderStars(c.rating)}
                    </div>
                    <p className="mt-1 text-gray-700">{c.content}</p>
                  </div>
                ))}
                {comments.length === 0 && (
                  <div className="text-xs text-gray-500">
                    Chưa có bình luận nào, hãy là người đầu tiên!
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetailPage;
