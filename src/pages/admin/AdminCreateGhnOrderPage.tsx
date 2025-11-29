// src/pages/admin/AdminCreateGhnOrderPage.tsx
import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useForm } from "react-hook-form";
import { toast } from "react-toastify";

import {
  getAdminShippingOrderDetail,
  getGhnPickupShiftsApi,
  getGhnServicesApi,
  createGhnOrderApi,
  getServiceFee
} from "@/api/admin.order";

import {
  getProvinces,
  getDistricts,
  getWards,
  type LocationItem,
} from "@/api/vietnam.api";

const formatCurrency = (v: number) =>
  new Intl.NumberFormat("vi-VN").format(v) + "đ";

type CreateGhnFormValues = {
  receiverName: string;
  receiverPhone: string;
  addressDetail: string;

  provinceId: number;
  districtId: number;
  wardId: number;

  weight: number;
  length: number;
  width: number;
  height: number;

  codAmount: number;
  goodsValue: number;

  serviceId: number;
  paymentTypeId: 1 | 2;
  requiredNote: string;
  note: string;
  pickShiftId: number;
};

const AdminCreateGhnOrderPage: React.FC = () => {
  const { orderId } = useParams<{ orderId: string }>();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [detail, setDetail] = useState<AdminShippingOrderDetail | null>(null);
  const [services, setServices] = useState<GhnService[]>([]);
  const [shifts, setShifts] = useState<GhnPickupShift[]>([]);

  const [provinces, setProvinces] = useState<LocationItem[]>([]);
  const [districts, setDistricts] = useState<LocationItem[]>([]);
  const [wards, setWards] = useState<LocationItem[]>([]);


  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors },
  } = useForm<CreateGhnFormValues>({
    defaultValues: {
      receiverName: "",
      receiverPhone: "",
      addressDetail: "",

      provinceId: undefined as unknown as number,
      districtId: undefined as unknown as number,
      wardId: undefined as unknown as number,

      weight: 500,
      length: 20,
      width: 15,
      height: 10,
      codAmount: 0,
      goodsValue: 0,
      serviceId: undefined as unknown as number,
      paymentTypeId: 2,
      requiredNote: "KHONGCHOXEMHANG",
      note: "Đơn hàng từ hệ thống",
      pickShiftId: undefined as unknown as number,
    },
  });

  const itemsTotal = useMemo(
    () =>
      detail?.items.reduce(
        (sum, i) => sum + i.quantity * i.price,
        0
      ) ?? 0,
    [detail]
  );

  const watchCodAmount = watch("codAmount");
  const watchDistrictId = watch("districtId");
  const watchWardId = watch("wardId");
  const watchServiceId = watch("serviceId");
  const watchPaymentTypeId = watch("paymentTypeId");


  const [serviceFee, setServiceFee] = useState<number | null>(null);
  const [feeLoading, setFeeLoading] = useState(false);


  // ===== load tất cả: detail + service + shift + provinces + districts + wards =====
  useEffect(() => {
    if (!orderId) return;

    const fetchAll = async () => {
      try {
        setLoading(true);

        const [detailRes, servicesRes, shiftsRes, provincesRes] =
          await Promise.all([
            getAdminShippingOrderDetail(Number(orderId)),
            getGhnServicesApi(),
            getGhnPickupShiftsApi(),
            getProvinces(),
          ]);

        const d: AdminShippingOrderDetail | undefined = detailRes?.data;
        const svs: GhnService[] = servicesRes?.data ?? [];
        const shs: GhnPickupShift[] = shiftsRes?.data ?? [];
        const provs: LocationItem[] = provincesRes ?? [];

        if (!d) {
          toast.error("Không tải được thông tin vận chuyển của đơn hàng");
          return;
        }

        setDetail(d);
        setServices(svs);
        setShifts(shs);
        setProvinces(provs);

        // load quận/phường theo id có sẵn trong detail
        const [dists, ws] = await Promise.all([
          getDistricts(d.provinceId),
          getWards(d.districtId),
        ]);

        setDistricts(dists);
        setWards(ws);
        reset({
          receiverName: d.customerName,
          receiverPhone: d.customerPhone,
          addressDetail: d.addressDetail,

          provinceId: d.provinceId,
          districtId: d.districtId,
          wardId: d.wardId,

          weight: d.weight || 500,
          length: d.length || 20,
          width: d.width || 15,
          height: d.height || 10,
          codAmount: d.codAmount,
          goodsValue: d.goodsValue ?? d.codAmount,
          serviceId: svs[0]?.service_id,
          paymentTypeId: 2,
          requiredNote: "KHONGCHOXEMHANG",
          note: "Đơn hàng từ hệ thống",
          pickShiftId: shs[0]?.id,
        });
      } catch (err) {
        console.error(err);
        toast.error("Lỗi khi tải dữ liệu tạo vận đơn GHN");
      } finally {
        setLoading(false);
      }
    };

    fetchAll();
  }, [orderId, reset]);

  useEffect(() => {
  // cần đủ district / ward / service thì mới gọi
  if (!watchDistrictId || !watchWardId || !watchServiceId) {
    setServiceFee(null);
    return;
  }

  const service = services.find(
    (s) => s.service_id === watchServiceId
  );
  if (!service) {
    setServiceFee(null);
    return;
  }

  const fetchFee = async () => {
    try {
      setFeeLoading(true);
      const quote = await getServiceFee({
        districtId: watchDistrictId,
        wardId: watchWardId,
        service_id: service.service_id,
        service_type_id: service.service_type_id,
      });

      setServiceFee(quote.serviceFee ?? 0);
    } catch (err) {
      console.error(err);
      setServiceFee(null);
      toast.error("Không tính được phí dịch vụ GHN");
    } finally {
      setFeeLoading(false);
    }
  };

  fetchFee();
}, [watchDistrictId, watchWardId, watchServiceId, services]);

