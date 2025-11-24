/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable react-hooks/rules-of-hooks */
import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import {
  updateCartQuantityApi,
  removeCartItemApi
} from "@/api/cart.api";
import { toast } from "react-toastify";
import { useCurrentApp } from "@/components/context/AppContext";

const formatCurrency = (value: number) =>
  new Intl.NumberFormat("vi-VN").format(value) + "đ";

export const CartPage: React.FC = () => {
  const { isAuthenticated, cart, cartCount, reloadCart } = useCurrentApp();
  const navigate = useNavigate();
  const location = useLocation();

  // Nếu chưa login → đẩy sang login
  useEffect(() => {
    if (!isAuthenticated) {
      navigate(`/login?redirect=${encodeURIComponent(location.pathname)}`);
    }
  }, [isAuthenticated, navigate, location.pathname]);

  if (!isAuthenticated) {
    return null;
  }

  const [isUpdating, setIsUpdating] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
  const [localQuantities, setLocalQuantities] = useState<Record<number, string>>({});

// Lưu timer cho từng item để debounce
const debounceTimers = React.useRef<Record<number, number | undefined>>({});


  // Mỗi khi giỏ hàng thay đổi → mặc định chọn hết (giống Shopee)
  useEffect(() => {
    if (cart && cart.items.length > 0) {
      setSelectedIds(new Set(cart.items.map((i) => i.id)));
    } else {
      setSelectedIds(new Set());
    }
  }, [cart]);

  useEffect(() => {
  if (cart && cart.items.length > 0) {
    setSelectedIds(new Set(cart.items.map((i) => i.id)));
    setLocalQuantities(
      cart.items.reduce((acc, item) => {
        acc[item.id] = String(item.quantity);
        return acc;
      }, {} as Record<number, string>)
    );
  } else {
    setSelectedIds(new Set());
    setLocalQuantities({});
  }
}, [cart]);


  const DEBOUNCE_MS = 600;

const handleInputQuantityChange = (item: ICartItem, value: string) => {
  // Cập nhật state local hiển thị
  setLocalQuantities((prev) => ({
    ...prev,
    [item.id]: value,
  }));

  // Clear timer cũ
  const old = debounceTimers.current[item.id];
  if (old) clearTimeout(old);

  // Set timer mới
  debounceTimers.current[item.id] = window.setTimeout(() => {
    // Parse sang số
    const parsed = parseInt(value, 10);

    // Nếu không phải số hợp lệ → revert về quantity cũ
    if (isNaN(parsed) || parsed < 1) {
      setLocalQuantities((prev) => ({
        ...prev,
        [item.id]: String(item.quantity),
      }));
      return;
    }

    // Nếu không thay đổi thì thôi
    if (parsed === item.quantity) return;

    handleChangeQuantity(item, parsed);
  }, DEBOUNCE_MS);
};

const handleQuantityBlur = (item: ICartItem) => {
  const value = localQuantities[item.id];
  const parsed = parseInt(value, 10);

  if (isNaN(parsed) || parsed < 1) {
    setLocalQuantities((prev) => ({
      ...prev,
      [item.id]: String(item.quantity),
    }));
    return;
  }

  if (parsed !== item.quantity) {
    handleChangeQuantity(item, parsed);
  }
};


  const isAllSelected =
    cart && cart.items.length > 0
      ? selectedIds.size === cart.items.length
      : false;

  const handleToggleAll = () => {
    if (!cart) return;
    if (isAllSelected) {
      // Bỏ chọn tất cả
      setSelectedIds(new Set());
    } else {
      // Chọn tất cả
      setSelectedIds(new Set(cart.items.map((i) => i.id)));
    }
  };

  const handleToggleOne = (item: ICartItem) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(item.id)) {
        next.delete(item.id);
      } else {
        next.add(item.id);
      }
      return next;
    });
  };

  const selectedItems: ICartItem[] = useMemo(() => {
    if (!cart) return [];
    return cart.items.filter((i) => selectedIds.has(i.id));
  }, [cart, selectedIds]);

  const selectedTotal = useMemo(
    () => selectedItems.reduce((sum, item) => sum + item.total, 0),
    [selectedItems]
  );

  const handleChangeQuantity = async (item: ICartItem, newQuantity: number) => {
    if (newQuantity <= 0) {
      const ok = window.confirm(
        "Bạn có chắc muốn xóa sản phẩm này khỏi giỏ hàng?"
      );
      if (!ok) return;
      return handleRemoveItem(item);
    }

    try {
      setIsUpdating(true);
      const data = await updateCartQuantityApi({
        cartDetailId: item.id,
        quantity: newQuantity,
      });
      if(!data.data){
        toast.error(data.message)
      }
      await reloadCart();
    } catch (error) {
      toast.error("Không thể cập nhật số lượng sản phẩm");
    } finally {
      setIsUpdating(false);
    }
  };

  const handleRemoveItem = async (item: ICartItem) => {
    const ok = window.confirm(
      `Xóa "${item.productName}" khỏi giỏ hàng?`
    );
    if (!ok) return;

    try {
      setIsUpdating(true);
      await removeCartItemApi(item.id);
      await reloadCart();
      toast.success("Đã xóa sản phẩm khỏi giỏ hàng");
    } catch (error) {
      toast.error("Không thể xóa sản phẩm khỏi giỏ hàng");
    } finally {
      setIsUpdating(false);
    }
  };

  const handleRemoveSelected = async () => {
    if (!cart || selectedIds.size === 0) {
      toast.info("Vui lòng chọn ít nhất 1 sản phẩm để xóa");
      return;
    }

    const ok = window.confirm(
      `Bạn có chắc muốn xóa ${selectedIds.size} sản phẩm đã chọn khỏi giỏ hàng?`
    );
    if (!ok) return;

    try {
      setIsUpdating(true);
      // Xóa lần lượt từng item (sau này nếu có API bulk thì thay thế ở đây)
      for (const id of Array.from(selectedIds)) {
        await removeCartItemApi(id);
      }
      await reloadCart();
      toast.success("Đã xóa các sản phẩm đã chọn");
    } catch (error) {
      toast.error("Không thể xóa các sản phẩm đã chọn");
    } finally {
      setIsUpdating(false);
    }
  };

  // Giỏ hàng trống
  if (!cart || cart.items.length === 0) {
    return (
      <div className="bg-slate-50 min-h-screen">
        <div className="max-w-5xl mx-auto px-3 sm:px-4 lg:px-0 py-8">
          <h1 className="text-xl font-semibold mb-4">Giỏ hàng</h1>
          <div className="bg-white rounded-xl shadow-sm py-10 flex flex-col items-center">
            <img
              src="https://hoanghamobile.com/Content/web/content-icon/no-item.png"
              alt="Empty cart"
              className="h-24 mb-4 opacity-80"
            />
            <p className="text-slate-600 mb-4">Giỏ hàng của bạn đang trống</p>
            <Link
              to="/"
              className="px-6 py-2 rounded-full bg-orange-500 text-white text-sm font-semibold hover:bg-orange-600"
            >
              Tiếp tục mua sắm
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-slate-50 min-h-screen">
      <div className="max-w-5xl mx-auto px-3 sm:px-4 lg:px-0 py-6">
        <h1 className="text-xl font-semibold mb-4">
          Giỏ hàng ({cartCount} sản phẩm)
        </h1>

        <div className="flex flex-col lg:flex-row gap-4">
          {/* Bảng sản phẩm */}
          <div className="flex-1">
            <div className="bg-white rounded-xl shadow-sm">
              {/* Header */}
              <div className="grid grid-cols-12 px-4 py-3 border-b text-xs text-slate-500 items-center">
                <div className="col-span-6 flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={isAllSelected}
                    onChange={handleToggleAll}
                  />
                  <span>Chọn tất cả ({cart.items.length})</span>
                </div>
                <div className="col-span-2 text-center">Đơn giá</div>
                <div className="col-span-2 text-center">Số lượng</div>
                <div className="col-span-2 text-center">Thành tiền</div>
              </div>

              {/* Items */}
              {cart.items.map((item) => {
                const checked = selectedIds.has(item.id);

                return (
                  <div
                    key={item.id}
                    className="grid grid-cols-12 px-4 py-4 border-b last:border-b-0 items-center"
                  >
                    {/* Chọn + sản phẩm */}
                    <div className="col-span-6 flex gap-3">
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={() => handleToggleOne(item)}
                        className="mt-8"
                      />
                      <img
                        src={item.thumbnailUrl}
                        alt={item.productName}
                        className="w-20 h-20 rounded border object-cover"
                      />
                      <div>
                        <p className="text-sm text-slate-800 line-clamp-2">
                          {item.productName}
                        </p>
                        <p className="text-xs text-slate-400 mt-1">
                          SKU: {item.sku}
                        </p>
                        <button
                          onClick={() => handleRemoveItem(item)}
                          className="mt-2 text-xs text-rose-500 hover:underline"
                          disabled={isUpdating}
                        >
                          Xóa
                        </button>
                      </div>
                    </div>

                    {/* Đơn giá */}
                    <div className="col-span-2 text-center text-sm text-slate-700">
                      {formatCurrency(item.price)}
                    </div>

                    {/* Số lượng */}
                    <div className="col-span-2 flex items-center justify-center gap-2">
                      {/* Nút giảm */}
                      <button
                        type="button"
                        disabled={isUpdating}
                        onClick={() => {
                          const current = parseInt(localQuantities[item.id], 10);
                          const safeValue = isNaN(current) ? item.quantity : current;
                          const newValue = Math.max(1, safeValue - 1);

                          handleInputQuantityChange(item, String(newValue));
                        }}
                        className="w-8 h-8 border rounded flex items-center justify-center text-lg disabled:opacity-40"
                      >
                        -
                      </button>

                      {/* Input */}
                      <input
                        type="text"
                        value={localQuantities[item.id] ?? String(item.quantity)}
                        onChange={(e) => handleInputQuantityChange(item, e.target.value)}
                        onBlur={() => handleQuantityBlur(item)}
                        className="w-12 h-8 border rounded text-center text-sm"
                      />

                      {/* Nút tăng */}
                      <button
                        type="button"
                        disabled={isUpdating}
                        onClick={() => {
                          const current = parseInt(localQuantities[item.id], 10);
                          const safeValue = isNaN(current) ? item.quantity : current;
                          const newValue = safeValue + 1;

                          handleInputQuantityChange(item, String(newValue));
                        }}
                        className="w-8 h-8 border rounded flex items-center justify-center text-lg disabled:opacity-40"
                      >
                        +
                      </button>
                    </div>

                    {/* Thành tiền */}
                    <div className="col-span-2 text-center text-sm font-semibold text-rose-600">
                      {formatCurrency(item.total)}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Thanh action phía dưới (xóa đã chọn) */}
            <div className="mt-3 flex items-center justify-between text-sm">
              <div className="flex items-center gap-3 text-slate-600">
                <button
                  type="button"
                  className="text-rose-500 hover:underline disabled:opacity-50"
                  onClick={handleRemoveSelected}
                  disabled={isUpdating || selectedIds.size === 0}
                >
                  Xóa các sản phẩm đã chọn
                </button>
              </div>
            </div>
          </div>

          {/* Sidebar tổng tiền */}
          <div className="w-full lg:w-80">
            <div className="bg-white rounded-xl shadow-sm p-4">
              <h2 className="text-sm font-semibold mb-3">Thanh toán</h2>

              <div className="flex justify-between text-sm text-slate-600 mb-2">
                <span>Tổng tiền ({selectedItems.length} sản phẩm)</span>
                <span>{formatCurrency(selectedTotal)}</span>
              </div>

              <div className="border-t mt-3 pt-3 flex justify-between items-center">
                <span className="text-sm text-slate-700">Tổng thanh toán</span>
                <span className="text-lg font-bold text-rose-600">
                  {formatCurrency(selectedTotal)}
                </span>
              </div>

              <button
                type="button"
                disabled={
                  isUpdating || selectedItems.length === 0 || selectedTotal <= 0
                }
                onClick={() => {
                  const ids = selectedItems.map((i) => i.id); // cartDetailId
                  navigate("/checkout", { state: { selectedIds: ids } });
                }}
                className="mt-4 w-full bg-rose-600 hover:bg-rose-700 text-white py-3 rounded-full text-sm font-semibold disabled:opacity-60"
              >
                Mua hàng ({selectedItems.length})
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
