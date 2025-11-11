import { Container } from "@/components/client/AppHeader";
import React from "react";
import {
  useForm,
  type RegisterOptions,
  type UseFormRegister,
} from "react-hook-form";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { submitContactMessage } from "@/api/admin.contact.api";

export type Crumb = { label: string; href?: string };

export const Breadcrumbs: React.FC<{ items: Crumb[] }> = ({ items }) => (
  <div className="text-sm text-slate-500">
    {items.map((it, idx) => (
      <span key={it.href ?? it.label}>
        {idx > 0 && <span className="mx-1">/</span>}
        {it.href ? (
          <a
            className="hover:text-indigo-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-300"
            href={it.href}
          >
            {it.label}
          </a>
        ) : (
          <span>{it.label}</span>
        )}
      </span>
    ))}
  </div>
);

export const MapEmbed: React.FC = () => (
  <div className="overflow-hidden rounded-2xl border border-slate-200">
    <iframe
      title="DSH STORE"
      src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d10000.446103230086!2d105.53676352472984!3d21.012383277539662!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3135ab5f41e95f55%3A0xcfc029607e11a4fe!2sHoa%20Lac%20High-tech%20Park!5e0!3m2!1sen!2s!4v1762742489269!5m2!1sen!2s"
      width="100%"
      height={420}
      loading="lazy"
      style={{ border: 0 }}
      allowFullScreen
    />
  </div>
);

export const ContactInfo: React.FC = () => (
  <div className="space-y-2 text-slate-700">
    <h3 className="text-base font-semibold">THÔNG TIN LIÊN HỆ DSH STORE</h3>
    <p>
      Hotline:{" "}
      <a
        href="tel:0987863174"
        className="font-semibold text-rose-600 hover:text-rose-700"
      >
        0987.863.174
      </a>
    </p>
    <p>
      Email:{" "}
      <a
        className="text-indigo-700 hover:underline"
        href="mailto:dshstore@gmail.com"
      >
        dshstore@gmail.com
      </a>
    </p>
    <p className="mt-2 font-semibold">
      ĐCT08, Kéo Dài, Thạch Thất, Hà Nội 10000
    </p>
  </div>
);