useEffect(() => {
  if (!detail) return;

  // Tiền hàng gốc: ưu tiên codAmount từ đơn, fallback sang itemsTotal
  const baseCod = detail.codAmount ?? itemsTotal;

  // paymentTypeId: 2 = bên nhận trả phí, 1 = bên gửi trả phí
  if (watchPaymentTypeId === 2) {
    // Bên nhận trả ship -> COD = tiền hàng + phí dịch vụ
    const fee = serviceFee ?? 0;
    setValue("codAmount", baseCod + fee);
  } else {
    // Bên gửi trả ship -> chỉ thu tiền hàng
    setValue("codAmount", 0);
  }
}, [watchPaymentTypeId, serviceFee, detail, itemsTotal, setValue]);



  // ===== handler đổi Tỉnh / Quận =====
  const handleProvinceChange = async (provinceId: number) => {
    try {
      setValue("provinceId", provinceId);
      setValue("districtId", undefined as unknown as number);
      setValue("wardId", undefined as unknown as number);
      setDistricts([]);
      setWards([]);

      if (!provinceId) return;
      const dists = await getDistricts(provinceId);
      setDistricts(dists);
    } catch (err) {
      console.error(err);
      toast.error("Không tải được danh sách quận/huyện");
    }
  };

  const handleDistrictChange = async (districtId: number) => {
    try {
      setValue("districtId", districtId);
      setValue("wardId", undefined as unknown as number);
      setWards([]);

      if (!districtId) return;
      const ws = await getWards(districtId);
      setWards(ws);
    } catch (err) {
      console.error(err);
      toast.error("Không tải được danh sách phường/xã");
    }
  };

  // ===== submit =====
  const onSubmit = async (values: CreateGhnFormValues) => {
    if (!detail) return;

    try {
      setSubmitting(true);

      const service = services.find(
        (s) => s.service_id === values.serviceId
      );

      const payload: AdminCreateGhnOrderPayload = {
        orderId: detail.orderId,

        receiverName: values.receiverName,
        receiverPhone: values.receiverPhone,
        addressDetail: values.addressDetail,
        provinceId: values.provinceId,
        districtId: values.districtId,
        wardId: values.wardId,

        weight: values.weight,
        length: values.length,
        width: values.width,
        height: values.height,
        codAmount: values.codAmount,
        goodsValue: values.goodsValue,

        serviceId: values.serviceId,
        serviceTypeId: service?.service_type_id ?? 2,
        pickShiftId: values.pickShiftId,

        paymentTypeId: values.paymentTypeId,
        requiredNote: values.requiredNote,
        note: values.note,
      };

      const res = await createGhnOrderApi(payload);

      if (res?.data) {
        toast.success("Tạo vận đơn GHN thành công");
        navigate(`/admin/orders?id=${detail.orderId}&refresh=${Date.now()}`);
      } else {
        toast.error("Tạo vận đơn GHN thất bại");
      }
    } catch (err: any) {
      console.error(err);
      toast.error(
        err?.response?.data?.message ||
          "Lỗi khi gọi API tạo vận đơn GHN"
      );
    } finally {
      setSubmitting(false);
    }
  };

  if (loading || !detail) {
    return (
      <div className="p-6 text-sm text-slate-600">
        Đang tải dữ liệu đơn hàng...
      </div>
    );
  }

  // cần destructure register để combine onChange với handler custom
  const provinceRegister = register("provinceId", {
    required: "Bắt buộc chọn tỉnh/thành",
    valueAsNumber: true,
  });
  const districtRegister = register("districtId", {
    required: "Bắt buộc chọn quận/huyện",
    valueAsNumber: true,
  });

  return (
    <div className="p-6 bg-slate-50 min-h-screen">
      <div className="max-w-6xl mx-auto space-y-4">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-semibold">
            Tạo vận đơn GHN cho đơn #{detail.orderId}
          </h1>
          <button
            onClick={() => navigate(-1)}
            className="text-sm text-slate-600 hover:underline"
          >
            ← Quay lại
          </button>
        </div>

        <form
          onSubmit={handleSubmit(onSubmit)}
          className="grid lg:grid-cols-[2fr,1.2fr] gap-4"
        >
          {/* CỘT TRÁI */}
          <div className="space-y-4">
            {/* BÊN GỬI */}
            <section className="bg-white rounded-xl shadow-sm p-4">
              <h2 className="text-sm font-semibold mb-3">Bên gửi</h2>
              <p className="text-sm text-slate-700">
                {detail.shopName} – {detail.shopPhone}
              </p>
              <p className="text-xs text-slate-500">
                {detail.shopAddressDetail}, {detail.ward}, {detail.district},{" "}
                {detail.province}
              </p>
              <p className="mt-1 text-[11px] text-slate-400">
                Thông tin shop được cấu hình từ hệ thống, không chỉnh sửa tại
                đây.
              </p>
            </section>

            {/* BÊN NHẬN */}
            <section className="bg-white rounded-xl shadow-sm p-4">
              <h2 className="text-sm font-semibold mb-3">Bên nhận</h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                <div>
                  <label className="block text-xs text-slate-500 mb-1">
                    Số điện thoại *
                  </label>
                  <input
                    className="w-full border rounded px-3 py-2 text-sm"
                    {...register("receiverPhone", {
                      required: "Bắt buộc nhập số điện thoại",
                    })}
                  />
                  {errors.receiverPhone && (
                    <p className="text-xs text-red-500 mt-1">
                      {errors.receiverPhone.message}
                    </p>
                  )}
                </div>
                <div>
                  <label className="block text-xs text-slate-500 mb-1">
                    Họ tên *
                  </label>
                  <input
                    className="w-full border rounded px-3 py-2 text-sm"
                    {...register("receiverName", {
                      required: "Bắt buộc nhập họ tên",
                    })}
                  />
                  {errors.receiverName && (
                    <p className="text-xs text-red-500 mt-1">
                      {errors.receiverName.message}
                    </p>
                  )}
                </div>
              </div>

              <div className="mt-3">
                <label className="block text-xs text-slate-500 mb-1">
                  Địa chỉ nhận *
                </label>
                <input
                  className="w-full border rounded px-3 py-2 text-sm"
                  placeholder="Số nhà, đường..."
                  {...register("addressDetail", {
                    required: "Bắt buộc nhập địa chỉ",
                  })}
                />
                {errors.addressDetail && (
                  <p className="text-xs text-red-500 mt-1">
                    {errors.addressDetail.message}
                  </p>
                )}
              </div>

              {/* Tỉnh / Quận / Phường */}
              <div className="mt-3 grid md:grid-cols-3 gap-3 text-sm">
                {/* Tỉnh */}
                <div>
                  <label className="block text-xs text-slate-500 mb-1">
                    Tỉnh - Thành phố *
                  </label>
                  <select
                    className="w-full border rounded px-3 py-2 text-sm"
                    {...provinceRegister}
                    onChange={(e) => {
                      provinceRegister.onChange(e);
                      handleProvinceChange(Number(e.target.value));
                    }}
                  >
                    <option value="">-- Chọn tỉnh/thành --</option>
                    {provinces.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name}
                      </option>
                    ))}
                  </select>
                  {errors.provinceId && (
                    <p className="text-xs text-red-500 mt-1">
                      {errors.provinceId.message}
                    </p>
                  )}
                </div>

                {/* Quận */}
                <div>
                  <label className="block text-xs text-slate-500 mb-1">
                    Quận - Huyện *
                  </label>
                  <select
                    className="w-full border rounded px-3 py-2 text-sm"
                    {...districtRegister}
                    onChange={(e) => {
                      districtRegister.onChange(e);
                      handleDistrictChange(Number(e.target.value));
                    }}
                  >
                    <option value="">-- Chọn quận/huyện --</option>
                    {districts.map((d) => (
                      <option key={d.id} value={d.id}>
                        {d.name}
                      </option>
                    ))}
                  </select>
                  {errors.districtId && (
                    <p className="text-xs text-red-500 mt-1">
                      {errors.districtId.message}
                    </p>
                  )}
                </div>

                {/* Phường */}
                <div>
                  <label className="block text-xs text-slate-500 mb-1">
                    Phường - Xã *
                  </label>
                  <select
                    className="w-full border rounded px-3 py-2 text-sm"
                    {...register("wardId", {
                      required: "Bắt buộc chọn phường/xã",
                      valueAsNumber: true,
                    })}
                  >
                    <option value="">-- Chọn phường/xã --</option>
                    {wards.map((w) => (
                      <option key={w.id} value={w.id}>
                        {w.name}
                      </option>
                    ))}
                  </select>
                  {errors.wardId && (
                    <p className="text-xs text-red-500 mt-1">
                      {errors.wardId.message}
                    </p>
                  )}
                </div>
              </div>
            </section>

            {/* THÔNG TIN SẢN PHẨM */}
            <section className="bg-white rounded-xl shadow-sm p-4">
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-sm font-semibold">
                  Thông tin sản phẩm
                </h2>
              </div>
              <div className="border rounded-lg overflow-hidden text-sm">
                <table className="w-full">
                  <thead className="bg-slate-50 text-xs text-slate-500">
                    <tr>
                      <th className="text-left px-3 py-2">Sản phẩm</th>
                      <th className="text-center px-3 py-2">SKU</th>
                      <th className="text-center px-3 py-2">Số lượng</th>
                      <th className="text-right px-3 py-2">Đơn giá</th>
                      <th className="text-right px-3 py-2">Thành tiền</th>
                    </tr>
                  </thead>
                  <tbody>
                    {detail.items.map((it) => (
                      <tr key={it.orderDetailId} className="border-t">
                        <td className="px-3 py-2">{it.productName}</td>
                        <td className="px-3 py-2 text-center text-xs">
                          {it.sku}
                        </td>
                        <td className="px-3 py-2 text-center">
                          {it.quantity}
                        </td>
                        <td className="px-3 py-2 text-right">
                          {formatCurrency(it.price)}
                        </td>
                        <td className="px-3 py-2 text-right">
                          {formatCurrency(it.price * it.quantity)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>

            {/* THÔNG TIN ĐƠN HÀNG */}
            <section className="bg-white rounded-xl shadow-sm p-4">
              <h2 className="text-sm font-semibold mb-3">
                Thông tin đơn hàng
              </h2>
              <div className="grid md:grid-cols-4 gap-3 text-sm">
                {/* weight / length / width / height */}
                {[
                  ["weight", "KL (gram) *"],
                  ["length", "Dài (cm) *"],
                  ["width", "Rộng (cm) *"],
                  ["height", "Cao (cm) *"],
                ].map(([field, label]) => (
                  <div key={field}>
                    <label className="block text-xs text-slate-500 mb-1">
                      {label}
                    </label>
                    <input
                      type="number"
                      className="w-full border rounded px-3 py-2 text-sm"
                      {...register(field as keyof CreateGhnFormValues, {
                        required: "Bắt buộc",
                        valueAsNumber: true,
                        min: { value: 1, message: "Phải > 0" },
                      })}
                    />
                    {errors[field as keyof CreateGhnFormValues] && (
                      <p className="text-xs text-red-500 mt-1">
                        {
                          (
                            errors[
                              field as keyof CreateGhnFormValues
                            ] as any
                          )?.message
                        }
                      </p>
                    )}
                  </div>
                ))}
              </div>

              <div className="grid md:grid-cols-2 gap-3 mt-4 text-sm">
                <div>
                  <label className="block text-xs text-slate-500 mb-1">
                    Tổng tiền thu hộ (COD)
                  </label>
                  <input
                    type="number"
                    className="w-full border rounded px-3 py-2 text-sm"
                    {...register("codAmount", {
                      valueAsNumber: true,
                      min: { value: 0, message: "Không được âm" },
                    })}
                  />
                  {errors.codAmount && (
                    <p className="text-xs text-red-500 mt-1">
                      {errors.codAmount.message}
                    </p>
                  )}
                </div>
                <div>
                  <label className="block text-xs text-slate-500 mb-1">
                    Tổng giá trị hàng hóa
                  </label>
                  <input
                    type="number"
                    className="w-full border rounded px-3 py-2 text-sm"
                    {...register("goodsValue", {
                      valueAsNumber: true,
                      min: { value: 0, message: "Không được âm" },
                    })}
                  />
                  {errors.goodsValue && (
                    <p className="text-xs text-red-500 mt-1">
                      {errors.goodsValue.message}
                    </p>
                  )}
                  <p className="mt-1 text-[11px] text-slate-400">
                    GHN dùng để bồi thường nếu mất, hư hỏng.
                  </p>
                </div>
              </div>
            </section>

            {/* DỊCH VỤ, CA LẤY HÀNG & GHI CHÚ */}
            <section className="bg-white rounded-xl shadow-sm p-4 space-y-4">
              <div>
                <h2 className="text-sm font-semibold mb-3">
                  Gói dịch vụ & ca lấy hàng
                </h2>

                {/* Dịch vụ */}
                <div className="mb-3">
                  <label className="block text-xs text-slate-500 mb-1">
                    Gói dịch vụ *
                  </label>
                  <select
                    className="w-full border rounded px-3 py-2 text-sm"
                    {...register("serviceId", {
                      required: "Vui lòng chọn gói dịch vụ",
                      valueAsNumber: true,
                    })}
                  >
                    {services.map((sv) => (
                      <option key={sv.service_id} value={sv.service_id}>
                        {sv.short_name} (id: {sv.service_id})
                      </option>
                    ))}
                  </select>
                  {errors.serviceId && (
                    <p className="text-xs text-red-500 mt-1">
                      {errors.serviceId.message}
                    </p>
                  )}
                </div>

                {/* Ca lấy hàng */}
                <div>
                  <label className="block text-xs text-slate-500 mb-1">
                    Ca lấy hàng *
                  </label>
                  <select
                    className="w-full border rounded px-3 py-2 text-sm"
                    {...register("pickShiftId", {
                      required: "Vui lòng chọn ca lấy hàng",
                      valueAsNumber: true,
                    })}
                  >
                    {shifts.map((sh) => (
                      <option key={sh.id} value={sh.id}>
                        {sh.title}
                      </option>
                    ))}
                  </select>
                  {errors.pickShiftId && (
                    <p className="text-xs text-red-500 mt-1">
                      {errors.pickShiftId.message}
                    </p>
                  )}
                </div>
              </div>

              <div>
                <h2 className="text-sm font-semibold mb-3">
                  Lưu ý – Ghi chú
                </h2>
                <div className="flex flex-col md:flex-row gap-4 text-sm">
                  <div className="space-y-2">
                    <p className="text-xs text-slate-500 mb-1">
                      Lưu ý giao hàng *
                    </p>
                    <label className="flex items-center gap-2 text-xs">
                      <input
                        type="radio"
                        value="KHONGCHOXEMHANG"
                        {...register("requiredNote", { required: true })}
                      />
                      Không cho xem hàng
                    </label>
                    <label className="flex items-center gap-2 text-xs">
                      <input
                        type="radio"
                        value="CHOTHUHANG"
                        {...register("requiredNote")}
                      />
                      Cho thử hàng
                    </label>
                    <label className="flex items-center gap-2 text-xs">
                      <input
                        type="radio"
                        value="CHOXEMHANGKHONGTHU"
                        {...register("requiredNote")}
                      />
                      Cho xem không cho thử
                    </label>
                    {errors.requiredNote && (
                      <p className="text-xs text-red-500 mt-1">
                        Vui lòng chọn lưu ý giao hàng
                      </p>
                    )}
                  </div>
                  <div className="flex-1">
                    <p className="text-xs text-slate-500 mb-1">Ghi chú</p>
                    <textarea
                      className="w-full border rounded px-3 py-2 text-sm min-h-[80px]"
                      {...register("note")}
                    />
                  </div>
                </div>
              </div>
            </section>
          </div>

          {/* CỘT PHẢI – TỔNG QUAN & SUBMIT */}
          <div className="space-y-4">
            <section className="bg-white rounded-xl shadow-sm p-4 text-sm">
              <h2 className="text-sm font-semibold mb-3">Tổng quan</h2>
              <div className="flex justify-between mb-1">
                <span>Tổng tiền hàng</span>
                <span>{formatCurrency(itemsTotal)}</span>
              </div>
              <div className="flex justify-between mb-1">
                <span>COD</span>
                <span>{formatCurrency(watchCodAmount || 0)}</span>
              </div>

              <div className="border-t mt-3 pt-3 flex justify-between font-semibold">
                <span>Tổng phí dịch vụ (ước tính)</span>
                <span>
                  {feeLoading
                    ? "Đang tính..."
                    : serviceFee != null
                    ? formatCurrency(serviceFee)
                    : "—"}
                </span>
              </div>
            </section>

            <section className="bg-white rounded-xl shadow-sm p-4 text-sm space-y-3">
              <div>
                <label className="block text-xs text-slate-500 mb-1">
                  Bên trả phí
                </label>
                <select
                  className="w-full border rounded px-3 py-2 text-sm"
                  {...register("paymentTypeId", { valueAsNumber: true })}
                >
                  <option value={2}>Bên nhận trả phí</option>
                  <option value={1}>Bên gửi trả phí</option>
                </select>
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full bg-orange-500 hover:bg-orange-600 text-white py-3 rounded-lg text-sm font-semibold disabled:opacity-60"
              >
                {submitting ? "Đang tạo đơn..." : "TẠO ĐƠN GHN"}
              </button>
            </section>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AdminCreateGhnOrderPage;
