import React from "react";
import { AiOutlineHeart, AiOutlineEye } from "react-icons/ai";
import { HiOutlineSwitchHorizontal } from "react-icons/hi";
import { useCurrentApp } from "../context/AppContext";
import { toast } from "react-toastify";
import { addToWishlistApi } from "@/api/home.api";

type ProductCardProps = {
  productVariantId: number;
  name: string;
  imageUrl: string;
  discountPercent?: number;
  rating?: number;
  reviewCount?: number;
  originalPrice?: number;
  salePrice: number;
  stock: number;
  onAddToCart?: () => void;
  onClick?: () => void;
};

const formatCurrency = (value: number) =>
  new Intl.NumberFormat("vi-VN").format(value) + "đ";

export const ProductCard: React.FC<ProductCardProps> = ({
  productVariantId,
  name,
  imageUrl,
  discountPercent = 0,
  rating = 5,
  reviewCount = 0,
  originalPrice,
  salePrice,
  stock,
  onAddToCart,
  onClick,
}) => {
  const { isAuthenticated, reloadWishlistCount } = useCurrentApp();

  const handleAddWishlist = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();

    if (!isAuthenticated) {
      toast.info("Vui lòng đăng nhập để thêm sản phẩm yêu thích");
      return;
    }

    try {
      await addToWishlistApi(productVariantId);
      toast.success("Đã thêm vào danh sách yêu thích");
      await reloadWishlistCount(); // 👈 update count global
    } catch {
      toast.error("Không thể thêm vào danh sách yêu thích");
    }
  };
  return (
    <div
      onClick={onClick}
      className="group relative flex flex-col rounded-2xl bg-white border border-gray-200 
                 shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden cursor-pointer"
    >
      <div className="relative p-4 pb-2">
        {/* Badge giảm giá */}
        {discountPercent > 0 && (
          <div className="absolute left-4 top-4 bg-red-500 text-white text-xs px-2 py-1 rounded-md">
            {discountPercent}%
          </div>
        )}

        {/* ICON */}
        <div className="absolute right-4 top-4 flex flex-col gap-2">
          {/* Icon Yêu thích (luôn hiện) */}
          <button
            className="w-9 h-9 bg-white flex items-center justify-center rounded-full shadow-md"
            onClick={handleAddWishlist}
          >
            <AiOutlineHeart className="text-xl" />
          </button>

          {/* Icon Eye (hover mới hiện) */}
          <button
            className="w-9 h-9 bg-white flex items-center justify-center rounded-full shadow-md
                       opacity-0 translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition"
            onClick={(e) => e.stopPropagation()}
          >
            <AiOutlineEye className="text-xl" />
          </button>

          {/* Icon So sánh */}
          <button
            className="w-9 h-9 bg-white flex items-center justify-center rounded-full shadow-md
                       opacity-0 translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition"
            onClick={(e) => e.stopPropagation()}
          >
            <HiOutlineSwitchHorizontal className="text-xl" />
          </button>
        </div>

        {/* Ảnh */}
        <div className="aspect-[3/4] flex items-center justify-center">
          <img
            src={imageUrl}
            alt={name}
            className="object-contain max-h-full"
          />
        </div>
      </div>

      {/* Nội dung */}
      <div className="px-4 pb-4">
        <h3 className="text-sm font-semibold line-clamp-2 min-h-[40px]">
          {name}
        </h3>

        {/* Rating */}
        <div className="flex items-center gap-2 text-xs mt-2">
          <div className="text-yellow-400">
            {"★".repeat(rating)}
            {"☆".repeat(5 - rating)}
          </div>
          <span>{reviewCount} đánh giá</span>
        </div>

        {/* Giá */}
        <div className="mt-2">
          {originalPrice && originalPrice > salePrice && (
            <span className="line-through text-gray-400 text-sm">
              {formatCurrency(originalPrice)}
            </span>
          )}
          <div className="text-xl font-bold text-indigo-800">
            {formatCurrency(salePrice)}
          </div>
        </div>

        {/* Tồn kho */}
        <div className="text-sm text-emerald-600 mt-2 flex items-center gap-1">
          <span className="w-2 h-2 bg-emerald-600 rounded-full" />
          Còn lại : {stock}
        </div>

        {/* Nút thêm giỏ hàng */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onAddToCart?.();
          }}
          className="w-full bg-indigo-600  hover:bg-indigo-700 text-white py-3 rounded-full font-semibold mt-3
                     opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 transition"
        >
          Thêm giỏ hàng
        </button>
      </div>
    </div>
  );
};