export const SocialBox: React.FC = () => (
  <div className="rounded-2xl border border-slate-200 p-4">
    <div className="font-semibold mb-3">Kết nối với chúng tôi</div>
    <ul className="space-y-3 text-sm">
      <li>
        <a
          href="#"
          className="inline-flex items-center gap-2 hover:text-indigo-700"
        >
          <span className="h-5 w-5 rounded bg-blue-600 inline-block" /> Facebook
        </a>
      </li>
      <li>
        <a
          href="#"
          className="inline-flex items-center gap-2 hover:text-indigo-700"
        >
          <span className="h-5 w-5 rounded bg-sky-400 inline-block" /> Twitter
        </a>
      </li>
      <li>
        <a
          href="#"
          className="inline-flex items-center gap-2 hover:text-indigo-700"
        >
          <span className="h-5 w-5 rounded bg-pink-600 inline-block" />{" "}
          Instagram
        </a>
      </li>
    </ul>
  </div>
);
type FormValues = {
  subject: string;
  fullName: string;
  email: string;
  phone: string;
  message: string;
};
const InputBase: React.FC<{
  label: string;
  name: keyof FormValues;
  type?: string;
  register: UseFormRegister<FormValues>;
  rules?: RegisterOptions<FormValues, keyof FormValues>;
  error?: string;
  placeholder?: string;
}> = ({ label, name, type = "text", register, error, placeholder, rules }) => (
  <div>
    <label className="text-sm" htmlFor={name}>
      {label}
    </label>
    <input
      id={name}
      type={type}
      className={`mt-1 w-full rounded-lg border px-3 py-2 focus:outline-none focus:ring-2 border-slate-300 focus:ring-indigo-300 ${
        error ? "border-rose-400" : ""
      }`}
      placeholder={placeholder}
      {...register(name, rules)}
    />
    {error && <p className="mt-1 text-xs text-rose-600">{error}</p>}
  </div>
);
const TextAreaBase: React.FC<{
  label: string;
  name: keyof FormValues;
  register: UseFormRegister<FormValues>;
  rules?: RegisterOptions<FormValues, keyof FormValues>;
  error?: string;
  placeholder?: string;
}> = ({ label, name, register, error, placeholder, rules }) => (
  <div className="md:col-span-2">
    <label className="text-sm" htmlFor={name}>
      {label}
    </label>
    <textarea
      id={name}
      rows={4}
      className={`mt-1 w-full rounded-lg border px-3 py-2 focus:outline-none focus:ring-2 border-slate-300 focus:ring-indigo-300 ${
        error ? "border-rose-400" : ""
      }`}
      placeholder={placeholder}
      {...register(name, rules)}
    />
    {error && <p className="mt-1 text-xs text-rose-600">{error}</p>}
  </div>
);
export const ContactForm: React.FC = () => {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    defaultValues: {
      subject: "",
      fullName: "",
      email: "",
      phone: "",
      message: "",
    },
    mode: "onBlur",
  });

  const onSubmit = async (values: FormValues) => {
    try {
      await submitContactMessage(values);
      toast.success("Gửi liên hệ thành công! Chúng tôi sẽ phản hồi sớm.");
      reset();
    } catch (e: any) {
      toast.error(e?.message || "Gửi liên hệ thất bại. Vui lòng thử lại.");
    }
  };
  return (
    <form onSubmit={handleSubmit(onSubmit)} className="mt-6 space-y-3">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <InputBase
          label="Tiêu đề *"
          name="subject"
          placeholder="Tiêu đề"
          register={register}
          error={errors.subject?.message}
        />
        <InputBase
          label="Họ và Tên *"
          name="fullName"
          placeholder="Họ và Tên"
          register={register}
          rules={{ required: "Họ và Tên là bắt buộc" }}
          error={errors.fullName?.message}
        />
        <InputBase
          label="Địa chỉ Email *"
          name="email"
          type="email"
          placeholder="Địa chỉ Email"
          register={register}
          rules={{
            required: "Email là bắt buộc",
            pattern: {
              value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
              message: "Email không hợp lệ",
            },
          }}
          error={errors.email?.message}
        />
        <InputBase
          label="Điện thoại *"
          name="phone"
          type="tel"
          placeholder="Điện thoại"
          register={register}
          rules={{
            required: "Điện thoại là bắt buộc",
            pattern: {
              value:
                /^(?:\+84|0)(?:3[2-9]|5[6|8|9]|7[0|6-9]|8[1-5]|9[0-9])[0-9]{7}$/,
              message: "Số điện thoại không hợp lệ (phải là số Việt Nam)",
            },
          }}
          error={errors.phone?.message}
        />
        <TextAreaBase
          label="Nội dung *"
          name="message"
          placeholder="Nội dung"
          register={register}
          rules={{
            required: "Nội dung là bắt buộc",
            minLength: {
              value: 10,
              message: "Nội dung phải có ít nhất 10 ký tự",
            },
          }}
          error={errors.message?.message}
        />
      </div>

      <button
        disabled={isSubmitting}
        className="inline-flex items-center rounded-lg bg-indigo-800 text-white px-4 py-2 font-medium hover:bg-indigo-700 disabled:opacity-60"
        type="submit"
      >
        {isSubmitting ? "Đang gửi..." : "Gửi liên hệ"}
      </button>
    </form>
  );
};

export const ContactPage: React.FC = () => {
  return (
    <Container className="py-6">
      <Breadcrumbs
        items={[{ label: "Trang chủ", href: "/" }, { label: "Liên hệ" }]}
      />

      <ToastContainer position="top-right" autoClose={2500} />
      <h1 className="mt-3 text-3xl font-bold">Liên hệ</h1>

      <div className="mt-5">
        <MapEmbed />
      </div>

      <div className="mt-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <ContactInfo />
          <h2 className="text-2xl font-bold">Liên hệ</h2>
          <ContactForm />
        </div>
        <div className="space-y-6">
          <SocialBox />
          <div className="rounded-2xl border border-slate-200 p-4 text-sm text-slate-700">
            <div className="font-semibold mb-2">Địa chỉ</div>
            <p>ĐCT08, Kéo Dài, Thạch Thất, Hà Nội 10000</p>
            <div className="mt-3 font-semibold">Điện thoại</div>
            <ul className="space-y-1">
              <li>Phone: 0987 863 174</li>
              <li>Email: dshstore@gmail.com</li>
            </ul>
          </div>
        </div>
      </div>
    </Container>
  );
};
